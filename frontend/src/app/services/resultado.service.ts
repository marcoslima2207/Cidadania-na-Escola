import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Resultado {
  id?: number;
  nome: string;
  pontuacao: number;
  total_perguntas: number;
  resultado: string;
  respostas: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ResultadoService {
  private http = inject(HttpClient);

  salvarResultado(payload: Partial<Resultado>): Observable<Resultado> {
    return this.http.post<Resultado>('http://localhost:8000/api/resultados/', payload);
  }
}
