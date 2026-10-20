// Apresenta conteúdo educativo sobre informações falsas e compartilhamento responsável.
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

// CONTEUDO: pagina educativa sobre desinformacao.
@Component({
  selector: 'app-desinformacao',
  standalone: true,
  imports: [RouterLink, IconComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  templateUrl: './desinformacao.component.html',
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styleUrl: '../education-page.css',
})
export class DesinformacaoComponent {}
