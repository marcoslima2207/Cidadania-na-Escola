import { Component } from '@angular/core';

// CONTEUDO: pagina educativa sobre direitos trabalhistas.
@Component({
  selector: 'app-direitos-trabalhistas',
  standalone: true,
  template: `
    <section class="page page--trabalho">
      <header class="page__header">
        <p class="eyebrow">Tema</p>
        <h1>Direitos Trabalhistas</h1>
        <p class="lead">
          Conhecer os direitos do trabalho é essencial para promover dignidade, segurança e justiça nas relações profissionais.
        </p>
      </header>

      <div class="content-grid">
        <article class="card card--neutral">
          <span class="card__tag">Informação</span>
          <h2>Direito à informação</h2>
          <p>O trabalhador precisa conhecer seus direitos para exercer a cidadania e questionar práticas abusivas.</p>
        </article>
        <article class="card card--blue">
          <span class="card__tag">Proteção</span>
          <h2>Proteção e dignidade</h2>
          <p>Direitos trabalhistas são fundamentais para garantir condições justas, seguras e respeitosas no ambiente de trabalho.</p>
        </article>
        <article class="card card--green">
          <span class="card__tag">Autonomia</span>
          <h2>Educação profissional</h2>
          <p>Quando a informação circula com clareza, as pessoas conseguem agir com mais segurança e autonomia.</p>
        </article>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 2rem 3rem;
    }
    .page__header {
      background: linear-gradient(135deg, #f7f5f1 0%, #effaff 100%);
      border-radius: 28px;
      padding: 2rem 2rem 1.5rem;
      box-shadow: 0 18px 35px rgba(12, 49, 92, 0.06);
      margin-bottom: 2rem;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: .12em;
      color: #1b7a43;
      font-weight: 800;
      margin: 0 0 0.8rem;
    }
    h1 {
      margin: 0;
      font-size: clamp(2.2rem, 4vw, 3.8rem);
      color: #0d2d6b;
      line-height: 1;
    }
    .lead {
      margin: 1rem 0 0;
      max-width: 720px;
      line-height: 1.7;
      color: #2f3d4f;
      font-size: 1.05rem;
    }
    .content-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.2rem;
    }
    .card {
      border-radius: 22px;
      padding: 1.6rem;
      border: 1px solid rgba(13, 45, 107, 0.08);
      box-shadow: 0 12px 25px rgba(14, 35, 68, 0.04);
      min-height: 220px;
    }
    .card--neutral { background: #f7f5f1; }
    .card--blue { background: #edf5ff; }
    .card--green { background: #edf9f1; }
    .card__tag {
      display: inline-block;
      padding: 0.5rem 0.8rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(13,45,107,0.08);
      color: #173a6d;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 0.9rem;
    }
    .card h2 {
      color: #0d2d6b;
      margin-top: 0;
      margin-bottom: 0.8rem;
      font-size: 1.5rem;
    }
    .card p {
      line-height: 1.7;
      color: #2f3d4f;
      margin: 0;
    }
    @media (max-width: 860px) {
      .page { padding: 0 1rem 3rem; }
      .page__header { padding: 1.5rem 1.2rem; }
      .content-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DireitosTrabalhistasComponent {}
