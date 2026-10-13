// Encapsula a consulta e a criação de materiais educativos na API local.
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// API DE CONTEUDO: acesso aos materiais educativos.
// Define o formato dos dados de Conteudo para conferir os tipos usados pela interface.
export interface Conteudo {
  id?: number;
  titulo: string;
  descricao: string;
  categoria: string;
  conteudo: string;
  data_publicacao?: string;
}

@Injectable({ providedIn: 'root' })
export class ConteudoService {
  // Estado da classe: guarda os dados e as opções utilizados pelos métodos e pelo template.
  private http = inject(HttpClient);

  // Faz um GET para obter a lista de materiais educativos; a resposta chega pelo Observable.
  getConteudos(): Observable<Conteudo[]> {
    return this.http.get<Conteudo[]>('http://localhost:8000/api/conteudos/');
  }

  // Faz um POST com os campos informados para cadastrar um material educativo.
  criarConteudo(payload: Partial<Conteudo>): Observable<Conteudo> {
    return this.http.post<Conteudo>('http://localhost:8000/api/conteudos/', payload);
  }
}
