import { Component } from '@angular/core';

@Component({
  selector: 'app-direitos-trabalhistas',
  standalone: true,
  template: `
    <section class="page">
      <div class="page__header">
        <p class="eyebrow">Tema</p>
        <h1>Direitos Trabalhistas</h1>
      </div>
      <div class="content-grid">
        <article class="card">
          <h2>Direito à informação</h2>
          <p>O trabalhador precisa conhecer seus direitos para exercer a cidadania e questionar práticas abusivas.</p>
        </article>
        <article class="card">
          <h2>Proteção e dignidade</h2>
          <p>Direitos trabalhistas são fundamentais para garantir condições justas, seguras e respeitosas no ambiente de trabalho.</p>
        </article>
        <article class="card">
          <h2>Educação profissional</h2>
          <p>Quando a informação circula com clareza, as pessoas conseguem agir com mais segurança e autonomia.</p>
        </article>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 1200px; margin: 2rem auto; padding: 0 2rem 3rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: .12em; color: #1b7a43; font-weight: 800; }
    h1 { margin: .4rem 0 0; font-size: clamp(2rem, 4vw, 3.5rem); color: #0d2d6b; }
    .content-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.2rem; margin-top: 2rem; }
    .card { background: #f7f5f1; border-radius: 20px; padding: 1.5rem; border: 1px solid #e8e0d3; }
    .card h2 { color: #0d2d6b; margin-top: 0; }
    .card p { line-height: 1.7; color: #2f3d4f; }
    @media (max-width: 860px) { .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class DireitosTrabalhistasComponent {}
