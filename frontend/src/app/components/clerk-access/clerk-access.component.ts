import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClerkService } from '../../services/clerk.service';

@Component({
  selector: 'app-clerk-access',
  standalone: true,
  template: `
    <div class="clerk-access">
      @if (error()) {
        <p class="ce-notice ce-notice--error" role="alert">{{ error() }}</p>
        <button type="button" class="ce-button" (click)="mount()">Tentar novamente</button>
      } @else if (loading()) {
        <p role="status">Carregando acesso seguro…</p>
      }
      <div #access></div>
    </div>
  `,
  styles: [`.clerk-access { padding: 2rem; min-width: 0; }`],
})
export class ClerkAccessComponent implements AfterViewInit, OnDestroy {
  private readonly clerk = inject(ClerkService);
  private readonly router = inject(Router);
  private readonly signUp = inject(ActivatedRoute).snapshot.data['clerkMode'] === 'sign-up';
  private readonly access = viewChild.required<ElementRef<HTMLDivElement>>('access');
  private destroyed = false;
  readonly loading = signal(true);
  readonly error = signal('');

  ngAfterViewInit(): void { void this.mount(); }

  async mount(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.clerk.initialize();
      if (this.destroyed) return;
      if (this.clerk.signedIn()) {
        await this.router.navigate(['/postagens']);
        return;
      }
      if (this.signUp) await this.clerk.mountSignUp(this.access().nativeElement);
      else await this.clerk.mountSignIn(this.access().nativeElement);
    } catch {
      this.error.set('Não foi possível carregar o acesso. Confira sua conexão e tente novamente.');
    } finally { this.loading.set(false); }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.signUp) this.clerk.unmountSignUp(this.access().nativeElement);
    else this.clerk.unmountSignIn(this.access().nativeElement);
  }
}
