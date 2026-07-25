import React, { useState, useEffect } from 'react';

interface SipatiLogoProps {
  className?: string;
  size?: number;
  customLogoUrl?: string;
}

export const SipatiLogo: React.FC<SipatiLogoProps> = ({
  className = '',
  size = 40,
  customLogoUrl,
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    if (customLogoUrl) return customLogoUrl;
    try {
      return localStorage.getItem('sipati_logo_url');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (customLogoUrl !== undefined) {
      setLogoUrl(customLogoUrl);
      return;
    }

    const checkLogo = () => {
      try {
        const stored = localStorage.getItem('sipati_logo_url');
        setLogoUrl(stored || null);
      } catch {
        setLogoUrl(null);
      }
    };

    checkLogo();

    window.addEventListener('storage', checkLogo);
    window.addEventListener('sipati_logo_updated', checkLogo as EventListener);

    return () => {
      window.removeEventListener('storage', checkLogo);
      window.removeEventListener('sipati_logo_updated', checkLogo as EventListener);
    };
  }, [customLogoUrl]);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Logo Official SIPATI"
        style={{ width: size, height: size }}
        className={`object-contain shrink-0 rounded-xl p-0.5 bg-white/10 border border-cyan-500/40 shadow-md ${className}`}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Outer Golden Crest / Seal Ring */}
      <circle cx="50" cy="50" r="48" fill="#57000f" stroke="#E4DCC8" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="43" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Internal Shield Shape */}
      <path
        d="M50 16 L76 27 V52 C76 67 65 79 50 84 C35 79 24 67 24 52 V27 L50 16 Z"
        fill="#b62230"
        stroke="#ffd700"
        strokeWidth="1.5"
      />

      {/* Golden Star at top of Shield */}
      <polygon
        points="50,22 52.5,28.5 59.5,28.5 54,32.5 56,39 50,35 44,39 46,32.5 40.5,28.5 47.5,28.5"
        fill="#ffd700"
      />

      {/* Official Document / Administrative Book Motif */}
      <rect x="36" y="42" width="28" height="23" rx="2" fill="#FFFDF8" stroke="#57000f" strokeWidth="1.2" />
      <line x1="41" y1="47" x2="59" y2="47" stroke="#57000f" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="41" y1="52" x2="59" y2="52" stroke="#b62230" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="41" y1="57" x2="52" y2="57" stroke="#57000f" strokeWidth="1.2" strokeLinecap="round" />

      {/* Bottom Ribbon / Text Banner */}
      <path
        d="M25 71 Q50 81 75 71 L71 77 Q50 87 29 77 Z"
        fill="#d4af37"
        stroke="#57000f"
        strokeWidth="0.8"
      />
      <text
        x="50"
        y="76"
        textAnchor="middle"
        fill="#57000f"
        fontSize="5.2"
        fontWeight="bold"
        fontFamily="sans-serif"
        letterSpacing="0.4"
      >
        TAPEM KUBU RAYA
      </text>
    </svg>
  );
};
