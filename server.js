const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3847;
const ROOT = __dirname;
const ACTIVITY_FILE = path.join(ROOT, 'activity.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readActivity() {
  try {
    const raw = fs.readFileSync(ACTIVITY_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    return [];
  }
}

function appendActivity(entry) {
  const list = readActivity();
  list.push(entry);
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(list, null, 2), 'utf8');
  console.log('[activity]', entry.action, entry.detail, '→ total', list.length);
  return list;
}

function sendJson(res, status, body) {
  cors(res);
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  });
  res.end(payload);
}

function serveFile(req, res, filePath) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      cors(res);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    let type = MIME[ext];
    if (!type) {
      type = 'application/octet-stream';
    }
    cors(res);
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer(function (req, res) {
  const url = req.url.split('?')[0];

  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && url === '/api/activity') {
    let body = '';
    req.on('data', function (chunk) {
      body += chunk;
      if (body.length > 100000) {
        req.destroy();
      }
    });
    req.on('end', function () {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch (err) {
        sendJson(res, 400, { ok: false, error: 'invalid json' });
        return;
      }

      let detail = null;
      if (parsed.detail) {
        detail = parsed.detail;
      }

      let meta = null;
      if (parsed.meta) {
        meta = parsed.meta;
      }

      const entry = {
        id: Date.now() + '-' + Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        action: parsed.action,
        detail: detail,
        meta: meta
      };

      appendActivity(entry);
      sendJson(res, 200, { ok: true, entry: entry });
    });
    return;
  }

  if (req.method === 'GET' && url === '/api/activity') {
    sendJson(res, 200, { ok: true, activities: readActivity() });
    return;
  }

  let filePath;
  if (url === '/' || url === '') {
    filePath = path.join(ROOT, 'index.html');
  } else {
    const safe = path.normalize(url).replace(/^(\.\.[/\\])+/, '');
    filePath = path.join(ROOT, safe);
  }

  if (filePath.indexOf(ROOT) !== 0) {
    cors(res);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  serveFile(req, res, filePath);
});

server.listen(PORT, '127.0.0.1', function () {
  console.log('Drug dejt tece na http://127.0.0.1:' + PORT);
  console.log('Odpri TOLE v browserju — ne index.html direktno.');
});
