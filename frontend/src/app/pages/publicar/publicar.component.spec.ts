// Regressões de publicação: resposta assíncrona, reenvio e tratamento dos erros da API.
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PublicarComponent } from './publicar.component';
import { apiConfig } from '../../api-config';

describe('Publicação', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.setItem('cidadania_token', 'teste');
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  for (const [type, name, mime] of [
    ['image', 'foto.png', 'image/png'],
    ['video', 'video.mp4', 'video/mp4'],
  ]) {
    it(`publica ${type} sem título nem texto`, () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      const component = TestBed.createComponent(PublicarComponent).componentInstance;
      component.form.media_type = type;
      component.form.title = '   ';
      component.selectedFile = new File(['arquivo'], name, { type: mime });
      component.publish();
      const request = http.expectOne(`${apiConfig.baseUrl}/posts/`);
      expect(request.request.body.get('title')).toBe('');
      expect(request.request.body.get('content')).toBe('');
      expect(request.request.body.get('media_file').name).toBe(name);
      request.flush({ id: 43 }, { status: 201, statusText: 'Created' });
      expect(component.error).toBe('');
      expect(navigate).toHaveBeenCalledWith(['/postagens']);
    });
  }

  it('impede publicação vazia e volta a exigir escrita ao remover o arquivo', () => {
    const component = TestBed.createComponent(PublicarComponent).componentInstance;
    component.selectedFile = new File(['foto'], 'foto.png', { type: 'image/png' });
    component.clearMedia();
    component.publish();
    http.expectNone(`${apiConfig.baseUrl}/posts/`);
    expect(component.fieldErrors['title']).toBeTruthy();
    expect(component.fieldErrors['content']).toBeTruthy();
  });

  it('exibe o erro da API, libera o botão e permite corrigir e publicar', async () => {
    const fixture = TestBed.createComponent(PublicarComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.form.title = 'Minha publicação';
    component.form.content = 'Atividade da escola';
    const button = fixture.nativeElement.querySelector('button:last-of-type') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    http
      .expectOne(`${apiConfig.baseUrl}/posts/`)
      .flush(
        { media_file: ['A extensão não corresponde ao formato.'] },
        { status: 400, statusText: 'Bad Request' },
      );
    await fixture.whenStable();
    expect(button.disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain(
      'A extensão não corresponde',
    );
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    button.click();
    http
      .expectOne(`${apiConfig.baseUrl}/posts/`)
      .flush({ id: 42 }, { status: 201, statusText: 'Created' });
    expect(navigate).toHaveBeenCalledWith(['/postagens']);
  });

  it('não duplica requisições e envia o arquivo JFIF com o token', () => {
    const component = TestBed.createComponent(PublicarComponent).componentInstance;
    component.form.title = 'Foto';
    component.form.content = 'Texto';
    component.selectedFile = new File(['foto'], 'foto.jfif', { type: 'image/jpeg' });
    component.publish();
    component.publish();
    const request = http.expectOne(`${apiConfig.baseUrl}/posts/`);
    expect(request.request.body.get('media_file').name).toBe('foto.jfif');
    expect(request.request.headers.get('Authorization')).toBe('Token teste');
    request.flush({ title: ['Título inválido.'] }, { status: 400, statusText: 'Bad Request' });
    expect(component.error).toBe('Título inválido.');
    expect(component.loading).toBe(false);
  });

  it('distingue falha de conexão e remove o token quando a sessão expira', () => {
    const component = TestBed.createComponent(PublicarComponent).componentInstance;
    component.form.title = 'Post';
    component.form.content = 'Texto';
    component.publish();
    http.expectOne(`${apiConfig.baseUrl}/posts/`).error(new ProgressEvent('error'));
    expect(component.error).toContain('conectar à API');
    component.publish();
    http
      .expectOne(`${apiConfig.baseUrl}/posts/`)
      .flush({ detail: 'Token inválido' }, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem('cidadania_token')).toBeNull();
    expect(component.loading).toBe(false);
  });
});
