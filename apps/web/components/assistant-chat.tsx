'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from 'react';
import { replyTo, type AssistantKnowledge, type AssistantReply } from '../lib/assistant-replies';
import { localModelAvailable, recognizeQuestion } from '../lib/assistant-local-model';
import styles from './assistant-chat.module.css';

const suggested = [
  { label: 'Historia de Yerko', question: '¿Cuál es la historia profesional de Yerko?', icon: 'M4 5h16v14H4zM8 9h8m-8 4h6' },
  { label: 'Estudios y título', question: '¿Qué estudió Yerko y dónde?', icon: 'M2 9l10-5 10 5-10 5zm4 2v5c4 4 8 4 12 0v-5' },
  { label: 'Proyectos completados', question: '¿Qué proyectos están completados?', icon: 'M4 12l5 5L20 6' },
  { label: 'Proyectos con Docker', question: '¿Dónde usaste Docker?', icon: 'M12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5m-9 5v8' },
  { label: 'Demos en video', question: '¿Qué demos tienen video?', icon: 'M4 5h16v14H4zM10 9l5 3-5 3z' },
  { label: 'Descargar CV', question: '¿Cómo descargo el CV?', icon: 'M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4' },
];
const greeting = 'Conoce la historia de Yerko, sus proyectos y los servicios de Veltrix. Puedes escribir una pregunta o elegir un tema.';
const avatar = '/images/veltrix-chat-avatar.webp';
const emojis = ['😊', '👋', '👍', '💻', '🚀', '💡', '🐾', '🙌'];
const imageFormats = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
type Attachment = { url: string; name: string };
type Message = { question: string; attachment?: Attachment };
type Exchange = Message & { reply: AssistantReply };

function MessageBubble({ question, attachment }: Message) {
  return <div className={styles.question}>
    {attachment && <Image src={attachment.url} alt={`Imagen adjunta: ${attachment.name}`}
      width={240} height={160} unoptimized />}
    {question && <p>{question}</p>}
  </div>;
}

function ReplyBubble({ reply, onNavigate, thread }: {
  reply: AssistantReply; onNavigate: () => void; thread: RefObject<HTMLDivElement | null>;
}) {
  const [position, setPosition] = useState(0);
  const complete = position >= reply.text.length;

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) {
      setPosition(reply.text.length);
      return;
    }
    const step = Math.max(2, Math.ceil(reply.text.length / 90));
    let written = 0;
    const timer = window.setInterval(() => {
      const scroll = thread.current;
      const follow = scroll && scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 40;
      written = Math.min(written + step, reply.text.length);
      setPosition(written);
      if (follow) requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; });
      if (written === reply.text.length) window.clearInterval(timer);
    }, 34);
    return () => window.clearInterval(timer);
  }, [reply.text, thread]);

  return <div className={styles.reply}>
    {complete ? <p>{reply.text}</p> : <p aria-hidden="true">{reply.text.slice(0, position)}<span className={styles.caret} /></p>}
    {complete && !!reply.links?.length && <ul>{reply.links.map(({ label, href }) => <li key={href}>
      {href.startsWith('https://') ?
        <a href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a> :
        <Link href={href} onClick={onNavigate}>{label} →</Link>}
    </li>)}</ul>}
  </div>;
}

function playWelcomeChime() {
  if (!window.AudioContext) return;
  try {
    const audio = new AudioContext();
    const start = audio.currentTime + .015;
    [659.25, 987.77].forEach((frequency, index) => {
      const note = audio.createOscillator();
      const volume = audio.createGain();
      const time = start + index * .11;
      note.type = 'sine';
      note.frequency.value = frequency;
      volume.gain.setValueAtTime(.0001, time);
      volume.gain.exponentialRampToValueAtTime(.045, time + .025);
      volume.gain.exponentialRampToValueAtTime(.0001, time + .27);
      note.connect(volume).connect(audio.destination);
      note.start(time);
      note.stop(time + .28);
      if (index === 1) note.onended = () => { void audio.close().catch(() => {}); };
    });
    void audio.resume().catch(() => { void audio.close().catch(() => {}); });
  } catch {
    // Audio availability never prevents opening the assistant.
  }
}

