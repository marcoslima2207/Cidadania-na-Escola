// Monta a publicação, apresenta a prévia do arquivo e envia texto e mídia para a API.
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { finalize, timeout } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { apiConfig } from '../../api-config';
import { IconComponent } from '../../components/icon/icon.component';
import { postCategories } from '../../educational-topics';
import { PostsService } from '../../services/posts.service';

// PUBLICAR: formulario autenticado para criar foto, video ou texto.
@Component({
  selector: 'app-publicar',
  standalone: true,
  // Disponibiliza as diretivas, os formulários e os componentes usados por este template.
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  templateUrl: './publicar.component.html',
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styleUrl: './publicar.component.css',
})
export class PublicarComponent implements OnDestroy {
  readonly categories = postCategories;
  private readonly posts = inject(PostsService);
  submitted = false;
  fieldErrors: Record<string, string> = {};
  // Indica se existe um token no navegador; a API confirma sua validade em cada requisição.
  get loggedIn(): boolean {
    return !!localStorage.getItem('cidadania_token');
  }
  // Estado da classe: guarda os dados e as opções utilizados pelos métodos e pelo template.
  form = { category: 'Cidadania', media_type: 'image', title: '', content: '', media_url: '' };
  selectedFile: File | null = null;
  get hasMedia(): boolean {
    return !!this.selectedFile || !!this.form.media_url.trim();
  }
  error = '';
  loading = false;
  private readonly api = apiConfig.baseUrl;
  // Recebe os serviços do Angular utilizados por esta classe por injeção de dependências.
  constructor(
    private http: HttpClient,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
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
    delete this.fieldErrors['title'];
    delete this.fieldErrors['content'];
    // A prévia usa uma URL do navegador; o upload só ocorre ao clicar em publicar.
    this.previewUrl = URL.createObjectURL(file);
  }
  // Valida sessão e campos, monta FormData e envia o post com o arquivo ao backend.
  publish(): void {
    // Evita que cliques repetidos enviem a mesma publicação durante o upload.
    if (this.loading) return;
    this.submitted = true;
    this.fieldErrors = {};
    this.error = '';
    const token = localStorage.getItem('cidadania_token');
    if (!token) {
      this.error = 'Sua sessão terminou. Entre novamente para publicar.';
      return;
    }
    if (!this.hasMedia && (!this.form.title.trim() || !this.form.content.trim())) {
      if (!this.form.title.trim()) this.fieldErrors['title'] = 'Informe o título da publicação.';
      if (!this.form.content.trim()) this.fieldErrors['content'] = 'Escreva o texto da publicação.';
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
      .pipe(
        // Libera a tela se o servidor não responder, sem reenviar automaticamente o post.
        timeout(120_000),
        finalize(() => {
          this.loading = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.posts.publicationCreated.set(true);
          this.router.navigate(['/postagens']);
        },
        error: (error) => {
          for (const field of ['title', 'content', 'category', 'media_file']) {
            const message = error?.error?.[field];
            if (Array.isArray(message)) this.fieldErrors[field] = message[0];
          }
          if (error.status === 401) {
            localStorage.removeItem('cidadania_token');
            this.error = 'Sua sessão expirou. Entre novamente para publicar.';
            return;
          }
          this.error =
            (error.name === 'TimeoutError'
              ? 'O servidor demorou para responder. Confira a comunidade antes de tentar publicar novamente.'
              : '') ||
            (error.status === 0
              ? 'Não foi possível conectar à API. Verifique sua conexão e se o servidor está disponível.'
              : '') ||
            (error.status === 413
              ? 'O servidor recusou o tamanho do arquivo. Envie uma mídia menor.'
              : '') ||
            error?.error?.detail ||
            error?.error?.non_field_errors?.[0] ||
            error?.error?.title?.[0] ||
            error?.error?.content?.[0] ||
            error?.error?.category?.[0] ||
            error?.error?.media_type?.[0] ||
            error?.error?.media_file?.[0] ||
            error?.error?.media_url?.[0] ||
            'Não foi possível publicar agora. Tente novamente.';
        },
      });
  }
}
