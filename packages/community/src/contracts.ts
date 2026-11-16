export const avatars = ['🧑‍💻','🚀','🤖','🦊','🐱','🐼','👾','⚡','🎨','🌱','🛰️','😎'] as const;
export const reactionEmojis = ['❤️','🔥','🚀','👏','💡'] as const;
export const categories = ['Opinión general','Sugerencia de mejora','Diseño UX/UI','Reporte de error','Nueva funcionalidad'] as const;
export const topics = categories;
export const sorts = ['recent','popular','oldest'] as const;
export const reportReasons = ['spam','abuse','privacy','other'] as const;
export type Emoji = typeof reactionEmojis[number];
export type Sort = typeof sorts[number];
export type Attachment = { id:string; url:string; width:number; height:number };
export type ReactionSummary = { emoji:Emoji; count:number };
export type CommunityComment = { id:string; name:string; avatar:string; category:string | null; message:string; createdAt:string; authorRole:'VISITOR'|'OWNER'; pinned:boolean; replyCount:number; reactions:ReactionSummary[]; myReaction:Emoji | null; attachments:Attachment[] };
export type CommentPage = { items:CommunityComment[]; page:number; pages:number };
export type CommunityData = CommentPage & { likes:number; comments:number; liked:boolean; reactions:ReactionSummary[]; myReaction:Emoji | null; sort:Sort; submissionStatus?:'APPROVED'|'PENDING' };
export const wordCount = (value:string) => value.trim() ? value.trim().split(/\s+/u).length : 0;
const object = (v:unknown): v is Record<string,unknown> => !!v && typeof v === 'object';
const count = (v:unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;
function isReactions(v:unknown): v is ReactionSummary[] { return Array.isArray(v) && v.length <= 5 && v.every(r => object(r) && reactionEmojis.includes(r.emoji as Emoji) && count(r.count)); }
export function isAttachment(v:unknown): v is Attachment { return object(v) && typeof v.id === 'string' && typeof v.url === 'string' && /^\/api\/community\/media\/[0-9a-f-]{36}$/.test(v.url) && count(v.width) && v.width > 0 && count(v.height) && v.height > 0; }
export function isComment(v:unknown): v is CommunityComment {
  return object(v) && ['id','name','avatar','message','createdAt'].every(k => typeof v[k] === 'string') && !Number.isNaN(Date.parse(v.createdAt as string)) && (v.category === null || typeof v.category === 'string') && ['VISITOR','OWNER'].includes(v.authorRole as string) && typeof v.pinned === 'boolean' && count(v.replyCount) && isReactions(v.reactions) && (v.myReaction === null || reactionEmojis.includes(v.myReaction as Emoji)) && Array.isArray(v.attachments) && v.attachments.length <= 3 && v.attachments.every(isAttachment);
}
export function isCommentPage(v:unknown): v is CommentPage { return object(v) && count(v.page) && v.page > 0 && count(v.pages) && v.pages > 0 && Array.isArray(v.items) && v.items.length <= 12 && v.items.every(isComment); }
export function isCommunityData(v:unknown): v is CommunityData { return object(v) && count(v.likes) && count(v.comments) && typeof v.liked === 'boolean' && isReactions(v.reactions) && (v.myReaction === null || reactionEmojis.includes(v.myReaction as Emoji)) && sorts.includes(v.sort as Sort) && isCommentPage(v); }
