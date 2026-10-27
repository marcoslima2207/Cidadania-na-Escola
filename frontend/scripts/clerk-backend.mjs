import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const key = process.env.CLERK_PUBLISHABLE_KEY;
if (!key?.startsWith('pk_test_') || !process.env.CLERK_SECRET_KEY?.startsWith('sk_test_')) {
  throw new Error('Este comando exige as chaves de desenvolvimento do Clerk.');
}
const issuer = 'https://' + Buffer.from(key.split('_')[2], 'base64').toString().replace(/\$$/, '');
if (!/^https:\/\/[a-zA-Z0-9.-]+$/.test(issuer)) throw new Error('Domínio Clerk inválido.');
const backend = new URL('../../backend/', import.meta.url);
const virtualenv = fileURLToPath(new URL(
  process.platform === 'win32' ? 'venv/Scripts/python.exe' : 'venv/bin/python', backend,
));
const args = process.argv.slice(2);
const child = spawn(existsSync(virtualenv) ? virtualenv : 'python',
  ['manage.py', ...(args.length ? args : ['runserver', '127.0.0.1:8000'])], {
    cwd: fileURLToPath(backend), stdio: 'inherit',
    env: { ...process.env, CLERK_ENABLED: 'true', CLERK_ISSUER: issuer },
  });
child.on('error', () => { console.error('Não foi possível iniciar o Python do backend.'); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
