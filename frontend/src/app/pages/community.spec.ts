// Testa busca, sessão autenticada, curtidas e publicação multipart com uma API simulada.
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BuscarComponent } from './buscar/buscar.component';
import { PostagensComponent } from './postagens/postagens.component';
import { PublicarComponent } from './publicar/publicar.component';
import { apiConfig } from '../api-config';

describe('Busca e comunidade', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('busca na API e mostra a definição antes dos resultados', () => {
    const fixture = TestBed.createComponent(BuscarComponent);
    fixture.componentInstance.searchTopic('Desinformação');
    const request = http.expectOne(
      (r) => r.url.endsWith('/posts/') && r.params.get('search') === 'Desinformação',
    );
    request.flush([
      { id: 4, title: 'Fontes', content: 'Verifique', category: 'Desinformação', author: 'Escola' },
    ]);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text.indexOf('Significado:')).toBeLessThan(text.indexOf('Fontes'));
    expect(fixture.componentInstance.meaning).toContain('Conteúdo falso');
  });

  it('distingue erro de rede de resultado vazio', () => {
    const component = TestBed.createComponent(BuscarComponent).componentInstance;
    component.searchTopic('cidadania');
    http
      .expectOne((r) => r.url.endsWith('/posts/'))
      .flush({}, { status: 503, statusText: 'Unavailable' });
    expect(component.error).toContain('Não foi possível');
    expect(component.searched).toBe(false);
  });

  it('envia a sessão no feed e impede curtidas duplicadas durante a requisição', () => {
    localStorage.setItem('cidadania_token', 'token-teste');
    const component = TestBed.createComponent(PostagensComponent).componentInstance;
    component.load();
    const request = http.expectOne(`${apiConfig.baseUrl}/posts/`);
    expect(request.request.headers.get('Authorization')).toBe('Token token-teste');
    const post = {
      id: 1,
      author: 'Outro',
      title: 'Post',
      content: 'Texto',
      category: 'Cidadania',
      media_type: 'image' as const,
      media_url: '',
      likes_count: 0,
      comments_count: 0,
      liked_by_me: false,
      is_mine: false,
    };
    request.flush([post]);
    component.like(post);
    component.like(post);
    http.expectOne(`${apiConfig.baseUrl}/posts/1/like/`).flush({ liked: true, likes_count: 1 });
    expect(post.liked_by_me).toBe(true);
    expect(post.likes_count).toBe(1);
  });

  it('publica o arquivo por multipart sem URL externa', () => {
    localStorage.setItem('cidadania_token', 'token-teste');
    const component = TestBed.createComponent(PublicarComponent).componentInstance;
    component.form.title = 'Minha foto';
    component.form.content = 'Uma atividade da escola';
    const file = new File(['foto'], 'foto.png', { type: 'image/png' });
    component.selectedFile = file;
    component.publish();
    const request = http.expectOne(`${apiConfig.baseUrl}/posts/`);
    const uploaded = request.request.body.get('media_file') as File;
    expect(uploaded.name).toBe(file.name);
    expect(uploaded.size).toBe(file.size);
    expect(uploaded.type).toBe('image/png');
    expect(request.request.body.has('media_url')).toBe(false);
    request.flush({}, { status: 503, statusText: 'Unavailable' });
    expect(component.loading).toBe(false);
  });
});
