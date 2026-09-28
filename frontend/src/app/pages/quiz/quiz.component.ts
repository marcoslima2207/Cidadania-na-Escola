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
          <div class="progress">
            <span>{{ currentIndex + 1 }} / {{ questions.length }}</span>
            <div class="progress__bar">
              <span [style.width.%]="((currentIndex + 1) / questions.length) * 100"></span>
            </div>
          </div>

          <p class="question-index">Pergunta {{ currentIndex + 1 }}</p>
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
    .quiz {
      max-width: 960px;
      margin: 2.5rem auto;
      padding: 0 1.5rem 4rem;
    }
    .quiz__header {
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #0d2d6b 0%, #164b9b 72%, #2068aa 100%);
      border-radius: 30px;
      padding: 2.5rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 24px 50px rgba(12, 49, 92, 0.16);
    }
    .quiz__header::after {
      content: '';
      position: absolute;
      width: 220px;
      height: 220px;
      right: -70px;
      bottom: -120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.09);
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: .12em;
      color: #2cae5f;
      font-weight: 800;
      margin: 0 0 0.8rem;
    }
    h1 {
      margin: 0;
      font-size: clamp(2.2rem, 4vw, 3.8rem);
      color: white;
    }
    .question-card, .result-card {
      background: rgba(255,255,255,0.88);
      border: 1px solid rgba(13,45,107,0.1);
      border-radius: 26px;
      padding: 2.25rem;
      box-shadow: 0 20px 45px rgba(11, 33, 63, 0.08);
      backdrop-filter: blur(12px);
    }
    .progress {
      margin-bottom: 1.25rem;
      color: #173a6d;
      font-weight: 700;
    }
    .progress__bar {
      width: 100%;
      height: 10px;
      background: #e6edf9;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 0.75rem;
    }
    .progress__bar span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #0d2d6b, #2cae5f);
    }
    .question-index {
      color: #0d2d6b;
      font-weight: 700;
      margin: 0 0 1rem;
    }
    .question-card h2 { margin: 0 0 1.5rem; color: #102748; }
    .options { display: grid; gap: 1rem; }
    .option {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.95rem 1rem;
      background: #fff;
      border-radius: 14px;
      border: 1px solid #dfe6f1;
      cursor: pointer;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .option:hover {
      border-color: #8bb5ff;
      background: #f7fbff;
      transform: translateY(-2px);
    }
    .option input { accent-color: #153e79; }
    .actions { margin-top: 1.5rem; }
    .btn {
      border: none;
      border-radius: 999px;
      padding: 0.85rem 1.4rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-primary {
      background: #153e79;
      color: white;
      box-shadow: 0 12px 22px rgba(21, 62, 121, 0.18);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 28px rgba(21, 62, 121, 0.24); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .score {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0d2d6b;
      margin-bottom: 0.75rem;
    }
    .message { line-height: 1.7; color: #2f3d4f; }
    @media (max-width: 640px) {
      .quiz { margin: 1.5rem auto; padding: 0 1rem 3rem; }
      .quiz__header, .question-card, .result-card { padding: 1.3rem 1rem; }
      .option { padding: 0.85rem 0.75rem; }
    }
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
    },
    {
      id: 9,
      question: 'O que torna uma pessoa mais preparada para debater ideias públicas?',
      options: [
        { value: 'a', label: 'Ouvir várias fontes e avaliar os fatos' },
        { value: 'b', label: 'Aceitar qualquer afirmação sem questionar' },
        { value: 'c', label: 'Compartilhar tudo sem confirmação' }
      ],
      correct: 'a'
    },
    {
      id: 10,
      question: 'Qual é um sinal de que uma notícia pode ser falsa?',
      options: [
        { value: 'a', label: 'Fonte desconhecida e linguagem alarmista' },
        { value: 'b', label: 'Texto bem escrito e bem documentado' },
        { value: 'c', label: 'Nome de veículo reconhecido' }
      ],
      correct: 'a'
    },
    {
      id: 11,
      question: 'Como a educação contribui para a cidadania?',
      options: [
        { value: 'a', label: 'Ajuda a formar pessoas críticas e conscientes' },
        { value: 'b', label: 'Apenas repete informações sem questionar' },
        { value: 'c', label: 'Substitui a participação social' }
      ],
      correct: 'a'
    },
    {
      id: 12,
      question: 'Qual é um comportamento responsável em redes sociais?',
      options: [
        { value: 'a', label: 'Conferir a veracidade antes de divulgar' },
        { value: 'b', label: 'Compartilhar qualquer coisa sem contexto' },
        { value: 'c', label: 'Ignorar mensagens importantes' }
      ],
      correct: 'a'
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
