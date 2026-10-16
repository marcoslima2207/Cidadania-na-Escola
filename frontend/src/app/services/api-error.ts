import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  const body: unknown = error.error;
  if (!body || typeof body !== 'object') return fallback;
  for (const field of ['detail', 'non_field_errors', 'email', 'password', 'name']) {
    const value: unknown = (body as Record<string, unknown>)[field];
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  }
  return error.status === 401 ? 'Sua sessão expirou. Entre novamente.' : fallback;
}
