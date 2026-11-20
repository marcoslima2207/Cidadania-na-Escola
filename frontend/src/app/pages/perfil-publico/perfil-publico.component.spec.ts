import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { apiConfig } from '../../api-config';
import { PerfilPublicoComponent } from './perfil-publico.component';

describe('Perfil público', () => {
  let http: HttpTestingController;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id: '12' }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('mostra o perfil e as publicações do autor sem controles privados', async () => {
    const fixture = TestBed.createComponent(PerfilPublicoComponent);
    fixture.detectChanges();
    http.expectOne(`${apiConfig.baseUrl}/profiles/12/`).flush({
      id: 12,
      display_name: 'Maria',
      bio: 'Aprendendo juntas',
      avatar_url: '',
      avatar_choice: 'portrait01',
      posts_count: 1,
    });
    http
      .expectOne((r) => r.url.endsWith('/posts/') && r.params.get('author') === '12')
      .flush([
        {
          id: 8,
          title: 'Participação',
          content: 'Nossa comunidade',
          category: 'Cidadania',
          media_url: '',
        },
      ]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Maria');
    expect(fixture.nativeElement.textContent).toContain('Aprendendo juntas');
    expect(fixture.nativeElement.textContent).toContain('Participação');
    expect(fixture.nativeElement.querySelector('a[href="/postagens?post=8"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input, textarea')).toBeNull();
  });

  it('cancela o perfil anterior ao mudar de pessoa e mostra perfil inexistente', async () => {
    const fixture = TestBed.createComponent(PerfilPublicoComponent);
    fixture.detectChanges();
    const previous = http.expectOne(`${apiConfig.baseUrl}/profiles/12/`);
    http.expectOne((r) => r.params.get('author') === '12');
    params.next(convertToParamMap({ id: '13' }));
    expect(previous.cancelled).toBe(true);
    http.expectOne((r) => r.params.get('author') === '13').flush([]);
    http
      .expectOne(`${apiConfig.baseUrl}/profiles/13/`)
      .flush({}, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Perfil não encontrado.');
    expect(fixture.componentInstance.profile).toBeNull();
  });
});
