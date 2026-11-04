import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { apiConfig } from '../api-config';
import { ClerkService } from './clerk.service';

export interface AccountProfile {
  username: string;
  display_name?: string;
  email: string;
  login_methods?: string[];
  bio: string;
  avatar_url: string;
  avatar_choice: string;
  avatar_file_url: string;
}

export interface AuthSession {
  token: string;
  user: { id: number; username: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly clerk = inject(ClerkService);

  private readonly profileState = signal<AccountProfile | null>(null);
  readonly profile = this.profileState.asReadonly();

  private profileRevision = 0;

  clearProfile(): void { this.profileRevision++; this.profileState.set(null); }

  loadProfile(): Observable<AccountProfile> {
    const revision = this.profileRevision;
    return this.http.get<AccountProfile>(`${apiConfig.baseUrl}/auth/profile/`, { headers: this.headers })
      .pipe(tap(profile => { if (revision === this.profileRevision) this.profileState.set(profile); }));
  }

  saveProfile(payload: FormData): Observable<AccountProfile> {
    return this.http.patch<AccountProfile>(`${apiConfig.baseUrl}/auth/profile/`, payload, { headers: this.headers })
      .pipe(tap(profile => { this.profileRevision++; this.profileState.set(profile); }));
  }

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
        this.clearProfile();
        localStorage.setItem('cidadania_token', session.token);
        localStorage.setItem('cidadania_username', session.user.username);
      }),
    );
  }
}
