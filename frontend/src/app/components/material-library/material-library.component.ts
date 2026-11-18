import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout } from 'rxjs';
import { apiConfig } from '../../api-config';
import { IconComponent } from '../icon/icon.component';

export interface EducationalMaterial {
  id: number;
  titulo: string;
  resumo: string;
  categoria: string;
  fonte: string;
  url: string;
  formato: string;
  conferido_em: string;
}

@Component({
  selector: 'app-material-library',
  imports: [DatePipe, IconComponent],
  templateUrl: './material-library.component.html',
  styleUrl: './material-library.component.css',
})
export class MaterialLibraryComponent implements OnInit {
  readonly category = input.required<string>();
  readonly materials = signal<EducationalMaterial[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.http
      .get<EducationalMaterial[]>(`${apiConfig.baseUrl}/materiais/`, {
        params: { categoria: this.category() },
      })
      .pipe(timeout(60_000), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (materials) => {
          this.materials.set(materials);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
