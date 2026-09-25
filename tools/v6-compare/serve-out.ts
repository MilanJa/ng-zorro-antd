/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { readFile } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const port = 4301;
const root = path.join(__dirname, 'out');

const MIME: Record<string, string> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json'
};

createServer((req, res) => {
  const url = req.url ?? '/';
  const pathname = decodeURIComponent(url.split('?')[0] ?? '/');
  const relative = pathname === '/' ? 'compare.html' : pathname.replace(/^\/+/, '');
  const file = path.join(root, relative);
  readFile(file, (error, data) => {
    if (error) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream');
    res.end(data);
  });
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
