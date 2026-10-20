// Alterna entre login e cadastro, valida os campos e guarda o token devolvido pela API.
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { apiErrorMessage } from '../../services/api-error';
import { GoogleLoginComponent } from '../../components/google-login/google-login.component';

// AUTENTICACAO: formulario de login e criacao de conta.
@Component({
  selector: 'app-acesso',
  standalone: true,
  // Disponibiliza as diretivas, os formulários e os componentes usados por este template.
  imports: [CommonModule, FormsModule, RouterLink, GoogleLoginComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  templateUrl: './acesso.component.html',
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styleUrl: './acesso.component.css',
})
export class AcessoComponent {
  // Estado da classe: guarda os dados e as opções utilizados pelos métodos e pelo template.
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  readonly error = signal('');
  showPassword = false;
  readonly loading = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  registerForm = { name: '' };

  // Recebe os serviços do Angular utilizados por esta classe por injeção de dependências.
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  completeAccess(): void {
    this.loading.set(false);
    this.router.navigate(['/postagens']);
  }

  // Troca entre entrar e cadastrar, limpando senha e mensagens da tentativa anterior.
  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.error.set('');
    this.password = '';
    this.showPassword = false;
  }

  // Valida o formulário, chama login ou cadastro e, no sucesso, abre a comunidade.
  submit(): void {
    if (this.loading()) return;
    this.error.set('');
    if (this.mode === 'register' && this.registerForm.name.trim().length < 2) {
      this.error.set('Digite seu nome para criar a conta.');
      return;
    }
    if (!this.email.trim()) {
      this.error.set(
        this.mode === 'login' ? 'Digite seu e-mail ou usuário.' : 'Digite seu e-mail.',
      );
      return;
    }
    if (this.password.length < 8) {
      this.error.set('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    this.loading.set(true);
    const endpoint = this.mode === 'login' ? 'login' : 'register';
    const body =
      this.mode === 'login'
        ? { username: this.email.trim(), password: this.password }
        : {
            name: this.registerForm.name.trim(),
            email: this.email.trim(),
            password: this.password,
          };
    this.auth
      .access(endpoint, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.completeAccess(),
        error: (error) => {
          this.loading.set(false);
          this.error.set(
            apiErrorMessage(
              error,
              'Não foi possível concluir o acesso. Confira seus dados e tente novamente.',
            ),
          );
        },
      });
  }
}
