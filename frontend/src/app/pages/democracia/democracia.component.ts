// Apresenta conteúdo educativo sobre democracia, participação e cidadania.
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

// CONTEUDO: pagina educativa sobre democracia e participacao cidada.
@Component({
  selector: 'app-democracia',
  standalone: true,
  imports: [RouterLink, IconComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  templateUrl: './democracia.component.html',
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styleUrl: '../education-page.css',
})
export class DemocraciaComponent {}
