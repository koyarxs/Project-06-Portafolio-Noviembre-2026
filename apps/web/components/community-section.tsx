"use client";
import { useState } from 'react';
import type { Sort } from '../../../packages/community/src/contracts';
import { useCommunity } from '../lib/community-client';
import { CommunityComposer } from './community-composer';
import { CommunityThread } from './community-thread';
import { VeltrixLogo } from './veltrix-logo';
import { ReactionPicker } from './community-reactions';
import styles from './community-section.module.css';
export function CommunitySection() {
  const community = useCommunity(); const [shareNotice,setShareNotice] = useState('');
  async function share() {
    const url = new URL('/',window.location.href).href;
    try { if (navigator.share) { await navigator.share({ title:'Yerko Barrera · Portafolio',url }); setShareNotice('Gracias por compartir.'); } else { await navigator.clipboard.writeText(url); setShareNotice('Enlace copiado. Listo para compartir.'); } }
    catch(error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setShareNotice(`Puedes compartir este enlace: ${url}`); }
  }
  return <section id="comentarios" className={styles.section} aria-labelledby="community-title"><div className={styles.inner}>
    <header className={styles.heading}><div className={styles.communityMark} aria-label="YB Veltrix Solutions"><VeltrixLogo/></div><p className={styles.eyebrow}>COMUNIDAD / YB VELTRIX SOLUTIONS</p><h2 id="community-title">Lo que dicen <span>de mí.</span></h2><p className={styles.intro}>Un espacio para tus ideas, opiniones y sugerencias.</p><button type="button" onClick={() => { void share(); }} className={styles.share}>Compartir portafolio ↗</button></header>
    <p role="status" className={styles.shareNotice}>{shareNotice}</p>
    <div className={styles.layout}><div><CommunityComposer/><div className={styles.communityGuidelines}><span aria-hidden="true">↳</span><p><strong>Una conversación con respeto.</strong> Comparte ideas útiles, cuida los datos personales y reporta el contenido que no aporte. Los nombres de visitantes son elegidos por sus autores.</p></div></div>
      <div id="community-feed" className={styles.feed} aria-busy={community.loading}><div className={styles.feedHeading}><h3>Comentarios<span>{community.data?.comments ?? '—'}</span></h3><label><span className="sr-only">Ordenar comentarios</span><select value={community.sort} disabled={community.loading || community.saving} onChange={event => { void community.refresh(event.target.value as Sort,1); }}><option value="recent">Más recientes</option><option value="popular">Más populares</option><option value="oldest">Más antiguos</option></select></label></div>
      <div className={styles.feedReactions}><ReactionPicker counts={community.data?.reactions ?? []} selected={community.data?.myReaction ?? null} disabled={!community.data || community.saving} onReact={emoji => { void community.react(emoji); }}/></div>
      {community.loading && !community.data ? <div className={styles.skeleton} role="status" aria-label="Cargando comentarios">{[0,1,2].map(i => <div key={i}><i/><span/><span/></div>)}</div> : !community.data ? <div className={styles.empty}><span aria-hidden="true">↳</span><h4>La conversación sigue aquí.</h4><p>No pudimos conectar en este momento. Tu idea puede esperar; tu borrador se conserva.</p><button type="button" onClick={() => { void community.refresh(); }}>Volver a intentar</button></div> : community.data.items.length === 0 ? <div className={styles.empty}><span aria-hidden="true">✳</span><h4>El primer punto de vista puede ser tuyo.</h4><p>¿Algo que te gustó? ¿Una idea para mejorar?<br />Comparte lo que te gustaría ver aquí.</p></div> : <div className={styles.threads}>{community.data.items.map(item => <CommunityThread key={item.id} item={item} version={community.version}/>)}</div>}
      {community.data && community.data.pages > 1 && <nav className={styles.pagination} aria-label="Páginas de comentarios"><button type="button" disabled={community.page <= 1 || community.loading || community.saving} onClick={() => { void community.refresh(community.sort,community.page-1); }}>← Anterior</button><span>{community.page} / {community.data.pages}</span><button type="button" disabled={community.page >= community.data.pages || community.loading || community.saving} onClick={() => { void community.refresh(community.sort,community.page+1); }}>Siguiente →</button></nav>}
      </div></div>
  </div></section>;
}
