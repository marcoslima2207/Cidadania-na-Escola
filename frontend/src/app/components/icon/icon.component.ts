import { Component, input } from '@angular/core';

// Ícones locais com o mesmo traço. O rótulo acessível fica no controle que os utiliza.
@Component({
  selector: 'app-icon',
  standalone: true,
  host: { 'aria-hidden': 'true' },
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    focusable="false"
  >
    @switch (name()) {
      @case ('chevron-down') { <path d="m6 9 6 6 6-6" /> }
      @case ('settings') { <path d="M12 8v8m-4-4h8M5 5h14v14H5Z" /> }
      @case ('logout') { <path d="M10 4H4v16h6m4-12 4 4-4 4m-6-4h10" /> }
      @case ('bookmark') { <path d="M6 4h12v16l-6-4-6 4Z" /> }
      @case ('bank') {
        <path d="m3 8 9-5 9 5H3ZM4 21h16M5 18h14M6 10v6m6-6v6m6-6v6" />
      }
      @case ('document') {
        <path d="M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6" />
      }
      @case ('search') {
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      }
      @case ('briefcase') {
        <rect x="3" y="7" width="18" height="14" rx="3" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a24 24 0 0 0 18 0m-9 0v3" />
      }
      @case ('book') {
        <path
          d="M12 5v16M3 4h4a6 6 0 0 1 5 2 6 6 0 0 1 5-2h4v15h-4a7 7 0 0 0-5 2 7 7 0 0 0-5-2H3V4Z"
        />
      }
      @case ('people') {
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2" />
      }
      @case ('heart') {
        <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 3 11 8 15 5-4 13-10 8-15Z" />
      }
      @case ('comment') {
        <path d="M21 11a9 9 0 0 1-9 9H4l-2 2v-11a9 9 0 0 1 19 0ZM7 9h10M7 13h6" />
      }
      @case ('upload') {
        <path d="M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
      }
      @case ('check') {
        <path d="m5 12 4 4L19 6" />
      }
      @case ('lock') {
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
      }
      @case ('play') {
        <path d="m9 5 11 7-11 7V5Z" />
      }
      @case ('trophy') {
        <path
          d="M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-5 0h10"
        />
      }
      @case ('bolt') {
        <path d="m13 2-8 12h6l-1 8 9-13h-7l1-7Z" />
      }
      @case ('target') {
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <path d="m12 12 9-9M18 3h3v3" />
      }
      @case ('eye') {
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      }
      @case ('shield') {
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      }
      @case ('plus') {
        <path d="M12 4v16M4 12h16" />
      }
      @case ('back') {
        <path d="M20 12H4m6-6-6 6 6 6" />
      }
      @case ('calendar') {
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 10h18" />
      }
      @case ('chart') {
        <path d="M3 21h18M5 17v-4h3v4m3 0V9h3v8m3 0V4h3v13" />
      }
      @case ('star') {
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.6l6.2-.9L12 3Z" />
      }
      @case ('crown') {
        <path d="m3 6 5 4 4-6 4 6 5-4-2 13H5L3 6Z" />
      }
      @default {
        <path d="M4 12h16m-6-6 6 6-6 6" />
      }
    }
  </svg>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: 0 0 auto;
        width: 1.25em;
        height: 1.25em;
        vertical-align: middle;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class IconComponent {
  readonly name = input<string>('arrow');
}
