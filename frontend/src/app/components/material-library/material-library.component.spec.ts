import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiConfig } from '../../api-config';
import { MaterialLibraryComponent } from './material-library.component';

describe('Biblioteca de materiais', () => {
  let requests: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialLibraryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    requests = TestBed.inject(HttpTestingController);
  });

  afterEach(() => requests.verify());

  it('busca o tema da página e mostra o material com fonte e link original', () => {
    const fixture = TestBed.createComponent(MaterialLibraryComponent);
    fixture.componentRef.setInput('category', 'democracia');
    fixture.detectChanges();
    const request = requests.expectOne((r) => r.url === `${apiConfig.baseUrl}/materiais/`);
    expect(request.request.params.get('categoria')).toBe('democracia');
    request.flush([
      {
        id: 1,
        titulo: 'Constituição em Miúdos',
        resumo: 'Direitos e cidadania para jovens.',
        categoria: 'democracia',
        fonte: 'Senado Federal',
        formato: 'Livro',
        url: 'https://www2.senado.leg.br/jspui/handle/id/649385',
        conferido_em: '2026-11-18',
      },
    ]);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Senado Federal');
    expect(page.textContent).toContain('18/11/2026');
    expect(page.querySelector('article a')?.getAttribute('href')).toContain('/handle/id/649385');
    expect(page.querySelector('article a')?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('permite tentar novamente após uma falha de rede', () => {
    const fixture = TestBed.createComponent(MaterialLibraryComponent);
    fixture.componentRef.setInput('category', 'checagem');
    fixture.detectChanges();
    requests
      .expectOne((r) => r.url === `${apiConfig.baseUrl}/materiais/`)
      .flush(
        {},
        {
          status: 503,
          statusText: 'Service Unavailable',
        },
      );
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[role="alert"]')).toBeTruthy();
    page.querySelector('button')?.click();
    requests.expectOne((r) => r.url === `${apiConfig.baseUrl}/materiais/`).flush([]);
    fixture.detectChanges();
    expect(page.querySelector('[role="alert"]')).toBeNull();
    expect(page.textContent).toContain('serão publicados em breve');
  });
});
