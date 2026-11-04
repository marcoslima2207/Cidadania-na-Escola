import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  computed,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, Subscription, TimeoutError, interval } from 'rxjs';
import { apiErrorMessage } from '../../services/api-error';
import { AuthService } from '../../services/auth.service';
import { QuizService } from '../../services/quiz.service';
import {
  Answer,
  AnswerFeedback,
  AttemptResponse,
  DailyQuiz,
  Level,
  Question,
  QuizAttempt,
  QuizDashboard,
  QuizProgress,
  QuizRanking,
  QuizReview,
} from './quiz.models';
import { QuizQuestionComponent } from './quiz-question.component';
import { IconComponent } from '../../components/icon/icon.component';
import { avatarImage } from '../../avatar-options';

const QUIZ_NAV = [
  { id: 'trail', label: 'Trilha de aprendizagem', short: 'Trilha', icon: 'book' },
  { id: 'practice', label: 'Treino', short: 'Treino', icon: 'target' },
  { id: 'missions', label: 'Missões', short: 'Missões', icon: 'calendar' },
  { id: 'awards', label: 'Conquistas', short: 'Medalhas', icon: 'trophy' },
  { id: 'history', label: 'Minha evolução', short: 'Evolução', icon: 'chart' },
  { id: 'ranking', label: 'Ranking', short: 'Ranking', icon: 'crown' },
] as const;
type QuizTab = (typeof QUIZ_NAV)[number]['id'] | 'review';
const TOPIC_ORDER = ['cidadania', 'democracia', 'trabalhista', 'desinformacao', 'educacao'];

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink, QuizQuestionComponent, IconComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizComponent implements OnInit {
  private readonly api = inject(QuizService);
  readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly contentFocus = viewChild<ElementRef<HTMLElement>>('contentFocus');
  private trailRequest?: Subscription;
  private progressRequest?: Subscription;
  private dailyRequest?: Subscription;
  private tabRequest?: Subscription;
  readonly nav = QUIZ_NAV;
  readonly tab = signal<QuizTab>('trail');
  readonly activeTopic = signal('cidadania');
  readonly tabLoading = signal(false);
  readonly tabError = signal('');
  readonly reviews = signal<QuizReview[]>([]);
  readonly dashboard = signal<QuizDashboard | null>(null);
  readonly ranking = signal<QuizRanking | null>(null);
  readonly avatarImage = avatarImage;
  private readonly now = signal(Date.now());
  readonly recovery = computed(() => {
    const progress = this.progress();
    if (!progress?.recupera_em || progress.vidas === progress.max_vidas) return '';
    const minutes = Math.max(
      0,
      Math.ceil((Date.parse(progress.recupera_em) - this.now()) / 60_000),
    );
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}min` : `${minutes} min`;
  });
  readonly levels = signal<Level[]>([]);
  readonly progress = signal<QuizProgress | null>(null);
  readonly daily = signal<DailyQuiz | null>(null);
  readonly attempt = signal<QuizAttempt | null>(null);
  readonly view = signal<'trail' | 'lesson' | 'result'>('trail');
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly dailyError = signal('');
  readonly progressLoading = signal(false);
  readonly progressError = signal('');
  readonly sessionExpired = signal(false);
  readonly currentIndex = signal(0);
  readonly selected = signal<Answer | null>(null);
  readonly feedback = signal<AnswerFeedback | null>(null);
  readonly lessonTitle = signal('');
  readonly dailyCompletedDate = signal<string | null>(null);
  readonly question = computed(() => this.attempt()?.perguntas[this.currentIndex()] ?? null);
  readonly practiceMode = computed(
    () => this.attempt()?.modo === 'treino' || this.attempt()?.modo === 'revisao',
  );
  readonly percent = computed(() => {
    const attempt = this.attempt();
    return attempt ? (attempt.respondidas / attempt.perguntas.length) * 100 : 0;
  });
  readonly completed = computed(() => new Set(this.progress()?.niveis_concluidos ?? []));
  readonly hearts = computed(() =>
    Array.from({ length: this.progress()?.max_vidas ?? 5 }, (_, i) => i),
  );
  readonly topics = computed(() => {
    const groups = new Map<string, { topic: Level['tema']; levels: Level[] }>();
    for (const level of this.levels()) {
      const slug = this.trailSlug(level.tema.slug);
      const group = groups.get(slug) ?? {
        topic:
          slug === 'desinformacao'
            ? { ...level.tema, slug, nome: 'Desinformação e Checagem' }
            : level.tema,
        levels: [],
      };
      group.levels.push(level);
      groups.set(slug, group);
    }
    return [...groups.values()].sort(
      (a, b) => TOPIC_ORDER.indexOf(a.topic.slug) - TOPIC_ORDER.indexOf(b.topic.slug),
    );
  });
  readonly topic = computed(
    () =>
      this.topics().find((group) => group.topic.slug === this.activeTopic()) ?? this.topics()[0],
  );
  readonly selectedTopicSlug = computed(() => this.topic()?.topic.slug);
  readonly next = computed(() =>
    this.topic()?.levels.find((level) => !this.completed().has(level.id) && this.available(level)),
  );
  readonly reward = computed(() => {
    const saved = this.progress()?.diario_concluido;
    return saved && saved.data === this.daily()?.data ? saved : null;
  });

  ngOnInit(): void {
    this.load();
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.now.set(Date.now());
        const progress = this.progress();
        if (
          progress?.recupera_em &&
          Date.parse(progress.recupera_em) <= this.now() &&
          this.view() === 'trail' &&
          !this.progressLoading() &&
          !this.busy() &&
          !this.progressError()
        ) {
          this.loadProgress();
        }
      });
  }

  available(level: Level): boolean {
    return (
      this.completed().has(level.id) ||
      this.levels().every(
        (previous) =>
          this.trailSlug(previous.tema.slug) !== this.trailSlug(level.tema.slug) ||
          previous.ordem >= level.ordem ||
          this.completed().has(previous.id),
      )
    );
  }

  private trailSlug(slug: string): string {
    return slug === 'checagem' ? 'desinformacao' : slug;
  }

  answerLabel(question: Question, answer: Answer): string {
    return question[`opcao_${answer}`];
  }

  topicPercent(levels: Level[]): number {
    return Math.round(
      (100 * levels.filter((level) => this.completed().has(level.id)).length) / levels.length,
    );
  }

  levelStatus(level: Level): string {
    if (this.completed().has(level.id)) return 'Concluída';
    if (this.progress()?.em_andamento?.[level.id] !== undefined) return 'Em andamento';
    return this.available(level) ? 'Disponível' : 'Bloqueada';
  }

  relatedLink(category: string): string {
    return (
      (
        {
          cidadania: '/democracia',
          democracia: '/democracia',
          desinformacao: '/desinformacao',
          checagem: '/checagem',
          trabalhista: '/direitos-trabalhistas',
        } as Record<string, string>
      )[category] ?? '/buscar'
    );
  }

  categoryLabel(category: string): string {
    return this.levels().find((level) => level.tema.slug === category)?.tema.nome ?? category;
  }

  openTab(tab: QuizTab): void {
    this.tab.set(tab);
    this.error.set('');
    this.tabError.set('');
    this.tabRequest?.unsubscribe();
    this.tabLoading.set(false);
    this.focusContent();
    if (!this.auth.loggedIn) return;
    switch (tab) {
      case 'review':
        this.loadTabData(this.api.reviews(), this.reviews.set);
        break;
      case 'ranking':
        this.loadTabData(this.api.ranking(), this.ranking.set);
        break;
      case 'missions':
      case 'awards':
      case 'history':
        this.loadTabData(this.api.dashboard(), this.dashboard.set);
        break;
    }
  }

  setRanking(participate: boolean): void {
    this.loadTabData(this.api.ranking(participate), this.ranking.set);
  }

  private loadTabData<T>(request: Observable<T>, update: (data: T) => void): void {
    this.tabLoading.set(true);
    this.tabError.set('');
    this.tabRequest = request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        update(data);
        this.tabLoading.set(false);
      },
      error: (error) => {
        this.tabLoading.set(false);
        this.tabError.set(
          this.requestError(error, 'Não foi possível carregar esta área. Tente novamente.'),
        );
      },
    });
  }

  topicIcon(slug: string): string {
    return (
      (
        {
          cidadania: 'people',
          democracia: 'bank',
          desinformacao: 'document',
          checagem: 'search',
          trabalhista: 'briefcase',
          educacao: 'book',
        } as Record<string, string>
      )[slug] || 'book'
    );
  }

  load(): void {
    this.trailRequest?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.loadProgress();
    this.trailRequest = this.api
      .levels()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (levels) => {
          this.levels.set(levels);
          this.loading.set(false);
          this.loadDailyWhenReady();
        },
        error: (error) => {
          this.loading.set(false);
          this.error.set(
            this.requestError(error, 'Não foi possível carregar a trilha. Tente novamente.'),
          );
        },
      });
  }

  loadProgress(): void {
    this.progressRequest?.unsubscribe();
    this.progressError.set('');
    this.sessionExpired.set(false);
    this.progressLoading.set(this.auth.loggedIn);
    if (!this.auth.loggedIn) {
      this.progress.set(null);
      return;
    }
    this.progressRequest = this.api
      .progress()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (progress) => {
          this.progress.set(progress);
          this.progressLoading.set(false);
          this.loadDailyWhenReady();
        },
        error: (error) => {
          this.progressLoading.set(false);
          this.sessionExpired.set(error instanceof HttpErrorResponse && error.status === 401);
          this.progressError.set(
            this.sessionExpired()
              ? 'Sua sessão expirou. Entre novamente para jogar.'
              : this.requestError(
                  error,
                  'Não foi possível carregar seu progresso. Tente novamente.',
                ),
          );
          this.loadDailyWhenReady();
        },
      });
  }

  private loadDailyWhenReady(): void {
    // A geração diária pode gravar no banco; priorize a trilha e o progresso.
    if (!this.loading() && !this.progressLoading() && !this.error()) this.loadDaily();
  }

  loadDaily(): void {
    this.dailyRequest?.unsubscribe();
    this.dailyError.set('');
    this.dailyRequest = this.api
      .daily()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (daily) => this.daily.set(daily),
        error: () =>
          this.dailyError.set('O desafio de hoje ainda não está disponível. Tente novamente.'),
      });
  }

  start(level: Level | null): void {
    if (this.busy()) return;
    if (!this.auth.loggedIn) {
      this.error.set('Entre na sua conta para jogar e salvar sua evolução.');
      return;
    }
    if (this.progressLoading() || this.progressError()) return;
    this.startActivity(this.api.start(level?.id ?? null), level?.titulo ?? 'Desafio diário');
  }

  practice(topic: string | null, question?: string): void {
    if (this.busy() || !this.auth.loggedIn) return;
    this.startActivity(
      this.api.practice(topic, question),
      topic ? 'Treino livre' : 'Revisão de erros',
    );
  }

  private startActivity(request: Observable<AttemptResponse>, title: string): void {
    this.error.set('');
    this.busy.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.attempt.set(data.tentativa);
        this.progress.set(data.progresso);
        this.currentIndex.set(data.tentativa.respondidas);
        this.selected.set(null);
        this.feedback.set(null);
        this.lessonTitle.set(title);
        this.view.set(data.tentativa.concluida ? 'result' : 'lesson');
        this.busy.set(false);
        this.focusContent();
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(
          this.requestError(error, 'Não foi possível iniciar a lição. Tente novamente.'),
        );
      },
    });
  }

  submitAnswer(): void {
    const attempt = this.attempt();
    const question = this.question();
    const answer = this.selected();
    if (!attempt || !question || !answer || this.busy() || this.feedback()) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .answer(attempt.id, question.id, answer)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.attempt.set(data.tentativa);
          this.progress.set(data.progresso);
          this.feedback.set(data);
          if (data.tentativa.diario !== null && data.tentativa.concluida && data.tentativa.aprovado)
            this.dailyCompletedDate.set(this.daily()?.data ?? null);
          this.busy.set(false);
        },
        error: (error) => {
          this.busy.set(false);
          this.error.set(
            this.requestError(error, 'Não foi possível verificar a resposta. Tente novamente.'),
          );
        },
      });
  }

  continueLesson(): void {
    const attempt = this.attempt();
    if (!attempt || !this.feedback()) return;
    if (attempt.concluida) {
      this.view.set('result');
    } else {
      this.currentIndex.set(attempt.respondidas);
      this.selected.set(null);
      this.feedback.set(null);
    }
    this.focusContent();
  }

  private focusContent(): void {
    afterNextRender(() => this.contentFocus()?.nativeElement.focus(), { injector: this.injector });
  }

  private requestError(error: unknown, fallback: string): string {
    return error instanceof TimeoutError
      ? 'O servidor demorou para responder. Tente novamente em alguns instantes.'
      : apiErrorMessage(error, fallback);
  }

  backToTrail(): void {
    this.view.set('trail');
    this.attempt.set(null);
    this.feedback.set(null);
    this.error.set('');
    if (this.tab() === 'trail') this.load();
    else this.openTab(this.tab());
    this.focusContent();
  }
}
