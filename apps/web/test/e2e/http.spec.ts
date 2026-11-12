import { test, expect } from '@playwright/test';

// Pruebas HTTP sobre Next de producción. La revisión visual usa el navegador de Codex.
test.beforeEach(async ({ request }) => { await request.post('http://127.0.0.1:4011/_test/mode?mode=content'); });
test('renders every route with semantic landmarks and correct metadata', async ({ request }) => {
  for (const path of ['/', '/proyectos', '/sobre-mi', '/experiencia', '/laboratorios', '/contacto']) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('lang="es"');
    expect(html).toContain('<main');
    expect(html).toContain('<h1');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('Saltar al contenido');
    expect(html).not.toContain('DATABASE_URL');
  }
});
test('renders real response content and project-case sections, hiding unverified links', async ({ request }) => {
  const response = await request.get('/proyectos/proyecto-prueba-alfa');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Proyecto de prueba Alfa');
  expect(html).toContain('Problema de prueba.');
  expect(html).toContain('Arquitectura de prueba.');
  expect(html).toContain('Evidencias del trabajo');
  expect(html).not.toContain('href="https://example.invalid/demo-no-verificada');
  expect(html).not.toContain('href="https://example.invalid/no-verificado');
});
test('forwards only validated filters to the backend', async ({ request }) => {
  const matching = await request.get('/proyectos?status=IN_DEVELOPMENT&technology=typescript');
  expect(await matching.text()).toContain('Proyecto de prueba Alfa');
  const empty = await request.get('/proyectos?status=COMPLETED');
  expect(await empty.text()).toContain('Sin coincidencias por ahora.');
  await request.get('/proyectos?status=INVALID&technology=bad%20slug&page=-1');
  const calls = await (await request.get('http://127.0.0.1:4011/_test/calls')).json() as string[];
  expect(calls.filter(path => path.startsWith('/api/v1/projects')).at(-1)).toBe('/api/v1/projects?page=1&limit=8');
});
test('never reveals private projects and returns a 404 with noindex', async ({ request }) => {
  const response = await request.get('/proyectos/private-project');
  expect(response.status()).toBe(404);
  const html = await response.text();
  expect(html).toContain('noindex');
  expect(html).toContain('Este camino no lleva a un proyecto público.');
});
test('distinguishes empty content from an unavailable API', async ({ request }) => {
  await request.post('http://127.0.0.1:4011/_test/mode?mode=empty');
  const empty = await request.get('/proyectos');
  expect(await empty.text()).toContain('Un espacio para el trabajo que viene.');
  for (const mode of ['unavailable', 'rate-limit', 'malformed']) {
    await request.post(`http://127.0.0.1:4011/_test/mode?mode=${mode}`);
    const response = await request.get('/proyectos');
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('Una pausa en la conexión');
  }
});
test('publishes only API-returned slugs in the sitemap and protects local indexing', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/proyectos/proyecto-prueba-alfa');
  expect(sitemap).not.toContain('private-project');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /');
});

test('keeps the owner portfolio visible without exposing private repository links when the API is offline', async ({ request }) => {
  await request.post('http://127.0.0.1:4011/_test/mode?mode=unavailable');
  const home = await request.get('/');
  const html = await home.text();
  expect(home.status()).toBe(200);
  for (const name of ['Yerko Barrera', 'Pawly', 'Zenvik', 'FraudShield', 'Falta Uno', 'FlyMaster']) expect(html).toContain(name);
  expect(html).toContain('/images/yerko-linkedin.jpg');
  expect(html).toContain('https://flymaster.cl');
  expect(html).not.toContain('github.com/koyarxs/Project-02-FlyMaster');
  const contact = await (await request.get('/contacto')).text();
  expect(contact).toContain('https://github.com/koyarxs');
  expect(contact).toContain('linkedin.com/in/yerko-andr');
});
