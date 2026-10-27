// Verifica a seleção dos novos avatares e o contrato de upload do perfil com HTTP simulado.
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PerfilComponent } from './perfil.component';
import { apiConfig } from '../../api-config';

describe('Perfil com foto e ilustrações', () => {
  let http: HttpTestingController;
  const profile = {
    username: 'aluno',
    email: 'aluno@example.com',
    bio: 'Olá',
    avatar_url: '',
    avatar_file_url: 'http://localhost:8000/media/avatars/antiga.jpg',
    avatar_choice: 'portrait01',
  };
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

  it('exibe o nome salvo da conta Google em vez do identificador interno', async () => {
    const fixture = TestBed.createComponent(PerfilComponent);
    fixture.detectChanges();
    http.expectOne(`${apiConfig.baseUrl}/auth/profile/`).flush({
      ...profile,
      username: 'google_3c0d6272c6a9a5eaca143583',
      display_name: 'Marcos Eduardo',
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#profile-username').value).toBe('Marcos Eduardo');
    expect(fixture.nativeElement.querySelector('.avatar-column strong').textContent).toBe(
      'Marcos Eduardo',
    );
    expect(fixture.nativeElement.textContent).not.toContain('google_3c0d6272c6a9a5eaca143583');
  });

  it('mantém o nome de usuário ao receber uma API sem display_name', async () => {
    const fixture = TestBed.createComponent(PerfilComponent);
    fixture.detectChanges();
    http.expectOne(`${apiConfig.baseUrl}/auth/profile/`).flush({ ...profile });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#profile-username').value).toBe('aluno');
  });

  it('permite tentar novamente após falha do serviço sem exigir novo login', async () => {
    const fixture = TestBed.createComponent(PerfilComponent);
    fixture.detectChanges();
    http.expectOne(`${apiConfig.baseUrl}/auth/profile/`).flush(
      { detail: 'O serviço de autenticação está indisponível. Tente novamente.' },
      { status: 503, statusText: 'Service Unavailable' },
    );
    await fixture.whenStable();
    const retry = fixture.nativeElement.querySelector('.profile-state button') as HTMLButtonElement;
    expect(retry.textContent?.trim()).toBe('Tentar novamente');
    expect(fixture.componentInstance.error).toContain('indisponível');
    expect(localStorage.getItem('cidadania_token')).toBe('teste');
    retry.click();
    http.expectOne(`${apiConfig.baseUrl}/auth/profile/`).flush({ ...profile });
    await fixture.whenStable();
    expect(fixture.componentInstance.profile?.username).toBe('aluno');
    expect(fixture.componentInstance.error).toBe('');
  });

  it('mostra oito ilustrações e substitui a foto pela escolha salva', async () => {
    const fixture = TestBed.createComponent(PerfilComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${apiConfig.baseUrl}/auth/profile/`).flush({ ...profile });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.avatar-option').length).toBe(8);
    component.chooseIllustration('portrait07');
    expect(component.previewImage).toBe('avatars/portrait-07.jpg');
    component.save();
    const request = http.expectOne(`${apiConfig.baseUrl}/auth/profile/`);
    expect(request.request.body.get('avatar_choice')).toBe('portrait07');
    expect(request.request.body.has('avatar_file')).toBe(false);
    expect(request.request.body.has('avatar_url')).toBe(false);
    request.flush({ ...profile, avatar_file_url: '', avatar_choice: 'portrait07' });
    expect(component.message).toBe('Perfil atualizado.');
  });

  it('envia a foto por multipart e usa seu endereço após salvar', () => {
    const component = TestBed.createComponent(PerfilComponent).componentInstance;
    component.profile = { ...profile };
    component.mode = 'upload';
    component.selectedFile = new File(['foto'], 'foto.jfif', { type: 'image/jpeg' });
    component.save();
    component.save();
    const request = http.expectOne(`${apiConfig.baseUrl}/auth/profile/`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('Authorization')).toBe('Token teste');
    expect(request.request.body.get('avatar_file').name).toBe('foto.jfif');
    expect(request.request.body.has('avatar_choice')).toBe(false);
    request.flush({ ...profile, avatar_file_url: 'http://localhost:8000/media/avatars/nova.jpg' });
    expect(component.previewImage).toContain('nova.jpg');
    expect(component.selectedFile).toBeNull();
  });

  it('recusa vídeo e mantém o formulário após erro de upload', () => {
    const component = TestBed.createComponent(PerfilComponent).componentInstance;
    component.profile = { ...profile };
    component.mode = 'upload';
    component.selectPhoto({
      target: {
        files: [new File(['video'], 'video.mp4', { type: 'video/mp4' })],
        value: 'video.mp4',
      },
    } as unknown as Event);
    expect(component.saveError).toContain('foto');
    expect(component.selectedFile).toBeNull();
    component.selectedFile = new File(['foto'], 'foto.png', { type: 'image/png' });
    component.save();
    http
      .expectOne(`${apiConfig.baseUrl}/auth/profile/`)
      .flush({ avatar_file: ['Foto inválida.'] }, { status: 400, statusText: 'Bad Request' });
    expect(component.saveError).toBe('Foto inválida.');
    expect(component.saving).toBe(false);
    expect(component.profile).not.toBeNull();
  });
});
