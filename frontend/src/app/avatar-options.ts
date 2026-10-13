// Catálogo compartilhado pelo perfil e pelo feed; caminhos relativos respeitam o GitHub Pages.
export const avatarOptions = [
  { id: 'portrait01', label: 'Óculos e cabelo ondulado', image: 'avatars/portrait-01.jpg' },
  { id: 'portrait02', label: 'Fones de ouvido', image: 'avatars/portrait-02.jpg' },
  { id: 'portrait03', label: 'Lenço azul', image: 'avatars/portrait-03.jpg' },
  { id: 'portrait04', label: 'Boné', image: 'avatars/portrait-04.jpg' },
  { id: 'portrait05', label: 'Cabelo ruivo', image: 'avatars/portrait-05.jpg' },
  { id: 'portrait06', label: 'Cabelo curto', image: 'avatars/portrait-06.jpg' },
  { id: 'portrait07', label: 'Tranças e óculos', image: 'avatars/portrait-07.jpg' },
  { id: 'portrait08', label: 'Cabelo cacheado', image: 'avatars/portrait-08.jpg' },
];

// Usa uma ilustração padrão para perfis sem escolha ou recebidos de uma API anterior.
export function avatarImage(choice?: string): string {
  return (avatarOptions.find((option) => option.id === choice) || avatarOptions[0]).image;
}
