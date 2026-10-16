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
