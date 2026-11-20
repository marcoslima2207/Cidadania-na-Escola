import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { apiConfig } from '../../api-config';
import { avatarImage } from '../../avatar-options';

interface PublicProfile {
  id: number;
  display_name: string;
  bio: string;
  avatar_url: string;
  avatar_choice: string;
  posts_count: number;
}

interface PublicPost {
  id: number;
  title: string;
  content: string;
  category: string;
  media_type: 'image' | 'video';
  media_url: string;
  created_at: string;
}

@Component({
  selector: 'app-perfil-publico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-publico.component.html',
  styleUrl: './perfil-publico.component.css',
})
export class PerfilPublicoComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  profile: PublicProfile | null = null;
  posts: PublicPost[] = [];
  loading = true;
  error = '';
  imageError = false;

  get avatar(): string {
    return (
      (!this.imageError && this.profile?.avatar_url) || avatarImage(this.profile?.avatar_choice)
    );
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id') || '';
          this.profile = null;
          this.posts = [];
          this.error = '';
          this.loading = true;
          this.imageError = false;
          this.changeDetector.markForCheck();
          return forkJoin({
            profile: this.http.get<PublicProfile>(
              `${apiConfig.baseUrl}/profiles/${encodeURIComponent(id)}/`,
            ),
            posts: this.http.get<PublicPost[]>(`${apiConfig.baseUrl}/posts/`, {
              params: { author: id },
            }),
          }).pipe(
            catchError((response) => {
              this.error =
                response.status === 404
                  ? 'Perfil não encontrado.'
                  : 'Não foi possível carregar este perfil. Tente novamente.';
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result) {
          this.profile = result.profile;
          this.posts = result.posts;
        }
        this.loading = false;
        this.changeDetector.markForCheck();
      });
  }
}
