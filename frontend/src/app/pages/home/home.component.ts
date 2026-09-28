import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { apiConfig } from '../../api-config';

type PostTheme = 'justice' | 'education' | 'fake-news';

type FeedMediaType = 'image' | 'video';

type FeedAccent = 'blue' | 'green' | 'gold' | 'neutral';

interface Post {
  image: string;
  title: string;
  subtitle: string;
  theme: PostTheme;
  badge: string;
  description: string;
}

interface FeedPost {
  id: number;
  author: string;
  handle: string;
  category: string;
  title: string;
  excerpt: string;
  type: FeedMediaType;
  accent: FeedAccent;
  time: string;
  likes: number;
  comments: number;
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

interface DraftPost {
  category: string;
  type: FeedMediaType;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="home-page">
      @if (loginOpen) {
        <div class="login-overlay" (click)="closeLogin()">
          <div class="login-modal" (click)="$event.stopPropagation()">
            <button type="button" class="close-button" (click)="closeLogin()" aria-label="Fechar login">×</button>
            <p class="eyebrow">Acesso à comunidade</p>
            @if (authMode === 'login') {
              <h2>Entrar na plataforma</h2>
              <div class="login-field">
                <label for="login-email">E-mail ou usuário</label>
                <input id="login-email" type="text" [(ngModel)]="loginForm.email" placeholder="nome@exemplo.com" />
              </div>
              <div class="login-field">
                <label for="login-password">Senha</label>
                <input id="login-password" type="password" [(ngModel)]="loginForm.password" placeholder="Digite sua senha" />
              </div>
              <button type="button" class="btn btn-primary btn-block" (click)="login()">Entrar</button>
              <p class="auth-switch">Ainda não tem conta? <button type="button" (click)="setAuthMode('register')">Criar conta</button></p>
            } @else {
              <h2>Criar sua conta</h2>
              <div class="login-field">
                <label for="register-name">Nome</label>
                <input id="register-name" type="text" [(ngModel)]="registerForm.name" placeholder="Como você quer ser chamado?" />
              </div>
              <div class="login-field">
                <label for="register-email">E-mail</label>
                <input id="register-email" type="email" [(ngModel)]="registerForm.email" placeholder="nome@exemplo.com" />
              </div>
              <div class="login-field">
                <label for="register-password">Senha</label>
                <input id="register-password" type="password" [(ngModel)]="registerForm.password" placeholder="Mínimo de 8 caracteres" />
              </div>
              <button type="button" class="btn btn-primary btn-block" (click)="register()">Criar conta</button>
              <p class="auth-switch">Já possui uma conta? <button type="button" (click)="setAuthMode('login')">Entrar</button></p>
            }
          </div>
        </div>
      }

      <section class="identity-banner">
        <div class="identity-banner__text">
          <p class="eyebrow">Proposta de</p>
          <h1>IDENTIDADE <span>VISUAL</span></h1>
          <p class="tagline">Informação de qualidade.<br />Cidadania mais forte.</p>
        </div>

        <div class="identity-banner__feature">
          <div class="feature-card">
            <h3>Aproximar a sociedade ao Congresso.</h3>
            <p>Transparência que informa, participação que transforma.</p>
          </div>
          <div class="hero-illustration" aria-hidden="true">
            <div class="building building--left"></div>
            <div class="building building--main"></div>
            <div class="building building--right"></div>
            <div class="dome"></div>
          </div>
        </div>
      </section>

      <section class="identity-grid">
        <article class="info-card info-card--blue">
          <div class="icon">◎</div>
          <h3>Propósito</h3>
          <p>Promover informação de qualidade, combater a desinformação e fortalecer a cidadania por meio da educação e do diálogo.</p>
        </article>
        <article class="info-card info-card--green">
          <div class="icon">◌</div>
          <h3>Conceito</h3>
          <p>Comunicar com abordagem moderna, transparente e acessível, usando linguagem clara e visual institucional.</p>
        </article>
        <article class="info-card info-card--neutral">
          <div class="icon">▣</div>
          <h3>Objetivos</h3>
          <p>Informar, estimular a participação social, promover cidadania ativa e transformar conhecimento em ação.</p>
        </article>
        <article class="info-card info-card--light">
          <div class="icon">✦</div>
          <h3>Valores</h3>
          <p>Transparência, credibilidade, diálogo, participação, educação e compromisso com a democracia.</p>
        </article>
      </section>

