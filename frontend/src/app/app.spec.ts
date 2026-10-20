// Testa a criação do componente raiz e a presença do cabeçalho e do rodapé.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('move o foco para o conteúdo pelo atalho de teclado sem navegar para outra rota', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const main = root.querySelector<HTMLElement>('#main-content')!;
    const skip = root.querySelector<HTMLAnchorElement>('.skip-link')!;
    const currentUrl = window.location.href;

    skip.click();

    expect(document.activeElement).toBe(main);
    expect(window.location.href).toBe(currentUrl);
  });
});
