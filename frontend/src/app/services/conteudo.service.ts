import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
  private http = inject(HttpClient);

  getConteudos(): Observable<Conteudo[]> {
    return this.http.get<Conteudo[]>('http://localhost:8000/api/conteudos/');
  }

  criarConteudo(payload: Partial<Conteudo>): Observable<Conteudo> {
    return this.http.post<Conteudo>('http://localhost:8000/api/conteudos/', payload);
  }
}
