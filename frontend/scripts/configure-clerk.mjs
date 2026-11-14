import { writeFile } from 'node:fs/promises';

// O Node injeta as variáveis; somente a chave pública é serializada no frontend.
const production = process.argv.includes('--production');
const prefix = production ? 'pk_live_' : 'pk_test_';
const publicProductionKey = 'pk_live_Y2xlcmsuY2lkYWRhbmlhbmFlc2NvbGEuY29tJA';
const key = process.env.CLERK_PUBLISHABLE_KEY?.trim() || (production && process.argv.includes('--optional') ? publicProductionKey : '');
const optional = production && process.argv.includes('--optional');
if ((!optional || key) && !key?.startsWith(prefix)) {
  throw new Error(`Configure uma chave pública ${production ? 'de produção pk_live_' : 'de desenvolvimento pk_test_'}.`);
}
if (key) {
  const encodedDomain = key.slice(prefix.length);
  const domain = Buffer.from(encodedDomain, 'base64').toString('utf8');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encodedDomain) || !/^[a-zA-Z0-9.-]+\$$/.test(domain)) {
    throw new Error('O formato da chave pública Clerk é inválido.');
  }
}
const target = new URL(
  production ? '../src/app/clerk-config.prod.ts' : '../src/app/clerk-config.ts',
  import.meta.url,
);
await writeFile(target,
  '// Chave pública Clerk. Nunca adicione uma chave sk_ neste arquivo.\n' +
  `export const clerkConfig: { publishableKey: string } = ${JSON.stringify({ publishableKey: key || '' })};\n`,
);
if (key) {
  console.log(`Chave pública ${production ? 'de produção' : 'de desenvolvimento'} configurada.`);
}
