import 'reflect-metadata';
import assert from 'node:assert/strict';
import { before,after,describe,it } from 'node:test';
import { randomUUID } from 'node:crypto';
import { mkdir,readdir,unlink,rmdir } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import sharp from 'sharp';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module.ts';
import { configureApp } from '../src/configure-app.ts';
import { validateEnvironment } from '../src/config/environment.ts';
import { signVisitor } from '../../../packages/community/src/identity.ts';
import { createIsolatedDatabase } from './isolated-database.ts';
import type { CommunityData,Attachment } from '../../../packages/community/src/contracts.ts';
Logger.overrideLogger(false);
const key = 'test-community-signature-with-more-than-forty-eight-characters';
const adminKey = 'test-owner-key-with-more-than-forty-eight-random-characters';
const author = randomUUID(),reader = randomUUID();
const uploadDirectory = resolve('../../.data',`community-fixture-${randomUUID()}`);

describe('Portfolio Community end to end on isolated PostgreSQL',{ concurrency:false },() => {
  let isolated:Awaited<ReturnType<typeof createIsolatedDatabase>>;
  let app:NestExpressApplication,base:string,commentId:string,replyId:string,image:Attachment;
  const signed = (id=author) => ({ 'x-community-visitor':signVisitor(id,key) });
  async function createApp(overrides:Record<string,unknown> = {}) {
    const config = validateEnvironment({ NODE_ENV:'test',DATABASE_URL:isolated.connectionString,API_RATE_LIMIT:'120',COMMUNITY_SIGNING_SECRET:key,COMMUNITY_ADMIN_TOKEN:adminKey,COMMUNITY_UPLOAD_DIR:uploadDirectory,...overrides });
    const module = await Test.createTestingModule({ imports:[AppModule] }).overrideProvider(ConfigService).useValue(new ConfigService(config)).compile();
    const application = module.createNestApplication<NestExpressApplication>({ bodyParser:false,logger:false });
    configureApp(application); await application.listen(0,'127.0.0.1'); return application;
  }
  async function post(path:string,body:unknown,id=author,status=201) {
    const response = await fetch(`${base}/api/v1/${path}`,{ method:'POST',headers:{ ...signed(id),'Content-Type':'application/json' },body:JSON.stringify(body) });
    assert.equal(response.status,status,`${path}: ${response.status}`); return await response.json();
  }
  async function read(id=reader,query=''):Promise<CommunityData> { const response = await fetch(`${base}/api/v1/community${query}`,{ headers:signed(id) }); assert.equal(response.status,200); return await response.json() as CommunityData; }
  async function moderate(action:string,message?:string,id=commentId) {
    const response = await fetch(`${base}/api/v1/community-admin`,{ method:'POST',headers:{ Authorization:`Bearer ${adminKey}`,'Content-Type':'application/json' },body:JSON.stringify({ action,commentId:id,message }) });
    assert.equal(response.status,201); return await response.json();
  }
  async function upload(bytes:Buffer,mime='image/png',id=author,status=201):Promise<Attachment> {
    const form = new FormData(); form.set('image',new Blob([new Uint8Array(bytes)],{ type:mime }),'reference.png');
    const response = await fetch(`${base}/api/v1/community/uploads`,{ method:'POST',headers:signed(id),body:form });
    assert.equal(response.status,status); return await response.json() as Attachment;
  }
  before(async () => {
    assert.ok(process.env.DATABASE_URL);
    process.env.COMMUNITY_SIGNING_SECRET = key;
    await mkdir(uploadDirectory,{ recursive:true });
    isolated = await createIsolatedDatabase(process.env.DATABASE_URL);
    app = await createApp(); base = await app.getUrl();
  });
  after(async () => {
    try { await app?.close(); } finally { await isolated?.close(); }
    assert.equal(resolve(uploadDirectory,'..'),resolve('../../.data'));
    for (const name of await readdir(uploadDirectory).catch(() => [])) { assert.match(name,/^[0-9a-f-]{36}\.webp$/); await unlink(join(uploadDirectory,name)); }
    await rmdir(uploadDirectory).catch(() => undefined);
  });
  it('requires signed visitor identity and real owner credentials',async () => {
    assert.equal((await fetch(`${base}/api/v1/community`)).status,403);
    assert.equal((await fetch(`${base}/api/v1/community-admin`)).status,403);
    const forged = await fetch(`${base}/api/v1/community`,{ headers:{ 'x-community-visitor':author } }); assert.equal(forged.status,403);
  });
  it('counts browsers once and keeps activity separate from visits',async () => {
    assert.equal((await post('visitors',{},author)).total,1);
    assert.equal((await post('visitors',{},author)).total,1);
    assert.equal((await post('visitors',{},reader)).total,2);
  });
  it('checks file contents and size and strips EXIF before persistence',async () => {
    const png = await sharp({ create:{ width:20,height:12,channels:3,background:'#4677aa' } }).withExif({ IFD0:{ Artist:'Private fixture' } }).png().toBuffer();
    image = await upload(png);
    await upload(Buffer.from('<script>bad</script>'),'image/png',author,400);
    await upload(png,'image/jpeg',author,400);
    await upload(Buffer.alloc(5*1024*1024+1),'image/png',author,413);
    const response = await fetch(`${base}/api/v1/community/media/${image.id}`,{ headers:signed(author) });
    assert.equal(response.status,200); assert.equal(response.headers.get('content-type'),'image/webp');
    const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata(); assert.equal(metadata.exif,undefined); assert.equal(metadata.format,'webp');
    assert.equal((await fetch(`${base}/api/v1/community/media/${image.id}`)).status,404);
  });
  it('publishes general comments with attachments and rejects owner or project spoofing',async () => {
    await post('community/comments',{ name:'Visitor',avatar:'🚀',message:'Bad owner',authorRole:'OWNER' },reader,400);
    await post('community/comments',{ name:'Visitor',avatar:'🚀',message:'Bad project',projectId:randomUUID() },reader,400);
    const created = await post('community/comments',{ name:'Yerko Barrera',avatar:'🚀',category:'Diseño UX/UI',message:'<script>alert("xss")</script> Una referencia visual.',attachmentIds:[image.id] });
    commentId = created.id; assert.equal(created.submissionStatus,'APPROVED');
    const data = await read(); assert.equal(data.items[0].authorRole,'VISITOR'); assert.equal(data.items[0].category,'Diseño UX/UI'); assert.equal(data.items[0].attachments.length,1); assert.ok(data.items[0].message.startsWith('<script>'));
    assert.ok(!('visitorId' in data.items[0])); assert.equal((await fetch(`${base}/api/v1/community/media/${image.id}`)).status,200);
    await post('community/comments',{ name:'Visitor',avatar:'🚀',message:'Duplicate too fast' },author,429);
    await post('community/comments',{ name:'Visitor',avatar:'🚀',message:'Cannot steal attachment',attachmentIds:[image.id] },reader,400);
  });
  it('persists replies and prevents detached responses to hidden parents',async () => {
    const result = await post('community/comments',{ name:'Reader',avatar:'💻',message:'A reply',parentId:commentId },reader,400); void result;
    const reply = await post('community/comments',{ name:'Reader',avatar:'🤖',message:'A reply',parentId:commentId },reader);
    replyId = reply.id;
    const response = await fetch(`${base}/api/v1/community/comments/${commentId}/replies`,{ headers:signed(reader) }); const page = await response.json() as { items:{ id:string }[] }; assert.equal(page.items[0].id,replyId);
    assert.equal((await read()).items[0].replyCount,1);
  });
  it('deduplicates likes and reactions even for concurrent identical requests',async () => {
    await Promise.all(Array.from({ length:4 },() => post('community/likes',{ liked:true },reader)));
    assert.equal((await read()).likes,1);
    await Promise.all(Array.from({ length:4 },() => post('community/reactions',{ emoji:'❤️',commentId },reader)));
    assert.equal((await read()).items[0].reactions.find(r => r.emoji === '❤️')?.count,1);
    await post('community/reactions',{ emoji:'🔥',commentId },reader);
    const reactions = (await read()).items[0].reactions; assert.equal(reactions.find(r => r.emoji === '❤️')?.count,0); assert.equal(reactions.find(r => r.emoji === '🔥')?.count,1);
    await post('community/reactions',{ emoji:'🚀' },reader); assert.equal((await read()).myReaction,'🚀');
  });
  it('records reports once and limits all moderation operations to owner',async () => {
    await post('community/reports',{ commentId,reason:'spam' },reader);
    await post('community/reports',{ commentId,reason:'spam' },reader);
    assert.equal(await isolated.db.commentReport.count(),1);
    const denied = await fetch(`${base}/api/v1/community-admin`,{ method:'POST',headers:{ ...signed(reader),'Content-Type':'application/json' },body:JSON.stringify({ action:'hide',commentId }) }); assert.equal(denied.status,403);
    await moderate('pin'); assert.equal((await read()).items[0].pinned,true);
    await moderate('reply','Respuesta del propietario.');
    const response = await fetch(`${base}/api/v1/community/comments/${commentId}/replies`,{ headers:signed(reader) }); const replies = await response.json() as { items:{ authorRole:string }[] }; assert.ok(replies.items.some(item => item.authorRole === 'OWNER'));
    await moderate('resolve'); assert.equal(await isolated.db.commentReport.count({ where:{ status:'OPEN' } }),0);
    assert.ok(await isolated.db.moderationAction.count() >= 3);
  });
  it('hides and restores comments, descendants and media; blocks abusive participants',async () => {
    await moderate('hide'); assert.equal((await read()).items.length,0);
    assert.equal((await fetch(`${base}/api/v1/community/media/${image.id}`)).status,404);
    await moderate('approve'); await moderate('block'); assert.equal((await read()).items.length,0);
    await post('community/likes',{ liked:true },author,403);
    await moderate('unblock'); assert.equal((await read()).items.length,1);
    await moderate('delete'); assert.equal((await read()).items.length,0); await moderate('approve');
  });
  it('supports pending approval without exposing unpublished content',async () => {
    const pendingApp = await createApp({ COMMUNITY_REQUIRE_APPROVAL:'true' });
    try {
      const response = await fetch(`${await pendingApp.getUrl()}/api/v1/community/comments`,{ method:'POST',headers:{ ...signed(randomUUID()),'Content-Type':'application/json' },body:JSON.stringify({ name:'Waiting',avatar:'🚀',message:'Needs approval.' }) });
      assert.equal(response.status,201); const result = await response.json() as { id:string; submissionStatus:string }; assert.equal(result.submissionStatus,'PENDING');
      assert.ok(!(await read()).items.some(item => item.id === result.id));
    } finally { await pendingApp.close(); }
  });
  it('sorts, limits requests and persists data across API restart',async () => {
    for (const sort of ['recent','popular','oldest']) assert.equal((await read(reader,`?sort=${sort}`)).sort,sort);
    const before = await read(); await app.close(); app = await createApp(); base = await app.getUrl(); const after = await read(); assert.equal(after.comments,before.comments); assert.equal(after.likes,before.likes);
    const limited = await createApp({ API_RATE_LIMIT:'2' });
    try {
      const id = randomUUID(); const url = `${await limited.getUrl()}/api/v1/community/likes`;
      const send = () => fetch(url,{ method:'POST',headers:{ ...signed(id),'Content-Type':'application/json','X-Forwarded-For':randomUUID() },body:JSON.stringify({ liked:true }) });
      assert.equal((await send()).status,201); assert.equal((await send()).status,201); assert.equal((await send()).status,429);
    } finally { await limited.close(); }
  });
});
