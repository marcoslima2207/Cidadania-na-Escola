import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { apiConfig } from '../../api-config';

// PUBLICAR: formulario autenticado para criar foto, video ou texto.
@Component({
  selector: 'app-publicar', standalone: true, imports: [CommonModule, FormsModule],
  template: `<main class="publish-page"><section class="publish-card"><p class="eyebrow">Nova publicação</p><h1>Compartilhe uma ideia que transforma.</h1><p class="lead">Publique fotos, vídeos e reflexões sobre cidadania, democracia e informação.</p><div class="form"><label>Categoria<select [(ngModel)]="form.category"><option>Direitos Trabalhistas</option><option>Democracia</option><option>Cidadania</option><option>Desinformação</option><option>Educação</option></select></label><label>Tipo<select [(ngModel)]="form.media_type"><option value="image">Foto</option><option value="video">Vídeo</option></select></label><label>Título<input [(ngModel)]="form.title" placeholder="Dê um título à publicação" /></label><label>Texto<textarea [(ngModel)]="form.content" rows="6" placeholder="Escreva sua publicação"></textarea></label><label>Link da mídia (opcional)<input [(ngModel)]="form.media_url" placeholder="https://..." /></label><button type="button" (click)="publish()" [disabled]="loading">{{ loading ? 'Publicando...' : 'Publicar agora' }}</button>@if(error){<p class="error">{{ error }}</p>}</div></section></main>`,
  styles: [`:host{display:block}.publish-page{max-width:800px;margin:0 auto;padding:3rem 1.5rem 5rem}.publish-card{background:#fff;border-radius:30px;padding:3rem;box-shadow:0 24px 60px rgba(13,45,107,.1);border:1px solid rgba(13,45,107,.08)}h1{font-size:clamp(2.4rem,5vw,4.5rem);line-height:1;margin:.3rem 0 1rem;color:#0d2d6b}.lead{color:#526278;line-height:1.7}.eyebrow{text-transform:uppercase;letter-spacing:.12em;color:#1b7a43;font-weight:800}.form{display:grid;gap:1rem;margin-top:2rem}.form label{display:grid;gap:.4rem;color:#173a6d;font-weight:700;font-size:.85rem}.form input,.form select,.form textarea{width:100%;box-sizing:border-box;border:1px solid #d7e0eb;border-radius:12px;padding:.9rem;font:inherit}.form input:focus,.form select:focus,.form textarea:focus{outline:none;border-color:#2e7ce6;box-shadow:0 0 0 4px rgba(46,124,230,.12)}.form button{border:0;border-radius:999px;padding:1rem;background:#0d2d6b;color:#fff;font-weight:800;cursor:pointer}.form button:disabled{opacity:.65;cursor:wait}.error{color:#b42318;font-weight:700;background:#fff1f0;border-radius:12px;padding:.8rem}@media(max-width:700px){.publish-page{padding:1.5rem 1rem 3rem}.publish-card{padding:1.5rem}}`]
})
export class PublicarComponent {
  form = { category: 'Cidadania', media_type: 'image', title: '', content: '', media_url: '' }; error = ''; loading = false; private readonly api = apiConfig.baseUrl;
  constructor(private http: HttpClient, private router: Router) {}
  publish(): void {
    this.error = '';
    const token = localStorage.getItem('cidadania_token');
    if (!token) { this.error = 'Sua sessão terminou. Entre novamente para publicar.'; return; }
    if (!this.form.title.trim() || !this.form.content.trim()) { this.error = 'Preencha o título e o texto da publicação.'; return; }
    this.loading = true;
    this.http.post(`${this.api}/posts/`, { ...this.form, title: this.form.title.trim(), content: this.form.content.trim() }, { headers: new HttpHeaders({ Authorization: `Token ${token}` }) }).subscribe({
      next: () => this.router.navigate(['/postagens']),
      error: error => {
        this.loading = false;
        if (error.status === 401) { localStorage.removeItem('cidadania_token'); this.error = 'Sua sessão expirou. Entre novamente para publicar.'; return; }
        this.error = error?.error?.detail || error?.error?.media_url?.[0] || 'Não foi possível publicar agora. Tente novamente.';
      }
    });
  }
}