      <section class="posts-section">
        <h2 class="posts-title">POSTS:</h2>

        <div class="posts-carousel" aria-label="Posts em destaque">
          <button class="carousel-button carousel-button--prev" type="button" (click)="prevSlide()" aria-label="Post anterior">‹</button>

          <div class="posts-viewport">
            <div class="posts-track" [style.--slide-index]="currentIndex">
              <article class="post-card" *ngFor="let post of posts" [ngClass]="'post-card--' + post.theme">
                <img class="post-card__image" [src]="post.image" [alt]="post.title" />
                <div class="post-card__overlay"></div>

                <div class="post-card__content">
                  <h3>{{ post.title }}</h3>
                  <div class="post-card__badge">{{ post.badge }}</div>
                  <p>{{ post.description }}</p>
                </div>

                <div class="post-card__footer">
                  <span>{{ post.subtitle }}</span>
                </div>
              </article>
            </div>
          </div>

          <button class="carousel-button carousel-button--next" type="button" (click)="nextSlide()" aria-label="Próximo post">›</button>
        </div>
      </section>

      <section class="quiz-preview">
        <div class="quiz-preview__content">
          <p class="eyebrow">Quiz interativo</p>
          <h2>Teste seu conhecimento sobre cidadania, democracia e informação.</h2>
          <p>Desenvolva o senso crítico e aprenda a reconhecer conteúdos confiáveis e injustiças sociais.</p>
          <div class="quiz-preview__actions">
            <a routerLink="/quiz" class="btn btn-primary">Ir para o quiz</a>
          </div>
        </div>
        <div class="quiz-preview__panel" aria-hidden="true">
          <div class="panel-score">12 perguntas</div>
          <div class="panel-track">
            <span></span>
          </div>
          <div class="mini-answers">
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      background:
        radial-gradient(circle at 8% 4%, rgba(240, 191, 45, 0.14), transparent 24rem),
        radial-gradient(circle at 92% 28%, rgba(44, 174, 95, 0.1), transparent 26rem),
        linear-gradient(180deg, #eef3f0 0%, #f8f9fb 100%);
      color: #0d2d6b;
      min-height: 100vh;
      padding-bottom: 2rem;
    }

    .home-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.5rem 1.4rem 3rem;
    }

    .eyebrow,
    .section-label {
      margin: 0 0 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #1b7a43;
      font-weight: 800;
      font-size: 0.76rem;
    }

