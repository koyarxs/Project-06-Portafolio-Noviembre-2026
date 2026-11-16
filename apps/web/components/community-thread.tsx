"use client";
import Image from 'next/image';
import { useEffect,useRef,useState } from 'react';
import { isCommentPage,type Attachment,type CommentPage,type CommunityComment } from '../../../packages/community/src/contracts';
import { useCommunity } from '../lib/community-client';
import { CommunityComposer } from './community-composer';
import { ReactionPicker } from './community-reactions';
import styles from './community-section.module.css';
function Images({ items }:{ items:Attachment[] }) {
  const dialog = useRef<HTMLDialogElement>(null); const [index,setIndex] = useState(0);
  if (!items.length) return null;
  return <><div className={styles.commentImages}>{items.map((item,i) => <button key={item.id} type="button" onClick={() => { setIndex(i); dialog.current?.showModal(); }} aria-label={`Ampliar imagen ${i+1}`}><Image src={item.url} width={item.width} height={item.height} alt={`Imagen adjunta ${i+1}`} unoptimized /></button>)}</div><dialog ref={dialog} className={styles.viewer} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} aria-label="Visor de imágenes adjuntas"><div><button type="button" className={styles.viewerClose} onClick={() => dialog.current?.close()} aria-label="Cerrar visor">×</button><Image src={items[index].url} width={items[index].width} height={items[index].height} alt={`Imagen adjunta ampliada ${index+1}`} unoptimized /><footer><button type="button" disabled={index === 0} onClick={() => setIndex(index-1)}>← Anterior</button><span>{index+1} / {items.length}</span><button type="button" disabled={index === items.length-1} onClick={() => setIndex(index+1)}>Siguiente →</button></footer></div></dialog></>;
}
export function CommunityThread({ item,version,isReply=false }:{ item:CommunityComment; version:number; isReply?:boolean }) {
  const community = useCommunity();
  const [replying,setReplying] = useState(false),[reporting,setReporting] = useState(false),[expanded,setExpanded] = useState(false),[replies,setReplies] = useState<CommentPage | null>(null),[replyPage,setReplyPage] = useState(1),[replyLoading,setReplyLoading] = useState(false),[replyError,setReplyError] = useState(''),[reason,setReason] = useState('spam'),[detail,setDetail] = useState(''),[reportNotice,setReportNotice] = useState('');
  useEffect(() => {
    if (!expanded || isReply) return;
    let live = true; const controller = new AbortController(); setReplyLoading(true);
    void fetch(`/api/community?replies=${item.id}&page=${replyPage}`,{ signal:controller.signal,cache:'no-store' }).then(async response => { const data:unknown = await response.json(); if (!response.ok || !isCommentPage(data)) throw new Error(); if (live) { setReplies(data); setReplyError(''); } }).catch(() => { if (live) setReplyError('No pudimos cargar las respuestas.'); }).finally(() => { if (live) setReplyLoading(false); });
    return () => { live=false; controller.abort(); };
  },[expanded,isReply,item.id,replyPage,version]);
  return <article className={`${styles.comment} ${isReply ? styles.reply:''}`} id={`comentario-${item.id}`}>
    <span className={styles.commentAvatar} aria-hidden="true">{item.avatar}</span><div className={styles.commentBody}>
      <header><strong>{item.name}</strong>{item.authorRole === 'OWNER' ? <span className={styles.ownerBadge}>✓ Autor</span>:<span className={styles.commentVisitor}>Visitante</span>}<time dateTime={item.createdAt}>{new Intl.DateTimeFormat('es-CL',{ day:'numeric',month:'short',year:'numeric',timeZone:'America/Santiago' }).format(new Date(item.createdAt))}</time></header>
      {(item.pinned || item.category) && <div className={styles.commentTags}>{item.pinned && <span>↗ Destacado</span>}{item.category && <span>{item.category}</span>}</div>}
      <p className={styles.commentText}>{item.message}</p><Images items={item.attachments}/>
      <div className={styles.commentActions}><ReactionPicker counts={item.reactions} selected={item.myReaction} compact disabled={community.saving || !community.data} onReact={emoji => { void community.react(emoji,item.id); }} /><button type="button" onClick={() => setReplying(!replying)} aria-expanded={replying}>Responder</button><button type="button" className={styles.reportButton} onClick={() => setReporting(!reporting)} aria-expanded={reporting}>Reportar</button></div>
      {reporting && <form className={styles.reportForm} onSubmit={event => { event.preventDefault(); void community.report({ commentId:item.id,reason,detail }).then(result => { if (result) { setReporting(false); setReportNotice('Reporte recibido. Gracias por cuidar este espacio.'); } }); }}><h4>¿Qué ocurre con este comentario?</h4><label>Motivo<select value={reason} onChange={event => setReason(event.target.value)}><option value="spam">Spam o publicidad</option><option value="abuse">Contenido ofensivo</option><option value="privacy">Datos personales</option><option value="other">Otro motivo</option></select></label><label>Detalle opcional<textarea maxLength={500} value={detail} onChange={event => setDetail(event.target.value)} rows={2}/></label><div><button type="button" onClick={() => setReporting(false)}>Cancelar</button><button type="submit" disabled={community.saving}>Enviar reporte</button></div></form>}
      {reportNotice && <p role="status" className={styles.feedback}>{reportNotice}</p>}
      {replying && <CommunityComposer parentId={item.id} onCancel={() => setReplying(false)} onDone={() => { setReplying(false); setExpanded(true); }} />}
      {!isReply && item.replyCount > 0 && <button type="button" className={styles.showReplies} onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Ocultar respuestas':`Ver ${item.replyCount} ${item.replyCount === 1 ? 'respuesta':'respuestas'}`} <span aria-hidden="true">⌄</span></button>}
      {expanded && !isReply && <div className={styles.replyList}>{replyLoading && !replies && <p className={styles.muted}>Cargando respuestas…</p>}{replyError && <p role="status">{replyError}</p>}{replies?.items.map(reply => <CommunityThread key={reply.id} item={reply} version={version} isReply />)}{replies && replies.pages > 1 && <div className={styles.pagination}><button type="button" disabled={replyPage <= 1 || replyLoading} onClick={() => setReplyPage(replyPage-1)}>←</button><span>{replies.page} / {replies.pages}</span><button type="button" disabled={replyPage >= replies.pages || replyLoading} onClick={() => setReplyPage(replyPage+1)}>→</button></div>}</div>}
    </div>
  </article>;
}
