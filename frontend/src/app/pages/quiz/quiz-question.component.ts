import { Component, computed, input, output } from '@angular/core';
import { Answer, AnswerFeedback, Question } from './quiz.models';

@Component({
  selector: 'app-quiz-question',
  standalone: true,
  templateUrl: './quiz-question.component.html',
  styleUrl: './quiz-question.component.css',
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
