import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { apiConfig } from '../../api-config';
import { HeaderComponent } from './header.component';

@Component({ standalone: true, template: '' })
class RoutePage {}

describe('Navegação e sessão no header', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: '', component: RoutePage },
          { path: 'sobre', component: RoutePage },
          { path: 'acesso', component: RoutePage },
        ]),
      ],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    fixture.destroy();
    localStorage.clear();
  });

  it('oferece acesso sem sessão e identifica o botão de menu mesmo sem texto visível', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.account-link')?.getAttribute('href')).toBe('/acesso');
    expect(root.querySelector('.logout-button')).toBeNull();
    expect(root.querySelector('.menu-toggle')?.getAttribute('aria-label')).toBe(
      'Abrir menu de navegação',
    );
    expect(root.querySelector('.menu-toggle')?.getAttribute('aria-controls')).toBe(
      root.querySelector('.header-navigation')?.id,
    );
  });

  it('fecha o menu com Escape e devolve o foco ao botão que o abriu', () => {
    const root = fixture.nativeElement as HTMLElement;
    const toggle = root.querySelector<HTMLButtonElement>('.menu-toggle')!;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    const link = root.querySelector<HTMLAnchorElement>('.nav-link')!;
    link.focus();
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('recolhe o menu quando a pessoa clica fora do header', () => {
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    document.body.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('atualiza a sessão e a página ativa ao navegar e recolhe o menu', async () => {
    localStorage.setItem('cidadania_token', 'token-de-teste');
    (fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    await router.navigateByUrl('/sobre');
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.nav-link[aria-current="page"]')?.textContent?.trim()).toBe('Sobre');
    expect(root.querySelector('.account-link')?.getAttribute('href')).toBe('/perfil');
    expect(root.querySelector('.menu-toggle')?.getAttribute('aria-expanded')).toBe('false');
  });

  it('fecha o menu ao selecionar novamente a página que já está aberta', async () => {
    await router.navigateByUrl('/sobre');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('.menu-toggle')!.click();
    fixture.detectChanges();
    expect(root.querySelector('.menu-toggle')?.getAttribute('aria-expanded')).toBe('true');

    root.querySelector<HTMLAnchorElement>('.nav-link[aria-current="page"]')!.click();
    await fixture.whenStable();

    expect(root.querySelector('.menu-toggle')?.getAttribute('aria-expanded')).toBe('false');
    expect(router.url).toBe('/sobre');
  });

  it.each([204, 503])(
    'envia o token uma vez e encerra a sessão mesmo com resposta HTTP %i',
    async (status) => {
      localStorage.setItem('cidadania_token', 'token-de-teste');
      localStorage.setItem('cidadania_username', 'usuario-de-teste');
      await router.navigateByUrl('/sobre');
      await fixture.whenStable();

      const logout = fixture.nativeElement.querySelector('.logout-button') as HTMLButtonElement;
      logout.click();
      logout.click();
      fixture.detectChanges();
      expect(logout.disabled).toBe(true);

      const request = http.expectOne(`${apiConfig.baseUrl}/auth/logout/`);
      expect(request.request.method).toBe('POST');
      expect(request.request.headers.get('Authorization')).toBe('Token token-de-teste');
      request.flush(null, { status, statusText: status === 204 ? 'No Content' : 'Unavailable' });
      await fixture.whenStable();

      expect(localStorage.getItem('cidadania_token')).toBeNull();
      expect(localStorage.getItem('cidadania_username')).toBeNull();
      expect(router.url).toBe('/acesso');
      expect(fixture.nativeElement.querySelector('.logout-button')).toBeNull();
    },
  );
});
