import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { timeout } from 'rxjs';
import { apiConfig } from '../api-config';

export interface CommunityPost {
  id: number;
  author: string;
  title: string;
  category: string;
  content: string;
  media_type: 'image' | 'video';
  media_url: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  readonly publicationCreated = signal(false);
  private readonly http = inject(HttpClient);
  list(params: Record<string, string> = {}) {
    return this.http
      .get<CommunityPost[]>(`${apiConfig.baseUrl}/posts/`, { params })
      .pipe(timeout(45_000));
  }
}
