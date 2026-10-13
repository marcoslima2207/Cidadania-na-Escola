// Configura os serviços globais de rotas, requisições HTTP e registro de erros do Angular.
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Encaminha erros globais do navegador para o tratamento padrão do Angular.
    provideBrowserGlobalErrorListeners(),
    // Registra os caminhos declarados em app.routes.ts para mudar de página.
    provideRouter(routes),
    // Disponibiliza HttpClient para os componentes e serviços que chamam a API.
    provideHttpClient()
  ]
};
