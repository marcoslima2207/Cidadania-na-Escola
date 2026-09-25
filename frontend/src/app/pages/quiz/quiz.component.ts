import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Question {
  id: number;
  question: string;
  options: { value: string; label: string }[];
  correct: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="quiz">
      <div class="quiz__header">
        <p class="eyebrow">Quiz</p>
        <h1>Teste seu conhecimento</h1>
      </div>

      @if (!finished) {
        <div class="question-card">
          <p class="question-index">Pergunta {{ currentIndex + 1 }} de {{ questions.length }}</p>
          <h2>{{ currentQuestion.question }}</h2>

          <div class="options">
            @for (option of currentQuestion.options; track option.value) {
              <label class="option">
                <input type="radio" name="answer" [value]="option.value" [(ngModel)]="selectedAnswer" />
                <span>{{ option.label }}</span>
              </label>
            }
          </div>

          <div class="actions">
            <button type="button" class="btn btn-primary" (click)="submitAnswer()" [disabled]="!selectedAnswer">
              {{ currentIndex === questions.length - 1 ? 'Finalizar quiz' : 'Próxima pergunta' }}
            </button>
          </div>
        </div>
      }

      @if (finished) {
        <div class="result-card">
          <p class="eyebrow">Resultado</p>
          <h2>{{ passed ? 'Excelente!' : 'Você está no caminho certo!' }}</h2>
          <p class="score">Você acertou {{ score }} de {{ questions.length }} perguntas.</p>
          <p class="message">
            {{
              passed
                ? 'Sua compreensão sobre cidadania e informação está bem desenvolvida.'
                : 'Continue praticando e aprofundando sua leitura crítica das informações.'
            }}
          </p>
          <button type="button" class="btn btn-primary" (click)="restartQuiz()">Refazer quiz</button>
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .quiz { max-width: 900px; margin: 2rem auto; padding: 0 2rem 3rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: .12em; color: #1b7a43; font-weight: 800; }
    h1 { margin: .4rem 0 1.5rem; font-size: clamp(2rem, 4vw, 3.5rem); color: #0d2d6b; }
    .question-card, .result-card {
      background: #f7f8fb; border: 1px solid #dfe6f1; border-radius: 22px; padding: 2rem;
    }
    .question-index { color: #0d2d6b; font-weight: 700; margin: 0 0 1rem; }
    .question-card h2 { margin: 0 0 1.5rem; color: #102748; }
    .options { display: grid; gap: 1rem; }
    .option {
      display: flex; align-items: center; gap: 0.8rem; padding: 0.9rem 1rem; background: #fff; border-radius: 14px; border: 1px solid #dfe6f1; cursor: pointer;
    }
    .option input { accent-color: #153e79; }
    .actions { margin-top: 1.5rem; }
    .btn {
      border: none; border-radius: 999px; padding: 0.85rem 1.4rem; font-weight: 700; cursor: pointer;
    }
    .btn-primary { background: #153e79; color: white; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .score { font-size: 1.2rem; font-weight: 700; color: #0d2d6b; }
    .message { line-height: 1.7; color: #2f3d4f; }
  `]
})
export class QuizComponent {
  questions: Question[] = [
    {
      id: 1,
      question: 'Qual é a melhor forma de combater a desinformação?',
      options: [
        { value: 'a', label: 'Verificar a fonte antes de compartilhar' },
        { value: 'b', label: 'Compartilhar sem checar' },
        { value: 'c', label: 'Confiar em qualquer mensagem viral' }
      ],
      correct: 'a'
    },
    {
      id: 2,
      question: 'O que fortalece a democracia?',
      options: [
        { value: 'a', label: 'Participação consciente e informação acessível' },
        { value: 'b', label: 'Ignorar as notícias públicas' },
        { value: 'c', label: 'Repetir rumores sem questionar' }
      ],
      correct: 'a'
    },
    {
      id: 3,
      question: 'Qual ação é mais importante para o trabalhador?',
      options: [
        { value: 'a', label: 'Conhecer e reivindicar seus direitos' },
        { value: 'b', label: 'Aceitar qualquer condição sem questionar' },
        { value: 'c', label: 'Evitar informações sobre trabalho' }
      ],
      correct: 'a'
    },
    {
      id: 4,
      question: 'Como avaliar se uma notícia é confiável?',
      options: [
        { value: 'a', label: 'Acreditar no título sem ler o conteúdo' },
        { value: 'b', label: 'Comparar a informação com fontes confiáveis' },
        { value: 'c', label: 'Compartilhar porque muitas pessoas comentaram' }
      ],
      correct: 'b'
    },
    {
      id: 5,
      question: 'Qual é uma atitude cidadã no espaço público?',
      options: [
        { value: 'a', label: 'Participar das decisões e respeitar opiniões diferentes' },
        { value: 'b', label: 'Impedir que outras pessoas participem' },
        { value: 'c', label: 'Deixar todas as decisões para outras pessoas' }
      ],
      correct: 'a'
    },
    {
      id: 6,
      question: 'O que ajuda a proteger seus dados na internet?',
      options: [
        { value: 'a', label: 'Usar a mesma senha em todos os serviços' },
        { value: 'b', label: 'Publicar seus dados pessoais em qualquer página' },
        { value: 'c', label: 'Usar senhas fortes e desconfiar de links suspeitos' }
      ],
      correct: 'c'
    },
    {
      id: 7,
      question: 'Por que os direitos trabalhistas são importantes?',
      options: [
        { value: 'a', label: 'Para garantir condições dignas e proteção no trabalho' },
        { value: 'b', label: 'Para impedir qualquer mudança nas relações de trabalho' },
        { value: 'c', label: 'Para substituir o diálogo entre trabalhadores e empregadores' }
      ],
      correct: 'a'
    },
    {
      id: 8,
      question: 'Antes de compartilhar uma imagem ou vídeo, o que devemos fazer?',
      options: [
        { value: 'a', label: 'Observar apenas a quantidade de curtidas' },
        { value: 'b', label: 'Verificar o contexto, a data e a origem do conteúdo' },
        { value: 'c', label: 'Compartilhar rapidamente para ser a primeira pessoa' }
      ],
      correct: 'b'
    }
  ];

  currentIndex = 0;
  selectedAnswer = '';
  score = 0;
  finished = false;

  get currentQuestion(): Question {
    return this.questions[this.currentIndex];
  }

  get passed(): boolean {
    return this.score >= Math.ceil(this.questions.length * 0.7);
  }

  submitAnswer(): void {
    if (!this.selectedAnswer) return;

    if (this.selectedAnswer === this.currentQuestion.correct) {
      this.score += 1;
    }

    this.currentIndex += 1;
    this.selectedAnswer = '';

    if (this.currentIndex >= this.questions.length) {
      this.finished = true;
    }
  }

  restartQuiz(): void {
    this.currentIndex = 0;
    this.selectedAnswer = '';
    this.score = 0;
    this.finished = false;
  }
}
