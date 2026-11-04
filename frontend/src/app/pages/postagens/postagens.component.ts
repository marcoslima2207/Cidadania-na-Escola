import { AuthService } from '../../services/auth.service';
// Carrega o feed público, filtra assuntos e permite curtir, comentar e excluir posts próprios.
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, OnDestroy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { apiConfig } from '../../api-config';
import { avatarImage } from '../../avatar-options';
import { postCategories } from '../../educational-topics';
import { IconComponent } from '../../components/icon/icon.component';
import { PostsService } from '../../services/posts.service';

// Define o formato dos dados de Post para conferir os tipos usados pela interface.
interface Post {
  id: number;
  author: string;
  author_display_name?: string;
  title: string;
  category: string;
  content: string;
  media_type: 'image' | 'video';
  media_url: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  is_mine: boolean;
  saved_by_me?: boolean;
  created_at?: string;
  author_profile?: { avatar_url: string; avatar_choice: string };
}
// Define o formato dos dados de Comment para conferir os tipos usados pela interface.
interface Comment {
  id: number;
  author: string;
  author_display_name?: string;
  content: string;
  created_at?: string;
}

// POSTAGENS: feed publico com curtidas, comentarios e exclusao do proprio autor.
@Component({
  selector: 'app-postagens',
  standalone: true,
  // Disponibiliza as diretivas, os formulários e os componentes usados por este template.
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  templateUrl: './postagens.component.html',
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styleUrl: './postagens.component.css',
})
export class PostagensComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  readonly publicationCreated = inject(PostsService).publicationCreated;
  ngOnDestroy(): void {
    this.publicationCreated.set(false);
  }
  // Estado da classe: guarda os dados e as opções utilizados pelos métodos e pelo template.
  posts: Post[] = [];
  openPost: number | null = null;
  comments: Comment[] = [];
  commentText = '';
  loading = false;
  commentsLoading = false;
  error = '';
  category = '';
  scope = '';
  editing: { id: number; title: string; content: string } | null = null;
  editError = '';
  private readonly destroyRef = inject(DestroyRef);
  // Identifica posts com uma ação pendente para evitar curtidas ou comentários duplicados.
  busy = new Set<number>();
  categories = postCategories;
  private readonly api = apiConfig.baseUrl;
  private loadId = 0;
  // Indica se existe um token no navegador; a API confirma sua validade em cada requisição.
  get loggedIn(): boolean {
    return this.auth.loggedIn;
  }
  // Recebe os serviços do Angular utilizados por esta classe por injeção de dependências.
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
  ) {}
  // Executa a inicialização da página quando o Angular cria o componente.
  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const scope = params.get('lista');
      this.scope = scope === 'minhas' || scope === 'favoritos' ? scope : '';
      this.load();
    });
  }
  setCategory(category: string): void {
    this.category = category;
    this.load();
  }
  // Consulta os posts com sessão e filtro de categoria, tratando carregamento e falhas de rede.
  load(): void {
    const id = ++this.loadId;
    this.loading = true;
    this.error = '';
    this.openPost = null;
    this.editing = null;
    if (this.scope) this.posts = [];
    if (this.scope && !this.loggedIn) {
      this.loading = false;
      this.error = 'Entre na sua conta para acessar esta lista.';
      return;
    }
    this.http
      .get<Post[]>(`${this.api}/posts/`, {
        headers: this.headers(),
        params: { ...(this.category ? { category: this.category } : {}), ...(this.scope ? { lista: this.scope } : {}) },
      })
      .subscribe({
        next: (posts) => {
          if (id !== this.loadId) return;
          this.posts = posts;
          this.loading = false;
          // Atualiza o feed depois da resposta HTTP no Angular sem Zone.js.
          this.changeDetector.markForCheck();
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
            this.changeDetector.markForCheck();
          }
        },
      });
  }
  // Usa o mesmo catálogo de ilustrações apresentado na edição do perfil.
  editPost(post: Post): void {
    this.editError = '';
    this.editing = { id: post.id, title: post.title, content: post.content };
  }

  savePost(post: Post): void {
    const draft = this.editing;
    if (!draft || draft.id !== post.id || !this.isMine(post) || this.busy.has(post.id)) return;
    this.busy.add(post.id);
    this.editError = '';
    this.http.patch<Post>(`${this.api}/posts/${post.id}/`, {
      title: draft.title, content: draft.content,
    }, { headers: this.headers() }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: saved => {
        Object.assign(post, saved);
        this.busy.delete(post.id);
        if (this.editing === draft) this.editing = null;
        this.changeDetector.markForCheck();
      },
      error: response => {
        this.busy.delete(post.id);
        this.editError = response.error?.title?.[0] || response.error?.content?.[0] ||
          'Não foi possível salvar a publicação. Tente novamente.';
        this.changeDetector.markForCheck();
      },
    });
  }

  toggleFavorite(post: Post): void {
    if (!this.loggedIn || this.busy.has(post.id)) return;
    const url = `${this.api}/posts/${post.id}/favorite/`;
    const options = { headers: this.headers() };
    this.busy.add(post.id);
    const request = post.saved_by_me
      ? this.http.delete<{ saved_by_me: boolean }>(url, options)
      : this.http.put<{ saved_by_me: boolean }>(url, {}, options);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.busy.delete(post.id);
        post.saved_by_me = result.saved_by_me;
        if (this.scope === 'favoritos' && !post.saved_by_me) {
          this.posts = this.posts.filter(item => item.id !== post.id);
        }
        this.changeDetector.markForCheck();
      },
      error: error => this.failed(post, error),
    });
  }

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
          this.changeDetector.markForCheck();
        },
        error: (e) => this.failed(post, e),
      });
  }
  // Pede confirmação de exclusão, envia DELETE e remove o post do feed após o sucesso.
  deletePost(post: Post): void {
    if (this.busy.has(post.id)) return;
    if (!confirm('Excluir esta publicação?')) return;
    this.busy.add(post.id);
    this.http.delete(`${this.api}/posts/${post.id}/`, { headers: this.headers() }).subscribe({
      next: () => {
        this.posts = this.posts.filter((item) => item.id !== post.id);
        this.busy.delete(post.id);
        this.changeDetector.markForCheck();
      },
      error: (e) => this.failed(post, e),
    });
  }
  // Abre ou fecha os comentários e consulta a lista do post selecionado.
  toggleComments(post: Post): void {
    this.openPost = this.openPost === post.id ? null : post.id;
    this.comments = [];
    this.commentText = '';
    this.commentsLoading = !!this.openPost;
    if (this.openPost)
      this.http
        .get<Comment[]>(`${this.api}/posts/${post.id}/comments/`, { headers: this.headers() })
        .subscribe({
          next: (comments) => {
            if (this.openPost === post.id) {
              this.comments = comments;
              this.commentsLoading = false;
              this.changeDetector.markForCheck();
            }
          },
          error: (e) => {
            if (this.openPost === post.id) {
              this.commentsLoading = false;
              this.failed(post, e);
            }
          },
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
          this.changeDetector.markForCheck();
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
    this.changeDetector.markForCheck();
  }
  // Monta o cabeçalho de autenticação com o token salvo no navegador.
  private headers(): HttpHeaders {
    return this.auth.headers;
  }
}
