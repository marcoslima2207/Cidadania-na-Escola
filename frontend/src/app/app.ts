import { Component } from '@angular/core';

type ColorSwatch = {
  hex: string;
  label: string;
};

type InfoCard = {
  title: string;
  description: string;
  tone: 'blue' | 'green' | 'gray' | 'white';
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  primaryColors: ColorSwatch[] = [
    { hex: '#002D9A', label: 'Azul institucional' },
    { hex: '#0A901C', label: 'Verde forte' },
    { hex: '#E7B400', label: 'Amarelo' },
    { hex: '#FFFCF7', label: 'Branco' }
  ];

  secondaryColors: ColorSwatch[] = [
    { hex: '#0047F1', label: 'Azul secundário' },
    { hex: '#B4B4B4', label: 'Cinza' },
    { hex: '#000000', label: 'Preto' },
    { hex: '#B4B4B4', label: 'Cinza claro' }
  ];

  focusCards: InfoCard[] = [
    {
      title: 'PROPÓSITO',
      description:
        'Promover informação de qualidade, combater a desinformação e fortalecer a cidadania por meio da educação, do diálogo e da participação social.',
      tone: 'white'
    },
    {
      title: 'CONCEITO',
      description:
        'Comunicar o acompanhamento do Congresso de forma transparente, acessível e confiável, com uma linguagem moderna, institucional e conectada à sociedade.',
      tone: 'white'
    },
    {
      title: 'OBJETIVOS',
      description:
        'Aproximar o cidadão do Congresso, facilitar o acesso à informação pública, estimular a participação social e contribuir para uma sociedade mais crítica e engajada.',
      tone: 'white'
    },
    {
      title: 'VALORES',
      description:
        'Transparência, Credibilidade, Diálogo, Participação, Educação cidadã, Compromisso com a democracia.',
      tone: 'blue'
    }
  ];

  paletteDetails = [
    { label: 'Confiança', hex: '#153E79' },
    { label: 'Comunicação', hex: '#005788' },
    { label: 'Cidadania', hex: '#23A345' },
    { label: 'Apoio', hex: '#B181A1' },
    { label: 'Institucional', hex: '#1E3C5A' },
    { label: 'Clara', hex: '#F7F4F0' },
    { label: 'Ação', hex: '#F0C84D' },
    { label: 'Desenvolvimento', hex: '#0A901C' }
  ];

  typography = [
    'Montserrat',
    'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz',
    '0123456789'
  ];

  iconNotes = [
    'Ícones simples, com traço uniforme e clara legibilidade.',
    'Fácil adaptação em versões digitais e impressas.'
  ];

  socialCards = [
    {
      title: 'Você sabe como um projeto de lei vira lei?',
      imageClass: 'card-one',
      accent: 'blue'
    },
    {
      title: '3 coisas que você deve saber antes de compartilhar uma notícia',
      imageClass: 'card-two',
      accent: 'green'
    },
    {
      title: 'Analisamos. Explicamos. Conectamos.',
      imageClass: 'card-three',
      accent: 'blue'
    },
    {
      title: 'PL 2.345/2024',
      imageClass: 'card-four',
      accent: 'blue'
    }
  ];

  usageRules = [
    'Manter a paleta de cores e tipografia consistentes',
    'Usar sempre um linguagem clara e objetiva',
    'Utilizar ícones e elementos gráficos padronizados',
    'Aplicar imagens institucionalmente boas',
    'Garantir contraste e acessibilidade',
    'Manter unidade visual entre todos os canais'
  ];

  bestPractices = [
    'Publicar com regularidade',
    'Textos curtos e objetivos',
    'Fazer uso de elementos visuais quando apropriado',
    'Adaptar o conteúdo para cada rede social',
    'Usar chamadas claras',
    'Monitorar a análise do desempenho'
  ];

  deadlineText = '05/09';
}
