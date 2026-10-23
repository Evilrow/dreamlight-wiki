// npm run dev : lance Vite (rechargement à chaud) puis Electron pointé sur le serveur de dev.
import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import electron from 'electron'; // dans Node, renvoie le chemin de l'exécutable Electron

const server = await createServer();
await server.listen();
server.printUrls();
const url = server.resolvedUrls.local[0];

const app = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_SERVER_URL: url },
});
app.on('close', async (code) => { await server.close(); process.exit(code ?? 0); });
