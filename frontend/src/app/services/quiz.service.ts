import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { apiConfig } from '../api-config';
import {
  Answer,
  AnswerResponse,
  AttemptResponse,
  DailyQuiz,
  Level,
  QuizProgress,
} from '../pages/quiz/quiz.models';
import { AuthService } from './auth.service';

export const QUIZ_REQUEST_TIMEOUT_MS = 45_000;

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = `${apiConfig.baseUrl}/quiz`;

  levels(): Observable<Level[]> {
    return this.http.get<Level[]>(`${this.api}/nivel/`).pipe(timeout(QUIZ_REQUEST_TIMEOUT_MS));
  }

  progress(): Observable<QuizProgress> {
    return this.http
      .get<QuizProgress>(`${this.api}/progresso/`, { headers: this.auth.headers })
      .pipe(timeout(QUIZ_REQUEST_TIMEOUT_MS));
  }

  daily(): Observable<DailyQuiz> {
    return this.http.get<DailyQuiz>(`${this.api}/diario/`).pipe(timeout(QUIZ_REQUEST_TIMEOUT_MS));
  }

  start(levelId: number | null): Observable<AttemptResponse> {
    const path = levelId === null ? 'diario' : `nivel/${levelId}/iniciar`;
    return this.http
      .post<AttemptResponse>(`${this.api}/${path}/`, {}, { headers: this.auth.headers })
      .pipe(timeout(QUIZ_REQUEST_TIMEOUT_MS));
  }

  answer(attemptId: number, questionId: number, answer: Answer): Observable<AnswerResponse> {
    return this.http
      .post<AnswerResponse>(
        `${this.api}/tentativas/${attemptId}/responder/`,
        { pergunta_id: questionId, alternativa: answer },
        { headers: this.auth.headers },
      )
      .pipe(timeout(QUIZ_REQUEST_TIMEOUT_MS));
  }
}
