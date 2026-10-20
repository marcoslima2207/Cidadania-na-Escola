import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { educationalTopics } from '../../educational-topics';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-topic-card',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `<a
    class="ce-card ce-card--interactive topic-card"
    [routerLink]="topic().path"
    [attr.data-accent]="topic().color"
  >
    <span class="topic-icon"><app-icon [name]="topic().icon" /></span>
    <h3>{{ topic().title }}</h3>
    <p>{{ topic().description }}</p>
    <span class="topic-link">Explorar <app-icon name="arrow" /></span>
  </a>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        height: 100%;
      }
      .topic-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: var(--ce-space-6);
        gap: var(--ce-space-3);
      }
      .topic-icon {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: var(--ce-color-vibrant);
        color: white;
        font-size: 1.5rem;
      }
      .topic-card[data-accent='green'] .topic-icon {
        background: var(--ce-color-green);
      }
      .topic-card[data-accent='yellow'] .topic-icon {
        background: var(--ce-color-yellow);
        color: var(--ce-color-blue);
      }
      h3 {
        margin: var(--ce-space-1) 0 0;
        color: var(--ce-color-blue);
        font-size: 1.0625rem;
        line-height: 1.4;
      }
      p {
        margin: 0;
        color: var(--ce-color-text-muted);
        font-size: var(--ce-font-size-small);
        line-height: 1.7;
      }
      .topic-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ce-space-2);
        min-height: 44px;
        margin-top: auto;
        color: var(--ce-color-blue);
        font-size: var(--ce-font-size-small);
        font-weight: 700;
      }
    `,
  ],
})
export class TopicCardComponent {
  readonly topic = input.required<(typeof educationalTopics)[number]>();
}
