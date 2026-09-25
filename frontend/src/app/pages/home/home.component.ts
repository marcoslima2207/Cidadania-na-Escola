import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type PostTheme = 'justice' | 'education' | 'fake-news';

interface Post {
  image: string;
  title: string;
  subtitle: string;
  theme: PostTheme;
  badge: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="posts-section">
      <h2 class="posts-title">POSTS:</h2>

      <div class="posts-carousel" aria-label="Posts em destaque">
        <button class="carousel-button carousel-button--prev" type="button" (click)="prevSlide()" aria-label="Post anterior">
          ‹
        </button>

        <div class="posts-viewport">
          <div class="posts-track" [style.--slide-index]="currentIndex">
            <article class="post-card" *ngFor="let post of posts" [ngClass]="'post-card--' + post.theme">
              <img class="post-card__image" [src]="post.image" [alt]="post.title" />
              <div class="post-card__graphic" aria-hidden="true">
                <span class="mark mark--one"></span>
                <span class="mark mark--two"></span>
                <span class="mark mark--three"></span>
              </div>

              <div class="post-card__content">
                <h3>{{ post.title }}</h3>
                <div class="post-card__badge">{{ post.badge }}</div>
                <p>{{ post.description }}</p>
              </div>

              <div class="post-card__footer">
                <span>{{ post.subtitle }}</span>
              </div>
            </article>
          </div>
        </div>

        <button class="carousel-button carousel-button--next" type="button" (click)="nextSlide()" aria-label="Próximo post">
          ›
        </button>
      </div>
    </section>

    <section class="hero">
      <div class="hero__content">
        <p class="eyebrow">Cidadania na Escola</p>
        <h1>Informação de qualidade.<br />Cidadania mais forte.</h1>
        <p class="lead">
          A plataforma conecta educação, democracia e participação cidadã para fortalecer o debate público e a compreensão dos direitos e deveres sociais.
        </p>
        <div class="hero__actions">
          <a routerLink="/quiz" class="btn btn-primary">Começar agora</a>
          <a routerLink="/democracia" class="btn btn-secondary">Saiba mais</a>
        </div>
      </div>
      <div class="hero__visual" aria-hidden="true">
        <div class="visual-card visual-card--blue"></div>
        <div class="visual-card visual-card--green"></div>
        <div class="visual-card visual-card--light"></div>
      </div>
    </section>

