export function CodingKeyboard() {
  return <div className="coding-signature" aria-hidden="true"><span className="coding-prompt">&gt;_</span><svg className="coding-keyboard" width="98" height="51" viewBox="0 0 112 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="24" width="94" height="31" rx="6" className="keyboard-base" />
    {[0,1,2].map(row => <g key={row}>{Array.from({length:10},(_,col)=><rect className={`keyboard-key key-beat-${(row+col)%3}`} key={col} x={15+col*8.3} y={29+row*6} width="4.5" height="2.3" rx=".6" />)}</g>)}
    <path d="M41 49h30" />
    <g className="typing-hand hand-left"><path d="M19 3l4 15c-1 2-3 4-2 7l3 9c1 3 4 5 7 5h8c3 0 5-2 5-5l-1-8-4-9c-1-2-4-1-3 1l2 7-1-10c0-3-4-3-4 0l1 10-3-12c-1-3-4-2-3 1l2 11-4-8-3-14" /><path d="M30 25l2 7m5-7 1 7" /></g>
    <g className="typing-hand hand-right"><path d="M93 3l-4 15c1 2 3 4 2 7l-3 9c-1 3-4 5-7 5h-8c-3 0-5-2-5-5l1-8 4-9c1-2 4-1 3 1l-2 7 1-10c0-3 4-3 4 0l-1 10 3-12c1-3 4-2 3 1l-2 11 4-8 3-14" /><path d="M82 25l-2 7m-5-7-1 7" /></g>
  </svg><span className="coding-signature-label">Ideas en código<span>Diseño. Desarrollo. Conecto.</span></span></div>;
}
