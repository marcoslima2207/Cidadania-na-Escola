import { CLERK_PUBLISHABLE_KEY } from '../src/app/services/clerk.service';

// Os testes unitários não carregam o SDK nem acessam contas reais.
export default [{ provide: CLERK_PUBLISHABLE_KEY, useValue: '' }];
