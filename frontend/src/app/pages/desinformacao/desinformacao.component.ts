import { Component } from '@angular/core';

@Component({
  selector: 'app-desinformacao',
  standalone: true,
  template: `
    <section class="page">
      <div class="page__header">
        <p class="eyebrow">Tema</p>
        <h1>Desinformação</h1>
      </div>
      <div class="content-grid">
        <article class="card">
          <h2>O problema</h2>
          <p>Informações falsas se espalham rapidamente e podem influenciar decisões, opiniões e comportamentos.</p>
        </article>
        <article class="card">
          <h2>Como checar</h2>
          <p>Confirme a fonte, compare com veículos confiáveis, observe a data e procure contexto antes de compartilhar.</p>
        </article>
        <article class="card">
          <h2>Impacto social</h2>
          <p>Quando a informação é pouco confiável, a confiança pública e o debate democrático ficam enfraquecidos.</p>
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
    .card { background: #eefaf2; border-radius: 20px; padding: 1.5rem; border: 1px solid #d9ebde; }
    .card h2 { color: #0d2d6b; margin-top: 0; }
    .card p { line-height: 1.7; color: #2f3d4f; }
    @media (max-width: 860px) { .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class DesinformacaoComponent {}
