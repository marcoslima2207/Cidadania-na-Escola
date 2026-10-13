// Carrega o feed público, filtra assuntos e permite curtir, comentar e excluir posts próprios.
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { apiConfig } from '../../api-config';
import { avatarImage } from '../../avatar-options';

// Define o formato dos dados de Post para conferir os tipos usados pela interface.
interface Post {
  id: number;
  author: string;
  title: string;
  category: string;
  content: string;
  media_type: 'image' | 'video';
  media_url: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  is_mine: boolean;
  author_profile?: { avatar_url: string; avatar_choice: string };
}
// Define o formato dos dados de Comment para conferir os tipos usados pela interface.
interface Comment {
  id: number;
  author: string;
  content: string;
}

// POSTAGENS: feed publico com curtidas, comentarios e exclusao do proprio autor.
@Component({
  selector: 'app-postagens',
  standalone: true,
  // Disponibiliza as diretivas, os formulários e os componentes usados por este template.
  imports: [CommonModule, FormsModule, RouterLink],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  template: `<main class="posts-page">
    <header class="posts-head">
      <div>
        <p class="eyebrow">Comunidade</p>
        <h1>Postagens</h1>
        <p>Ideias, informação e conversa pública em um só lugar.</p>
      </div>
      <a routerLink="/publicar">+ Publicar</a>
    </header>
    <div class="filters">
      <label
        >Assunto
        <select [(ngModel)]="category" (ngModelChange)="load()">
          <option value="">Todos os assuntos</option>
          @for (category of categories; track category) {
            <option>{{ category }}</option>
          }
        </select></label
      >
    </div>
    @if (loading) {
      <p role="status">Carregando publicações...</p>
    }
    @if (error) {
      <p class="error" role="alert">{{ error }}</p>
    }
    <section class="feed">
      @for (post of posts; track post.id) {
        <article class="post" [attr.id]="'post-' + post.id">
          <div class="post-top">
            <div class="avatar">
              @if (post.author_profile?.avatar_url) {
                <img [src]="post.author_profile?.avatar_url" [alt]="'Foto de ' + post.author" />
              } @else {
                <img
                  [src]="illustrationImage(post.author_profile?.avatar_choice)"
                  [alt]="'Ilustração de ' + post.author"
                />
              }
            </div>
            <div>
              <strong>{{ post.author }}</strong
              ><span class="category">{{ post.category }}</span>
            </div>
            @if (isMine(post)) {
              <button class="delete-button" type="button" (click)="deletePost(post)">
                Excluir
              </button>
            }
          </div>
          <h2>{{ post.title }}</h2>
          <p>{{ post.content }}</p>
          @if (post.media_url) {
            @if (post.media_type === 'image') {
              <img class="media" [src]="post.media_url" [alt]="post.title" />
            } @else {
              <video
                class="media"
                [src]="post.media_url"
                controls
                playsinline
                preload="metadata"
              ></video>
            }
          }
          <div class="actions">
            <button
              class="action-button action-button--like"
              type="button"
              [class.liked]="post.liked_by_me"
              [attr.aria-pressed]="post.liked_by_me"
              [disabled]="busy.has(post.id)"
              (click)="like(post)"
            >
              <span class="action-icon">♥</span
              ><span
                ><strong>{{ post.likes_count }}</strong
                ><small>{{ post.liked_by_me ? 'Curtido' : 'Curtir' }}</small></span
              ></button
            ><button
              class="action-button"
              type="button"
              [class.active]="openPost === post.id"
              (click)="toggleComments(post)"
            >
              <span class="action-icon">▢</span
              ><span
                ><strong>{{ post.comments_count }}</strong
                ><small>Comentários</small></span
              >
            </button>
          </div>
          @if (openPost === post.id) {
            <div class="comments">
              @for (comment of comments; track comment.id) {
                <p>
                  <strong>{{ comment.author }}</strong> {{ comment.content }}
                </p>
              }
              @if (loggedIn) {
                <div class="comment-form">
                  <input
                    aria-label="Escreva um comentário"
                    maxlength="500"
                    [(ngModel)]="commentText"
                    placeholder="Escreva um comentário"
                  /><button
                    type="button"
                    [disabled]="busy.has(post.id) || !commentText.trim()"
                    (click)="comment(post)"
                  >
                    Enviar
                  </button>
                </div>
              } @else {
                <a routerLink="/acesso">Entre para comentar ou curtir.</a>
              }
            </div>
          }
        </article>
      } @empty {
        @if (!loading && !error) {
          <div class="empty">
            Ainda não há publicações. Seja a primeira pessoa a compartilhar uma ideia.
          </div>
        }
      }
    </section>
  </main>`,
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styles: [
    `
      :host {
        display: block;
      }
      .filters {
        margin-bottom: 1rem;
      }
      .filters select {
        padding: 0.7rem;
        border-radius: 12px;
        border: 1px solid #cbd9e8;
      }
      .error {
        color: #b42318;
      }
      button:disabled {
        opacity: 0.6;
        cursor: wait;
      }
      .posts-page {
        max-width: 900px;
        margin: 0 auto;
        padding: 3rem 1.5rem 5rem;
      }
      .posts-head {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .posts-head h1 {
        font-size: clamp(2.6rem, 6vw, 5rem);
        line-height: 1;
        margin: 0.3rem 0;
        color: #0d2d6b;
      }
      .posts-head p {
        color: #526278;
      }
      .posts-head a {
        background: #0d2d6b;
        color: #fff;
        text-decoration: none;
        border-radius: 999px;
        padding: 0.9rem 1.2rem;
        font-weight: 800;
        white-space: nowrap;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #1b7a43;
        font-weight: 800;
      }
      .feed {
        display: grid;
        gap: 1.2rem;
      }
      .post {
        background: #fff;
        border: 1px solid rgba(13, 45, 107, 0.08);
        border-radius: 24px;
        padding: 1.5rem;
        box-shadow: 0 16px 35px rgba(13, 45, 107, 0.07);
      }
      .post-top {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .post-top strong,
      .post-top span {
        display: block;
      }
      .category {
        color: #0d2d6b !important;
        font-size: 1rem !important;
        font-weight: 900;
      }
      .avatar {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #f0bf2d, #2cae5f);
        color: #0d2d6b;
        font-weight: 900;
        font-size: 1.5rem;
        overflow: hidden;
        flex-shrink: 0;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .delete-button {
        margin-left: auto;
        border: 1px solid #f1b7b3;
        border-radius: 999px;
        padding: 0.45rem 0.7rem;
        background: #fff5f4;
        color: #b42318;
        font-weight: 800;
        cursor: pointer;
      }
      .post h2 {
        margin: 1rem 0 0.5rem;
        color: #0d2d6b;
      }
      .post > p {
        line-height: 1.65;
        color: #394b62;
      }
      .media {
        width: 100%;
        max-height: 420px;
        object-fit: cover;
        border-radius: 16px;
        margin-top: 1rem;
      }
      .video {
        display: block;
        margin-top: 1rem;
        padding: 3rem;
        text-align: center;
        border-radius: 16px;
        background: linear-gradient(135deg, #0d2d6b, #2cae5f);
        color: #fff;
        text-decoration: none;
        font-weight: 800;
      }
      .actions {
        display: flex;
        gap: 0.8rem;
        margin-top: 1rem;
        border-top: 1px solid #edf1f5;
        padding-top: 1rem;
      }
      .action-button {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        min-width: 145px;
        border: 1px solid #dce6f1;
        border-radius: 16px;
        padding: 0.7rem 0.9rem;
        background: #f8fbff;
        color: #526278;
        text-align: left;
        cursor: pointer;
        transition:
          transform 0.2s,
          background 0.2s,
          border-color 0.2s;
      }
      .action-button:hover {
        transform: translateY(-2px);
        border-color: #9dbbe0;
        background: #fff;
      }
      .action-icon {
        font-size: 1.45rem;
        color: #65758a;
      }
      .action-button span:last-child {
        display: grid;
        gap: 0.1rem;
      }
      .action-button small {
        font-size: 0.72rem;
      }
      .action-button.liked {
        border-color: #f1b7b3;
        background: #fff4f3;
        color: #c62828;
      }
      .action-button.liked .action-icon {
        color: #c62828;
      }
      .action-button.active {
        border-color: #9dbbe0;
        background: #eaf3ff;
        color: #0d2d6b;
      }
      .comments {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #edf1f5;
      }
      .comments p {
        color: #526278;
      }
      .comment-form {
        display: flex;
        gap: 0.5rem;
      }
      .comment-form input {
        flex: 1;
        border: 1px solid #d7e0eb;
        border-radius: 999px;
        padding: 0.7rem 1rem;
      }
      .comment-form button {
        border: 0;
        border-radius: 999px;
        background: #0d2d6b;
        color: #fff;
        padding: 0.7rem 1rem;
        font-weight: 700;
      }
      .empty {
        padding: 3rem;
        text-align: center;
        background: #fff;
        border-radius: 24px;
        color: #526278;
      }
      @media (max-width: 600px) {
        .posts-page {
          padding: 1.5rem 1rem 3rem;
        }
        .posts-head {
          align-items: start;
          flex-direction: column;
        }
        .actions {
          gap: 0.5rem;
        }
        .action-button {
          min-width: 0;
          flex: 1;
          padding: 0.65rem;
        }
        .comment-form {
          flex-direction: column;
        }
        .delete-button {
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class PostagensComponent implements OnInit {
  // Estado da classe: guarda os dados e as opções utilizados pelos métodos e pelo template.
  posts: Post[] = [];
  openPost: number | null = null;
  comments: Comment[] = [];
  commentText = '';
  loading = false;
  error = '';
  category = '';
  // Identifica posts com uma ação pendente para evitar curtidas ou comentários duplicados.
  busy = new Set<number>();
  categories = ['Cidadania', 'Democracia', 'Desinformação', 'Direitos Trabalhistas', 'Educação'];
  private readonly api = apiConfig.baseUrl;
  private loadId = 0;
  // Indica se existe um token no navegador; a API confirma sua validade em cada requisição.
  get loggedIn(): boolean {
    return !!localStorage.getItem('cidadania_token');
  }
  // Recebe os serviços do Angular utilizados por esta classe por injeção de dependências.
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {}
  // Executa a inicialização da página quando o Angular cria o componente.
  ngOnInit(): void {
    this.load();
  }
  // Consulta os posts com sessão e filtro de categoria, tratando carregamento e falhas de rede.
  load(): void {
    const id = ++this.loadId;
    this.loading = true;
    this.error = '';
    this.openPost = null;
    this.http
      .get<Post[]>(`${this.api}/posts/`, {
        headers: this.headers(),
        params: this.category ? { category: this.category } : {},
      })
      .subscribe({
        next: (posts) => {
          if (id !== this.loadId) return;
          this.posts = posts;
          this.loading = false;
          // Um resultado da busca pode abrir o feed já posicionado no post escolhido.
          const postId = this.route.snapshot.queryParamMap.get('post');
          if (postId)
            setTimeout(
              () => document.getElementById('post-' + postId)?.scrollIntoView({ block: 'start' }),
              0,
            );
        },
        error: () => {
          if (id === this.loadId) {
            this.loading = false;
            this.error = 'Não foi possível carregar a comunidade. Tente novamente.';
          }
        },
      });
  }
  // Usa o mesmo catálogo de ilustrações apresentado na edição do perfil.
  illustrationImage(choice?: string): string {
    return avatarImage(choice);
  }
  // Usa a indicação de autoria devolvida pela API para mostrar a opção de excluir.
  isMine(post: Post): boolean {
    return post.is_mine;
  }
  // Alterna a curtida do post e impede outra chamada enquanto a primeira estiver pendente.
  like(post: Post): void {
    if (!this.loggedIn) {
      this.error = 'Entre na sua conta para curtir.';
      return;
    }
    if (this.busy.has(post.id)) return;
    this.busy.add(post.id);
    this.http
      .post<{ liked: boolean; likes_count: number }>(
        `${this.api}/posts/${post.id}/like/`,
        {},
        { headers: this.headers() },
      )
      .subscribe({
        next: (r) => {
          post.liked_by_me = r.liked;
          post.likes_count = r.likes_count;
          this.busy.delete(post.id);
          this.error = '';
        },
        error: (e) => this.failed(post, e),
      });
  }
  // Pede confirmação de exclusão, envia DELETE e remove o post do feed após o sucesso.
  deletePost(post: Post): void {
    if (!confirm('Excluir esta publicação?')) return;
    this.http.delete(`${this.api}/posts/${post.id}/`, { headers: this.headers() }).subscribe({
      next: () => {
        this.posts = this.posts.filter((item) => item.id !== post.id);
      },
      error: (e) => this.failed(post, e),
    });
  }
  // Abre ou fecha os comentários e consulta a lista do post selecionado.
  toggleComments(post: Post): void {
    this.openPost = this.openPost === post.id ? null : post.id;
    this.comments = [];
    this.commentText = '';
    if (this.openPost)
      this.http
        .get<Comment[]>(`${this.api}/posts/${post.id}/comments/`, { headers: this.headers() })
        .subscribe({
          next: (comments) => {
            if (this.openPost === post.id) this.comments = comments;
          },
          error: (e) => this.failed(post, e),
        });
  }
  // Envia o comentário e atualiza a lista e a contagem quando a API confirma o cadastro.
  comment(post: Post): void {
    if (!this.commentText.trim() || this.busy.has(post.id)) return;
    this.busy.add(post.id);
    this.http
      .post<Comment>(
        `${this.api}/posts/${post.id}/comments/`,
        { content: this.commentText.trim() },
        { headers: this.headers() },
      )
      .subscribe({
        next: (c) => {
          if (this.openPost === post.id) {
            this.comments = [...this.comments, c];
            this.commentText = '';
          }
          post.comments_count++;
          this.busy.delete(post.id);
          this.error = '';
        },
        error: (e) => this.failed(post, e),
      });
  }
  // Libera o bloqueio da ação e apresenta uma mensagem para sessão expirada ou outra falha.
  private failed(post: Post, e: { status: number }): void {
    this.busy.delete(post.id);
    this.error =
      e.status === 401
        ? 'Sua sessão expirou. Entre novamente.'
        : 'Não foi possível concluir a ação. Tente novamente.';
  }
  // Monta o cabeçalho de autenticação com o token salvo no navegador.
  private headers(): HttpHeaders {
    const token = localStorage.getItem('cidadania_token');
    return new HttpHeaders(token ? { Authorization: 'Token ' + token } : {});
  }
}
