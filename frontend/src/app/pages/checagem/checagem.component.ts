// Apresenta orientações para conferir fontes e verificar informações.
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

// CONTEUDO: pagina educativa sobre checagem de informacao.
@Component({
  selector: 'app-checagem',
  standalone: true,
  imports: [RouterLink, IconComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  templateUrl: './checagem.component.html',
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styleUrl: '../education-page.css',
})
export class ChecagemComponent {}
