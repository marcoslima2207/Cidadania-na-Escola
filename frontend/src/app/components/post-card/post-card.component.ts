import { DatePipe } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommunityPost } from '../../services/posts.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [RouterLink, DatePipe, IconComponent],
  template: `<a
    class="content-card"
    [class.is-compact]="compact()"
    routerLink="/postagens"
    [queryParams]="{ post: post().id }"
  >
    <div
      class="content-image"
      [class.is-fallback]="!post().media_url || post().media_type === 'video' || imageFailed()"
    >
      @if (post().media_url && post().media_type === 'image' && !imageFailed()) {
        <img [src]="post().media_url" alt="" loading="lazy" (error)="imageFailed.set(true)" />
      } @else {
        <app-icon [name]="post().media_type === 'video' ? 'play' : 'book'" />
      }
    </div>
    <div class="content-body">
      <div class="content-meta">
        <span
          class="ce-badge"
          [class.ce-badge--green]="
            post().category === 'Democracia' || post().category === 'Cidadania'
          "
          [class.ce-badge--yellow]="post().category === 'Direitos Trabalhistas'"
          >{{ post().category }}</span
        >
        @if (post().created_at) {
          <time [attr.datetime]="post().created_at">{{
            post().created_at | date: 'dd/MM/yyyy'
          }}</time>
        }
      </div>
      @if (post().title) {
        <h3>{{ post().title }}</h3>
      }
      @if (post().content) {
        <p>{{ post().content }}</p>
      }
      <span class="content-link">Acessar conteúdo <app-icon name="arrow" /></span>
    </div>
  </a>`,
  styleUrl: './post-card.component.css',
})
export class PostCardComponent {
  readonly post = input.required<CommunityPost>();
  readonly compact = input(false);
  readonly imageFailed = signal(false);
}
