import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('Destaques reais da página inicial', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('mostra a publicação retornada pela API e permite abri-la na comunidade', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/posts/'))
      .flush([
        {
          id: 42,
          title: 'Conteúdo publicado na comunidade',
          content: 'Texto educativo real da resposta.',
          category: 'Democracia',
          author: 'Autor',
          media_type: 'image',
          media_url: '',
        },
      ]);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Conteúdo publicado na comunidade');
    expect(root.querySelector('app-post-card a')?.getAttribute('href')).toBe('/postagens?post=42');
    expect(root.querySelectorAll('app-topic-card').length).toBe(4);
  });
  it('distingue uma falha da API de um feed vazio e permite tentar novamente', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/posts/'))
      .flush({}, { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[role=alert]')?.textContent).toContain('Não foi possível');
    (root.querySelector('[role=alert] button') as HTMLButtonElement).click();
    http.expectOne((r) => r.url.endsWith('/posts/')).flush([]);
    await fixture.whenStable();
    expect(root.querySelector('[role=alert]')).toBeNull();
    expect(root.querySelectorAll('app-post-card').length).toBe(0);
    expect(root.textContent).toContain('Ainda não há publicações em destaque');
  });
});
