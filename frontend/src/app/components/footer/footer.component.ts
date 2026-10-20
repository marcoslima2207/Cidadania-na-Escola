import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from '../brand/brand.component';

// Rodapé compartilhado com links para as páginas já existentes da plataforma.
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, BrandComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly links = [
    { label: 'Democracia e Cidadania', path: '/democracia' },
    { label: 'Desinformação', path: '/desinformacao' },
    { label: 'Checagem de Informação', path: '/checagem' },
    { label: 'Direitos Trabalhistas', path: '/direitos-trabalhistas' },
    { label: 'Quiz educativo', path: '/quiz' },
    { label: 'Comunidade', path: '/postagens' },
  ];
}