    <section class="topics">
      <article class="topic-card topic-card--blue">
        <h2>Democracia e Cidadania</h2>
        <p>Entenda como a participação ativa fortalece instituições, direitos e responsabilidade social.</p>
      </article>
      <article class="topic-card topic-card--green">
        <h2>Desinformação</h2>
        <p>Aprenda a identificar notícias falsas, boatos e conteúdos manipulados na internet.</p>
      </article>
      <article class="topic-card topic-card--neutral">
        <h2>Direitos Trabalhistas</h2>
        <p>Conheça informações essenciais sobre trabalho, proteção e garantia de direitos.</p>
      </article>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      color: #102748;
      background: #edf3f2;
      min-height: 100vh;
    }
    .posts-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 2rem 0;
    }
    .posts-title {
      margin: 0 0 1.5rem;
      font-size: clamp(2rem, 3vw, 4rem);
      line-height: 1.05;
      letter-spacing: -0.06em;
      color: #0d2d6b;
      font-weight: 900;
      text-align: center;
    }
    .posts-carousel {
      position: relative;
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) 52px;
      align-items: center;
      gap: 1rem;
    }
    .posts-viewport {
      overflow: hidden;
      width: 100%;
    }
    .posts-track {
      display: flex;
      gap: 1.4rem;
      transition: transform 0.45s ease;
      width: max-content;
      padding-bottom: 0.4rem;
      transform: translateX(calc(var(--slide-index) * -33.333%));
    }
    .post-card {
      position: relative;
      width: min(31.8vw, 360px);
      min-height: 350px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 18px 36px rgba(11, 53, 92, 0.12);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #fff;
      background: linear-gradient(180deg, rgba(9, 34, 76, 0.6), rgba(9, 34, 76, 0.2));
      padding: 0;
      border: 0;
      flex-shrink: 0;
    }
    .post-card__image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }
    .post-card__graphic {
      display: none;
    }
    .mark {
      position: absolute;
      display: block;
      border-radius: 50%;
      background: rgba(255, 214, 0, 0.9);
      box-shadow: 0 0 0 10px rgba(255, 214, 0, 0.12);
    }
    .mark--one {
      width: 72%;
      height: 72%;
      top: 8%;
      left: 14%;
      opacity: 0.7;
    }
    .mark--two {
      width: 56%;
      height: 56%;
      top: 34%;
      left: 22%;
      opacity: 0.82;
    }
    .mark--three {
      width: 22%;
      height: 22%;
      top: 42%;
      left: 39%;
      opacity: 0.9;
    }
    .post-card__content,
    .post-card__footer {
      display: none;
    }
    .post-card__content {
      padding-top: 1.2rem;
    }
    .post-card h3 {
      margin: 0;
      font-size: clamp(2rem, 2vw, 2.4rem);
      line-height: 0.95;
      letter-spacing: -0.05em;
      font-weight: 900;
      text-transform: uppercase;
      max-width: 220px;
    }
    .post-card__badge {
      display: inline-block;
      margin-top: 1rem;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.36);
      border-radius: 999px;
      padding: 0.5rem 0.8rem;
    }
    .post-card p {
      margin: 1rem 0 0;
      line-height: 1.5;
      font-size: 1rem;
      max-width: 240px;
      color: rgba(255, 255, 255, 0.92);
    }
    .post-card__footer {
      padding-bottom: 1.2rem;
      padding-top: 0.8rem;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.9);
      font-weight: 700;
    }
    .post-card--justice {
      background: linear-gradient(180deg, rgba(17, 87, 172, 0.84), rgba(17, 87, 172, 0.95));
    }
    .post-card--education {
      background: linear-gradient(180deg, rgba(12, 145, 73, 0.78), rgba(9, 93, 65, 0.96));
    }
    .post-card--fake-news {
      background: linear-gradient(180deg, rgba(17, 87, 172, 0.92), rgba(4, 64, 116, 0.96));
    }
    .carousel-button {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 2px solid #0d2d6b;
      background: rgba(255, 255, 255, 0.45);
      color: #0d2d6b;
      font-size: 2rem;
      line-height: 1;
      cursor: pointer;
      transition: transform 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .carousel-button:hover {
      transform: translateY(-1px);
    }
    .carousel-button--prev {
      margin-right: 0.25rem;
    }
    .carousel-button--next {
      margin-left: 0.25rem;
    }
    .hero {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 2rem;
      align-items: center;
      padding: 3rem 2rem 1rem;
      background: linear-gradient(135deg, #eaf2ff 0%, #edf8f1 100%);
      border-radius: 28px;
      margin: 1.5rem auto 2rem;
      max-width: 1200px;
    }
    .eyebrow {
      margin: 0 0 1rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 800;
      color: #1e7d49;
      font-size: 0.8rem;
    }
    h1 {
      margin: 0;
      font-size: clamp(2.6rem, 5vw, 5rem);
      line-height: 0.95;
      letter-spacing: -0.06em;
      color: #0d2d6b;
    }
    .lead {
      margin-top: 1.2rem;
      max-width: 640px;
      font-size: 1.1rem;
      line-height: 1.7;
      color: #2e466d;
    }
    .hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1.7rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.85rem 1.4rem;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      transition: transform 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-1px);
    }
    .btn-primary {
      background: #153e79;
      color: white;
    }
    .btn-secondary {
      background: transparent;
      color: #153e79;
      border: 2px solid #153e79;
    }
    .hero__visual {
      position: relative;
      min-height: 320px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 1rem;
    }
    .visual-card {
      border-radius: 24px;
      box-shadow: 0 25px 50px rgba(12, 36, 81, 0.15);
    }
    .visual-card--blue {
      width: 170px;
      height: 210px;
      background: linear-gradient(180deg, #0b3d9a 0%, #114aa0 100%);
    }
    .visual-card--green {
      width: 130px;
      height: 180px;
      background: linear-gradient(180deg, #2fb165 0%, #1f8f4e 100%);
      margin-bottom: 26px;
    }
    .visual-card--light {
      width: 110px;
      height: 150px;
      background: linear-gradient(180deg, #edf5f2 0%, #dfeff2 100%);
      margin-bottom: 48px;
    }
    .topics {
      max-width: 1200px;
      margin: 0 auto 2.5rem;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.2rem;
    }
    .topic-card {
      padding: 1.5rem;
      border-radius: 22px;
      min-height: 200px;
    }
    .topic-card h2 {
      margin: 0 0 0.8rem;
      font-size: 1.3rem;
      color: #102748;
    }
    .topic-card p {
      margin: 0;
      line-height: 1.6;
      color: #2f3d4f;
      font-weight: 500;
    }
    .topic-card--blue { background: #edf5ff; }
    .topic-card--green { background: #edf9f1; }
    .topic-card--neutral { background: #f4f4f4; }
    @media (max-width: 860px) {
      .posts-section {
        padding: 1.25rem 0.85rem 0;
      }
      .posts-carousel {
        grid-template-columns: 42px minmax(0, 1fr) 42px;
        gap: 0.35rem;
      }
      .carousel-button {
        display: inline-flex;
        width: 38px;
        height: 38px;
        font-size: 1.6rem;
      }
      .posts-track {
        gap: 0;
        width: 100%;
        transform: translateX(calc(var(--slide-index) * -100%));
      }
      .post-card {
        width: 100%;
        min-height: 390px;
        border-radius: 18px;
      }
      .posts-title { margin-bottom: 1rem; font-size: 2.5rem; }
      .hero {
        grid-template-columns: 1fr;
        margin: 1.1rem 0.85rem 1.5rem;
        padding: 2rem 1.2rem 1rem;
        border-radius: 22px;
        gap: 1rem;
      }
      h1 { font-size: clamp(2.45rem, 12vw, 3.6rem); }
      .lead { font-size: 1rem; line-height: 1.55; }
      .hero__actions { gap: 0.7rem; }
      .btn { flex: 1 1 100%; padding: 0.8rem 1rem; }
      .hero__visual { min-height: 210px; gap: 0.55rem; }
      .visual-card--blue { width: 105px; height: 150px; }
      .visual-card--green { width: 86px; height: 125px; margin-bottom: 18px; }
      .visual-card--light { width: 72px; height: 105px; margin-bottom: 30px; }
      .topics {
        grid-template-columns: 1fr;
        padding: 0 0.85rem;
        gap: 0.85rem;
      }
      .topic-card { min-height: auto; padding: 1.2rem; }
    }
  `]
})
export class HomeComponent {
  currentIndex = 0;

  posts: Post[] = [
    {
      image: 'posts/Gemini_Generated_Image_kunbw2kunbw2kunb.jfif',
      title: 'Qual dever da Justiça?',
      subtitle: 'Justiça',
      theme: 'justice',
      badge: 'Cidadania',
      description: 'Uma sociedade livre e aquela em que as pessoas podem gerar ações e seus direitos e deveres.'
    },
    {
      image: 'posts/Gemini_Generated_Image_uzx9pwuzx9pwuzx9.jfif',
      title: 'Educação',
      subtitle: 'Educação',
      theme: 'education',
      badge: 'Escola',
      description: 'A educação é um direito essencial para formar cidadãos críticos, conscientes e participantes da democracia.'
    },
    {
      image: 'posts/Gemini_Generated_Image_ve8p74ve8p74ve8p.jfif',
      title: 'Fake News',
      subtitle: 'Checagem',
      theme: 'fake-news',
      badge: 'Verificação',
      description: 'Aprenda a identificar fontes confiáveis e evitar a propagação de informações falsas na internet.'
    }
  ];

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.posts.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.posts.length) % this.posts.length;
  }
}
