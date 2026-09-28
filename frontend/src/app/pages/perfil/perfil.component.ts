import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { apiConfig } from '../../api-config';

interface Profile { username: string; email: string; bio: string; avatar_url: string; avatar_choice: string; }

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="profile-page">
      <section class="profile-card">
        <div class="profile-head"><p class="eyebrow">Meu espaço</p><h1>Seu perfil</h1><p>Personalize como você aparece na comunidade.</p></div>
        @if (loading) { <div class="profile-state">Carregando seu perfil...</div> }
        @if (error) { <div class="profile-state profile-state--error"><strong>{{ error }}</strong><button type="button" (click)="goToLogin()">Entrar novamente</button></div> }
        @if (profile && !loading && !error) {
          <div class="profile-body">
            <div class="avatar-preview" [class]="'avatar-' + profile.avatar_choice">
              @if (profile.avatar_url && !imageError) { <img [src]="profile.avatar_url" alt="Foto de perfil" (error)="imageError = true" /> } @else { <span>{{ avatarSymbol(profile.avatar_choice) }}</span> }
            </div>
            <div class="profile-form">
              <label>Nome de usuário<input [value]="profile.username" disabled /></label>
              <label>Foto de perfil por URL<input [(ngModel)]="profile.avatar_url" (ngModelChange)="imageError = false" placeholder="https://site.com/sua-foto.jpg" /><small>Use o link direto da imagem, não um link de busca do Google.</small></label>
              <label>Ou escolha uma ilustração
                <select [(ngModel)]="profile.avatar_choice"><option value="sun">Sol</option><option value="leaf">Folha</option><option value="star">Estrela</option><option value="book">Livro</option></select>
              </label>
              <label>Bio<textarea [(ngModel)]="profile.bio" maxlength="240" rows="3" placeholder="Conte um pouco sobre você"></textarea></label>
              <button class="save" type="button" (click)="save()">Salvar perfil</button>
              @if (message) { <p class="message">{{ message }}</p> }
            </div>
          </div>
        }
      </section>
    </main>
  `,
  styles: [`
    :host { display:block; } .profile-page { max-width:900px; margin:0 auto; padding:3rem 1.5rem 5rem; }
    .profile-card { background:#fff; border:1px solid rgba(13,45,107,.08); border-radius:30px; overflow:hidden; box-shadow:0 24px 60px rgba(13,45,107,.1); }
    .profile-head { padding:2.5rem; color:white; background:linear-gradient(145deg,#0d2d6b,#1a60a9); } .profile-head h1{margin:0;font-size:clamp(2.4rem,5vw,4rem)} .profile-head p:last-child{color:rgba(255,255,255,.8)} .eyebrow{color:#2cae5f;text-transform:uppercase;letter-spacing:.12em;font-weight:800}
    .profile-body { display:grid; grid-template-columns:220px 1fr; gap:2rem; padding:2.5rem; } .profile-state{display:grid;gap:1rem;justify-items:center;padding:3rem;text-align:center;color:#526278}.profile-state--error{color:#b42318}.profile-state button{border:0;border-radius:999px;padding:.8rem 1.2rem;background:#0d2d6b;color:#fff;font-weight:800;cursor:pointer}.avatar-preview{width:180px;height:180px;border-radius:50%;display:grid;place-items:center;background:#f0c52e;color:#0d2d6b;font-size:5rem;overflow:hidden;border:8px solid #edf5ff}.avatar-preview img{width:100%;height:100%;object-fit:cover}.avatar-leaf{background:#2cae5f}.avatar-star{background:#eaf3ff}.avatar-book{background:#dfe5ed}
    .profile-form{display:grid;gap:1rem} label{display:grid;gap:.4rem;color:#173a6d;font-weight:700;font-size:.85rem} label small{color:#718096;font-size:.75rem;font-weight:500} input,select,textarea{width:100%;box-sizing:border-box;padding:.85rem 1rem;border:1px solid #d7e0eb;border-radius:12px;font:inherit}.save{border:0;border-radius:999px;padding:1rem;background:#0d2d6b;color:white;font-weight:800;cursor:pointer}.message{color:#1b7a43;font-weight:700}
    @media(max-width:700px){.profile-page{padding:1.5rem 1rem 3rem}.profile-body{grid-template-columns:1fr;padding:1.5rem}.avatar-preview{margin:auto}}
  `]
})
export class PerfilComponent implements OnInit {
  profile: Profile | null = null; message = ''; error = ''; loading = true; imageError = false; private readonly api = apiConfig.baseUrl;
  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit(): void {
    if (!localStorage.getItem('cidadania_token')) { this.goToLogin(); return; }
    this.http.get<Profile>(`${this.api}/auth/profile/`, { headers: this.headers() }).subscribe({
      next: p => { this.profile = p; this.loading = false; },
      error: response => { this.loading = false; if (response.status === 401) localStorage.removeItem('cidadania_token'); this.error = response.status === 0 ? 'Não foi possível conectar ao servidor.' : 'Sua sessão expirou. Entre novamente para editar o perfil.'; }
    });
  }
  save(): void { if (!this.profile) return; this.http.patch<Profile>(`${this.api}/auth/profile/`, this.profile, { headers: this.headers() }).subscribe({ next: p => { this.profile = p; this.message = 'Perfil atualizado.'; } }); }
  avatarSymbol(choice: string): string { return ({ sun: '☀', leaf: '✦', star: '✧', book: '▣' } as Record<string, string>)[choice] || '◎'; }
  goToLogin(): void { this.router.navigate(['/acesso']); }
  private headers(): HttpHeaders { return new HttpHeaders({ Authorization: `Token ${localStorage.getItem('cidadania_token') || ''}` }); }
}
