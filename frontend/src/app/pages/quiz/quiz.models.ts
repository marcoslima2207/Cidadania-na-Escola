export type Answer = 'a' | 'b' | 'c';

export interface Topic {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  icone: string;
}

export interface Level {
  id: number;
  titulo: string;
  ordem: number;
  tema: Topic;
  total_perguntas: number;
  descricao?: string;
}

export interface Question {
  id: number;
  enunciado: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  categoria: string;
}

export interface QuizProgress {
  vidas: number;
  max_vidas: number;
  data_vidas: string;
  xp: number;
  niveis_concluidos: number[];
  proximo_nivel: number | null;
  recupera_em?: string;
  em_andamento?: Record<number, number>;
  diario_concluido?: { data: string; xp: number } | null;
}

export interface DailyQuiz {
  data: string;
  origem: 'ia' | 'reserva';
  total_perguntas: number;
}

export interface QuizAttempt {
  id: number;
  nivel: number | null;
  diario: number | null;
  perguntas: Question[];
  respondidas: number;
  acertos: number;
  concluida: boolean;
  aprovado: boolean;
  xp_ganho: number;
  modo?: 'oficial' | 'treino' | 'revisao';
}

export interface AttemptResponse {
  tentativa: QuizAttempt;
  progresso: QuizProgress;
}

export interface AnswerFeedback {
  alternativa: Answer;
  correta: boolean;
  alternativa_correta: Answer;
  explicacao: string;
}

export interface AnswerResponse extends AttemptResponse, AnswerFeedback {}

export interface QuizReview {
  chave: string;
  pergunta: Question;
  resposta: AnswerFeedback;
  revisada: boolean;
}

export interface QuizDashboard {
  respondidas: number;
  acertos: number;
  sequencia: number;
  xp_semanal: number;
  dificuldades: { categoria: string; erros: number }[];
  historico: {
    id: number;
    titulo: string;
    data: string;
    xp: number;
    acertos: number;
    respondidas: number;
  }[];
  missoes: { titulo: string; descricao: string; atual: number; objetivo: number }[];
  conquistas: { titulo: string; descricao: string; data: string | null }[];
}

export interface QuizRanking {
  inicio: string;
  participante: boolean;
  minha_posicao: number | null;
  resultados: {
    posicao: number;
    nome: string;
    avatar_url: string;
    avatar_choice: string;
    xp: number;
    eu: boolean;
  }[];
}
