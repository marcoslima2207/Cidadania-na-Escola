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
import { Subscription, TimeoutError } from 'rxjs';
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
  private trailRequest?: Subscription;
  private progressRequest?: Subscription;
  private dailyRequest?: Subscription;
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
    this.load();
  }
}
