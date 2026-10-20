import { Component } from '@angular/core';

// Reaproveita o símbolo e o nome existentes, compartilhados pelo header e pelo rodapé.
@Component({
  selector: 'app-brand',
  standalone: true,
  template: `
    <span class="brand">
      <span class="brand__mark" aria-hidden="true">
        <span class="mark mark--yellow"></span>
        <span class="mark mark--green"></span>
        <span class="mark mark--blue"></span>
      </span>
      <span class="brand__text"><span>CIDADANIA</span><span>NA ESCOLA</span></span>
    </span>
  `,
  styleUrl: './brand.component.css',
})
export class BrandComponent {}
