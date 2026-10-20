// Carrega o feed público, filtra assuntos e permite curtir, comentar e excluir posts próprios.
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  title: string;
  category: string;
  content: string;
  media_type: 'image' | 'video';
  media_url: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  is_mine: boolean;
  created_at?: string;
  author_profile?: { avatar_url: string; avatar_choice: string };
}
// Define o formato dos dados de Comment para conferir os tipos usados pela interface.
interface Comment {
  id: number;
  author: string;
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
  // Identifica posts com uma ação pendente para evitar curtidas ou comentários duplicados.
  busy = new Set<number>();
  categories = postCategories;
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
    private changeDetector: ChangeDetectorRef,
  ) {}
  // Executa a inicialização da página quando o Angular cria o componente.
  ngOnInit(): void {
    this.load();
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
    const token = localStorage.getItem('cidadania_token');
    return new HttpHeaders(token ? { Authorization: 'Token ' + token } : {});
  }
}
