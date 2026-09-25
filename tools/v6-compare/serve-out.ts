/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { readFile } from 'node:fs';
import { createServer, get, Server } from 'node:http';
import path from 'node:path';

const MIME: Record<string, string> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json'
};

// compare.html's <title>; used to tell "this is our harness" apart from an unrelated server that
// happens to answer on the same port (which must not be silently reused or double-bound).
const HARNESS_MARKER = '<title>antd v6 vs ng-zorro</title>';

// Loopback only: the server exposes local files, so it must never be reachable from the network.
const HOST = '127.0.0.1';

type PortProbe = 'free' | 'harness' | 'occupied';

function probePort(port: number): Promise<PortProbe> {
  return new Promise(resolve => {
    const req = get({ host: HOST, port, path: '/compare.html', timeout: 1000 }, res => {
      let body = '';
      res.on('data', (chunk: Buffer) => (body += chunk));
      res.on('end', () => resolve(res.statusCode === 200 && body.includes(HARNESS_MARKER) ? 'harness' : 'occupied'));
      res.on('error', () => resolve('occupied'));
    });
    req.on('timeout', () => {
      req.destroy();
      resolve('occupied');
    });
    req.on('error', (error: NodeJS.ErrnoException) => resolve(error.code === 'ECONNREFUSED' ? 'free' : 'occupied'));
  });
}

function createOutServer(dir: string): Server {
  return createServer((req, res) => {
    const url = req.url ?? '/';
    let pathname: string;
    try {
      pathname = decodeURIComponent(url.split('?')[0] ?? '/');
    } catch {
      res.statusCode = 400;
      res.end();
      return;
    }
    const relative = pathname === '/' ? 'compare.html' : pathname.replace(/^\/+/, '');
    const file = path.resolve(dir, relative);
    // Confine to `dir`: `..` segments (also percent-encoded ones, decoded above) must not escape it.
    if (!file.startsWith(path.resolve(dir) + path.sep)) {
      res.statusCode = 404;
      res.end();
      return;
    }
    readFile(file, (error, data) => {
      if (error) {
        res.statusCode = 404;
        res.end();
        return;
      }
      res.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream');
      res.end(data);
    });
  });
}

/**
 * Serves `dir` (the compare harness's `out/`) at `http://127.0.0.1:${port}` (loopback only; `localhost`
 * URLs such as the default `HARNESS_URL` reach it too). Requests are confined to `dir`. If a server already
 * answers `GET /compare.html` on that port with the compare harness's own page, resolves immediately
 * with a no-op stop function instead of starting a second server. If something else is listening on
 * the port (wrong status, wrong body, or a non-HTTP socket), throws rather than reusing or double-
 * binding it.
 */
export async function startOutServer(dir: string, port: number): Promise<() => Promise<void>> {
  const probe = await probePort(port);
  if (probe === 'harness') {
    console.log(`Reusing server already serving http://${HOST}:${port}`);
    return async () => {};
  }
  if (probe === 'occupied') {
    throw new Error(`port ${port} is in use by something other than the compare harness`);
  }
  const server = createOutServer(dir);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, HOST, () => resolve());
  });
  console.log(`Serving ${dir} at http://${HOST}:${port}`);
  return () => new Promise<void>(resolve => server.close(() => resolve()));
}

if (require.main === module) {
  const port = Number(new URL(process.env['HARNESS_URL'] ?? 'http://localhost:4301').port || 80);
  startOutServer(path.join(__dirname, 'out'), port).catch(error => {
    console.error(error);
    process.exit(1);
  });
}
