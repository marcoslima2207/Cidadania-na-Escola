import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { apiConfig } from '../api-config';
import { ClerkService } from './clerk.service';

export interface AuthSession {
  token: string;
  user: { id: number; username: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly clerk = inject(ClerkService);

  get loggedIn(): boolean {
    return this.clerk.enabled ? this.clerk.signedIn() : !!localStorage.getItem('cidadania_token');
  }

  get headers(): HttpHeaders {
    // O interceptor obtém um JWT atualizado antes de cada chamada.
    if (this.clerk.enabled) return new HttpHeaders({ Authorization: 'Bearer' });
    const token = localStorage.getItem('cidadania_token');
    return new HttpHeaders(token ? { Authorization: `Token ${token}` } : {});
  }

  access(endpoint: 'login' | 'register' | 'google', body: object): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${apiConfig.baseUrl}/auth/${endpoint}/`, body).pipe(
      tap((session) => {
        localStorage.setItem('cidadania_token', session.token);
        localStorage.setItem('cidadania_username', session.user.username);
      }),
    );
  }
}
