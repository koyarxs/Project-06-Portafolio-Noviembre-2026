"use client";
import { useState } from 'react';
import { reactionEmojis,type Emoji,type ReactionSummary } from '../../../packages/community/src/contracts';
import styles from './community-section.module.css';
export function ReactionPicker({ counts,selected,onReact,disabled=false,compact=false }:{ counts:ReactionSummary[]; selected:Emoji | null; onReact:(emoji:Emoji | null) => void; disabled?:boolean; compact?:boolean }) {
  const [open,setOpen] = useState(false);
  return <div className={styles.reactionControl} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
    <button type="button" className={styles.reactionTrigger} aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)}>{selected ?? '☺'}<span>{compact ? 'Reaccionar' : 'Tu reacción'}</span><small>⌄</small></button>
    {open && <div className={styles.emojiPopover} role="group" aria-label="Elige una reacción">{reactionEmojis.map(emoji => <button key={emoji} type="button" aria-label={`Reaccionar ${emoji}`} aria-pressed={selected === emoji} disabled={disabled} onClick={() => { onReact(selected === emoji ? null:emoji); setOpen(false); }}>{emoji}</button>)}</div>}
    <div className={styles.reactionCounts}>{counts.filter(r => r.count > 0).map(r => <button type="button" key={r.emoji} aria-label={`${r.emoji}: ${r.count} reacciones`} aria-pressed={selected === r.emoji} disabled={disabled} onClick={() => onReact(selected === r.emoji ? null:r.emoji)}><span>{r.emoji}</span><span key={r.count} className={styles.countChange}>{r.count}</span></button>)}</div>
  </div>;
}
