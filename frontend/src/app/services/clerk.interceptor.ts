import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, throwError } from 'rxjs';
import { apiConfig } from '../api-config';
import { ClerkService } from './clerk.service';

export const clerkInterceptor: HttpInterceptorFn = (request, next) => {
  const clerk = inject(ClerkService);
  const api = apiConfig.baseUrl.replace(/\/$/, '');
  // Nenhuma credencial é enviada para uploads externos, imagens ou outros hosts.
  if (!clerk.enabled || !(request.url === api || request.url.startsWith(api + '/'))) {
    return next(request);
  }
  return from(clerk.token()).pipe(switchMap((token) => {
    const headers = request.headers.delete('Authorization');
    if (!token && request.headers.has('Authorization')) {
      return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Sessão expirada' }));
    }
    return next(request.clone({ headers: token ? headers.set('Authorization', `Bearer ${token}`) : headers }));
  }));
};
