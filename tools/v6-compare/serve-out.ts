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

type PortProbe = 'free' | 'harness' | 'occupied';

function probePort(port: number): Promise<PortProbe> {
  return new Promise(resolve => {
    const req = get({ host: 'localhost', port, path: '/compare.html', timeout: 1000 }, res => {
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
    const pathname = decodeURIComponent(url.split('?')[0] ?? '/');
    const relative = pathname === '/' ? 'compare.html' : pathname.replace(/^\/+/, '');
    const file = path.join(dir, relative);
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
 * Serves `dir` (the compare harness's `out/`) at `http://localhost:${port}`. If a server already
 * answers `GET /compare.html` on that port with the compare harness's own page, resolves immediately
 * with a no-op stop function instead of starting a second server. If something else is listening on
 * the port (wrong status, wrong body, or a non-HTTP socket), throws rather than reusing or double-
 * binding it.
 */
export async function startOutServer(dir: string, port: number): Promise<() => Promise<void>> {
  const probe = await probePort(port);
  if (probe === 'harness') {
    console.log(`Reusing server already serving http://localhost:${port}`);
    return async () => {};
  }
  if (probe === 'occupied') {
    throw new Error(`port ${port} is in use by something other than the compare harness`);
  }
  const server = createOutServer(dir);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve());
  });
  console.log(`Serving ${dir} at http://localhost:${port}`);
  return () => new Promise<void>(resolve => server.close(() => resolve()));
}

if (require.main === module) {
  startOutServer(path.join(__dirname, 'out'), 4301).catch(error => {
    console.error(error);
    process.exit(1);
  });
}
