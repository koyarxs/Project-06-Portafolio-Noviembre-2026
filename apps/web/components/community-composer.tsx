"use client";
import Image from 'next/image';
import { useEffect,useRef,useState,type FormEvent } from 'react';
import { avatars,categories,isAttachment,type Attachment } from '../../../packages/community/src/contracts';
import { useCommunity } from '../lib/community-client';
import styles from './community-section.module.css';
type DraftImage = { key:string; preview:string; attachment?:Attachment; loading:boolean; error?:string };
const emojis = ['😊','🙌','✨','💙','🔥','🚀','👏','💡','🎯','🤝','💻','🎨'];
export function CommunityComposer({ parentId,onDone,onCancel }:{ parentId?:string; onDone?:() => void; onCancel?:() => void }) {
  const community = useCommunity();
  const [name,setName] = useState(''),[avatar,setAvatar] = useState<string>(avatars[0]),[category,setCategory] = useState(''),[message,setMessage] = useState(''),[website,setWebsite] = useState(''),[picker,setPicker] = useState(false),[showAvatars,setShowAvatars] = useState(!parentId),[dragging,setDragging] = useState(false),[notice,setNotice] = useState(''),[publishing,setPublishing] = useState(false),[images,setImages] = useState<DraftImage[]>([]);
  const textarea = useRef<HTMLTextAreaElement>(null),input = useRef<HTMLInputElement>(null),files = useRef<DraftImage[]>([]);
  const update = (fn:(items:DraftImage[]) => DraftImage[]) => { const next = fn(files.current); files.current = next; setImages(next); };
  useEffect(() => () => { files.current.forEach(file => URL.revokeObjectURL(file.preview)); },[]);
  useEffect(() => { const element = textarea.current; if (element) { element.style.height='auto'; element.style.height=`${Math.min(260,Math.max(parentId ? 80:115,element.scrollHeight))}px`; } },[message,parentId]);
  async function addFiles(incoming:File[]) {
    const available = 3-files.current.length;
    if (incoming.length > available) setNotice('Puedes adjuntar hasta tres imágenes por comentario.');
    for (const file of incoming.slice(0,available)) {
      if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 5*1024*1024) { setNotice('Elige imágenes PNG, JPEG o WebP de hasta 5 MB.'); continue; }
      const entry:DraftImage = { key:crypto.randomUUID(),preview:URL.createObjectURL(file),loading:true };
      update(items => [...items,entry]);
      const form = new FormData(); form.set('image',file);
      void (async () => {
        try {
          const response = await fetch('/api/community/uploads',{ method:'POST',body:form,signal:AbortSignal.timeout(20000) });
          const data:unknown = await response.json();
          if (!response.ok || !isAttachment(data)) throw new Error(data && typeof data === 'object' && 'error' in data ? String(data.error) : 'No se pudo validar esta imagen.');
          if (!files.current.some(item => item.key === entry.key)) { void fetch(`/api/community/uploads?id=${data.id}`,{ method:'DELETE' }); return; }
          update(items => items.map(item => item.key === entry.key ? { ...item,attachment:data,loading:false }:item));
        } catch(error) { update(items => items.map(item => item.key === entry.key ? { ...item,loading:false,error:error instanceof Error ? error.message:'Error al cargar.' }:item)); }
      })();
    }
  }
  function remove(key:string) {
    const item = files.current.find(file => file.key === key); if (!item) return;
    URL.revokeObjectURL(item.preview); update(items => items.filter(file => file.key !== key));
    if (item.attachment) void fetch(`/api/community/uploads?id=${item.attachment.id}`,{ method:'DELETE' });
  }
  async function send(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(''); setPublishing(true);
    const result = await community.comment({ name:name.trim(),avatar,category:category || undefined,message:message.trim(),parentId,attachmentIds:images.flatMap(file => file.attachment ? [file.attachment.id]:[]),website });
    setPublishing(false);
    if (result) { setMessage(''); files.current.forEach(file => URL.revokeObjectURL(file.preview)); update(() => []); setNotice(result.submissionStatus === 'PENDING' ? 'Recibido. Tu comentario aparecerá después de la revisión.' : 'Tu comentario ya está publicado. Gracias por aportar.'); onDone?.(); }
  }
  function insertEmoji(emoji:string) {
    const start = textarea.current?.selectionStart ?? message.length,end = textarea.current?.selectionEnd ?? start;
    if (message.length+emoji.length-(end-start) > 2000) return;
    setMessage(message.slice(0,start)+emoji+message.slice(end)); setPicker(false);
    requestAnimationFrame(() => { textarea.current?.focus(); textarea.current?.setSelectionRange(start+emoji.length,start+emoji.length); });
  }
  const canPublish = !!community.data && !community.loading && !community.saving && name.trim().length >= 2 && message.trim().length > 0 && images.every(file => !!file.attachment && !file.loading && !file.error);
  return <form id={parentId ? undefined:'community-editor'} className={`${styles.composer} ${parentId ? styles.replyComposer:''} ${dragging ? styles.dragging:''}`} onSubmit={send} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); void addFiles(Array.from(event.dataTransfer.files)); }} aria-busy={community.saving}>
    <div className={styles.composerTop}><button className={styles.avatarButton} type="button" disabled={community.saving} onClick={() => setShowAvatars(!showAvatars)} aria-expanded={showAvatars} aria-label="Elegir avatar">{avatar}<small>⌄</small></button><div><h3>{parentId ? 'Tu respuesta':'Deja tu comentario'}</h3><p>Una idea, una opinión o algo que podríamos mejorar.</p></div><span className={styles.visitorBadge}>Visitante</span></div>
    {showAvatars && <div className={styles.avatarOptions} role="group" aria-label="Avatares disponibles">{avatars.map(item => <button type="button" key={item} aria-label={`Avatar ${item}`} aria-pressed={avatar === item} onClick={() => { setAvatar(item); setShowAvatars(false); }}>{item}</button>)}</div>}
    <div className={styles.identityFields}><label>Nombre público<input disabled={community.saving} value={name} onChange={event => setName(event.target.value)} autoComplete="nickname" minLength={2} maxLength={60} placeholder="¿Cómo te llamas?" required /></label>{!parentId && <label>Categoría <span>opcional</span><select disabled={community.saving} value={category} onChange={event => setCategory(event.target.value)}><option value="">Sin categoría</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>}</div>
    <label className={styles.textLabel}><span className="sr-only">{parentId ? 'Tu respuesta':'Tu comentario'}</span><textarea ref={textarea} disabled={community.saving} value={message} onChange={event => setMessage(event.target.value)} maxLength={2000} minLength={1} required placeholder={parentId ? 'Escribe una respuesta…':'¿Qué te pareció el portafolio? Comparte tu punto de vista…'} onPaste={event => { const pasted = Array.from(event.clipboardData.items).filter(item => item.kind === 'file').map(item => item.getAsFile()).filter((file):file is File => !!file); if (pasted.length) { event.preventDefault(); void addFiles(pasted); } }} /></label>
    {images.length > 0 && <ul className={styles.draftImages}>{images.map(file => <li key={file.key}><Image src={file.preview} width={120} height={90} alt="Vista previa del adjunto" unoptimized /><button type="button" disabled={community.saving} onClick={() => remove(file.key)} aria-label="Quitar imagen adjunta">×</button>{file.loading && <span>Validando…</span>}{file.error && <p role="alert">{file.error}</p>}</li>)}</ul>}
    {dragging && <div className={styles.dropHint}>Suelta tus imágenes aquí · hasta 3 archivos</div>}
    <div className={styles.editorTools}><div className={styles.toolGroup}><button type="button" onClick={() => input.current?.click()} disabled={images.length >= 3 || !community.data || community.saving} aria-label="Adjuntar imágenes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/></svg><span>Imagen</span></button><div className={styles.emojiTool}><button type="button" disabled={community.saving} aria-label="Insertar emoji" aria-expanded={picker} onClick={() => setPicker(!picker)}>☺</button>{picker && <div className={styles.emojiPopover} role="group" aria-label="Emojis del comentario">{emojis.map(emoji => <button key={emoji} type="button" aria-label={`Insertar ${emoji}`} onClick={() => insertEmoji(emoji)}>{emoji}</button>)}</div>}</div></div><span className={styles.charCount}>{message.length}<span> / 2000</span></span></div>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={event => { void addFiles(Array.from(event.target.files ?? [])); event.target.value=''; }} />
    <label className={styles.trap} aria-hidden="true">Sitio web<input tabIndex={-1} value={website} autoComplete="off" onChange={event => setWebsite(event.target.value)} /></label>
    <div className={styles.publishRow}><p>PNG, JPEG o WebP · 5 MB por imagen.<br />También puedes pegar o arrastrar capturas.</p><div>{onCancel && <button type="button" className={styles.cancel} onClick={onCancel}>Cancelar</button>}<button className={styles.publish} type="submit" disabled={!canPublish}>{publishing ? 'Publicando…':parentId ? 'Responder':'Publicar'}<span aria-hidden="true">↗</span></button></div></div>
    <p className={styles.publicNotice}>Tu nombre y contenido serán públicos. No compartas información personal ni imágenes ajenas sin permiso.</p><p role="status" className={styles.feedback}>{notice || community.error}</p>
  </form>;
}
