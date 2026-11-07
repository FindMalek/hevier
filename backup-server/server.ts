import http from 'node:http';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { KEY_HEADER, isValidPath } from '../shared/sync-protocol';
import type { BeginRequest, Manifest, Refusal } from '../shared/sync-types';
import { StoreError, type Store } from './store';

// What the window prints as it happens (main.ts).
export type SyncEvent =
  | { type: 'received'; manifest: Manifest }
  | { type: 'refused'; reason: Refusal['reason']; phoneWorkouts: number; pcWorkouts: number }
  | { type: 'restore' };

function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createServer(store: Store, onEvent: (e: SyncEvent) => void = () => {}): http.Server {
  async function handle(req: http.IncomingMessage, res: http.ServerResponse) {
    if (req.headers[KEY_HEADER] !== store.key()) return send(res, 401, { error: 'wrong key' });
    const url = new URL(req.url ?? '/', 'http://pc');
    const route = `${req.method} ${url.pathname}`;

    if (route === 'GET /status') return send(res, 200, { backup: store.current() });

    if (route === 'POST /begin') {
      const body = (await readJson(req)) as BeginRequest;
      if (!Array.isArray(body?.files) || !body.files.every((f) => isValidPath(f.path))) {
        return send(res, 400, { error: 'bad file list' });
      }
      const result = store.begin(body);
      if ('reason' in result) {
        onEvent({ type: 'refused', reason: result.reason, phoneWorkouts: body.workouts, pcWorkouts: result.pc.workouts });
        return send(res, 409, result);
      }
      return send(res, 200, result);
    }

    if (route === 'POST /commit') {
      const manifest = store.commit();
      onEvent({ type: 'received', manifest });
      return send(res, 200, manifest);
    }

    if (url.pathname === '/file') {
      const p = url.searchParams.get('path') ?? '';
      if (!isValidPath(p)) return send(res, 400, { error: 'bad path' });
      if (req.method === 'PUT') {
        await pipeline(req, store.writeStream(p));
        return send(res, 200, { ok: true });
      }
      if (req.method === 'GET') {
        const file = store.readPath(p);
        if (!file) return send(res, 404, { error: 'not found' });
        if (p === 'hevier.db') onEvent({ type: 'restore' });
        res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': fs.statSync(file).size });
        await pipeline(fs.createReadStream(file), res);
        return;
      }
    }

    send(res, 404, { error: 'not found' });
  }

  return http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      if (res.headersSent) return res.destroy();
      send(res, err instanceof StoreError ? err.status : 500, { error: String(err.message ?? err) });
    });
  });
}
