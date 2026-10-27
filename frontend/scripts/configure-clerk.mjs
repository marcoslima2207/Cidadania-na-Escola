import { writeFile } from 'node:fs/promises';

// O Node injeta as variáveis; somente a chave pública é serializada no frontend.
const key = process.env.CLERK_PUBLISHABLE_KEY;
if (!key?.startsWith('pk_test_')) {
  throw new Error('Configure uma chave pública de desenvolvimento pk_test_.');
}
const target = new URL('../src/app/clerk-config.ts', import.meta.url);
await writeFile(target,
  '// Chave pública de desenvolvimento. Nunca adicione uma chave sk_ neste arquivo.\n' +
  `export const clerkConfig: { publishableKey: string } = ${JSON.stringify({ publishableKey: key })};\n`,
);
console.log('Chave pública de desenvolvimento configurada. Nenhuma chave secreta foi copiada.');
