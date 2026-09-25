import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Pergunta {
  id?: number;
  enunciado: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  alternativa_correta: string;
  categoria: string;
}

@Injectable({ providedIn: 'root' })
export class PerguntaService {
  private http = inject(HttpClient);

  getPerguntas(): Observable<Pergunta[]> {
    return this.http.get<Pergunta[]>('http://localhost:8000/api/perguntas/');
  }
}
