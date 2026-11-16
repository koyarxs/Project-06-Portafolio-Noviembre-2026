export type NavIconName = 'home' | 'stack' | 'services' | 'person' | 'career' | 'chat' | 'arrow' | 'chevron';

const paths: Record<NavIconName, string> = {
  home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  stack: 'm3 7 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 17l9 5 9-5',
  services: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  person: 'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-4a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v4H4Z',
  career: 'm3 19 6-7 5 3 7-11M15 4h6v6',
  chat: 'M21 11a9 9 0 0 1-9 9 12 12 0 0 1-4-.7L3 21l1.7-5A9 9 0 1 1 21 11ZM8 11h.01M12 11h.01M16 11h.01',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  chevron: 'm6 9 6 6 6-6',
};
export function NavIcon({ name }: { name: NavIconName }) {
  return <svg className={`nav-icon nav-icon-${name}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
