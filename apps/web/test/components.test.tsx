import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState, ExternalLink, Pagination, StatusBadge } from '../components/ui';
import { ProjectList } from '../components/projects';
import { CaseStudyChapter, TechnicalEvidence } from '../components/case-study';
import Loading from '../components/loading';
import { project } from './fixtures';

describe('public presentation components', () => {
  it('renders truthful development states and no invented demos', () => {
    const html = renderToStaticMarkup(<ProjectList projects={[project]} />);
    assert.match(html, /En desarrollo/);
    assert.match(html, /proyecto-prueba-alfa/);
    assert.doesNotMatch(html, /demo-no-verificada|no-verificado|<img/);
    assert.match(renderToStaticMarkup(<StatusBadge status="PLANNED" />), /En planificación/);
  });
  it('renders empty and unavailable states with appropriate semantics', () => {
    const html = renderToStaticMarkup(<EmptyState title="Sin contenido" unavailable>Inténtalo de nuevo.</EmptyState>);
    assert.match(html, /role="status"/);
    assert.match(html, /Sin contenido/);
    assert.doesNotMatch(html, /Error:|postgresql:|stack trace/);
  });
  it('rejects unsafe protocols and secures external links', () => {
    assert.equal(renderToStaticMarkup(<ExternalLink href="javascript:alert(1)">Enlace</ExternalLink>), '');
    const html = renderToStaticMarkup(<ExternalLink href="https://example.com">Enlace</ExternalLink>);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.match(html, /abre en otra pestaña/);
  });
  it('preserves filters while paginating and omits unnecessary pagination', () => {
    assert.equal(renderToStaticMarkup(<Pagination page={1} totalPages={1} path="/proyectos" />), '');
    const html = renderToStaticMarkup(<Pagination page={2} totalPages={3} path="/proyectos" query={{ status: 'COMPLETED' }} />);
    assert.match(html, /status=COMPLETED/);
    assert.match(html, /page=1/);
    assert.match(html, /page=3/);
  });
  it('shows only supplied case-study chapters and evidence', () => {
    assert.equal(renderToStaticMarkup(<CaseStudyChapter number="01" title="Pruebas" id="testing" text={null} />), '');
    const html = renderToStaticMarkup(<TechnicalEvidence projectName={project.name} media={{ ...project.media[0], caption: 'Pruebas: evidencia controlada' }} />);
    assert.match(html, /Pruebas/);
    assert.match(html, /evidencia controlada/);
    assert.doesNotMatch(html, /<img/);
  });
  it('announces loading without a fake content layout', () => {
    const html = renderToStaticMarkup(<Loading />);
    assert.match(html, /Cargando contenido/);
    assert.match(html, /role="status"/);
  });
});
