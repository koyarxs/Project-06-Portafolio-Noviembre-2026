export function DeveloperAvatarHead({ skin, hair }: { skin: string; hair: string }) {
  return <g className="studio-head"><path d="M220 86c-10-3-12 20-1 24m74-24c10-3 12 20 1 24" fill="#d99973" /><path d="M220 69c0-23 74-25 74 0v35c0 26-21 43-37 43s-37-17-37-43Z" fill={skin} />
        <path d="M220 103c-10-12-15-32-9-46-4-11 5-22 16-23 5-11 18-14 29-10 11-7 24-2 29 6 13-1 24 11 23 22 8 12 3 28-2 37l-11 14-2-30c-12 2-14-11-24-12-9 12-24 5-32 14-5-4-13-4-14 4Z" fill={hair} />
        <path d="M222 58c2-12 17-18 27-13m-13 17c6-14 24-21 36-12m-15 14c7-9 20-7 26-1m-12-24c14-2 24 6 25 17" stroke="#766052" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round" />
        <path d="M229 84q8-4 16 0m24 0q8-4 16 0" stroke="#47382f" strokeWidth="2" strokeLinecap="round" />
        <g className="studio-eyes"><ellipse cx="237" cy="99" rx="7" ry="4" fill="#fff7ed" /><ellipse cx="277" cy="99" rx="7" ry="4" fill="#fff7ed" /><g className="studio-pupils"><circle cx="237" cy="100" r="3" fill="#483a30" /><circle cx="277" cy="100" r="3" fill="#483a30" /><circle cx="238" cy="99" r=".9" fill="#fff" /><circle cx="278" cy="99" r=".9" fill="#fff" /></g></g>
        <path d="m257 105-2 10h4" stroke="#b77d5c" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        <path className="studio-mouth" d="M249 126Q257 132 265 126" fill="#60372e" stroke="#845140" strokeWidth="1.5" strokeLinecap="round" />
        <g fill="#d6eeff" fillOpacity=".1" stroke="#182638" strokeWidth="3"><rect x="222" y="88" width="29" height="20" rx="5.5" /><rect x="263" y="88" width="29" height="20" rx="5.5" /><path d="M251 94c4-3 8-3 12 0m-45-6 4 4m70 0 5-4" /></g><path className="studio-lens-light" d="m228 91 10 0m31 0h10" stroke="#e8f7ff" strokeWidth="2" strokeLinecap="round" />
      </g>;
}