    .identity-banner {
      background: linear-gradient(135deg, #0e3d82 0%, #114c9b 55%, #0f5ba6 100%);
      border-radius: 30px;
      color: white;
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 1.2rem;
      padding: 2rem 2rem 0;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 28px 70px rgba(13, 45, 107, 0.2);
      animation: rise-in 0.7s ease both;
    }

    .identity-banner::before,
    .identity-banner::after {
      content: "";
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      z-index: 0;
    }

    .identity-banner::before {
      width: 340px;
      height: 340px;
      top: -120px;
      right: -100px;
    }

    .identity-banner::after {
      width: 220px;
      height: 220px;
      bottom: -90px;
      left: -80px;
    }

    .identity-banner__text,
    .identity-banner__feature {
      position: relative;
      z-index: 1;
    }

    .identity-banner__text {
      padding: 2rem 0 2.5rem;
    }

    .identity-banner h1 {
      margin: 0;
      font-size: clamp(2.8rem, 5vw, 5.3rem);
      line-height: 0.93;
      letter-spacing: -0.08em;
      font-weight: 900;
      color: white;
    }

    .identity-banner h1 span {
      display: block;
      color: #f1d75b;
    }

    .tagline {
      margin-top: 1rem;
      font-size: 1.2rem;
      line-height: 1.5;
      color: rgba(255,255,255,0.9);
      max-width: 420px;
    }

    .identity-banner__feature {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      min-height: 350px;
      position: relative;
    }

    .feature-card {
      align-self: flex-end;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      max-width: 350px;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(6px);
    }

    .feature-card h3 {
      margin: 0 0 0.6rem;
      font-size: 1.7rem;
      line-height: 1.1;
      color: white;
    }

    .feature-card p {
      margin: 0;
      color: rgba(255,255,255,0.82);
      line-height: 1.6;
    }

    .hero-illustration {
      width: 100%;
      height: 220px;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 0.6rem;
    }

    .building {
      position: relative;
      background: linear-gradient(180deg, #edf5ff 0%, #c8d7ea 100%);
      border-radius: 10px 10px 0 0;
      box-shadow: inset 0 0 0 2px rgba(13,45,107,0.08);
    }

    .building--left {
      width: 120px;
      height: 140px;
      background: linear-gradient(180deg, #f8fafc 0%, #d5dfe9 100%);
    }

    .building--main {
      width: 200px;
      height: 180px;
      background: linear-gradient(180deg, #eaf3ff 0%, #bfd4ee 100%);
    }

    .building--right {
      width: 110px;
      height: 130px;
      background: linear-gradient(180deg, #f8fafc 0%, #dfe8f1 100%);
    }

    .dome {
      position: absolute;
      bottom: 18px;
      width: 290px;
      height: 110px;
      background: linear-gradient(180deg, rgba(240, 244, 250, 0.7) 0%, rgba(191, 210, 228, 0.8) 100%);
      border-radius: 45% 45% 0 0 / 100% 100% 0 0;
      box-shadow: inset 0 0 0 2px rgba(13,45,107,0.08);
    }

    .identity-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .info-card {
      padding: 1.4rem 1.2rem;
      border-radius: 22px;
      min-height: 220px;
      border: 1px solid rgba(13,45,107,0.08);
      box-shadow: 0 16px 30px rgba(14,35,68,0.05);
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    .info-card:hover {
      transform: translateY(-5px);
      border-color: rgba(13,45,107,0.16);
      box-shadow: 0 22px 40px rgba(14,35,68,0.1);
    }

    .info-card--blue { background: #edf5ff; }
    .info-card--green { background: #edf9f1; }
    .info-card--neutral { background: #f7f7f7; }
    .info-card--light { background: #f2f4f8; }

    .icon {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(13,45,107,0.08);
      font-size: 1.2rem;
      margin-bottom: 0.8rem;
    }

    .info-card h3 {
      margin: 0 0 0.6rem;
      color: #0d2d6b;
      font-size: 1.4rem;
    }

    .info-card p {
      margin: 0;
      line-height: 1.6;
      color: #2f3d4f;
    }

    .posts-section {
      margin-top: 2.2rem;
      padding: 1rem 0 0;
    }

    .posts-title {
      margin: 0 0 1rem;
      font-size: clamp(2rem, 3vw, 3.5rem);
      letter-spacing: -0.07em;
      color: #0d2d6b;
      font-weight: 900;
    }

    .posts-carousel {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) 52px;
      gap: 1rem;
      align-items: center;
    }

    .posts-viewport {
      overflow: hidden;
      width: 100%;
    }

    .posts-track {
      display: flex;
      gap: 1.25rem;
      transition: transform 0.42s ease;
      width: max-content;
      transform: translateX(calc(var(--slide-index) * -33.333%));
      padding-bottom: 0.5rem;
    }

    .post-card {
      position: relative;
      width: min(31vw, 360px);
      min-height: 350px;
      border-radius: 24px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      color: white;
      box-shadow: 0 18px 35px rgba(9, 42, 78, 0.14);
      flex-shrink: 0;
      isolation: isolate;
    }

    .post-card__image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    .post-card__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11,24,44,0.12), rgba(11,24,44,0.72));
      z-index: 1;
    }

    .post-card__content,
    .post-card__footer {
      position: relative;
      z-index: 2;
      padding-left: 1.4rem;
      padding-right: 1.4rem;
    }

    .post-card__content {
      padding-top: 1.1rem;
      padding-bottom: 0.5rem;
    }

    .post-card h3 {
      margin: 0;
      font-size: clamp(2rem, 1.8vw, 2.4rem);
      line-height: 0.95;
      letter-spacing: -0.06em;
      font-weight: 900;
      text-transform: uppercase;
      max-width: 220px;
      color: white;
    }

    .post-card__badge {
      display: inline-block;
      margin-top: 0.8rem;
      margin-bottom: 0.75rem;
      padding: 0.45rem 0.8rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.3);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
    }

    .post-card p {
      margin: 0;
      color: rgba(255,255,255,0.92);
      font-size: 1rem;
      line-height: 1.5;
      max-width: 240px;
    }

    .post-card__footer {
      padding-bottom: 1.2rem;
      padding-top: 0.4rem;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
    }

    .post-card--justice { background: linear-gradient(180deg, #0c3c83, #0b2958); }
    .post-card--education { background: linear-gradient(180deg, #2cae5f, #1e8b4a); }
    .post-card--fake-news { background: linear-gradient(180deg, #173d77, #0a2a52); }

    .carousel-button {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 2px solid #0d2d6b;
      background: rgba(255,255,255,0.7);
      color: #0d2d6b;
      font-size: 2rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }

    .carousel-button:hover {
      transform: scale(1.06);
      background: white;
      box-shadow: 0 10px 22px rgba(13,45,107,0.14);
    }

    .social-section {
      margin-top: 2.2rem;
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 1.2rem;
    }

    .composer-panel,
    .feed-item {
      background: rgba(255,255,255,0.82);
      border: 1px solid rgba(13,45,107,0.08);
      border-radius: 24px;
      box-shadow: 0 18px 35px rgba(14,35,68,0.05);
    }

    .composer-panel {
      padding: 1.5rem;
    }

    .composer-panel h2 {
      margin: 0 0 1rem;
      font-size: clamp(1.8rem, 2vw, 2.6rem);
      color: #0d2d6b;
      line-height: 1.1;
    }

    .composer-lock {
      background: linear-gradient(135deg, #edf5ff 0%, #edf9f1 100%);
      border-radius: 18px;
      padding: 1rem;
      border: 1px solid rgba(13,45,107,0.08);
    }

    .composer-lock p {
      margin: 0 0 1rem;
      color: #2f3d4f;
      line-height: 1.6;
    }

    .composer-form {
      display: grid;
      gap: 1rem;
    }

    .composer-form__row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.8rem;
    }

    label {
      display: grid;
      gap: 0.45rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: #173a6d;
    }

    input,
    select,
    textarea {
      width: 100%;
      border: 1px solid rgba(13,45,107,0.12);
      border-radius: 12px;
      background: white;
      color: #0d2d6b;
      padding: 0.8rem 0.9rem;
      font: inherit;
      resize: vertical;
    }

    .composer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.8rem;
      margin-top: 0.4rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.8rem 1.2rem;
      border-radius: 999px;
      text-decoration: none;
      border: none;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn-primary {
      background: #153e79;
      color: white;
      box-shadow: 0 12px 20px rgba(21,62,121,0.18);
    }

    .btn-secondary {
      background: transparent;
      color: #153e79;
      border: 2px solid #153e79;
    }

    .btn-block {
      width: 100%;
    }

    .feed-list {
      display: grid;
      gap: 1rem;
    }

    .feed-item {
      padding: 1.2rem;
    }

    .feed-item__head {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 0.9rem;
    }

    .feed-item__head strong,
    .feed-item__head span,
    .feed-item__head small {
      display: block;
    }

    .feed-item__head strong {
      color: #0d2d6b;
      font-size: 1rem;
    }

    .feed-item__head span,
    .feed-item__head small {
      color: #5d6980;
      font-size: 0.75rem;
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #153e79, #2cae5f);
      color: white;
      font-weight: 800;
      text-transform: uppercase;
    }

    .feed-item__meta {
      display: inline-flex;
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      background: #edf5ff;
      color: #173a6d;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 0.7rem;
    }

    .feed-item h3 {
      margin: 0 0 0.6rem;
      color: #0d2d6b;
      font-size: 1.5rem;
      line-height: 1.2;
    }

    .feed-item p {
      margin: 0;
      color: #2f3d4f;
      line-height: 1.6;
    }

    .feed-media {
      margin-top: 1rem;
      border-radius: 18px;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(13,45,107,0.08);
    }

    .feed-media span {
      position: relative;
      z-index: 1;
      font-size: 3rem;
      color: rgba(255,255,255,0.9);
    }

    .feed-media--image {
      background: linear-gradient(135deg, rgba(13,45,107,0.8), rgba(44,174,95,0.8));
    }

    .feed-media--video {
      background: linear-gradient(135deg, rgba(25,70,120,0.88), rgba(231,189,55,0.8));
    }

    .feed-media--blue { background: linear-gradient(135deg, #153e79, #2e7ce6); }
    .feed-media--green { background: linear-gradient(135deg, #1d8748, #2cae5f); }
    .feed-media--gold { background: linear-gradient(135deg, #d7a31d, #f0cf68); }
    .feed-media--neutral { background: linear-gradient(135deg, #6c7a8f, #aab5c0); }

    .feed-item__footer {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      color: #173a6d;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .login-overlay {
      position: fixed;
      inset: 0;
      background: rgba(6, 17, 31, 0.52);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1rem;
    }

    .login-modal {
      position: relative;
      width: min(100%, 420px);
      background: white;
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: 0 30px 80px rgba(0,0,0,0.25);
    }

    .login-modal h2 {
      margin: 0 0 1rem;
      color: #0d2d6b;
      font-size: 2rem;
    }

    .login-field {
      display: grid;
      gap: 0.45rem;
      margin-bottom: 1rem;
    }

    .login-field label {
      font-size: 0.82rem;
    }

    .close-button {
      position: absolute;
      top: 0.8rem;
      right: 0.8rem;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: none;
      background: #edf5ff;
      color: #0d2d6b;
      font-size: 1.6rem;
      cursor: pointer;
    }

    .auth-switch {
      margin: 1rem 0 0;
      text-align: center;
      color: #5d6980;
      font-size: 0.88rem;
    }

    .auth-switch button {
      border: 0;
      padding: 0;
      background: transparent;
      color: #153e79;
      font-weight: 800;
      cursor: pointer;
    }

    .quiz-preview {
      margin-top: 2rem;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 1rem;
      background: linear-gradient(135deg, #edf5ff 0%, #eefaf2 100%);
      border-radius: 28px;
      padding: 1.5rem 1.5rem 1.2rem;
      border: 1px solid rgba(13,45,107,0.08);
      box-shadow: 0 18px 35px rgba(14,35,68,0.04);
    }

    .quiz-preview__content h2 {
      margin: 0 0 0.8rem;
      font-size: clamp(2rem, 3vw, 3rem);
      line-height: 1.1;
      color: #0d2d6b;
    }

    .quiz-preview__content p {
      margin: 0;
      color: #2f3d4f;
      line-height: 1.7;
      max-width: 650px;
    }

    .quiz-preview__actions {
      margin-top: 1.2rem;
    }

    .quiz-preview__panel {
      background: #0d2d6b;
      border-radius: 22px;
      color: white;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 220px;
    }

    .panel-score {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.8rem;
      color: #f4d65a;
    }

    .panel-track {
      width: 100%;
      height: 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.2);
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .panel-track span {
      display: block;
      width: 78%;
      height: 100%;
      background: linear-gradient(90deg, #2cae5f, #f2d65a);
      border-radius: inherit;
    }

    .mini-answers {
      display: flex;
      gap: 0.7rem;
    }

    .mini-answers span {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.18);
      font-weight: 800;
    }

    @keyframes rise-in {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 980px) {
      .identity-banner,
      .social-section,
      .quiz-preview {
        grid-template-columns: 1fr;
      }

      .identity-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

    }

    @media (max-width: 700px) {
      .home-page {
        padding-left: 0.9rem;
        padding-right: 0.9rem;
      }

      .identity-banner {
        padding: 1.2rem 1rem 0;
      }

      .identity-banner__text {
        padding: 1rem 0 0.4rem;
      }

      .identity-grid {
        grid-template-columns: 1fr;
      }

      .posts-carousel {
        grid-template-columns: 38px minmax(0, 1fr) 38px;
      }

      .posts-track {
        gap: 0.8rem;
        transform: translateX(calc(var(--slide-index) * -100%));
      }

      .post-card {
        width: 100%;
        min-height: 360px;
      }

      .composer-form__row {
        grid-template-columns: 1fr;
      }

      .composer-actions {
        flex-direction: column;
      }

      .btn,
      .btn-primary,
      .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  currentIndex = 0;
  isLoggedIn = false;
  loginOpen = false;
  authMode: 'login' | 'register' = 'login';
  private readonly apiBaseUrl = apiConfig.baseUrl;
  private readonly tokenKey = 'cidadania_token';

  loginForm: LoginForm = {
    email: '',
    password: ''
  };

  registerForm: RegisterForm = {
    name: '',
    email: '',
    password: ''
  };

  draftPost: DraftPost = {
    category: 'Direitos Trabalhistas',
    type: 'image',
    title: '',
    description: ''
  };

  posts: Post[] = [
    {
      image: 'posts/Gemini_Generated_Image_kunbw2kunbw2kunb.jfif',
      title: 'Qual dever da Justiça?',
      subtitle: 'Justiça',
      theme: 'justice',
      badge: 'Cidadania',
      description: 'Uma sociedade livre é aquela em que as pessoas podem agir com direitos, deveres e justiça.'
    },
    {
      image: 'posts/Gemini_Generated_Image_uzx9pwuzx9pwuzx9.jfif',
      title: 'Educação',
      subtitle: 'Educação',
      theme: 'education',
      badge: 'Escola',
      description: 'A educação é um direito essencial para formar cidadãos críticos, conscientes e participantes da democracia.'
    },
    {
      image: 'posts/Gemini_Generated_Image_ve8p74ve8p74ve8p.jfif',
      title: 'Fake News',
      subtitle: 'Checagem',
      theme: 'fake-news',
      badge: 'Verificação',
      description: 'Aprenda a identificar fontes confiáveis e evitar a propagação de informações falsas na internet.'
    }
  ];

  feedPosts: FeedPost[] = [
    {
      id: 1,
      author: 'Cidadania Hoje',
      handle: '@cidadaniahoje',
      category: 'Direitos Trabalhistas',
      title: 'Direitos e dignidade no trabalho',
      excerpt: 'A informação correta pode orientar trabalhadores e fortalecer relações justas e respeitosas no ambiente profissional.',
      type: 'image',
      accent: 'blue',
      time: 'há 1h',
      likes: 128,
      comments: 24
    },
    {
      id: 2,
      author: 'Maria Silva',
      handle: '@mariaativa',
      category: 'Democracia',
      title: 'Participação é base da democracia',
      excerpt: 'Debater ideias, acompanhar decisões públicas e ouvir diferentes vozes faz a sociedade ser mais justa e consciente.',
      type: 'video',
      accent: 'green',
      time: 'há 4h',
      likes: 245,
      comments: 31
    },
    {
      id: 3,
      author: 'Educação em Foco',
      handle: '@educacaoemfoco',
      category: 'Cidadania',
      title: 'A educação fortalece a sociedade',
      excerpt: 'Formar pessoas críticas e informadas é um passo essencial para uma comunidade mais solidária e participativa.',
      type: 'image',
      accent: 'gold',
      time: 'há 8h',
      likes: 317,
      comments: 43
    },
    {
      id: 4,
      author: 'Verifique antes',
      handle: '@verifiqueantes',
      category: 'Desinformação',
      title: 'Antes de compartilhar, confirme',
      excerpt: 'Uma notícia com aparência forte pode ser falsa. Checar a fonte e o contexto é um ato de responsabilidade social.',
      type: 'video',
      accent: 'neutral',
      time: 'há 12h',
      likes: 501,
      comments: 59
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem(this.tokenKey);
    this.isLoggedIn = !!token;
    this.loadPosts();
  }

  openLogin(): void {
    this.authMode = 'login';
    this.loginOpen = true;
  }

  setAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
  }

  closeLogin(): void {
    this.loginOpen = false;
  }

  login(): void {
    if (!this.loginForm.email.trim() || !this.loginForm.password.trim()) {
      return;
    }

    const payload = {
      username: this.loginForm.email.trim(),
      password: this.loginForm.password.trim()
    };

    this.http.post<{ token: string; user: { username: string } }>(`${this.apiBaseUrl}/auth/login/`, payload)
      .subscribe({
        next: (response) => {
          localStorage.setItem(this.tokenKey, response.token);
          this.isLoggedIn = true;
          this.loginOpen = false;
          this.loginForm = { email: '', password: '' };
        },
        error: () => {
          alert('Credenciais inválidas. Use um usuário ou e-mail cadastrado no backend.');
        }
      });
  }

  register(): void {
    if (!this.registerForm.name.trim() || !this.registerForm.email.trim() || !this.registerForm.password.trim()) {
      return;
    }

    this.http.post<{ token: string; user: { username: string } }>(`${this.apiBaseUrl}/auth/register/`, {
      name: this.registerForm.name.trim(),
      email: this.registerForm.email.trim(),
      password: this.registerForm.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem(this.tokenKey, response.token);
        this.isLoggedIn = true;
        this.loginOpen = false;
        this.registerForm = { name: '', email: '', password: '' };
      },
      error: (error) => {
        const message = error?.error?.email?.[0]
          || error?.error?.password?.[0]
          || error?.error?.name?.[0]
          || error?.error?.detail
          || 'Não foi possível criar a conta. Tente novamente em alguns segundos.';
        alert(message);
      }
    });
  }

  loadPosts(): void {
    this.http.get<Array<{
      id: number;
      title: string;
      category: string;
      content: string;
      media_type: 'image' | 'video';
      media_url: string;
      created_at: string;
      author: string;
    }>>(`${this.apiBaseUrl}/posts/`).subscribe({
      next: (posts) => {
        if (posts && posts.length) {
          this.feedPosts = posts.map((post) => ({
            id: post.id,
            author: post.author,
            handle: `@${post.author.toLowerCase().replace(/\s+/g, '')}`,
            category: post.category,
            title: post.title,
            excerpt: post.content,
            type: post.media_type || 'image',
            accent: post.category === 'Desinformação' ? 'neutral' : post.category === 'Democracia' ? 'green' : post.category === 'Cidadania' ? 'gold' : 'blue',
            time: 'agora',
            likes: 0,
            comments: 0
          }));
        }
      },
      error: () => {
        this.feedPosts = this.feedPosts;
      }
    });
  }

  resetDraft(): void {
    this.draftPost = {
      category: 'Direitos Trabalhistas',
      type: 'image',
      title: '',
      description: ''
    };
  }

  publishPost(): void {
    if (!this.isLoggedIn) {
      this.openLogin();
      return;
    }

    const title = this.draftPost.title.trim() || 'Nova publicação';
    const description = this.draftPost.description.trim() || 'Informação de qualidade para fortalecer a cidadania e a participação social.';
    const token = localStorage.getItem(this.tokenKey);

    const payload = {
      title,
      category: this.draftPost.category,
      content: description,
      media_type: this.draftPost.type,
      media_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'
    };

    const headers = new HttpHeaders({
      Authorization: `Token ${token ?? ''}`
    });

    this.http.post(`${this.apiBaseUrl}/posts/`, payload, { headers }).subscribe({
      next: () => {
        this.loadPosts();
        this.resetDraft();
      },
      error: () => {
        alert('Não foi possível publicar. Faça login novamente e tente outra vez.');
      }
    });
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.posts.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.posts.length) % this.posts.length;
  }
}
