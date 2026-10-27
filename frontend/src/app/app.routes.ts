// Relaciona os endereços do site às páginas Angular; caminhos desconhecidos voltam ao início.
import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  // CONTEÚDO PÚBLICO: páginas educativas e quiz.
  { path: '', component: HomeComponent },
  {
    path: 'democracia',
    loadComponent: () =>
      import('./pages/democracia/democracia.component').then((m) => m.DemocraciaComponent),
  },
  {
    path: 'desinformacao',
    loadComponent: () =>
      import('./pages/desinformacao/desinformacao.component').then((m) => m.DesinformacaoComponent),
  },
  {
    path: 'checagem',
    loadComponent: () =>
      import('./pages/checagem/checagem.component').then((m) => m.ChecagemComponent),
  },
  {
    path: 'direitos-trabalhistas',
    loadComponent: () =>
      import('./pages/direitos-trabalhistas/direitos-trabalhistas.component').then(
        (m) => m.DireitosTrabalhistasComponent,
      ),
  },
  {
    path: 'quiz',
    loadComponent: () => import('./pages/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/sobre/sobre.component').then((m) => m.SobreComponent),
  },
  // COMUNIDADE: acesso, perfil, publicações e criação de posts.
  {
    path: 'acesso/cadastro',
    data: { clerkMode: 'sign-up' },
    loadComponent: () => import('./pages/acesso/acesso.component').then((m) => m.AcessoComponent),
  },
  {
    path: 'acesso',
    loadComponent: () => import('./pages/acesso/acesso.component').then((m) => m.AcessoComponent),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  {
    path: 'postagens',
    loadComponent: () =>
      import('./pages/postagens/postagens.component').then((m) => m.PostagensComponent),
  },
  {
    path: 'publicar',
    loadComponent: () =>
      import('./pages/publicar/publicar.component').then((m) => m.PublicarComponent),
  },
  {
    path: 'buscar',
    loadComponent: () => import('./pages/buscar/buscar.component').then((m) => m.BuscarComponent),
  },
  { path: '**', redirectTo: '' },
];
