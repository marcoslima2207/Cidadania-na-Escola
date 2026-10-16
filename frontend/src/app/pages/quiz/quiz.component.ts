import { CommonModule } from '@angular/common';
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
import { forkJoin, of } from 'rxjs';
import { apiErrorMessage } from '../../services/api-error';
import { AuthService } from '../../services/auth.service';
import { QuizService } from '../../services/quiz.service';
import { Answer, AnswerFeedback, DailyQuiz, Level, QuizAttempt, QuizProgress } from './quiz.models';
import { QuizQuestionComponent } from './quiz-question.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink, QuizQuestionComponent],
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
  readonly levels = signal<Level[]>([]);
  readonly progress = signal<QuizProgress | null>(null);
  readonly daily = signal<DailyQuiz | null>(null);
  readonly attempt = signal<QuizAttempt | null>(null);
  readonly view = signal<'trail' | 'lesson' | 'result'>('trail');
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly dailyError = signal('');
  readonly currentIndex = signal(0);
  readonly selected = signal<Answer | null>(null);
  readonly feedback = signal<AnswerFeedback | null>(null);
  readonly lessonTitle = signal('');
  readonly question = computed(() => this.attempt()?.perguntas[this.currentIndex()] ?? null);
  readonly percent = computed(() => {
    const attempt = this.attempt();
    return attempt ? (attempt.respondidas / attempt.perguntas.length) * 100 : 0;
  });
  readonly completed = computed(() => new Set(this.progress()?.niveis_concluidos ?? []));
  readonly nextLevel = computed(
    () => this.progress()?.proximo_nivel ?? this.levels()[0]?.id ?? null,
  );
  readonly hearts = computed(() =>
    Array.from({ length: this.progress()?.max_vidas ?? 5 }, (_, i) => i),
  );
  readonly topics = computed(() => {
    const groups = new Map<number, { topic: Level['tema']; levels: Level[] }>();
    for (const level of this.levels()) {
      const group = groups.get(level.tema.id) ?? { topic: level.tema, levels: [] };
      group.levels.push(level);
      groups.set(level.tema.id, group);
    }
    return [...groups.values()];
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      levels: this.api.levels(),
      progress: this.auth.loggedIn ? this.api.progress() : of(null),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.levels.set(data.levels);
          this.progress.set(data.progress);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.error.set(
            apiErrorMessage(error, 'Não foi possível carregar a trilha. Tente novamente.'),
          );
        },
      });
    this.loadDaily();
  }

  loadDaily(): void {
    this.dailyError.set('');
    this.api
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
    this.error.set('');
    this.busy.set(true);
    this.api
      .start(level?.id ?? null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.attempt.set(data.tentativa);
          this.progress.set(data.progresso);
          this.currentIndex.set(data.tentativa.respondidas);
          this.selected.set(null);
          this.feedback.set(null);
          this.lessonTitle.set(level?.titulo ?? 'Desafio diário');
          this.view.set('lesson');
          this.busy.set(false);
          this.focusContent();
        },
        error: (error) => {
          this.busy.set(false);
          this.error.set(
            apiErrorMessage(error, 'Não foi possível iniciar a lição. Tente novamente.'),
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
          this.busy.set(false);
        },
        error: (error) => {
          this.busy.set(false);
          this.error.set(
            apiErrorMessage(error, 'Não foi possível verificar a resposta. Tente novamente.'),
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

  backToTrail(): void {
    this.view.set('trail');
    this.attempt.set(null);
    this.feedback.set(null);
    this.error.set('');
    this.load();
  }
}
