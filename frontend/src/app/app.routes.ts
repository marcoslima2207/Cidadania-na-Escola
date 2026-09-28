import { Routes } from '@angular/router';

import { ChecagemComponent } from './pages/checagem/checagem.component';
import { DemocraciaComponent } from './pages/democracia/democracia.component';
import { DesinformacaoComponent } from './pages/desinformacao/desinformacao.component';
import { DireitosTrabalhistasComponent } from './pages/direitos-trabalhistas/direitos-trabalhistas.component';
import { HomeComponent } from './pages/home/home.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { SobreComponent } from './pages/sobre/sobre.component';
import { AcessoComponent } from './pages/acesso/acesso.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { PostagensComponent } from './pages/postagens/postagens.component';
import { PublicarComponent } from './pages/publicar/publicar.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'democracia', component: DemocraciaComponent },
  { path: 'desinformacao', component: DesinformacaoComponent },
  { path: 'checagem', component: ChecagemComponent },
  { path: 'direitos-trabalhistas', component: DireitosTrabalhistasComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'sobre', component: SobreComponent },
  { path: 'acesso', component: AcessoComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'postagens', component: PostagensComponent },
  { path: 'publicar', component: PublicarComponent },
  { path: '**', redirectTo: '' }
];
