// Encapsula o envio de resultados de tentativas do quiz à API local.
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// API DE RESULTADOS: envio e consulta das tentativas do quiz.
// Define o formato dos dados de Resultado para conferir os tipos usados pela interface.
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
  // Estado da classe: guarda os dados e as opções utilizados pelos métodos e pelo template.
  private http = inject(HttpClient);

  // Faz um POST com a pontuação e as respostas de uma tentativa do quiz.
  salvarResultado(payload: Partial<Resultado>): Observable<Resultado> {
    return this.http.post<Resultado>('http://localhost:8000/api/resultados/', payload);
  }
}
