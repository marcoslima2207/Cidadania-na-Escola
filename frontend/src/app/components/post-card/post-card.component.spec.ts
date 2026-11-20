import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CommunityPost } from '../../services/posts.service';
import { PostCardComponent } from './post-card.component';

const photo: CommunityPost = {
  id: 12,
  author: 'autor',
  title: '',
  content: '',
  category: 'Educação',
  media_type: 'image',
  media_url: 'https://example.com/foto.jpg',
};

describe('Cards de publicações com foto', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PostCardComponent],
      providers: [provideRouter([])],
    }),
  );

  it('apresenta a foto sem uma área de texto vazia e permite abrir a publicação', () => {
    const fixture = TestBed.createComponent(PostCardComponent);
    fixture.componentRef.setInput('post', { ...photo, title: '  ', content: '\n' });
    fixture.detectChanges();
    const card = fixture.nativeElement as HTMLElement;
    expect(card.querySelector('img')?.getAttribute('src')).toBe(photo.media_url);
    expect(card.querySelector('.content-body')).toBeNull();
    expect(card.querySelector('a')?.getAttribute('href')).toBe('/postagens?post=12');
    expect(card.querySelector('a')?.getAttribute('aria-label')).toContain('Educação');
  });

  it('conserva título, texto, categoria e acesso nos cards com notícia', () => {
    const fixture = TestBed.createComponent(PostCardComponent);
    fixture.componentRef.setInput('post', {
      ...photo,
      title: 'Uma notícia',
      content: 'Texto da notícia.',
    });
    fixture.detectChanges();
    const card = fixture.nativeElement as HTMLElement;
    expect(card.querySelector('h3')?.textContent).toBe('Uma notícia');
    expect(card.querySelector('p')?.textContent).toBe('Texto da notícia.');
    expect(card.querySelector('.ce-badge')?.textContent).toBe('Educação');
    expect(card.querySelector('.content-link')?.textContent).toContain('Acessar conteúdo');
  });

  it('mantém a identificação na busca compacta e oferece alternativa se a foto falhar', () => {
    const fixture = TestBed.createComponent(PostCardComponent);
    fixture.componentRef.setInput('post', photo);
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();
    const card = fixture.nativeElement as HTMLElement;
    expect(card.querySelector('.content-body')).toBeTruthy();
    fixture.componentRef.setInput('compact', false);
    fixture.detectChanges();
    card.querySelector('img')?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(card.querySelector('.content-image.is-fallback')).toBeTruthy();
    expect(card.querySelector('.content-body')).toBeTruthy();
  });
});
