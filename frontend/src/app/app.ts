// Componente raiz: mantém o cabeçalho e o rodapé e exibe a página escolhida pelo roteador.
import { Component } from '@angular/core';
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
    <app-header></app-header>
    <main class="page-wrap">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: transparent;
      }
      .page-wrap {
        min-height: calc(100vh - 160px);
      }
    `
  ]
})
export class App {}
