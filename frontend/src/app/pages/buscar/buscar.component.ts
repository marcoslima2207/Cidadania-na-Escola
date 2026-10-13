import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { apiConfig } from '../../api-config';

interface SearchPost {
  id: number;
  author: string;
  title: string;
  category: string;
  content: string;
  media_type: 'image' | 'video';
  media_url: string;
}

// BUSCA: significado resumido e posts relacionados por assunto.
@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="search-page">
      <section class="search-hero">
        <p class="eyebrow">Explorar</p>
        <h1>Encontre um assunto.</h1>
        <p>
          Pesquise por cidadania, democracia, direitos ou qualquer palavra presente nas publicações.
        </p>
        <form class="search-box" (submit)="$event.preventDefault(); search()">
          <span aria-hidden="true">⌕</span>
          <input
            [(ngModel)]="term"
            name="term"
            placeholder="O que você quer descobrir?"
            aria-label="Pesquisar assunto"
          />
          <button type="submit">Pesquisar</button>
        </form>
      </section>

      <section class="topics" aria-label="Assuntos">
        <h2>Explore por assunto</h2>
        @for (topic of topics; track topic.path) {
          <a [routerLink]="topic.path">{{ topic.label }}</a>
        }
        <div class="suggestions">
          @for (
            term of [
              'Cidadania',
              'Democracia',
              'Desinformação',
              'Direitos Trabalhistas',
              'Educação',
            ];
            track term
          ) {
            <button type="button" (click)="searchTopic(term)">{{ term }}</button>
          }
        </div>
      </section>
      @if (loading) {
        <p role="status">Buscando publicações...</p>
      }
      @if (error) {
        <p role="alert">{{ error }}</p>
      }

      @if (searched) {
        <section class="results-summary">
          <p class="eyebrow">Resultado da busca</p>
          <h2>{{ searchedTerm }}</h2>
          @if (meaning) {
            <p class="meaning"><strong>Significado:</strong> {{ meaning }}</p>
          } @else {
            <p class="meaning">
              Ainda não há uma definição de “{{ searchedTerm }}” no glossário do projeto. Veja
              abaixo as publicações relacionadas.
            </p>
          }
        </section>
        <section class="results-list">
          @for (post of results; track post.id) {
            <article class="result-card">
              <div class="result-meta">
                <span>{{ post.category }}</span
                ><small>por {{ post.author }}</small>
              </div>
              <h3>{{ post.title }}</h3>
              <p>{{ post.content }}</p>
              <a routerLink="/postagens" [queryParams]="{ post: post.id }">Ver na comunidade</a>
            </article>
          } @empty {
            <div class="empty">
              Nenhuma publicação encontrada para “{{ searchedTerm }}”. Tente outra palavra.
            </div>
          }
        </section>
      }
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .topics {
        margin: 2rem 0;
        color: #0d2d6b;
      }
      .topics a,
      .suggestions button {
        display: inline-block;
        margin: 0.3rem;
        padding: 0.7rem 1rem;
        border-radius: 12px;
        background: #eaf3ff;
        color: #0d2d6b;
        text-decoration: none;
        border: 1px solid #cbd9e8;
        font: inherit;
        cursor: pointer;
      }
      .suggestions {
        margin-top: 1rem;
      }
      .search-page {
        max-width: 980px;
        margin: 0 auto;
        padding: 3rem 1.5rem 5rem;
      }
      .search-hero {
        padding: 3rem;
        border-radius: 30px;
        color: white;
        background: linear-gradient(145deg, #0d2d6b, #1760aa);
        box-shadow: 0 24px 60px rgba(13, 45, 107, 0.16);
      }
      .eyebrow {
        margin: 0 0 0.8rem;
        color: #2cae5f;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-weight: 800;
      }
      h1 {
        margin: 0;
        font-size: clamp(2.6rem, 6vw, 5rem);
        line-height: 0.98;
      }
      .search-hero > p:not(.eyebrow) {
        max-width: 620px;
        color: rgba(255, 255, 255, 0.84);
        line-height: 1.7;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-top: 1.8rem;
        padding: 0.45rem 0.5rem 0.45rem 1rem;
        border-radius: 18px;
        background: white;
      }
      .search-box span {
        color: #0d2d6b;
        font-size: 1.8rem;
      }
      .search-box input {
        min-width: 0;
        flex: 1;
        border: 0;
        outline: 0;
        color: #173a6d;
        font: inherit;
      }
      .search-box button {
        border: 0;
        border-radius: 12px;
        padding: 0.8rem 1rem;
        background: #f0bf2d;
        color: #0d2d6b;
        font-weight: 900;
        cursor: pointer;
      }
      .results-summary {
        margin: 2.5rem 0 1rem;
      }
      .results-summary h2 {
        margin: 0;
        color: #0d2d6b;
        font-size: clamp(2rem, 4vw, 3.5rem);
      }
      .meaning {
        color: #526278;
        line-height: 1.7;
      }
      .results-list {
        display: grid;
        gap: 1rem;
      }
      .result-card,
      .empty {
        padding: 1.4rem;
        border: 1px solid rgba(13, 45, 107, 0.08);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 14px 30px rgba(13, 45, 107, 0.06);
      }
      .result-meta {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: #718096;
        font-size: 0.8rem;
      }
      .result-meta span {
        color: #1b7a43;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .result-card h3 {
        margin: 0.8rem 0 0.5rem;
        color: #0d2d6b;
      }
      .result-card p {
        color: #394b62;
        line-height: 1.6;
      }
      .result-card a {
        color: #0d2d6b;
        font-weight: 800;
        text-decoration: none;
      }
      .empty {
        color: #526278;
        text-align: center;
      }
      @media (max-width: 600px) {
        .search-page {
          padding: 1.5rem 1rem 3rem;
        }
        .search-hero {
          padding: 1.7rem;
        }
        .search-box {
          align-items: stretch;
          flex-wrap: wrap;
        }
        .search-box input {
          flex-basis: calc(100% - 2.5rem);
        }
        .search-box button {
          width: 100%;
        }
        .result-meta {
          flex-direction: column;
          gap: 0.3rem;
        }
      }
    `,
  ],
})
export class BuscarComponent {
  term = '';
  searched = false;
  results: SearchPost[] = [];
  meaning = '';
  searchedTerm = '';
  loading = false;
  error = '';
  private requestId = 0;
  topics = [
    { label: 'Democracia e cidadania', path: '/democracia' },
    { label: 'Desinformação', path: '/desinformacao' },
    { label: 'Checagem de informação', path: '/checagem' },
    { label: 'Direitos trabalhistas', path: '/direitos-trabalhistas' },
  ];
  private readonly api = apiConfig.baseUrl;
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

  constructor(private http: HttpClient) {}

  searchTopic(term: string): void {
    this.term = term;
    this.search();
  }

  search(): void {
    const term = this.term.trim();
    if (!term) {
      this.error = 'Digite um assunto para pesquisar.';
      return;
    }
    const id = ++this.requestId;
    this.loading = true;
    this.error = '';
    this.searched = false;
    this.http.get<SearchPost[]>(`${this.api}/posts/`, { params: { search: term } }).subscribe({
      next: (posts) => {
        if (id !== this.requestId) return;
        this.results = posts;
        this.searchedTerm = term;
        this.meaning =
          this.meanings[
            term
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          ] || '';
        this.loading = false;
        this.searched = true;
      },
      error: () => {
        if (id === this.requestId) {
          this.loading = false;
          this.error = 'Não foi possível buscar. Tente novamente.';
        }
      },
    });
  }
}
