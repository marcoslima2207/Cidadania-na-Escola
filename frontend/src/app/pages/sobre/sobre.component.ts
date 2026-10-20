// Apresenta a proposta educativa e o contexto do projeto Cidadania na Escola.
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

// INSTITUCIONAL: missao, visao e valores do projeto.
@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [RouterLink, IconComponent],
  // HTML da página: liga campos, eventos e condições ao estado do componente.
  templateUrl: './sobre.component.html',
  // CSS local do componente: define aparência, espaçamento e adaptação às telas menores.
  styleUrl: './sobre.component.css',
})
export class SobreComponent {}
