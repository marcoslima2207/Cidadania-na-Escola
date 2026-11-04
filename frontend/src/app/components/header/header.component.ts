import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { apiConfig } from '../../api-config';
import { BrandComponent } from '../brand/brand.component';
import { AuthService } from '../../services/auth.service';
import { ProfileMenuComponent } from './profile-menu.component';
import { ClerkService } from '../../services/clerk.service';

// Navegação compartilhada: conserva as rotas e o contrato de sessão existentes.
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, BrandComponent, ProfileMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly clerk = inject(ClerkService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');

  readonly navigation = [
    { label: 'Início', path: '/' },
    { label: 'Assuntos e busca', path: '/buscar' },
    { label: 'Quiz', path: '/quiz' },
    { label: 'Sobre', path: '/sobre' },
    { label: 'Comunidade', path: '/postagens' },
    { label: 'Publicar', path: '/publicar' },
  ];

  menuOpen = false;
  get isLoggedIn(): boolean { return this.auth.loggedIn; }
  loggingOut = false;
  logoutError = '';

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.closeMenu();
        this.changeDetector.markForCheck();
      });
  }

  closeMenu(restoreFocus = false): void {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    if (restoreFocus) this.menuToggle()?.nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.closeMenu();
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.closeMenu();
  }

  // Invalida o token na API e encerra a sessão local também em caso de falha de rede.
  logout(): void {
    if (this.loggingOut) return;
    this.loggingOut = true;
    this.logoutError = '';
    if (this.clerk.enabled) {
      void this.clerk.signOut().then(() => this.finishLogout()).catch(() => {
        this.loggingOut = false;
        this.logoutError = 'Não foi possível sair. Confira sua conexão e tente novamente.';
        this.changeDetector.markForCheck();
      });
      return;
    }
    const token = localStorage.getItem('cidadania_token');
    this.http
      .post(
        `${apiConfig.baseUrl}/auth/logout/`,
        {},
        { headers: new HttpHeaders({ Authorization: `Token ${token || ''}` }) },
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.finishLogout(),
        error: () => this.finishLogout(),
      });
  }

  private finishLogout(): void {
    localStorage.removeItem('cidadania_token');
    localStorage.removeItem('cidadania_username');
    this.loggingOut = false;
    this.closeMenu();
    this.changeDetector.markForCheck();
    this.auth.clearProfile();
    this.router.navigate(['/']);
  }
}
