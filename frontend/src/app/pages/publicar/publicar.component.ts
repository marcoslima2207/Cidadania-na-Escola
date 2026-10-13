// Monta a publicação, apresenta a prévia do arquivo e envia texto e mídia para a API.
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { apiConfig } from '../../api-config';

// PUBLICAR: formulario autenticado para criar foto, video ou texto.
@Component({
  selector: 'app-publicar',
  standalone: true,
  // Disponibiliza as diretivas, os formulários e os componentes usados por este template.
  imports: [CommonModule, FormsModule, RouterLink],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  template: `<main class="publish-page">
    <section class="publish-card">
      <p class="eyebrow">Nova publicação</p>
      <h1>Compartilhe uma ideia que transforma.</h1>
      <p class="lead">
        Publique fotos, vídeos e reflexões sobre cidadania, democracia e informação.
      </p>
      @if (!loggedIn) {
        <p><a routerLink="/acesso">Entre ou crie uma conta para publicar.</a></p>
      }
      <div class="form">
        <label
          >Categoria<select [(ngModel)]="form.category">
            <option>Direitos Trabalhistas</option>
            <option>Democracia</option>
            <option>Cidadania</option>
            <option>Desinformação</option>
            <option>Educação</option>
          </select></label
        ><label
          >Tipo<select [(ngModel)]="form.media_type" (ngModelChange)="clearMedia(); mediaInput.value = ''">
            <option value="image">Foto</option>
            <option value="video">Vídeo</option>
          </select></label
        ><label
          >Título<input [(ngModel)]="form.title" maxlength="200" placeholder="Dê um título à publicação" /></label
        ><label
          >Texto<textarea
            [(ngModel)]="form.content"
            rows="6"
            placeholder="Escreva sua publicação"
          ></textarea></label
        ><label class="upload-label"
          >Foto ou vídeo do dispositivo<input
            #mediaInput
            type="file"
            [accept]="
              form.media_type === 'image'
                ? 'image/jpeg,image/png,image/webp'
                : 'video/mp4,video/webm,video/quicktime'
            "
            (change)="selectMedia($event)"
          /><small>Até 20 MB. O arquivo será enviado para o servidor.</small></label
        >
        @if (selectedFile) {
          <p class="selected-file">Arquivo selecionado: {{ selectedFile.name }}</p>
        }
        @if (previewUrl) {
          @if (form.media_type === 'image') {
            <img class="preview" [src]="previewUrl" alt="Prévia da foto selecionada" />
          } @else {
            <video class="preview" [src]="previewUrl" controls preload="metadata"></video>
          }
          <button type="button" (click)="clearMedia(); mediaInput.value = ''">
            Remover arquivo
          </button>
        }
        <button type="button" (click)="publish()" [disabled]="loading">
          {{ loading ? 'Publicando...' : 'Publicar agora' }}
        </button>
        @if (error) {
          <p class="error">{{ error }}</p>
        }
      </div>
    </section>
  </main>`,
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styles: [
    `
      :host {
        display: block;
      }
      .preview {
        width: 100%;
        max-height: 360px;
        object-fit: contain;
        border-radius: 12px;
      }
      .publish-page {
        max-width: 800px;
        margin: 0 auto;
        padding: 3rem 1.5rem 5rem;
      }
      .publish-card {
        background: #fff;
        border-radius: 30px;
        padding: 3rem;
        box-shadow: 0 24px 60px rgba(13, 45, 107, 0.1);
        border: 1px solid rgba(13, 45, 107, 0.08);
      }
      h1 {
        font-size: clamp(2.4rem, 5vw, 4.5rem);
        line-height: 1;
        margin: 0.3rem 0 1rem;
        color: #0d2d6b;
      }
      .lead {
        color: #526278;
        line-height: 1.7;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #1b7a43;
        font-weight: 800;
      }
      .form {
        display: grid;
        gap: 1rem;
        margin-top: 2rem;
      }
      .form label {
        display: grid;
        gap: 0.4rem;
        color: #173a6d;
        font-weight: 700;
        font-size: 0.85rem;
      }
      .form input,
      .form select,
      .form textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #d7e0eb;
        border-radius: 12px;
        padding: 0.9rem;
        font: inherit;
      }
      .form input:focus,
      .form select:focus,
      .form textarea:focus {
        outline: none;
        border-color: #2e7ce6;
        box-shadow: 0 0 0 4px rgba(46, 124, 230, 0.12);
      }
      .upload-label input[type='file'] {
        padding: 0.7rem;
        background: #f8fbff;
      }
      .form small {
        color: #718096;
        font-weight: 500;
      }
      .selected-file {
        margin: 0;
        padding: 0.7rem 1rem;
        border-radius: 12px;
        background: #edf9f1;
        color: #1b7a43;
        font-size: 0.85rem;
      }
      .form button {
        border: 0;
        border-radius: 999px;
        padding: 1rem;
        background: #0d2d6b;
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }
      .form button:disabled {
        opacity: 0.65;
        cursor: wait;
      }
      .error {
        color: #b42318;
        font-weight: 700;
        background: #fff1f0;
        border-radius: 12px;
        padding: 0.8rem;
      }
      @media (max-width: 700px) {
        .publish-page {
          padding: 1.5rem 1rem 3rem;
        }
        .publish-card {
          padding: 1.5rem;
        }
      }
    `,
  ],
})
export class PublicarComponent implements OnDestroy {
  // Indica se existe um token no navegador; a API confirma sua validade em cada requisição.
  get loggedIn(): boolean { return !!localStorage.getItem('cidadania_token'); }
  // Estado da classe: guarda os dados e as opções utilizados pelos métodos e pelo template.
  form = { category: 'Cidadania', media_type: 'image', title: '', content: '', media_url: '' };
  selectedFile: File | null = null;
  error = '';
  loading = false;
  private readonly api = apiConfig.baseUrl;
  // Recebe os serviços do Angular utilizados por esta classe por injeção de dependências.
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
  previewUrl = '';
  // Revoga a URL temporária da prévia e limpa a referência ao arquivo selecionado.
  clearMedia(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = '';
    this.selectedFile = null;
  }
  // Libera a prévia do arquivo quando o Angular remove a página.
  ngOnDestroy(): void {
    this.clearMedia();
  }
  // Verifica o formato e o limite de 20 MB e cria uma URL temporária para a prévia.
  selectMedia(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.clearMedia();
    this.error = '';
    if (!file) return;
    const allowed =
      this.form.media_type === 'image'
        ? ['image/jpeg', 'image/png', 'image/webp']
        : ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type) || file.size > 20 * 1024 * 1024 || !file.size) {
      this.error = 'Selecione um arquivo válido do tipo escolhido, com até 20 MB.';
      input.value = '';
      return;
    }
    this.selectedFile = file;
    // A prévia usa uma URL do navegador; o upload só ocorre ao clicar em publicar.
    this.previewUrl = URL.createObjectURL(file);
  }
  // Valida sessão e campos, monta FormData e envia o post com o arquivo ao backend.
  publish(): void {
    this.error = '';
    const token = localStorage.getItem('cidadania_token');
    if (!token) {
      this.error = 'Sua sessão terminou. Entre novamente para publicar.';
      return;
    }
    if (!this.form.title.trim() || !this.form.content.trim()) {
      this.error = 'Preencha o título e o texto da publicação.';
      return;
    }
    this.loading = true;
    // FormData transporta texto e bytes no mesmo pedido multipart.
    // O navegador define o Content-Type e seu separador automaticamente.
    const payload = new FormData();
    payload.append('category', this.form.category);
    payload.append('media_type', this.form.media_type);
    payload.append('title', this.form.title.trim());
    payload.append('content', this.form.content.trim());
    if (this.form.media_url.trim()) payload.append('media_url', this.form.media_url.trim());
    if (this.selectedFile) payload.append('media_file', this.selectedFile, this.selectedFile.name);
    this.http
      .post(`${this.api}/posts/`, payload, {
        headers: new HttpHeaders({ Authorization: `Token ${token}` }),
      })
      .subscribe({
        next: () => this.router.navigate(['/postagens']),
        error: (error) => {
          this.loading = false;
          if (error.status === 401) {
            localStorage.removeItem('cidadania_token');
            this.error = 'Sua sessão expirou. Entre novamente para publicar.';
            return;
          }
          this.error =
            error?.error?.detail ||
            error?.error?.media_file?.[0] ||
            error?.error?.media_url?.[0] ||
            'Não foi possível publicar agora. Tente novamente.';
        },
      });
  }
}
