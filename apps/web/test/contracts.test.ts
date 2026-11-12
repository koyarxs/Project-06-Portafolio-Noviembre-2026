import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { itemSchema, pageSchema, profileSchema, projectDetailSchema, projectSchema } from '../lib/contracts';
import { dateLabel, safeUrl } from '../lib/presentation';
import { profile, project } from './fixtures';

describe('network contracts and display utilities', () => {
  it('accepts actual JSON shapes including nullable business dates', () => {
    assert.ok(itemSchema(profileSchema)({ data: profile }));
    assert.ok(projectDetailSchema(project));
    assert.ok(pageSchema(projectSchema)({ data: [project], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }));
  });
  it('rejects malformed data before it reaches components', () => {
    assert.equal(profileSchema({ ...profile, biography: {} }), false);
    assert.equal(projectDetailSchema({ ...project, technologies: 'invalid' }), false);
    assert.equal(projectDetailSchema({ ...project, status: 'UNKNOWN' }), false);
    assert.equal(pageSchema(projectSchema)({ data: [project], meta: { page: '1' } }), false);
  });
  it('rejects credentials, unsafe protocols and invalid dates', () => {
    for (const url of ['data:text/html,test', 'javascript:alert(1)', 'https://user:secret@example.com']) assert.equal(safeUrl(url), null);
    assert.equal(dateLabel(null), '');
    assert.equal(dateLabel('not-a-date'), '');
    assert.match(dateLabel('2020-01-01'), /2020/);
  });
});
