import { isCommunityData, wordCount } from '../../../packages/community/src/contracts';
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


describe('public community contracts', () => {
  const valid = { likes:0,comments:1,liked:false,page:1,pages:1,sort:'recent',myReaction:null,reactions:[],items:[{ id:'example',name:'Visitante',avatar:'🚀',category:null,message:'Una idea.',createdAt:'2026-11-15T12:00:00.000Z',authorRole:'VISITOR',pinned:false,replyCount:0,reactions:[],myReaction:null,attachments:[] }] };
  it('accepts zero counts and rejects malformed public results', () => {
    assert.equal(isCommunityData(valid), true);
    for (const value of [{ ...valid, likes:-1 }, { ...valid, comments:'1' }, { ...valid, liked:'false' }, { ...valid, items:[{ ...valid.items[0], createdAt:'not-a-date' }] }, { ...valid, items:Array(13).fill(valid.items[0]) }]) assert.equal(isCommunityData(value), false);
  });
  it('counts words across whitespace and empty drafts', () => {
    assert.equal(wordCount('   '), 0);
    assert.equal(wordCount('  Hola\n mundo\t🚀  '), 3);
    assert.equal(wordCount(Array(200).fill('idea').join(' ')), 200);
  });
});
