import { AuthService } from '../../services/auth.service';
import { ClerkService } from '../../services/clerk.service';
// Perfil autenticado: permite enviar uma foto, manter um link ou escolher uma ilustração.
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { apiConfig } from '../../api-config';
import { avatarImage, avatarOptions } from '../../avatar-options';
import { IconComponent } from '../../components/icon/icon.component';
import { apiErrorMessage } from '../../services/api-error';

// O upload é recebido pelo campo avatar_file; a consulta retorna seu endereço neste contrato.
interface Profile {
  username: string;
  display_name?: string;
  email: string;
  bio: string;
  avatar_url: string;
  avatar_choice: string;
  avatar_file_url: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  // Mostra a prévia e as opções; a aparência só é gravada ao salvar o formulário.
  templateUrl: './perfil.component.html',
  // Mantém o cartão do perfil e adapta a grade de ilustrações e a prévia para celulares.
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit, OnDestroy {
  readonly clerk = inject(ClerkService);
  private readonly auth = inject(AuthService);
  async accountSettings(): Promise<void> {
    try { await this.clerk.openUserProfile(); }
    catch {
      this.saveError = 'Não foi possível abrir as configurações da conta. Tente novamente.';
      this.changeDetector.markForCheck();
    }
  }
  profile: Profile | null = null;
  illustrations = avatarOptions;
  mode: 'upload' | 'url' | 'illustration' = 'illustration';
  message = '';
  error = '';
  sessionExpired = false;
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
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.auth.loggedIn) {
      this.goToLogin();
      return;
    }
    this.loading = true;
    this.error = '';
    this.sessionExpired = false;
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
        this.sessionExpired = response.status === 401 || response.status === 403;
        if (response.status === 401) localStorage.removeItem('cidadania_token');
        this.error = apiErrorMessage(response,
          response.status === 0
            ? 'Não foi possível conectar ao servidor. Tente novamente.'
            : this.sessionExpired
              ? 'Sua sessão expirou. Entre novamente.'
              : 'Não foi possível carregar o perfil agora. Tente novamente.',
        );
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
    return this.auth.headers;
  }
}
