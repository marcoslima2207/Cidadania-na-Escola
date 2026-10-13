// Perfil autenticado: permite enviar uma foto, manter um link ou escolher uma ilustração.
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { apiConfig } from '../../api-config';
import { avatarImage, avatarOptions } from '../../avatar-options';

// O upload é recebido pelo campo avatar_file; a consulta retorna seu endereço neste contrato.
interface Profile {
  username: string;
  email: string;
  bio: string;
  avatar_url: string;
  avatar_choice: string;
  avatar_file_url: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Mostra a prévia e as opções; a aparência só é gravada ao salvar o formulário.
  template: ` <main class="profile-page">
    <section class="profile-card">
      <div class="profile-head">
        <p class="eyebrow">Meu espaço</p>
        <h1>Seu perfil</h1>
        <p>Personalize como você aparece na comunidade.</p>
      </div>
      @if (loading) {
        <div class="profile-state" role="status">Carregando seu perfil...</div>
      }
      @if (error) {
        <div class="profile-state profile-state--error" role="alert">
          <strong>{{ error }}</strong
          ><button type="button" (click)="goToLogin()">Entrar novamente</button>
        </div>
      }
      @if (profile && !loading && !error) {
        <div class="profile-body">
          <div class="avatar-column">
            <div class="avatar-preview">
              <img [src]="previewImage" alt="Prévia do seu avatar" (error)="imageError = true" />
            </div>
            <small>Aparência na comunidade</small>
          </div>
          <div class="profile-form">
            <label>Nome de usuário<input [value]="profile.username" disabled /></label>
            <div class="photo-modes" aria-label="Origem da foto">
              <button
                type="button"
                [attr.aria-pressed]="mode === 'upload'"
                (click)="setMode('upload')"
              >
                Enviar foto
              </button>
              <button
                type="button"
                [attr.aria-pressed]="mode === 'illustration'"
                (click)="setMode('illustration')"
              >
                Ilustrações
              </button>
              <button type="button" [attr.aria-pressed]="mode === 'url'" (click)="setMode('url')">
                Usar link
              </button>
            </div>
            @if (mode === 'upload') {
              <label
                >Foto do dispositivo<input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jfif"
                  (change)="selectPhoto($event)"
                  [disabled]="saving"
                /><small>JPG, JPEG, JFIF, PNG ou WEBP. Até 5 MB.</small></label
              >
              @if (selectedFile) {
                <p class="selected-file">{{ selectedFile.name }}</p>
                <button type="button" class="secondary" (click)="setMode('illustration')">
                  Usar uma ilustração
                </button>
              } @else if (profile.avatar_file_url) {
                <p class="selected-file">
                  Você já tem uma foto enviada. Selecione outro arquivo para substituí-la.
                </p>
              }
            }
            @if (mode === 'url') {
              <label
                >Foto de perfil por URL<input
                  [(ngModel)]="profile.avatar_url"
                  (ngModelChange)="imageError = false; message = ''"
                  placeholder="https://site.com/sua-foto.jpg"
                /><small>Use o link direto da imagem.</small></label
              >
            }
            <fieldset class="illustrations">
              <legend>Ou escolha uma ilustração</legend>
              <div class="avatar-grid">
                @for (option of illustrations; track option.id) {
                  <button
                    type="button"
                    class="avatar-option"
                    [class.selected]="
                      mode === 'illustration' && profile.avatar_choice === option.id
                    "
                    [attr.aria-pressed]="
                      mode === 'illustration' && profile.avatar_choice === option.id
                    "
                    (click)="chooseIllustration(option.id)"
                    [disabled]="saving"
                  >
                    <img [src]="option.image" [alt]="option.label" loading="lazy" /><span>{{
                      option.label
                    }}</span>
                  </button>
                }
              </div>
            </fieldset>
            <label
              >Bio<textarea
                [(ngModel)]="profile.bio"
                maxlength="240"
                rows="3"
                placeholder="Conte um pouco sobre você"
              ></textarea>
            </label>
            <button class="save" type="button" [disabled]="saving" (click)="save()">
              {{ saving ? 'Salvando...' : 'Salvar perfil' }}
            </button>
            @if (saveError) {
              <p class="form-error" role="alert">{{ saveError }}</p>
            }
            @if (message) {
              <p class="message" role="status">{{ message }}</p>
            }
          </div>
        </div>
      }
    </section>
  </main>`,
  // Mantém o cartão do perfil e adapta a grade de ilustrações e a prévia para celulares.
  styles: [
    `
      :host {
        display: block;
      }
      .profile-page {
        max-width: 900px;
        margin: 0 auto;
        padding: 3rem 1.5rem 5rem;
      }
      .profile-card {
        background: #fff;
        border: 1px solid rgba(13, 45, 107, 0.08);
        border-radius: 30px;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(13, 45, 107, 0.1);
      }
      .profile-head {
        padding: 2.5rem;
        color: white;
        background: linear-gradient(145deg, #0d2d6b, #1a60a9);
      }
      .profile-head h1 {
        margin: 0;
        font-size: clamp(2.4rem, 5vw, 4rem);
      }
      .profile-head p:last-child {
        color: rgba(255, 255, 255, 0.8);
      }
      .eyebrow {
        color: #2cae5f;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-weight: 800;
      }
      .profile-body {
        display: grid;
        grid-template-columns: 200px minmax(0, 1fr);
        gap: 2rem;
        padding: 2.5rem;
      }
      .profile-state {
        display: grid;
        gap: 1rem;
        justify-items: center;
        padding: 3rem;
        text-align: center;
        color: #526278;
      }
      .profile-state--error,
      .form-error {
        color: #b42318;
      }
      .avatar-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .avatar-column small {
        color: #718096;
      }
      .avatar-preview {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        overflow: hidden;
        border: 8px solid #edf5ff;
        background: #fff;
      }
      .avatar-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .profile-form {
        display: grid;
        gap: 1rem;
      }
      label {
        display: grid;
        gap: 0.4rem;
        color: #173a6d;
        font-weight: 700;
        font-size: 0.85rem;
      }
      label small {
        color: #718096;
        font-size: 0.75rem;
        font-weight: 500;
      }
      input,
      textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 0.85rem 1rem;
        border: 1px solid #d7e0eb;
        border-radius: 12px;
        font: inherit;
      }
      button {
        cursor: pointer;
        font: inherit;
      }
      button:disabled {
        opacity: 0.6;
        cursor: wait;
      }
      .save,
      .profile-state button {
        border: 0;
        border-radius: 999px;
        padding: 1rem;
        background: #0d2d6b;
        color: white;
        font-weight: 800;
      }
      .message {
        color: #1b7a43;
        font-weight: 700;
      }
      .photo-modes {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .photo-modes button,
      .secondary {
        padding: 0.65rem 0.8rem;
        border: 1px solid #cbd9e8;
        background: #fff;
        border-radius: 12px;
        color: #173a6d;
      }
      .photo-modes button[aria-pressed='true'] {
        background: #eaf3ff;
        border-color: #0d2d6b;
        font-weight: 800;
      }
      .illustrations {
        border: 0;
        padding: 0;
        margin: 0;
        min-width: 0;
      }
      .illustrations legend {
        font-size: 0.85rem;
        font-weight: 700;
        color: #173a6d;
        margin-bottom: 0.7rem;
      }
      .avatar-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.6rem;
      }
      .avatar-option {
        display: grid;
        gap: 0.4rem;
        justify-items: center;
        border: 2px solid #e5ebf3;
        border-radius: 14px;
        padding: 0.4rem;
        background: white;
        color: #173a6d;
      }
      .avatar-option img {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 50%;
      }
      .avatar-option span {
        font-size: 0.65rem;
        line-height: 1.3;
        text-align: center;
      }
      .avatar-option.selected {
        border-color: #0d2d6b;
        background: #eaf3ff;
      }
      .selected-file {
        margin: 0;
        color: #526278;
        font-size: 0.8rem;
        overflow-wrap: anywhere;
      }
      @media (max-width: 700px) {
        .profile-page {
          padding: 1.5rem 1rem 3rem;
        }
        .profile-body {
          grid-template-columns: 1fr;
          padding: 1.5rem;
        }
        .avatar-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
    `,
  ],
})
export class PerfilComponent implements OnInit, OnDestroy {
  profile: Profile | null = null;
  illustrations = avatarOptions;
  mode: 'upload' | 'url' | 'illustration' = 'illustration';
  message = '';
  error = '';
  saveError = '';
  loading = true;
  saving = false;
  imageError = false;
  selectedFile: File | null = null;
  private previewUrl = '';
  private readonly api = apiConfig.baseUrl;
  constructor(
    private http: HttpClient,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {}

  // A foto enviada tem prioridade sobre link; sem foto, usa a ilustração cadastrada.
  get previewImage(): string {
    if (!this.profile) return avatarImage();
    if (!this.imageError) {
      if (this.mode === 'upload' && (this.previewUrl || this.profile.avatar_file_url))
        return this.previewUrl || this.profile.avatar_file_url;
      if (this.mode === 'url' && this.profile.avatar_url) return this.profile.avatar_url;
    }
    return avatarImage(this.profile.avatar_choice);
  }

  // Consulta apenas o perfil da sessão autenticada.
  ngOnInit(): void {
    if (!localStorage.getItem('cidadania_token')) {
      this.goToLogin();
      return;
    }
    this.http.get<Profile>(`${this.api}/auth/profile/`, { headers: this.headers() }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.mode = profile.avatar_file_url
          ? 'upload'
          : profile.avatar_url
            ? 'url'
            : 'illustration';
        this.loading = false;
        // Notifica o Angular quando uma resposta HTTP muda os dados da tela.
        this.changeDetector.markForCheck();
      },
      error: (response) => {
        this.loading = false;
        if (response.status === 401) localStorage.removeItem('cidadania_token');
        this.error =
          response.status === 0
            ? 'Não foi possível conectar ao servidor.'
            : 'Não foi possível carregar o perfil. Entre novamente.';
        this.changeDetector.markForCheck();
      },
    });
  }

  // Libera os bytes mantidos pela URL temporária quando a página é fechada.
  ngOnDestroy(): void {
    this.clearPhoto();
  }
  private clearPhoto(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = '';
    this.selectedFile = null;
  }

  // Alterna a origem da imagem sem enviar alterações antes de salvar.
  setMode(mode: 'upload' | 'url' | 'illustration'): void {
    if (this.saving) return;
    if (mode !== 'upload') this.clearPhoto();
    this.mode = mode;
    this.imageError = false;
    this.message = '';
    this.saveError = '';
  }

  // Clicar em uma miniatura também seleciona o modo de ilustração.
  chooseIllustration(id: string): void {
    if (!this.profile || this.saving) return;
    this.setMode('illustration');
    this.profile.avatar_choice = id;
  }

  // Valida o arquivo no navegador e mostra a prévia; o backend repete a validação ao salvar.
  selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.saveError = '';
    this.message = '';
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      !file.size ||
      file.size > 5 * 1024 * 1024
    ) {
      this.saveError = 'Selecione uma foto JPG, JPEG, JFIF, PNG ou WEBP de até 5 MB.';
      input.value = '';
      return;
    }
    this.clearPhoto();
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
    this.imageError = false;
  }

  // Envia somente a origem escolhida para não deixar um upload antigo ocultando a ilustração.
  save(): void {
    if (!this.profile || this.saving) return;
    this.saveError = '';
    this.message = '';
    const payload = new FormData();
    payload.append('bio', this.profile.bio);
    if (this.mode === 'upload') {
      if (this.selectedFile)
        payload.append('avatar_file', this.selectedFile, this.selectedFile.name);
      else if (!this.profile.avatar_file_url) {
        this.saveError = 'Selecione uma foto antes de salvar.';
        return;
      }
    } else if (this.mode === 'url') {
      if (!this.profile.avatar_url.trim()) {
        this.saveError = 'Informe o link da foto ou escolha uma ilustração.';
        return;
      }
      payload.append('avatar_url', this.profile.avatar_url.trim());
    } else payload.append('avatar_choice', this.profile.avatar_choice);
    this.saving = true;
    this.http
      .patch<Profile>(`${this.api}/auth/profile/`, payload, { headers: this.headers() })
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.clearPhoto();
          this.saving = false;
          this.message = 'Perfil atualizado.';
        this.changeDetector.markForCheck();
        },
        error: (response) => {
          this.saving = false;
          this.saveError =
            response.status === 401
              ? 'Sua sessão expirou. Entre novamente.'
              : response.error?.avatar_file?.[0] ||
                response.error?.avatar_url?.[0] ||
                response.error?.avatar_choice?.[0] ||
                'Não foi possível salvar. Tente novamente.';
        this.changeDetector.markForCheck();
        },
      });
  }
  // Abre a tela de acesso e monta a identificação da sessão nas chamadas à API.
  goToLogin(): void {
    this.router.navigate(['/acesso']);
  }
  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${localStorage.getItem('cidadania_token') || ''}`,
    });
  }
}
