import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { apiConfig } from '../../api-config';

@Component({
  selector: 'app-acesso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="access-page">
      <section class="access-card">
        <div class="access-intro">
          <p class="eyebrow">Comunidade cidadã</p>
          <h1>{{ mode === 'login' ? 'Bem-vindo de volta.' : 'Crie seu espaço.' }}</h1>
          <p>Participe das conversas, compartilhe informação e acompanhe ideias que transformam.</p>
        </div>
        <div class="access-form">
          <div class="mode-switch">
            <button type="button" [class.active]="mode === 'login'" (click)="mode = 'login'">Entrar</button>
            <button type="button" [class.active]="mode === 'register'" (click)="mode = 'register'">Criar conta</button>
          </div>
          @if (mode === 'register') {
            <label>Nome<input [(ngModel)]="registerForm.name" placeholder="Seu nome" /></label>
          }
          <label>E-mail ou usuário<input type="text" [(ngModel)]="email" placeholder="nome@exemplo.com" /></label>
          <label>Senha<input type="password" [(ngModel)]="password" placeholder="Mínimo de 8 caracteres" /></label>
          <button class="submit" type="button" (click)="submit()">{{ mode === 'login' ? 'Entrar' : 'Criar conta' }}</button>
          @if (error) { <p class="error">{{ error }}</p> }
          <a routerLink="/">Voltar para o início</a>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display:block; }
    .access-page { max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
    .access-card { display:grid; grid-template-columns: 1fr 1fr; overflow:hidden; border-radius:30px; background:#fff; box-shadow:0 25px 70px rgba(13,45,107,.12); border:1px solid rgba(13,45,107,.08); }
    .access-intro { padding:3.5rem; color:white; background:linear-gradient(145deg,#0d2d6b,#1760aa); }
    .access-intro h1 { margin:0; font-size:clamp(2.3rem,5vw,4.5rem); line-height:.98; }
    .access-intro p:last-child { max-width:360px; line-height:1.7; color:rgba(255,255,255,.84); }
    .eyebrow { color:#2cae5f; text-transform:uppercase; letter-spacing:.12em; font-weight:800; }
    .access-form { padding:3rem; display:grid; gap:1rem; align-content:center; }
    .mode-switch { display:grid; grid-template-columns:1fr 1fr; padding:.3rem; border-radius:999px; background:#eef3f8; margin-bottom:.5rem; }
    .mode-switch button { border:0; border-radius:999px; padding:.75rem; background:transparent; color:#173a6d; font-weight:800; cursor:pointer; }
    .mode-switch button.active { background:#0d2d6b; color:white; }
    label { display:grid; gap:.4rem; color:#173a6d; font-weight:700; font-size:.85rem; }
    input { width:100%; box-sizing:border-box; padding:.9rem 1rem; border:1px solid #d7e0eb; border-radius:12px; font:inherit; }
    .submit { border:0; border-radius:999px; padding:1rem; background:#0d2d6b; color:white; font-weight:800; cursor:pointer; }
    .access-form a { text-align:center; color:#173a6d; font-weight:700; text-decoration:none; }
    .error { margin:0; color:#b42318; font-weight:700; font-size:.9rem; }
    @media (max-width:700px) { .access-page { padding:1.5rem 1rem 3rem; } .access-card { grid-template-columns:1fr; } .access-intro,.access-form { padding:1.7rem; } }
  `]
})
export class AcessoComponent {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  error = '';
  registerForm = { name: '' };
  private readonly api = apiConfig.baseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  submit(): void {
    this.error = '';
    const endpoint = this.mode === 'login' ? 'login' : 'register';
    const body = this.mode === 'login'
      ? { username: this.email.trim(), password: this.password }
      : { name: this.registerForm.name.trim(), email: this.email.trim(), password: this.password };
    this.http.post<{ token: string }>(`${this.api}/auth/${endpoint}/`, body).subscribe({
      next: response => { localStorage.setItem('cidadania_token', response.token); this.router.navigate(['/postagens']); },
      error: error => { this.error = error?.error?.email?.[0] || error?.error?.detail || 'Não foi possível concluir o acesso.'; }
    });
  }
}
