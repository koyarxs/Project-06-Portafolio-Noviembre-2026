import { createServer } from 'node:http';
import { project, profile, technology } from './fixtures';

let mode = 'content';
const calls: string[] = [];
createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1:4011');
  res.setHeader('Content-Type', 'application/json');
  const json = (body: unknown, status = 200) => { res.statusCode = status; res.end(JSON.stringify(body)); };
  if (url.pathname === '/_test/mode' && req.method === 'POST') {
    mode = url.searchParams.get('mode') ?? 'content'; calls.length = 0; return json({ mode });
  }
  if (url.pathname === '/_test/calls') return json(calls);
  if (url.pathname === '/_test/health') return json({ status: 'ok' });
  calls.push(url.pathname + url.search);
  if (mode === 'unavailable') return json({ status: 'error' }, 503);
  if (mode === 'rate-limit') return json({ status: 'error' }, 429);
  if (mode === 'malformed') return json({ data: { fullName: null } });
  const path = url.pathname.replace('/api/v1', '');
  if (path === '/profile') return mode === 'empty' ? json({ status: 'error' }, 404) : json({ data: profile });
  if (path === `/projects/${project.slug}`) return mode === 'empty' ? json({ status: 'error' }, 404) : json({ data: project });
  if (path.startsWith('/projects/')) return json({ status: 'error' }, 404);
  const page = Number(url.searchParams.get('page') ?? 1), limit = Number(url.searchParams.get('limit') ?? 20);
  let items: unknown[] = [];
  if (mode !== 'empty') {
    if (path === '/projects') {
      const matches = (!url.searchParams.get('status') || url.searchParams.get('status') === project.status) &&
        (!url.searchParams.get('technology') || url.searchParams.get('technology') === technology.slug);
      items = matches ? [project] : [];
    }
    if (path === '/technologies') items = [technology];
  }
  return json({ data: page === 1 ? items : [], meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) } });
}).listen(4011, '127.0.0.1', () => console.log('Test-only API fixture listening on 4011'));
