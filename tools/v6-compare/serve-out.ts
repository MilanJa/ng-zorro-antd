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

function isAlreadyServing(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const req = get({ host: 'localhost', port, path: '/compare.html', timeout: 1000 }, res => {
      res.resume();
      resolve(res.statusCode !== undefined);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
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
 * answers `GET /compare.html` on that port, resolves immediately with a no-op stop function instead
 * of starting a second server.
 */
export async function startOutServer(dir: string, port: number): Promise<() => Promise<void>> {
  if (await isAlreadyServing(port)) {
    console.log(`Reusing server already serving http://localhost:${port}`);
    return async () => {};
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
