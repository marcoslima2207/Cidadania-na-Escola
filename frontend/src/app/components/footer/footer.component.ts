import { Component } from '@angular/core';

// RODAPE: identidade e links institucionais exibidos no fim das paginas.
@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <div>
          <div class="brand-mini">
            <span class="brand-mini__mark"></span>
            <span>Cidadania na Escola</span>
          </div>
          <p>Informação de qualidade também é conquista.</p>
        </div>

        <div class="site-footer__links">
          <span>Democracia</span>
          <span>Desinformação</span>
          <span>Direitos</span>
          <span>Quiz</span>
        </div>

        <p class="site-footer__copy">© 2026 Cidadania na Escola</p>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: linear-gradient(180deg, #0e2d63 0%, #0b234b 100%);
      color: #eef4ff;
      padding: 2rem 1rem;
      margin-top: 3rem;
    }
    .site-footer__inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .brand-mini {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      font-size: 1rem;
      margin-bottom: 0.4rem;
    }
    .brand-mini__mark {
      display: inline-block;
      width: 18px;
      height: 26px;
      border-radius: 8px 8px 0 0;
      background: linear-gradient(180deg, #f5dd60, #d7a617);
      box-shadow: 0 0 0 5px rgba(255,255,255,0.08);
    }
    .site-footer p {
      margin: 0.2rem 0;
      font-weight: 500;
      color: rgba(238, 244, 255, 0.9);
    }
    .site-footer__links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem 1.2rem;
      font-size: 0.9rem;
      opacity: 0.9;
    }
    .site-footer__copy {
      font-weight: 700;
      opacity: 1;
    }
    @media (max-width: 640px) {
      .site-footer__inner {
        justify-content: center;
        text-align: center;
      }
      .site-footer__links {
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {}
