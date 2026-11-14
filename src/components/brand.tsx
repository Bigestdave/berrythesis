export function BerryMark({ className = "" }: { className?: string }) {
  return <svg className={className} width="31" height="35" viewBox="0 0 32 36" fill="none" aria-hidden="true">
    <path d="M16 8C15 3 19 1 23 2C23 6 20 9 16 8Z" fill="#45d483"/>
    <circle cx="10.4" cy="12.8" r="5.2" fill="#f2416b"/>
    <circle cx="21.6" cy="12.8" r="5.2" fill="#f2416b"/>
    <circle cx="5.6" cy="22.2" r="5.2" fill="#f2416b"/>
    <circle cx="16" cy="22.2" r="5.2" fill="#ff7a9c"/>
    <circle cx="26.4" cy="22.2" r="5.2" fill="#d83660"/>
    <circle cx="10.8" cy="31" r="4.8" fill="#d83660"/>
    <circle cx="21" cy="31" r="4.8" fill="#f2416b"/>
  </svg>;
}

export function NearMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor" aria-label="NEAR Protocol">
    <path d="M21.443 0c-.89 0-1.714.46-2.18 1.218l-5.017 7.448a.533.533 0 0 0 .792.7l4.938-4.282a.2.2 0 0 1 .334.151v13.41a.2.2 0 0 1-.354.128L5.03.905A2.555 2.555 0 0 0 3.078 0h-.521A2.557 2.557 0 0 0 0 2.557v18.886a2.557 2.557 0 0 0 4.736 1.338l5.017-7.448a.533.533 0 0 0-.792-.7l-4.938 4.283a.2.2 0 0 1-.333-.152V5.352a.2.2 0 0 1 .354-.128l14.924 17.87c.486.574 1.2.905 1.952.906h.521A2.558 2.558 0 0 0 24 21.445V2.557A2.558 2.558 0 0 0 21.443 0Z"/>
  </svg>;
}

export function AuthorAvatar({ small = false }: { small?: boolean }) {
  return <span className={`author-avatar ${small ? "small" : ""}`} aria-label="David, researcher">
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect width="40" height="40" rx="20" fill="#b4b4a4"/><path d="M7 40C7 27 13 25 20 25C27 25 33 28 33 40" fill="#303331"/><path d="M16 24V29C18 32 22 32 24 29V23" fill="#9d7054"/><ellipse cx="20" cy="18" rx="8" ry="10" fill="#b98b66"/><path d="M12 20C8 10 12 5 20 5C28 5 30 10 28 18L25 13L23 14L19 12L13 15Z" fill="#292522"/><path d="M16.7 20H17M23 20H23.3" stroke="#302924" strokeWidth="1.6" strokeLinecap="round"/><path d="M18 25C19 26 21 26 22 25" stroke="#704933" strokeLinecap="round"/><path d="M11 39L14 28L20 33L26 28L29 40" fill="#3f4540"/><path d="M20 33V40" stroke="#7c8177"/></svg>
  </span>;
}
