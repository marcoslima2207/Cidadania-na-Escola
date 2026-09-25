import { Component } from '@angular/core';

@Component({
  selector: 'app-checagem',
  standalone: true,
  template: `
    <section class="page">
      <div class="page__header">
        <p class="eyebrow">Ferramenta</p>
        <h1>Checagem</h1>
      </div>
      <div class="content-grid">
        <article class="card">
          <h2>Verifique a fonte</h2>
          <p>Pesquise o autor, a instituição e a origem da informação antes de compartilhar.</p>
        </article>
        <article class="card">
          <h2>Compare informações</h2>
          <p>Busque diferentes fontes confiáveis e compare dados, contextos e datas.</p>
        </article>
        <article class="card">
          <h2>Analise o contexto</h2>
          <p>Um vídeo ou trecho isolado pode distorcer a realidade; é essencial observar o contexto completo.</p>
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
    .card { background: #f1f5ff; border-radius: 20px; padding: 1.5rem; border: 1px solid #dfe8ff; }
    .card h2 { color: #0d2d6b; margin-top: 0; }
    .card p { line-height: 1.7; color: #2f3d4f; }
    @media (max-width: 860px) { .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class ChecagemComponent {}
