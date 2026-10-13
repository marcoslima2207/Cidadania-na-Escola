// Ponto de entrada do frontend: inicia o Angular com o componente raiz e os serviços configurados.
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Inicia a aplicação; se a inicialização falhar, registra o erro no console do navegador.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
