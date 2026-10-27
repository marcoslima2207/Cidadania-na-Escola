import { HttpClient, HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { apiConfig } from '../api-config';
import { clerkInterceptor } from './clerk.interceptor';
import { ClerkService } from './clerk.service';

describe('Credenciais Clerk na API', () => {
  const clerk = { enabled: true, token: vi.fn() };
  let http: HttpClient;
  let requests: HttpTestingController;

  beforeEach(() => {
    clerk.enabled = true;
    clerk.token.mockReset();
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([clerkInterceptor])), provideHttpClientTesting(),
      { provide: ClerkService, useValue: clerk },
    ] });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
  });
  afterEach(() => requests.verify());

  it('obtém um JWT atualizado por pedido e substitui o token antigo', async () => {
    for (const token of ['jwt-1', 'jwt-2']) {
      clerk.token.mockResolvedValueOnce(token);
      const result = firstValueFrom(http.get(`${apiConfig.baseUrl}/auth/profile/`, {
        headers: new HttpHeaders({ Authorization: 'Token antigo' }),
      }));
      await Promise.resolve();
      const request = requests.expectOne(`${apiConfig.baseUrl}/auth/profile/`);
      expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      request.flush({});
      await result;
    }
    expect(clerk.token).toHaveBeenCalledTimes(2);
  });

  it('não envia o JWT a outros hosts nem a um prefixo parecido', async () => {
    for (const url of ['https://external.example/upload', apiConfig.baseUrl + '-other/posts/']) {
      const result = firstValueFrom(http.get(url));
      const request = requests.expectOne(url);
      expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush({});
      await result;
    }
    expect(clerk.token).not.toHaveBeenCalled();
  });

  it('uma sessão encerrada não reutiliza o token Django armazenado', async () => {
    clerk.token.mockResolvedValue(null);
    const result = firstValueFrom(http.post(`${apiConfig.baseUrl}/posts/`, {}, {
      headers: new HttpHeaders({ Authorization: 'Token antigo' }),
    }));
    await expect(result).rejects.toMatchObject({ status: 401 });
    requests.expectNone(`${apiConfig.baseUrl}/posts/`);
  });

  it('mantém o contrato anterior quando Clerk está desativado', async () => {
    clerk.enabled = false;
    const result = firstValueFrom(http.get(`${apiConfig.baseUrl}/auth/profile/`, {
      headers: new HttpHeaders({ Authorization: 'Token anterior' }),
    }));
    const request = requests.expectOne(`${apiConfig.baseUrl}/auth/profile/`);
    expect(request.request.headers.get('Authorization')).toBe('Token anterior');
    request.flush({});
    await result;
    expect(clerk.token).not.toHaveBeenCalled();
  });
});
