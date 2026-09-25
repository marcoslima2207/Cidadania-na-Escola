import { Component } from '@angular/core';

@Component({
  selector: 'app-sobre',
  standalone: true,
  template: `
    <section class="page">
      <div class="page__header">
        <p class="eyebrow">Sobre</p>
        <h1>Quem somos</h1>
      </div>
      <div class="content-grid">
        <article class="card">
          <h2>Missão</h2>
          <p>Promover um ambiente de aprendizagem, reflexão e participação cidadã por meio da informação acessível e confiável.</p>
        </article>
        <article class="card">
          <h2>Visão</h2>
          <p>Construir uma sociedade mais crítica, democrática e consciente sobre os impactos da informação no cotidiano.</p>
        </article>
        <article class="card">
          <h2>Valores</h2>
          <p>Transparência, educação, respeito, comprometimento com a justiça social e a participação ativa.</p>
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
    .card { background: #f6f6f7; border-radius: 20px; padding: 1.5rem; border: 1px solid #dfe3e8; }
    .card h2 { color: #0d2d6b; margin-top: 0; }
    .card p { line-height: 1.7; color: #2f3d4f; }
    @media (max-width: 860px) { .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class SobreComponent {}
