import type { Experience } from '../lib/contracts';
import { dateLabel } from '../lib/presentation';
export function Timeline({ items }: { items: Experience[] }) {
  return <div>{items.map((item, index) => <article className="timeline-item" key={`${item.organization}-${item.position}-${index}`}><p className="timeline-date">{dateLabel(item.startedAt)} — {item.isCurrent ? 'Actualidad' : dateLabel(item.endedAt) || 'Sin fecha de término'}</p><div><h3>{item.position}</h3><p className="organization">{item.organization}{item.location ? ` · ${item.location}` : ''}</p>{item.description && <p className="prose-text">{item.description}</p>}</div></article>)}</div>;
}
