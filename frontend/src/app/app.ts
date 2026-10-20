// Componente raiz: mantém o cabeçalho e o rodapé e exibe a página escolhida pelo roteador.
import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';

// CASCA DA APLICACAO: header, rota atual e footer.
@Component({
  selector: 'app-root',
  standalone: true,
  // Disponibiliza as diretivas, os formulários e os componentes usados por este template.
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  template: `
    <a href="#main-content" class="skip-link ce-button" (click)="skipToContent($event)">
      Pular para o conteúdo
    </a>
    <app-header></app-header>
    <main class="page-wrap" id="main-content" #mainContent tabindex="-1">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        min-height: 100svh;
        background: var(--ce-color-page);
      }
      .page-wrap {
        flex: 1;
        min-width: 0;
        width: 100%;
      }
      .page-wrap:focus {
        outline: none;
        box-shadow: none;
      }
      .skip-link {
        position: fixed;
        top: var(--ce-space-3);
        left: var(--ce-page-gutter);
        z-index: var(--ce-layer-skip-link);
        transform: translateY(calc(-100% - var(--ce-space-6)));
        transition: none;
      }
      .skip-link:focus {
        transform: translateY(0);
      }
    `,
  ],
})
export class App {
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  skipToContent(event: MouseEvent): void {
    // Evita que o <base href> leve a pessoa ao início ao ativar a âncora em outra rota.
    event.preventDefault();
    const main = this.mainContent()?.nativeElement;
    main?.focus({ preventScroll: true });
    main?.scrollIntoView?.({ block: 'start' });
  }
}
