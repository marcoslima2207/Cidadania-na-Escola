import { ChecagemComponent } from './checagem.component';

describe('Pesquisa de checagens', () => {
  afterEach(() => vi.restoreAllMocks());

  it('abre a rota de busca do Explorer com o assunto codificado em português', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const event = new Event('submit', { cancelable: true });
    new ChecagemComponent().searchFactChecks(event, '  vacina / dengue;hl=en  ');
    expect(event.defaultPrevented).toBe(true);
    expect(open).toHaveBeenCalledWith(
      'https://toolbox.google.com/factcheck/explorer/search/vacina%20%2F%20dengue%3Bhl%3Den;hl=pt',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('mantém o formulário na página quando o assunto contém somente espaços', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    new ChecagemComponent().searchFactChecks(new Event('submit'), '   ');
    expect(open).not.toHaveBeenCalled();
  });
});
