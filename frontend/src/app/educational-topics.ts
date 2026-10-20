export const postCategories = [
  'Cidadania',
  'Democracia',
  'Desinformação',
  'Direitos Trabalhistas',
  'Educação',
] as const;

// Os assuntos educativos e as categorias de posts são contratos diferentes.
export const educationalTopics = [
  {
    title: 'Democracia e Cidadania',
    path: '/democracia',
    icon: 'bank',
    color: 'blue',
    description: 'Entenda seus direitos e o papel de cada cidadão na sociedade.',
  },
  {
    title: 'Desinformação',
    path: '/desinformacao',
    icon: 'document',
    color: 'green',
    description: 'Aprenda a identificar e combater notícias falsas.',
  },
  {
    title: 'Checagem de Informação',
    path: '/checagem',
    icon: 'search',
    color: 'yellow',
    description: 'Descubra como verificar a veracidade dos conteúdos.',
  },
  {
    title: 'Direitos Trabalhistas',
    path: '/direitos-trabalhistas',
    icon: 'briefcase',
    color: 'blue',
    description: 'Conheça seus direitos e deveres no mundo do trabalho.',
  },
] as const;
