import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { apiConfig } from '../../api-config';
import { educationalTopics, postCategories } from '../../educational-topics';
import { CommunityPost } from '../../services/posts.service';
import { IconComponent } from '../../components/icon/icon.component';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { TopicCardComponent } from '../../components/topic-card/topic-card.component';

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, PostCardComponent, TopicCardComponent],
  templateUrl: './buscar.component.html',
  styleUrl: './buscar.component.css',
})
export class BuscarComponent implements OnInit {
  term = '';
  category = '';
  searched = false;
  results: CommunityPost[] = [];
  recent: CommunityPost[] = [];
  meaning = '';
  searchedTerm = '';
  loading = false;
  error = '';
  private requestId = 0;
  readonly topics = educationalTopics;
  readonly categories = postCategories;
  private readonly meanings: Record<string, string> = {
    cidadania:
      'Participação ativa na sociedade, com direitos, deveres e responsabilidade coletiva.',
    democracia:
      'Sistema em que a sociedade participa das decisões públicas e acompanha seus representantes.',
    desinformacao: 'Conteúdo falso, impreciso ou fora de contexto que pode enganar quem o recebe.',
    direitos: 'Garantias e proteções que asseguram dignidade, liberdade e igualdade às pessoas.',
    checagem: 'Processo de verificar a origem, o contexto e a confiabilidade de uma informação.',
    'direitos trabalhistas': 'Garantias que protegem as pessoas nas relações de trabalho.',
    educacao: 'Processo de aprendizagem e formação para participar da vida em sociedade.',
    'fake news': 'Informações falsas apresentadas como notícias.',
    justica: 'Princípio de respeito aos direitos e de tratamento justo das pessoas.',
    igualdade: 'Princípio de que todas as pessoas têm a mesma dignidade e direitos.',
    liberdade:
      'Direito de fazer escolhas e expressar ideias respeitando os direitos das outras pessoas.',
  };
  constructor(
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    if (!this.searched && !this.loading && !this.term) this.loadRecent();
  }
  searchTopic(term: string): void {
    this.term = term;
    this.search();
  }
  search(): void {
    if (!this.term.trim() && !this.category) {
      this.error = 'Digite um assunto para pesquisar.';
      return;
    }
    this.requestPosts(true);
  }
  filterCategory(category: string): void {
    this.category = category;
    this.requestPosts(!!this.term.trim() || !!category);
  }
  loadRecent(): void {
    this.requestPosts(false);
  }
  retry(): void {
    this.requestPosts(!!this.term.trim() || !!this.category);
  }
  private requestPosts(isSearch: boolean): void {
    const term = this.term.trim(),
      id = ++this.requestId;
    this.loading = true;
    this.error = '';
    this.searched = false;
    const params: Record<string, string> = {};
    if (term) params['search'] = term;
    if (this.category) params['category'] = this.category;
    this.http.get<CommunityPost[]>(`${apiConfig.baseUrl}/posts/`, { params }).subscribe({
      next: (posts) => {
        if (id !== this.requestId) return;
        if (isSearch) this.results = posts;
        else this.recent = posts.slice(0, 6);
        this.searched = isSearch;
        this.searchedTerm = term || this.category;
        this.meaning =
          this.meanings[
            term
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          ] || '';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        if (id !== this.requestId) return;
        this.loading = false;
        this.error = 'Não foi possível buscar. Tente novamente.';
        this.changeDetector.markForCheck();
      },
    });
  }
}
