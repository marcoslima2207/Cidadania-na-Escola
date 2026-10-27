import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import type { Clerk } from '@clerk/clerk-js';
import { clerkConfig } from '../clerk-config';

export const CLERK_PUBLISHABLE_KEY = new InjectionToken<string>('Clerk publishable key', {
  providedIn: 'root', factory: () => clerkConfig.publishableKey,
});

@Injectable({ providedIn: 'root' })
export class ClerkService {
  private readonly publishableKey = inject(CLERK_PUBLISHABLE_KEY);
  readonly enabled = !!this.publishableKey && (
    this.publishableKey.startsWith('pk_live_') ||
    ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
  );
  readonly signedIn = signal(false);
  private instance?: Clerk;
  private initialization?: Promise<void>;

  initialize(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    return (this.initialization ??= this.load().catch((error) => {
      this.initialization = undefined;
      throw error;
    }));
  }

  private async load(): Promise<void> {
    const key = this.publishableKey;
    if (!/^pk_(test|live)_/.test(key)) throw new Error('Chave pública Clerk inválida.');
    const domain = atob(key.split('_')[2]).replace(/\$$/, '');
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) throw new Error('Domínio Clerk inválido.');
    const [{ Clerk }, { ptBR }] = await Promise.all([
      import('@clerk/clerk-js'), import('@clerk/localizations/pt-BR'),
    ]);
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      const timer = window.setTimeout(() => {
        script.remove();
        reject(new Error('O acesso demorou para carregar. Tente novamente.'));
      }, 15000);
      script.src = `https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => {
        clearTimeout(timer); script.remove();
        reject(new Error('Não foi possível carregar o acesso. Tente novamente.'));
      };
      document.head.appendChild(script);
    });
    const clerk = new Clerk(key);
    await clerk.load({
      ui: { ClerkUI: Reflect.get(window, '__internal_ClerkUICtor') },
      localization: ptBR,
      signInUrl: new URL('acesso', document.baseURI).href,
      signUpUrl: new URL('acesso/cadastro', document.baseURI).href,
    });
    this.instance = clerk;
    this.signedIn.set(!!clerk.session);
    clerk.addListener(({ session }) => this.signedIn.set(!!session));
  }

  async token(): Promise<string | null> {
    await this.initialize();
    return this.instance?.session?.getToken() ?? null;
  }

  async mountSignIn(element: HTMLDivElement): Promise<void> {
    await this.initialize();
    const destination = new URL('postagens', document.baseURI).href;
    this.instance?.mountSignIn(element, {
      routing: 'hash',
      signUpUrl: new URL('acesso/cadastro', document.baseURI).href,
      forceRedirectUrl: destination,
      signUpForceRedirectUrl: destination,
      appearance: { variables: { colorPrimary: '#002d9a' } },
    });
  }

  unmountSignIn(element: HTMLDivElement): void {
    this.instance?.unmountSignIn(element);
  }

  async mountSignUp(element: HTMLDivElement): Promise<void> {
    await this.initialize();
    const destination = new URL('postagens', document.baseURI).href;
    this.instance?.mountSignUp(element, {
      routing: 'hash',
      signInUrl: new URL('acesso', document.baseURI).href,
      forceRedirectUrl: destination,
      signInForceRedirectUrl: destination,
      appearance: { variables: { colorPrimary: '#002d9a' } },
    });
  }

  unmountSignUp(element: HTMLDivElement): void {
    this.instance?.unmountSignUp(element);
  }

  async signOut(): Promise<void> {
    await this.initialize();
    await this.instance?.signOut();
    this.signedIn.set(false);
  }

  async openUserProfile(): Promise<void> {
    await this.initialize();
    this.instance?.openUserProfile();
  }
}
