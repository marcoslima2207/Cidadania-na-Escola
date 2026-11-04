import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ClerkService } from '../../services/clerk.service';
import { ConfiguracoesComponent } from './configuracoes.component';

describe('Configurações da conta', () => {
  const account = signal<{ email: string; providers: string[]; passwordEnabled: boolean } | null>(null);
  const profile = signal({ email: 'local@example.com', login_methods: ['E-mail e senha'] });
  const openUserProfile = vi.fn().mockResolvedValue(undefined);

  function setup(enabled: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { loggedIn: true, profile, loadProfile: () => of(profile()) } },
        { provide: ClerkService, useValue: { enabled, account, openUserProfile } },
      ],
    });
    const fixture = TestBed.createComponent(ConfiguracoesComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('mostra o e-mail atual e o provedor, sem sugerir troca de senha para uma conta só do Google', async () => {
    account.set({ email: 'google@example.com', providers: ['Google'], passwordEnabled: false });
    const fixture = setup(true);
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('google@example.com');
    expect(root.textContent).toContain('Google');
    expect(root.textContent).not.toContain('gerenciar sua senha');
    root.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    expect(openUserProfile).toHaveBeenCalled();
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/perfil');
    account.update(value => ({ ...value!, passwordEnabled: true }));
    fixture.detectChanges();
    expect(root.textContent).toContain('gerenciar sua senha');
  });

  it('mostra os dados da conta local sem abrir um painel que ela não usa', () => {
    const root: HTMLElement = setup(false).nativeElement;
    expect(root.textContent).toContain('local@example.com');
    expect(root.textContent).toContain('E-mail e senha');
    expect(root.querySelector('button')).toBeNull();
  });
});
