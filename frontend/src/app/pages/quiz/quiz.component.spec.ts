import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { apiConfig } from '../../api-config';
import { QUIZ_REQUEST_TIMEOUT_MS } from '../../services/quiz.service';
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
    vi.useRealTimers();
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

  it('mostra os níveis enquanto o progresso e o desafio diário ainda estão carregando', () => {
    const fixture = TestBed.createComponent(QuizComponent);
    fixture.detectChanges();
    http.expectOne(`${api}/nivel/`).flush([level]);
    const progressRequest = http.expectOne(`${api}/progresso/`);
    http.expectNone(`${api}/diario/`);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cidadania');
    expect(fixture.nativeElement.textContent).not.toContain('Preparando sua trilha');
    expect(fixture.nativeElement.textContent).toContain('Carregando seu progresso');
    expect(fixture.nativeElement.querySelector('.level-node').disabled).toBe(true);
    progressRequest.flush(progress);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.level-node').disabled).toBe(false);
    http
      .expectOne(`${api}/diario/`)
      .flush({ data: '2026-10-15', origem: 'reserva', total_perguntas: 12 });
  });

  it('mantém a trilha visível quando a sessão expira e oferece novo login', () => {
    const fixture = TestBed.createComponent(QuizComponent);
    fixture.detectChanges();
    http.expectOne(`${api}/nivel/`).flush([level]);
    http
      .expectOne(`${api}/progresso/`)
      .flush({ detail: 'Invalid token.' }, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${api}/diario/`).flush({});
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cidadania');
    expect(fixture.nativeElement.textContent).toContain('Sua sessão expirou');
    expect(fixture.nativeElement.querySelector('.notice a').textContent).toContain(
      'Entrar novamente',
    );
    fixture.componentInstance.start(level);
    http.expectNone(`${api}/nivel/1/iniciar/`);
  });

  it('encerra a espera pelo progresso e permite recuperar sem recarregar os níveis', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(QuizComponent);
    fixture.detectChanges();
    http.expectOne(`${api}/nivel/`).flush([level]);
    const pendingProgress = http.expectOne(`${api}/progresso/`);
    http.expectNone(`${api}/diario/`);
    await vi.advanceTimersByTimeAsync(QUIZ_REQUEST_TIMEOUT_MS);
    http.expectOne(`${api}/diario/`).flush({});
    fixture.detectChanges();
    expect(pendingProgress.cancelled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('O servidor demorou para responder');
    expect(fixture.componentInstance.levels()).toEqual([level]);
    fixture.nativeElement.querySelector('.notice button').click();
    http.expectOne(`${api}/progresso/`).flush({ ...progress, xp: 30 });
    http.expectOne(`${api}/diario/`).flush({});
    http.expectNone(`${api}/nivel/`);
    fixture.detectChanges();
    expect(fixture.componentInstance.progressError()).toBe('');
    expect(fixture.componentInstance.progress()?.xp).toBe(30);
    expect(fixture.nativeElement.querySelector('.level-node').disabled).toBe(false);
  });

  it('oferece nova tentativa se a API de níveis não responder', async () => {
    vi.useFakeTimers();
    localStorage.clear();
    const fixture = TestBed.createComponent(QuizComponent);
    fixture.detectChanges();
    const pendingLevels = http.expectOne(`${api}/nivel/`);
    http.expectNone(`${api}/diario/`);
    await vi.advanceTimersByTimeAsync(QUIZ_REQUEST_TIMEOUT_MS);
    fixture.detectChanges();
    expect(pendingLevels.cancelled).toBe(true);
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Preparando sua trilha');
    fixture.nativeElement.querySelector('.notice.error button').click();
    http.expectOne(`${api}/nivel/`).flush([level]);
    http.expectOne(`${api}/diario/`).flush({});
    expect(fixture.componentInstance.levels()).toEqual([level]);
  });

  it('libera o botão após timeout ao iniciar, sem repetir automaticamente a requisição', async () => {
    vi.useFakeTimers();
    const component = create().componentInstance;
    component.start(level);
    const pendingStart = http.expectOne(`${api}/nivel/1/iniciar/`);
    await vi.advanceTimersByTimeAsync(QUIZ_REQUEST_TIMEOUT_MS);
    expect(pendingStart.cancelled).toBe(true);
    expect(component.busy()).toBe(false);
    expect(component.view()).toBe('trail');
    expect(component.error()).toContain('O servidor demorou para responder');
    http.expectNone(`${api}/nivel/1/iniciar/`);
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
    http.expectOne(`${api}/tentativas/8/responder/`).flush({
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

  it('marca o desafio diário somente após aprovação confirmada pela API', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.start(null);
    const dailySession = {
      ...session,
      tentativa: { ...session.tentativa, nivel: null, diario: 2 },
    };
    http
      .expectOne((request) => request.url === `${api}/diario/` && request.method === 'POST')
      .flush(dailySession);
    expect(component.dailyCompletedDate()).toBeNull();
    component.selected.set('a');
    component.submitAnswer();
    http.expectOne(`${api}/tentativas/8/responder/`).flush({
      ...dailySession,
      progresso: { ...progress, xp: 30 },
      tentativa: {
        ...dailySession.tentativa,
        concluida: true,
        aprovado: true,
        respondidas: 3,
        acertos: 3,
        xp_ganho: 30,
      },
      alternativa: 'a',
      correta: true,
      alternativa_correta: 'a',
      explicacao: 'Muito bem.',
    });
    component.continueLesson();
    component.backToTrail();
    http.expectOne(`${api}/nivel/`).flush([level]);
    http.expectOne(`${api}/progresso/`).flush({ ...progress, xp: 30 });
    http
      .expectOne(`${api}/diario/`)
      .flush({ data: '2026-10-15', origem: 'reserva', total_perguntas: 12 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Desafio concluído nesta sessão!');
    expect(component.progress()?.xp).toBe(30);
  });

  it('alterna a trilha visível e apresenta a retomada salva no tema correspondente', () => {
    const fixture = TestBed.createComponent(QuizComponent);
    const democracy = {
      ...level,
      id: 3,
      ordem: 3,
      titulo: 'Participação democrática',
      tema: { ...level.tema, id: 2, nome: 'Democracia', slug: 'democracia' },
    };
    fixture.detectChanges();
    http.expectOne(`${api}/nivel/`).flush([level, democracy]);
    http.expectOne(`${api}/progresso/`).flush({ ...progress, em_andamento: { 3: 2 } });
    http.expectOne(`${api}/diario/`).flush({});
    fixture.detectChanges();
    const categories = fixture.nativeElement.querySelectorAll('.categories button');
    categories[1].click();
    fixture.detectChanges();
    expect(categories[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelector('.feature').textContent).toContain(
      'Continuar de onde parei',
    );
    expect(fixture.nativeElement.querySelector('.level-path').textContent).toContain(
      '2 de 3 respondidas',
    );
    expect(fixture.nativeElement.querySelectorAll('.level-node').length).toBe(1);
  });

  it('inicia treino sem vidas e não exibe penalidade ao errar', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.progress.set({ ...progress, vidas: 0 });
    component.openTab('practice');
    component.practice('cidadania');
    const practiceSession = {
      ...session,
      progresso: { ...progress, vidas: 0 },
      tentativa: { ...session.tentativa, modo: 'treino' as const },
    };
    const start = http.expectOne(`${api}/treino/`);
    expect(start.request.body).toEqual({ tema: 'cidadania' });
    start.flush(practiceSession);
    component.selected.set('b');
    component.submitAnswer();
    http.expectOne(`${api}/tentativas/8/responder/`).flush({
      ...practiceSession,
      alternativa: 'b',
      correta: false,
      alternativa_correta: 'a',
      explicacao: 'Participar fortalece a comunidade.',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.feedback').textContent).not.toContain(
      'usou um coração',
    );
  });
});
