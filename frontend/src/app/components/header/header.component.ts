import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="brand">
        <div class="brand__mark" aria-hidden="true">
          <span class="mark mark--yellow"></span>
          <span class="mark mark--green"></span>
          <span class="mark mark--blue"></span>
        </div>
        <div class="brand__text">
          <span>CIDADANIA</span>
          <span>NA ESCOLA</span>
        </div>
      </div>

      <nav class="nav" aria-label="Menu principal">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Início</a>
        <a routerLink="/democracia" routerLinkActive="active">Democracia</a>
        <a routerLink="/desinformacao" routerLinkActive="active">Desinformação</a>
        <a routerLink="/checagem" routerLinkActive="active">Checagem</a>
        <a routerLink="/direitos-trabalhistas" routerLinkActive="active">Direitos Trabalhistas</a>
        <a routerLink="/quiz" routerLinkActive="active">Quiz</a>
        <a routerLink="/sobre" routerLinkActive="active">Sobre</a>
      </nav>
    </header>
  `,
  styles: [`
    .site-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.2rem 2rem 1.6rem;
      flex-wrap: wrap;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.9rem;
    }
    .brand__mark {
      position: relative;
      width: 72px;
      height: 48px;
    }
    .mark {
      position: absolute;
      bottom: 0;
      width: 24px;
      height: 38px;
      border-radius: 10px 10px 0 0;
    }
    .mark--yellow { left: 0; background: linear-gradient(180deg, #f4e36b, #dfb329); transform: skewX(-18deg); }
    .mark--green { left: 22px; background: linear-gradient(180deg, #40d06e, #1ca953); }
    .mark--blue { right: 0; background: linear-gradient(180deg, #2d68ff, #123e99); transform: skewX(18deg); }
    .brand__text {
      display: flex;
      flex-direction: column;
      color: #0d2d6b;
      font-weight: 900;
      letter-spacing: 0.05em;
      line-height: 0.9;
    }
    .nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.7rem 1rem;
      justify-content: center;
    }
    .nav a {
      text-decoration: none;
      color: #173a6d;
      font-weight: 700;
      padding: 0.5rem 0.8rem;
      border-radius: 999px;
      transition: background 0.2s ease;
    }
    .nav a.active,
    .nav a:hover {
      background: #eaf3ff;
    }
    @media (max-width: 700px) {
      .site-header { justify-content: center; }
      .nav { width: 100%; }
      .nav a { flex: 1 1 calc(50% - 1rem); text-align: center; }
    }
  `]
})
export class HeaderComponent {}
