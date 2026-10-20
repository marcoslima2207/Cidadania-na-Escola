import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  OnInit,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { educationalTopics } from '../../educational-topics';
import { PostsService, CommunityPost } from '../../services/posts.service';
import { IconComponent } from '../../components/icon/icon.component';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { TopicCardComponent } from '../../components/topic-card/topic-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconComponent, PostCardComponent, TopicCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly api = inject(PostsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly track = viewChild<ElementRef<HTMLElement>>('featuredTrack');
  private request?: Subscription;
  readonly topics = educationalTopics;
  readonly posts = signal<CommunityPost[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly canPrevious = signal(false);
  readonly canNext = signal(false);
  ngOnInit(): void {
    this.loadPosts();
  }
  loadPosts(): void {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.request = this.api
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          this.posts.set(posts.slice(0, 6));
          this.loading.set(false);
          afterNextRender(() => this.syncCarousel(), { injector: this.injector });
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Não foi possível carregar os destaques. Tente novamente.');
        },
      });
  }
  @HostListener('window:resize')
  syncCarousel(): void {
    const track = this.track()?.nativeElement;
    this.canPrevious.set(!!track && track.scrollLeft > 2);
    this.canNext.set(!!track && track.scrollLeft + track.clientWidth < track.scrollWidth - 2);
  }
  moveCarousel(direction: number): void {
    const track = this.track()?.nativeElement;
    const card = track?.firstElementChild;
    if (!track || !card) return;
    const step =
      card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
    track.scrollBy({
      left: direction * step,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }
}