export function AssistantChat({ liveChatUrl, ...knowledge }: AssistantKnowledge & { liveChatUrl?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const directory = useRef<HTMLDetailsElement>(null);
  const objectUrls = useRef(new Set<string>());
  const [draft, setDraft] = useState('');
  const [history, setHistory] = useState<Exchange[]>([]);
  const [pending, setPending] = useState<Message>();
  const [attachment, setAttachment] = useState<Attachment>();
  const [fileError, setFileError] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [localAI, setLocalAI] = useState(false);
  const [muted, setMuted] = useState(false);
  const welcomed = useRef(false);
  const previousProject = useRef<string | undefined>(undefined);
  const topicsByGroup = new Map<string, string[]>();
  for (const { group, question } of knowledge.topics) {
    const questions = topicsByGroup.get(group) ?? [];
    questions.push(question);
    topicsByGroup.set(group, questions);
  }
  topicsByGroup.set('Proyectos y portafolio', [
    ...suggested.slice(2).map(item => item.question),
    ...knowledge.projects.map(project => `¿Qué hace ${project.name}?`),
  ]);
  topicsByGroup.set('Preguntas frecuentes', knowledge.faqs.map(faq => faq.question));

  useEffect(() => {
    if (thread.current) thread.current.scrollTop = thread.current.scrollHeight;
  }, [history, pending]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    try { setMuted(window.localStorage.getItem('veltrix-chat-muted') === 'true'); } catch { /* Storage may be unavailable. */ }
  }, []);

  function removeAttachment() {
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
      objectUrls.current.delete(attachment.url);
    }
    setAttachment(undefined);
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!imageFormats.includes(file.type) || file.size > 8 * 1024 * 1024) {
      setFileError('Elige una imagen PNG, JPEG, WebP, GIF o AVIF de hasta 8 MB.');
      return;
    }
    removeAttachment();
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    setAttachment({ url, name: file.name });
    setFileError('');
  }

  async function ask(question: string) {
    const text = question.trim();
    if ((!text && !attachment) || pending) return;
    const message = { question: text, attachment };
    setPending(message);
    setAttachment(undefined);
    setEmojiOpen(false);
    setFileError('');
    if (directory.current) directory.current.open = false;
    input.current?.focus({ preventScroll: true });
    const pause = new Promise(resolve => window.setTimeout(resolve, 650));
    let next = replyTo(text, knowledge, previousProject.current);
    setDraft('');
    if (text && next.unmatched && localAI) {
      const recognized = await recognizeQuestion(text, knowledge);
      if (recognized) next = replyTo(recognized, knowledge, previousProject.current);
    }
    await pause;
    const reply = message.attachment
      ? text ? { ...next.reply, text: `${next.reply.text}\n\nLa imagen queda adjunta en este chat. Si quieres que te oriente sobre algo que aparece ahí, descríbelo en tu mensaje.` }
        : { text: 'La imagen quedó adjunta en el chat. Cuéntame qué proyecto aparece o qué quieres saber de ella para poder orientarte.' }
      : next.reply;
    if (text) previousProject.current = next.project;
    setHistory(exchanges => [...exchanges, { ...message, reply }]);
    setPending(undefined);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(draft);
  }

  return <>
    <button className={styles.launcher} ref={launcher} type="button" aria-label="Abrir asistente" aria-haspopup="dialog"
      onClick={() => {
        if (dialog.current?.open) { dialog.current.close(); return; }
        dialog.current?.show();
        if (!welcomed.current && !muted) playWelcomeChime();
        welcomed.current = true;
        input.current?.focus({ preventScroll: true });
        void localModelAvailable().then(setLocalAI);
      }}>
      <Image src={avatar} alt="" width={56} height={56} unoptimized />
    </button>
    <dialog className={styles.dialog} ref={dialog} aria-labelledby="assistant-title" onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); dialog.current?.close(); }
    }}
      onClose={() => launcher.current?.focus({ preventScroll: true })}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <Image className={styles.mark} src={avatar} alt="YB Veltrix Solutions" width={54} height={54} unoptimized />
          <div><h2 id="assistant-title">Asistente Veltrix</h2>
            <p className={styles.availability}><span aria-hidden="true" />{localAI ? 'Disponible · IA local' : 'Disponible · Asistente automático'}</p>
          </div>
          <button type="button" className={styles.sound} aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'} onClick={() => {
            const next = !muted;
            setMuted(next);
            try { window.localStorage.setItem('veltrix-chat-muted', String(next)); } catch { /* Keep the preference for this visit. */ }
            if (!next) playWelcomeChime();
          }}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              {muted && <path d="M3 3l18 18" />}
            </svg>
          </button>
          <button type="button" className={styles.close} aria-label="Cerrar asistente"
            onClick={() => dialog.current?.close()}>×</button>
        </header>
        <Link className={styles.liveChat} href={liveChatUrl ?? '/contacto'}
          target={liveChatUrl ? '_blank' : undefined} rel={liveChatUrl ? 'noopener noreferrer' : undefined}
          onClick={() => { if (!liveChatUrl) dialog.current?.close(); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11a8 8 0 0 1 16 0v5a4 4 0 0 1-4 4h-3M4 11H3v6h4v-6H4Zm16 0h1v6h-4v-6h3Z" /></svg>
          <span><strong>{liveChatUrl ? 'Conversar con Yerko' : 'Contactar a Yerko'}</strong>
            <small>{liveChatUrl ? 'Chat humano en tawk.to' : 'Canales profesionales'}</small></span>
          <span aria-hidden="true">{liveChatUrl ? '↗' : '→'}</span>
        </Link>
        <details className={styles.directory} ref={directory}>
          <summary>Explorar preguntas</summary>
          <div className={styles.topicList}>
            {[...topicsByGroup].map(([group, questions]) => <details className={styles.topicGroup} key={group}>
              <summary>{group}</summary>
              <ul>{questions.map(question => <li key={question}>
                <button type="button" disabled={Boolean(pending)} onClick={() => void ask(question)}>{question}</button>
              </li>)}</ul>
            </details>)}
          </div>
        </details>
        <div className={styles.thread} ref={thread} role="log" aria-label="Conversación" aria-relevant="additions">
          <div className={styles.welcome}>
            <h3>¿En qué te puedo ayudar?</h3>
            <p>{greeting}</p>
          </div>
          {history.length === 0 && !pending && <div className={styles.suggestions} role="group" aria-label="Preguntas sugeridas">
            {suggested.map(({ label, question, icon }) => <button key={question} type="button" onClick={() => void ask(question)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg>
              {label}<span aria-hidden="true">↗</span>
            </button>)}
          </div>}
          {history.map(({ question, attachment, reply }, index) => <div className={styles.exchange} key={index}>
            <MessageBubble question={question} attachment={attachment} />
            <ReplyBubble reply={reply} thread={thread} onNavigate={() => dialog.current?.close()} />
          </div>)}
          {pending && <div className={styles.exchange}>
            <MessageBubble {...pending} />
            <div className={styles.typing} role="status"><span aria-hidden="true"><i /><i /><i /></span> Escribiendo…</div>
          </div>}
        </div>
        <form className={styles.form} onSubmit={submit}>
          {attachment && <div className={styles.attachment}>
            <Image src={attachment.url} alt="" width={34} height={34} unoptimized />
            <span>{attachment.name}</span>
            <button type="button" aria-label="Quitar imagen" onClick={removeAttachment}>×</button>
          </div>}
          {fileError && <p className={styles.fileError} role="status">{fileError}</p>}
          {emojiOpen && <div className={styles.emojis} role="group" aria-label="Emoticones">
            {emojis.map(emoji => <button key={emoji} type="button" onClick={() => {
              setDraft(value => `${value}${emoji}`.slice(0, 280));
              setEmojiOpen(false);
              input.current?.focus();
            }}>{emoji}</button>)}
          </div>}
          <div className={styles.composer}>
          <input ref={fileInput} type="file" accept={imageFormats.join(',')} hidden onChange={selectImage} />
          <button type="button" className={styles.tool} aria-label="Adjuntar imagen" onClick={() => fileInput.current?.click()}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 13 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l8-8m-3 9a1.3 1.3 0 0 0 2 2l6-6" /></svg>
          </button>
          <button type="button" className={styles.tool} aria-label="Añadir emoticón" aria-expanded={emojiOpen}
            onClick={() => setEmojiOpen(value => !value)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 14q4 5 8 0M9 9h.01M15 9h.01" /></svg>
          </button>
          <input ref={input} value={draft} onChange={event => setDraft(event.target.value)}
            aria-label="Tu pregunta" placeholder="Escribe tu pregunta…" maxLength={280} />
          <button className={styles.send} type="submit" disabled={Boolean(pending) || (!draft.trim() && !attachment)}
            aria-label="Enviar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4m-6 6 6-6 6 6" /></svg></button>
          </div>
        </form>
        <footer className={styles.footer}>Las consultas y las imágenes se quedan en este navegador.</footer>
      </div>
    </dialog>
  </>;
}
