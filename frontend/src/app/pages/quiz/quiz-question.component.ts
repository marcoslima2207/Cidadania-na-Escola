import { Component, computed, input, output } from '@angular/core';
import { Answer, AnswerFeedback, Question } from './quiz.models';

@Component({
  selector: 'app-quiz-question',
  standalone: true,
  template: `
    <fieldset [disabled]="disabled()" aria-label="Alternativas da pergunta">
      <legend>{{ question().enunciado }}</legend>
      @for (option of options(); track option.value) {
        <label
          [class.selected]="selected() === option.value"
          [class.correct]="feedback()?.alternativa_correta === option.value"
          [class.incorrect]="feedback() && !feedback()?.correta && selected() === option.value"
        >
          <input
            type="radio"
            name="quiz-answer"
            [value]="option.value"
            [checked]="selected() === option.value"
            (change)="choose.emit(option.value)"
          />
          <span class="letter" aria-hidden="true">{{ option.value.toUpperCase() }}</span>
          <span>{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
  styles: [
    `
      fieldset {
        display: grid;
        gap: 0.85rem;
        padding: 0;
        border: 0;
        margin: 0;
        min-width: 0;
      }
      legend {
        float: left;
        width: 100%;
        margin: 0 0 1.5rem;
        color: #102748;
        font-size: clamp(1.3rem, 3vw, 1.8rem);
        font-weight: 800;
        line-height: 1.4;
      }
      label {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1rem;
        border: 2px solid #dfe6f1;
        border-bottom-width: 4px;
        border-radius: 16px;
        padding: 1rem;
        color: #173a6d;
        background: white;
        cursor: pointer;
      }
      label:hover {
        border-color: #8bb5ff;
        background: #f7fbff;
      }
      label.selected {
        border-color: #2475c4;
        background: #edf5ff;
      }
      label.correct {
        border-color: #278447;
        background: #edf9f1;
      }
      label.incorrect {
        border-color: #c84848;
        background: #fff1f0;
      }
      input {
        width: 1.1rem;
        height: 1.1rem;
        accent-color: #153e79;
        flex-shrink: 0;
      }
      .letter {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
        border: 1px solid #dfe6f1;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 800;
      }
      label:focus-within {
        outline: 3px solid #2475c4;
        outline-offset: 3px;
      }
      fieldset:disabled label {
        cursor: default;
      }
      @media (max-width: 480px) {
        label {
          padding: 0.8rem;
          gap: 0.65rem;
        }
        .letter {
          display: none;
        }
      }
    `,
  ],
})
export class QuizQuestionComponent {
  readonly question = input.required<Question>();
  readonly selected = input<Answer | null>(null);
  readonly disabled = input(false);
  readonly feedback = input<AnswerFeedback | null>(null);
  readonly choose = output<Answer>();
  readonly options = computed(() => {
    const question = this.question();
    return (['a', 'b', 'c'] as const).map((value) => ({
      value,
      label: question[`opcao_${value}`],
    }));
  });
}
