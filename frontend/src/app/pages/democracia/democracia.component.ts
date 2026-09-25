import { Component } from '@angular/core';

@Component({
  selector: 'app-democracia',
  standalone: true,
  template: `
    <section class="page">
      <div class="page__header">
        <p class="eyebrow">Tema</p>
        <h1>Democracia e Cidadania</h1>
      </div>
      <div class="content-grid">
        <article class="card">
          <h2>Por que isso importa</h2>
          <p>Uma democracia forte depende de cidadãos informados, críticos e participantes ativos na vida pública.</p>
        </article>
        <article class="card">
          <h2>Como agir</h2>
          <p>Participe de debates, acompanhe decisões públicas, respeite diferentes opiniões e busque informação confiável.</p>
        </article>
        <article class="card">
          <h2>Exemplo prático</h2>
          <p>Votar com consciência, acompanhar a atuação de representantes e questionar decisões com base em fatos.</p>
        </article>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 1200px; margin: 2rem auto; padding: 0 2rem 3rem; }
    .page__header { margin-bottom: 2rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: .12em; color: #1b7a43; font-weight: 800; }
    h1 { margin: .4rem 0 0; font-size: clamp(2rem, 4vw, 3.5rem); color: #0d2d6b; }
    .content-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.2rem; }
    .card { background: #f6f7f9; border-radius: 20px; padding: 1.5rem; border: 1px solid #dfe7f0; }
    .card h2 { color: #0d2d6b; margin-top: 0; }
    .card p { line-height: 1.7; color: #2f3d4f; }
    @media (max-width: 860px) { .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class DemocraciaComponent {}
