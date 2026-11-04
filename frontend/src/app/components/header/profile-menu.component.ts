import { Component, DestroyRef, ElementRef, HostListener, inject, OnInit, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { avatarImage } from '../../avatar-options';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-profile-menu',
  imports: [RouterLink, IconComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.css',
})
export class ProfileMenuComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly profile = this.auth.profile;
  readonly open = signal(false);
  readonly failed = signal(false);
  readonly loggingOut = input(false);
  readonly signOut = output<void>();
  readonly links = [
    { label: 'Meu perfil', path: '/perfil', icon: 'people' },
    { label: 'Meus conteúdos', path: '/postagens', icon: 'document', params: { lista: 'minhas' } },
    { label: 'Favoritos', path: '/postagens', icon: 'heart', params: { lista: 'favoritos' } },
    { label: 'Configurações', path: '/perfil/configuracoes', icon: 'settings' },
  ];

  get name(): string {
    const profile = this.profile();
    return profile?.display_name || profile?.username || 'Minha conta';
  }

  get initials(): string {
    return this.profile() ? this.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() : '?';
  }

  get photo(): string {
    const profile = this.profile();
    return profile ? profile.avatar_file_url || profile.avatar_url || avatarImage(profile.avatar_choice) : '';
  }

  ngOnInit(): void {
    if (!this.profile()) this.load();
  }

  load(): void {
    this.failed.set(false);
    this.auth.loadProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => this.failed.set(true),
    });
  }

  close(): void { this.open.set(false); }

  @HostListener('document:click', ['$event'])
  outside(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  @HostListener('focusout', ['$event'])
  focusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.close();
  }

  escape(event: Event): void {
    if (!this.open()) return;
    event.stopPropagation();
    this.close();
    this.trigger().nativeElement.focus();
  }
}
