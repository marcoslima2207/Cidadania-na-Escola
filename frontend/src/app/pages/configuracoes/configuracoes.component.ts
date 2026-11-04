import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClerkService } from '../../services/clerk.service';

@Component({
  selector: 'app-configuracoes',
  imports: [RouterLink],
  templateUrl: './configuracoes.component.html',
  styles: [`
    :host { display: block; }
    .settings { padding-block: clamp(1.5rem, 4vw, 3rem); }
    .settings-card { max-inline-size: 48rem; padding: clamp(1rem, 3vw, 2rem); margin-block-start: 1.25rem; }
    dl { display: grid; gap: 1rem; margin-block: 1rem 1.5rem; }
    dt { font-weight: 700; color: var(--ce-color-blue); }
    dd { margin: .25rem 0 0; overflow-wrap: anywhere; }
    .ce-button { margin-block-start: .5rem; }
  `],
})
export class ConfiguracoesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly clerk = inject(ClerkService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly opening = signal(false);
  readonly securityError = signal('');
  readonly managed = computed(() => this.clerk.enabled && !!this.clerk.account());
  readonly passwordEnabled = computed(() => this.managed() && !!this.clerk.account()?.passwordEnabled);
  readonly email = computed(() =>
    (this.clerk.enabled ? this.clerk.account()?.email : this.auth.profile()?.email) || 'Sem e-mail cadastrado',
  );
  readonly methods = computed(() => {
    if (!this.clerk.enabled) return this.auth.profile()?.login_methods?.join(' · ') || 'Não informado';
    const account = this.clerk.account();
    const methods = [...(account?.providers || [])];
    if (account?.passwordEnabled) methods.unshift('E-mail e senha');
    return methods.join(' · ') || 'Conta gerenciada pelo Clerk';
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    if (!this.auth.loggedIn) {
      void this.router.navigate(['/acesso']);
      return;
    }
    if (this.clerk.enabled) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.loadProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set('Não foi possível carregar os dados da conta.');
      },
    });
  }

  async openSecurity(): Promise<void> {
    if (!this.managed() || this.opening()) return;
    this.securityError.set('');
    this.opening.set(true);
    try {
      await this.clerk.openUserProfile();
    } catch {
      this.securityError.set('Não foi possível abrir a segurança da conta. Tente novamente.');
    } finally {
      this.opening.set(false);
    }
  }
}
