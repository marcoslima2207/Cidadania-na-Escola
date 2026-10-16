import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { apiConfig } from '../../api-config';
import { apiErrorMessage } from '../../services/api-error';
import { AuthService } from '../../services/auth.service';

interface GoogleAccounts {
  initialize(options: {
    client_id: string;
    nonce: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(
    element: HTMLElement,
    options: { type: string; theme: string; size: string; text: string; locale: string },
  ): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccounts } };
  }
}

let library: Promise<void> | undefined;
function loadGoogleLibrary(): Promise<void> {
  if (window.google) return Promise.resolve();
  return (library ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      library = undefined;
      script.remove();
      reject(new Error('Google indisponível'));
    };
    document.head.appendChild(script);
  }));
}

@Component({
  selector: 'app-google-login',
  standalone: true,
  template: `
    <div class="google-access">
      <span class="separator">ou continue com</span>
      <div #button class="google-button" [attr.aria-busy]="busy()"></div>
      @if (message()) {
        <p role="status">{{ message() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .google-access {
        display: grid;
        justify-items: center;
        gap: 0.8rem;
      }
      .separator {
        color: #5d6980;
        font-size: 0.85rem;
      }
      .google-button {
        min-height: 44px;
      }
      p {
        color: #5d6980;
        font-size: 0.82rem;
        text-align: center;
        margin: 0;
      }
    `,
  ],
})
export class GoogleLoginComponent implements AfterViewInit {
  @ViewChild('button', { static: true }) private button!: ElementRef<HTMLElement>;
  @Output() authenticated = new EventEmitter<void>();
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly busy = signal(false);
  readonly message = signal('');

  ngAfterViewInit(): void {
    this.http
      .get<{ client_id: string; nonce: string }>(`${apiConfig.baseUrl}/auth/google-config/`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (config) => {
          if (!config.client_id) {
            this.message.set(
              'O acesso com Google estará disponível após a configuração do serviço.',
            );
            return;
          }
          try {
            await loadGoogleLibrary();
            if (this.destroyRef.destroyed) return;
            const accounts = window.google?.accounts.id;
            if (!accounts) throw new Error('Google indisponível');
            accounts.initialize({
              client_id: config.client_id,
              nonce: config.nonce,
              callback: (response) => this.signIn(response.credential),
            });
            accounts.renderButton(this.button.nativeElement, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              locale: 'pt-BR',
            });
          } catch {
            this.message.set(
              'Não foi possível carregar o Google. Você pode entrar com e-mail e senha.',
            );
          }
        },
        error: () => this.message.set('Acesso com Google temporariamente indisponível.'),
      });
  }

  private signIn(credential: string): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.message.set('Verificando sua conta...');
    this.auth
      .access('google', { credential })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.message.set('');
          this.authenticated.emit();
        },
        error: (error) => {
          this.busy.set(false);
          this.message.set(
            apiErrorMessage(
              error,
              'Não foi possível entrar com Google. Atualize a página e tente novamente.',
            ),
          );
        },
      });
  }
}
