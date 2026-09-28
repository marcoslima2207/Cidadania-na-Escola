import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { apiConfig } from '../../api-config';

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

      <div class="header-actions">
        @if (isLoggedIn) {
          <a routerLink="/perfil" class="header-login">Meu perfil</a>
          <button type="button" class="logout-button" (click)="logout()">Sair</button>
        } @else {
          <a routerLink="/acesso" class="header-login">Entrar</a>
        }

        <button class="menu-toggle" type="button" (click)="menuOpen = !menuOpen" [attr.aria-expanded]="menuOpen" aria-controls="main-navigation">
          <span aria-hidden="true">☰</span>
          <span>Menu</span>
        </button>
      </div>

      <nav id="main-navigation" class="nav" [class.nav--open]="menuOpen" aria-label="Menu principal">
        @if (isLoggedIn) {
          <a routerLink="/perfil" routerLinkActive="active" class="mobile-account-link">Meu perfil</a>
          <button type="button" class="mobile-logout" (click)="logout()">Sair da conta</button>
        } @else {
          <a routerLink="/acesso" routerLinkActive="active" class="mobile-account-link">Entrar / Criar conta</a>
        }
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Início</a>
        <a routerLink="/democracia" routerLinkActive="active">Democracia</a>
        <a routerLink="/desinformacao" routerLinkActive="active">Desinformação</a>
        <a routerLink="/checagem" routerLinkActive="active">Checagem</a>
        <a routerLink="/direitos-trabalhistas" routerLinkActive="active">Direitos Trabalhistas</a>
        <a routerLink="/quiz" routerLinkActive="active">Quiz</a>
        <a routerLink="/sobre" routerLinkActive="active">Sobre</a>
        <a routerLink="/postagens" routerLinkActive="active">Postagens</a>
        <a routerLink="/publicar" routerLinkActive="active">Publicar</a>
        @if (isLoggedIn) { <a routerLink="/perfil" routerLinkActive="active">Meu perfil</a> }
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
      position: relative;
      z-index: 10;
      background: rgba(248, 250, 249, 0.86);
      border-bottom: 1px solid rgba(13, 45, 107, 0.08);
      backdrop-filter: blur(16px);
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.9rem;
      min-width: 210px;
    }
    .brand__mark {
      position: relative;
      width: 72px;
      height: 48px;
      filter: drop-shadow(0 6px 10px rgba(12, 45, 108, 0.14));
    }
    .mark {
      position: absolute;
      bottom: 0;
      width: 24px;
      height: 38px;
      border-radius: 10px 10px 0 0;
    }
    .mark--yellow { left: 0; background: linear-gradient(180deg, #f4e36b, #dfb329); transform: skewX(-16deg); }
    .mark--green { left: 22px; background: linear-gradient(180deg, #40d06e, #1ca953); }
    .mark--blue { right: 0; background: linear-gradient(180deg, #2d68ff, #123e99); transform: skewX(16deg); }
    .brand__text {
      display: flex;
      flex-direction: column;
      color: #0d2d6b;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 0.9;
      font-size: 1.05rem;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }
    .header-login {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      background: #0d2d6b;
      color: white;
      border-radius: 999px;
      padding: 0.7rem 1rem;
      font-weight: 700;
      box-shadow: 0 10px 20px rgba(13, 45, 107, 0.18);
    }
    .logout-button {
      border: 1px solid #cbd9e8;
      border-radius: 999px;
      padding: 0.7rem 1rem;
      background: white;
      color: #173a6d;
      font-weight: 800;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .logout-button:hover { background: #edf5ff; color: #0d2d6b; }
    .nav {
      display: none;
      flex-wrap: wrap;
      gap: 0.7rem 1rem;
      justify-content: center;
      width: 100%;
      padding-top: 0.5rem;
    }
    .nav.nav--open {
      display: flex;
      padding: 0.7rem;
      background: rgba(255,255,255,0.82);
      border: 1px solid rgba(13,45,107,0.08);
      border-radius: 18px;
      box-shadow: 0 16px 30px rgba(14,35,68,0.08);
    }
    .menu-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      border: 1px solid #cbd9e8;
      border-radius: 999px;
      padding: 0.65rem 0.9rem;
      background: #fff;
      color: #173a6d;
      font-weight: 800;
      box-shadow: 0 10px 20px rgba(17, 51, 94, 0.06);
    }
    .nav a {
      text-decoration: none;
      color: #173a6d;
      font-weight: 700;
      padding: 0.55rem 0.8rem;
      border-radius: 999px;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .nav a.active,
    .nav a:hover {
      background: #eaf3ff;
      transform: translateY(-1px);
    }
    @media (max-width: 700px) {
      .site-header {
        padding: 0.9rem 1rem;
        justify-content: space-between;
      }
      .brand__mark { width: 52px; height: 36px; }
      .mark { width: 18px; height: 29px; }
      .mark--green { left: 16px; }
      .brand__text { font-size: 0.78rem; }
      .header-login, .logout-button { display: none; }
      .nav.nav--open { display: grid; grid-template-columns: 1fr 1fr; }
      .nav a { text-align: center; padding: 0.65rem 0.45rem; font-size: 0.9rem; }
      .nav .mobile-account-link,
      .nav .mobile-logout { grid-column: span 2; }
      .nav .mobile-account-link { background: #0d2d6b; color: white; }
      .mobile-logout { border: 1px solid #cbd9e8; border-radius: 999px; padding: 0.65rem 0.45rem; background: white; color: #173a6d; font: inherit; font-weight: 800; cursor: pointer; }
    }
  `]
})
export class HeaderComponent {
  menuOpen = false;
  isLoggedIn = !!localStorage.getItem('cidadania_token');

  constructor(private http: HttpClient, private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.isLoggedIn = !!localStorage.getItem('cidadania_token');
    });
  }

  logout(): void {
    const token = localStorage.getItem('cidadania_token');
    this.http.post(`${apiConfig.baseUrl}/auth/logout/`, {}, { headers: new HttpHeaders({ Authorization: `Token ${token || ''}` }) }).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  private finishLogout(): void {
    localStorage.removeItem('cidadania_token');
    localStorage.removeItem('cidadania_username');
    this.isLoggedIn = false;
    this.router.navigate(['/acesso']);
  }
}
