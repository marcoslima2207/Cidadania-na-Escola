// Apresenta conteúdo introdutório sobre os direitos das pessoas nas relações de trabalho.
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

// CONTEUDO: pagina educativa sobre direitos trabalhistas.
@Component({
  selector: 'app-direitos-trabalhistas',
  standalone: true,
  imports: [RouterLink, IconComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  templateUrl: './direitos-trabalhistas.component.html',
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styleUrl: '../education-page.css',
})
export class DireitosTrabalhistasComponent {}
