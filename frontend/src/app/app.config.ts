// Configura os serviços globais de rotas, requisições HTTP e registro de erros do Angular.
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ClerkService } from './services/clerk.service';
import { clerkInterceptor } from './services/clerk.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Encaminha erros globais do navegador para o tratamento padrão do Angular.
    provideBrowserGlobalErrorListeners(),
    // Registra os caminhos declarados em app.routes.ts para mudar de página.
    provideRouter(routes),
    // Disponibiliza HttpClient para os componentes e serviços que chamam a API.
    provideHttpClient(withInterceptors([clerkInterceptor])),
    // Falhas do provedor não impedem a leitura do conteúdo público.
    provideAppInitializer(() => inject(ClerkService).initialize().catch(() => undefined)),
  ]
};
