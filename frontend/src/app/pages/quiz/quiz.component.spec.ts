import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { apiConfig } from '../../api-config';
import { QuizComponent } from './quiz.component';
import { AttemptResponse, Level, QuizProgress } from './quiz.models';

const api = `${apiConfig.baseUrl}/quiz`;
const level: Level = {
  id: 1,
  titulo: 'Cidadania: primeiros passos',
  ordem: 1,
  total_perguntas: 3,
  tema: {
    id: 1,
    nome: 'Cidadania',
    slug: 'cidadania',
    descricao: 'Direitos e deveres',
    icone: '★',
  },
};
const progress: QuizProgress = {
  vidas: 5,
  max_vidas: 5,
  data_vidas: '2026-10-15',
  xp: 0,
  niveis_concluidos: [],
  proximo_nivel: 1,
};
const session: AttemptResponse = {
  progresso: progress,
  tentativa: {
    id: 8,
    nivel: 1,
    diario: null,
    respondidas: 0,
    acertos: 0,
    concluida: false,
    aprovado: false,
    xp_ganho: 0,
    perguntas: [1, 2, 3].map((id) => ({
      id,
      enunciado: `Pergunta ${id}`,
      opcao_a: 'Participar',
      opcao_b: 'Ignorar',
      opcao_c: 'Desistir',
      categoria: 'cidadania',
    })),
  },
};

describe('Quiz gamificado', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.setItem('cidadania_token', 'test-token');
    TestBed.configureTestingModule({
      imports: [QuizComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  function create() {
    const fixture = TestBed.createComponent(QuizComponent);
    fixture.detectChanges();
    http.expectOne(`${api}/nivel/`).flush([level]);
    if (localStorage.getItem('cidadania_token')) {
      const request = http.expectOne(`${api}/progresso/`);
      expect(request.request.headers.get('Authorization')).toBe('Token test-token');
      request.flush(progress);
    }
    http
      .expectOne(`${api}/diario/`)
      .flush({ data: '2026-10-15', origem: 'reserva', total_perguntas: 12 });
    fixture.detectChanges();
    return fixture;
  }

  it('exibe os temas e identifica o banco de reserva sem chamar isso de IA', () => {
    const fixture = create();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Cidadania');
    expect(content).toContain('Banco educativo');
    expect(content).not.toContain('Gerado por IA');
  });

  it('atualiza corações e barra ao conferir, mantendo a pergunta até continuar', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.start(level);
    http.expectOne(`${api}/nivel/1/iniciar/`).flush(session);
    component.selected.set('b');
    component.submitAnswer();
    component.submitAnswer();
    const request = http.expectOne(`${api}/tentativas/8/responder/`);
    expect(request.request.body).toEqual({ pergunta_id: 1, alternativa: 'b' });
    request.flush({
      ...session,
      progresso: { ...progress, vidas: 4 },
      tentativa: { ...session.tentativa, respondidas: 1 },
      alternativa: 'b',
      correta: false,
      alternativa_correta: 'a',
      explicacao: 'Participar fortalece a cidadania.',
    });
    fixture.detectChanges();
    expect(component.progress()?.vidas).toBe(4);
    expect(component.percent()).toBeCloseTo(100 / 3);
    expect(component.question()?.id).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.hearts .empty').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Participar fortalece a cidadania.');
    component.continueLesson();
    expect(component.question()?.id).toBe(2);
    expect(component.selected()).toBeNull();
  });

  it('mantém a resposta para repetir uma requisição que falhou', () => {
    const component = create().componentInstance;
    component.start(level);
    http.expectOne(`${api}/nivel/1/iniciar/`).flush(session);
    component.selected.set('a');
    component.submitAnswer();
    http
      .expectOne(`${api}/tentativas/8/responder/`)
      .flush({}, { status: 503, statusText: 'Unavailable' });
    expect(component.busy()).toBe(false);
    expect(component.feedback()).toBeNull();
    expect(component.currentIndex()).toBe(0);
    expect(component.selected()).toBe('a');
    expect(component.progress()?.vidas).toBe(5);
  });

  it('retoma uma tentativa na próxima pergunta ainda não respondida', () => {
    const component = create().componentInstance;
    component.start(level);
    http
      .expectOne(`${api}/nivel/1/iniciar/`)
      .flush({ ...session, tentativa: { ...session.tentativa, respondidas: 2, acertos: 2 } });
    expect(component.currentIndex()).toBe(2);
    expect(component.question()?.id).toBe(3);
  });

  it('apresenta o resultado após o último coração acabar', () => {
    const component = create().componentInstance;
    component.start(level);
    http.expectOne(`${api}/nivel/1/iniciar/`).flush(session);
    component.selected.set('b');
    component.submitAnswer();
    http
      .expectOne(`${api}/tentativas/8/responder/`)
      .flush({
        ...session,
        progresso: { ...progress, vidas: 0 },
        tentativa: { ...session.tentativa, concluida: true, respondidas: 1 },
        alternativa: 'b',
        correta: false,
        alternativa_correta: 'a',
        explicacao: 'A resposta correta é participar.',
      });
    component.continueLesson();
    expect(component.view()).toBe('result');
  });

  it('permite explorar sem conta e informa como entrar antes de iniciar', () => {
    localStorage.clear();
    const component = create().componentInstance;
    component.start(level);
    http.expectNone(`${api}/nivel/1/iniciar/`);
    expect(component.error()).toContain('Entre na sua conta');
    expect(component.view()).toBe('trail');
  });
});
