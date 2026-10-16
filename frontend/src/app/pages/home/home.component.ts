import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// HOME: apresentacao da plataforma, carrossel e chamada para o quiz.
// Restringe os valores aceitos pelo tipo PostTheme.
type PostTheme = 'justice' | 'education' | 'fake-news';

// Define o formato dos dados de Post para conferir os tipos usados pela interface.
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
  // Disponibiliza as diretivas, os formulários e os componentes usados por este template.
  imports: [CommonModule, RouterLink],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  template: `
    <main class="home-page">
      <section class="identity-banner">
        <div class="identity-banner__text">
          <p class="eyebrow">Proposta de</p>
          <h1>IDENTIDADE <span>VISUAL</span></h1>
          <p class="tagline">Informação de qualidade.<br />Cidadania mais forte.</p>
        </div>

        <div class="identity-banner__feature">
          <div class="feature-card">
            <h3>Aproximar a sociedade ao Congresso.</h3>
            <p>Transparência que informa, participação que transforma.</p>
          </div>
          <div class="hero-illustration" aria-hidden="true">
            <div class="building building--left"></div>
            <div class="building building--main"></div>
            <div class="building building--right"></div>
            <div class="dome"></div>
          </div>
        </div>
      </section>

      <section class="identity-grid">
        <article class="info-card info-card--blue">
          <div class="icon">◎</div>
          <h3>Propósito</h3>
          <p>
            Promover informação de qualidade, combater a desinformação e fortalecer a cidadania por
            meio da educação e do diálogo.
          </p>
        </article>
        <article class="info-card info-card--green">
          <div class="icon">◌</div>
          <h3>Conceito</h3>
          <p>
            Comunicar com abordagem moderna, transparente e acessível, usando linguagem clara e
            visual institucional.
          </p>
        </article>
        <article class="info-card info-card--neutral">
          <div class="icon">▣</div>
          <h3>Objetivos</h3>
          <p>
            Informar, estimular a participação social, promover cidadania ativa e transformar
            conhecimento em ação.
          </p>
        </article>
        <article class="info-card info-card--light">
          <div class="icon">✦</div>
          <h3>Valores</h3>
          <p>
            Transparência, credibilidade, diálogo, participação, educação e compromisso com a
            democracia.
          </p>
        </article>
      </section>

      <section class="posts-section">
        <h2 class="posts-title">POSTS:</h2>

        <div class="posts-carousel" aria-label="Posts em destaque">
          <button
            class="carousel-button carousel-button--prev"
            type="button"
            (click)="prevSlide()"
            [disabled]="currentIndex === 0"
            aria-label="Post anterior"
          >
            ‹
          </button>

          <div class="posts-viewport">
            <div class="posts-track" [style.--slide-index]="currentIndex">
              <article
                class="post-card"
                *ngFor="let post of posts"
                [ngClass]="'post-card--' + post.theme"
              >
                <img class="post-card__image" [src]="post.image" [alt]="post.title" />
                <div class="post-card__overlay"></div>

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

          <button
            class="carousel-button carousel-button--next"
            type="button"
            (click)="nextSlide()"
            [disabled]="currentIndex === posts.length - 1"
            aria-label="Próximo post"
          >
            ›
          </button>
        </div>
      </section>

      <section class="quiz-preview">
        <div class="quiz-preview__content">
          <p class="eyebrow">Quiz interativo</p>
          <h2>Teste seu conhecimento sobre cidadania, democracia e informação.</h2>
          <p>
            Desenvolva o senso crítico e aprenda a reconhecer conteúdos confiáveis e injustiças
            sociais.
          </p>
          <div class="quiz-preview__actions">
            <a routerLink="/quiz" class="btn btn-primary">Ir para o quiz</a>
          </div>
        </div>
        <div class="quiz-preview__panel" aria-hidden="true">
          <div class="panel-score">12 perguntas</div>
          <div class="panel-track">
            <span></span>
          </div>
          <div class="mini-answers">
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </div>
        </div>
      </section>
    </main>
  `,
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styles: [
    `
      :host {
        display: block;
        background:
          radial-gradient(circle at 8% 4%, rgba(240, 191, 45, 0.14), transparent 24rem),
          radial-gradient(circle at 92% 28%, rgba(44, 174, 95, 0.1), transparent 26rem),
          linear-gradient(180deg, #eef3f0 0%, #f8f9fb 100%);
        color: #0d2d6b;
        min-height: 100vh;
        padding-bottom: 2rem;
      }

      .home-page {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1.5rem 1.4rem 3rem;
      }

      .eyebrow {
        margin: 0 0 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #1b7a43;
        font-weight: 800;
        font-size: 0.76rem;
      }

      .identity-banner {
        background: linear-gradient(135deg, #0e3d82 0%, #114c9b 55%, #0f5ba6 100%);
        border-radius: 30px;
        color: white;
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: 1.2rem;
        padding: 2rem 2rem 0;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 28px 70px rgba(13, 45, 107, 0.2);
        animation: rise-in 0.7s ease both;
      }

      .identity-banner::before,
      .identity-banner::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        z-index: 0;
      }

      .identity-banner::before {
        width: 340px;
        height: 340px;
        top: -120px;
        right: -100px;
      }

      .identity-banner::after {
        width: 220px;
        height: 220px;
        bottom: -90px;
        left: -80px;
      }

      .identity-banner__text,
      .identity-banner__feature {
        position: relative;
        z-index: 1;
      }

      .identity-banner__text {
        padding: 2rem 0 2.5rem;
      }

      .identity-banner h1 {
        margin: 0;
        font-size: clamp(2.8rem, 5vw, 5.3rem);
        line-height: 0.93;
        letter-spacing: -0.08em;
        font-weight: 900;
        color: white;
      }

      .identity-banner h1 span {
        display: block;
        color: #f1d75b;
      }

      .tagline {
        margin-top: 1rem;
        font-size: 1.2rem;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.9);
        max-width: 420px;
      }

      .identity-banner__feature {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        min-height: 350px;
        position: relative;
      }

      .feature-card {
        align-self: flex-end;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 20px;
        padding: 1.25rem 1.5rem;
        max-width: 350px;
        margin-bottom: 1.5rem;
        backdrop-filter: blur(6px);
      }

      .feature-card h3 {
        margin: 0 0 0.6rem;
        font-size: 1.7rem;
        line-height: 1.1;
        color: white;
      }

      .feature-card p {
        margin: 0;
        color: rgba(255, 255, 255, 0.82);
        line-height: 1.6;
      }

      .hero-illustration {
        width: 100%;
        height: 220px;
        position: relative;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 0.6rem;
      }

      .building {
        position: relative;
        background: linear-gradient(180deg, #edf5ff 0%, #c8d7ea 100%);
        border-radius: 10px 10px 0 0;
        box-shadow: inset 0 0 0 2px rgba(13, 45, 107, 0.08);
      }

      .building--left {
        width: 120px;
        height: 140px;
        background: linear-gradient(180deg, #f8fafc 0%, #d5dfe9 100%);
      }

      .building--main {
        width: 200px;
        height: 180px;
        background: linear-gradient(180deg, #eaf3ff 0%, #bfd4ee 100%);
      }

      .building--right {
        width: 110px;
        height: 130px;
        background: linear-gradient(180deg, #f8fafc 0%, #dfe8f1 100%);
      }

      .dome {
        position: absolute;
        bottom: 18px;
        width: 290px;
        height: 110px;
        background: linear-gradient(
          180deg,
          rgba(240, 244, 250, 0.7) 0%,
          rgba(191, 210, 228, 0.8) 100%
        );
        border-radius: 45% 45% 0 0 / 100% 100% 0 0;
        box-shadow: inset 0 0 0 2px rgba(13, 45, 107, 0.08);
      }

      .identity-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .info-card {
        padding: 1.4rem 1.2rem;
        border-radius: 22px;
        min-height: 220px;
        border: 1px solid rgba(13, 45, 107, 0.08);
        box-shadow: 0 16px 30px rgba(14, 35, 68, 0.05);
        transition:
          transform 0.25s ease,
          box-shadow 0.25s ease,
          border-color 0.25s ease;
      }

      .info-card:hover {
        transform: translateY(-5px);
        border-color: rgba(13, 45, 107, 0.16);
        box-shadow: 0 22px 40px rgba(14, 35, 68, 0.1);
      }

      .info-card--blue {
        background: #edf5ff;
      }
      .info-card--green {
        background: #edf9f1;
      }
      .info-card--neutral {
        background: #f7f7f7;
      }
      .info-card--light {
        background: #f2f4f8;
      }

      .icon {
        width: 42px;
        height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(13, 45, 107, 0.08);
        font-size: 1.2rem;
        margin-bottom: 0.8rem;
      }

      .info-card h3 {
        margin: 0 0 0.6rem;
        color: #0d2d6b;
        font-size: 1.4rem;
      }

      .info-card p {
        margin: 0;
        line-height: 1.6;
        color: #2f3d4f;
      }

      .posts-section {
        margin-top: 2.2rem;
        padding: 1rem 0 0;
      }

      .posts-title {
        margin: 0 0 1rem;
        font-size: clamp(2rem, 3vw, 3.5rem);
        letter-spacing: -0.07em;
        color: #0d2d6b;
        font-weight: 900;
      }

      .posts-carousel {
        --post-width: min(31vw, 360px);
        --post-gap: 1.25rem;
        display: grid;
        grid-template-columns: 52px minmax(0, 1fr) 52px;
        gap: 1rem;
        align-items: center;
      }

      .posts-viewport {
        overflow: hidden;
        width: 100%;
      }

      .posts-track {
        display: flex;
        gap: var(--post-gap);
        transition: transform 0.42s ease;
        width: 100%;
        transform: translateX(
          calc(var(--slide-index) * (0px - var(--post-width) - var(--post-gap)))
        );
        padding-bottom: 0.5rem;
      }

      .post-card {
        position: relative;
        width: var(--post-width);
        min-height: 350px;
        border-radius: 24px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        color: white;
        box-shadow: 0 18px 35px rgba(9, 42, 78, 0.14);
        flex-shrink: 0;
        isolation: isolate;
      }

      .post-card__image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
      }

      .post-card__overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(11, 24, 44, 0.12), rgba(11, 24, 44, 0.72));
        z-index: 1;
      }

      .post-card__content,
      .post-card__footer {
        position: relative;
        z-index: 2;
        padding-left: 1.4rem;
        padding-right: 1.4rem;
      }

      .post-card__content {
        padding-top: 1.1rem;
        padding-bottom: 0.5rem;
      }

      .post-card h3 {
        margin: 0;
        font-size: clamp(2rem, 1.8vw, 2.4rem);
        line-height: 0.95;
        letter-spacing: -0.06em;
        font-weight: 900;
        text-transform: uppercase;
        max-width: 220px;
        color: white;
      }

      .post-card__badge {
        display: inline-block;
        margin-top: 0.8rem;
        margin-bottom: 0.75rem;
        padding: 0.45rem 0.8rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 700;
      }

      .post-card p {
        margin: 0;
        color: rgba(255, 255, 255, 0.92);
        font-size: 1rem;
        line-height: 1.5;
        max-width: 240px;
      }

      .post-card__footer {
        padding-bottom: 1.2rem;
        padding-top: 0.4rem;
        font-size: 0.7rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.9);
      }

      .post-card--justice {
        background: linear-gradient(180deg, #0c3c83, #0b2958);
      }
      .post-card--education {
        background: linear-gradient(180deg, #2cae5f, #1e8b4a);
      }
      .post-card--fake-news {
        background: linear-gradient(180deg, #173d77, #0a2a52);
      }

      .carousel-button {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 2px solid #0d2d6b;
        background: rgba(255, 255, 255, 0.7);
        color: #0d2d6b;
        font-size: 2rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        transition:
          transform 0.2s ease,
          background 0.2s ease,
          box-shadow 0.2s ease;
      }

      .carousel-button:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .carousel-button:hover:not(:disabled) {
        transform: scale(1.06);
        background: white;
        box-shadow: 0 10px 22px rgba(13, 45, 107, 0.14);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.8rem 1.2rem;
        border-radius: 999px;
        text-decoration: none;
        border: none;
        font-weight: 700;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          background 0.2s ease;
      }

      .btn:hover {
        transform: translateY(-2px);
      }

      .btn-primary {
        background: #153e79;
        color: white;
        box-shadow: 0 12px 20px rgba(21, 62, 121, 0.18);
      }

      .quiz-preview {
        margin-top: 2rem;
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 1rem;
        background: linear-gradient(135deg, #edf5ff 0%, #eefaf2 100%);
        border-radius: 28px;
        padding: 1.5rem 1.5rem 1.2rem;
        border: 1px solid rgba(13, 45, 107, 0.08);
        box-shadow: 0 18px 35px rgba(14, 35, 68, 0.04);
      }

      .quiz-preview__content h2 {
        margin: 0 0 0.8rem;
        font-size: clamp(2rem, 3vw, 3rem);
        line-height: 1.1;
        color: #0d2d6b;
      }

      .quiz-preview__content p {
        margin: 0;
        color: #2f3d4f;
        line-height: 1.7;
        max-width: 650px;
      }

      .quiz-preview__actions {
        margin-top: 1.2rem;
      }

      .quiz-preview__panel {
        background: #0d2d6b;
        border-radius: 22px;
        color: white;
        padding: 1.1rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 220px;
      }

      .panel-score {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.8rem;
        color: #f4d65a;
      }

      .panel-track {
        width: 100%;
        height: 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.2);
        overflow: hidden;
        margin-bottom: 1rem;
      }

      .panel-track span {
        display: block;
        width: 78%;
        height: 100%;
        background: linear-gradient(90deg, #2cae5f, #f2d65a);
        border-radius: inherit;
      }

      .mini-answers {
        display: flex;
        gap: 0.7rem;
      }

      .mini-answers span {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.18);
        font-weight: 800;
      }

      @media (prefers-reduced-motion: reduce) {
        .posts-track {
          transition: none;
        }
      }

      @keyframes rise-in {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 980px) {
        .identity-banner,
        .quiz-preview {
          grid-template-columns: 1fr;
        }

        .identity-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 700px) {
        .home-page {
          padding-left: 0.9rem;
          padding-right: 0.9rem;
        }

        .identity-banner {
          padding: 1.2rem 1rem 0;
        }

        .identity-banner__text {
          padding: 1rem 0 0.4rem;
        }

        .identity-grid {
          grid-template-columns: 1fr;
        }

        .posts-carousel {
          --post-width: 100%;
          --post-gap: 0.8rem;
          grid-template-columns: 38px minmax(0, 1fr) 38px;
        }

        .post-card {
          min-height: 360px;
        }

        .btn,
        .btn-primary {
          width: 100%;
        }
      }
    `,
  ],
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
      description:
        'Uma sociedade livre é aquela em que as pessoas podem agir com direitos, deveres e justiça.',
    },
    {
      image: 'posts/Gemini_Generated_Image_uzx9pwuzx9pwuzx9.jfif',
      title: 'Educação',
      subtitle: 'Educação',
      theme: 'education',
      badge: 'Escola',
      description:
        'A educação é um direito essencial para formar cidadãos críticos, conscientes e participantes da democracia.',
    },
    {
      image: 'posts/Gemini_Generated_Image_ve8p74ve8p74ve8p.jfif',
      title: 'Fake News',
      subtitle: 'Checagem',
      theme: 'fake-news',
      badge: 'Verificação',
      description:
        'Aprenda a identificar fontes confiáveis e evitar a propagação de informações falsas na internet.',
    },
  ];

  nextSlide(): void {
    this.currentIndex = Math.min(this.currentIndex + 1, this.posts.length - 1);
  }

  prevSlide(): void {
    this.currentIndex = Math.max(this.currentIndex - 1, 0);
  }
}
