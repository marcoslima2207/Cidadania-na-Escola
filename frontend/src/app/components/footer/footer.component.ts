import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <p>© 2026 Cidadania na Escola</p>
      <p>Informação de qualidade também é conquista.</p>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #0d2d6b;
      color: #eef4ff;
      padding: 1.5rem 2rem;
      text-align: center;
      margin-top: 2rem;
    }
    .site-footer p {
      margin: 0.2rem 0;
      font-weight: 600;
    }
  `]
})
export class FooterComponent {}
