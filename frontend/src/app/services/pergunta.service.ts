// Encapsula a consulta das perguntas cadastradas na API local.
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// API DO QUIZ: acesso as perguntas cadastradas no backend.
// Define o formato dos dados de Pergunta para conferir os tipos usados pela interface.
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
  // Estado da classe: guarda os dados e as opções utilizados pelos métodos e pelo template.
  private http = inject(HttpClient);

  // Faz um GET para obter as perguntas do quiz cadastradas no backend.
  getPerguntas(): Observable<Pergunta[]> {
    return this.http.get<Pergunta[]>('http://localhost:8000/api/perguntas/');
  }
}
