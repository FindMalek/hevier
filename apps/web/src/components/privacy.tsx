import type { CSSProperties } from 'react';
import { CheckIcon } from './icons';

export function Privacy() {
  return (
    <section id="privacy" data-section="privacy" className="section" aria-labelledby="privacy-title">
      <div className="wrap split flip">
        <div data-reveal>
          <p className="eyebrow">Privacy and local-first</p>
          <h2 id="privacy-title" className="h2" style={{ marginTop: 14 }}>
            Your data stays on your phone.
          </h2>
          <p className="lead" style={{ marginTop: 20 }}>
            Hevier keeps everything in a database on the device. There is nothing to sign up for and nothing to sell.
          </p>
          <ul className="checks">
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>No account.</b> Open the app and start logging.
              </span>
            </li>
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>No ads and no trackers.</b> This website has none either: no analytics, no cookies.
              </span>
            </li>
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>Backups on your terms.</b> Hevier Sync copies the database to your own PC over Wi-Fi or USB, and can
                restore it.
              </span>
            </li>
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>Open code.</b> Read exactly what it does. It is AGPL-3.0.
              </span>
            </li>
          </ul>
        </div>

        <div className="diagram" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
          <svg viewBox="0 0 520 420" role="img" aria-label="Diagram: your phone stores everything and backs up directly to your own PC. Servers and accounts are crossed out.">
            <defs>
              <linearGradient id="d-phone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#eef0f6" />
              </linearGradient>
              <filter id="d-shadow" x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#1e2850" floodOpacity="0.16" />
              </filter>
            </defs>

            <g filter="url(#d-shadow)">
              <rect x="30" y="70" width="170" height="290" rx="34" fill="url(#d-phone)" stroke="#d6d9e2" />
              <rect x="86" y="84" width="58" height="14" rx="7" fill="#e3e5ec" />
              <text x="115" y="150" textAnchor="middle" fontSize="15" fontWeight="650" fill="#1d1d1f">Your phone</text>
              <rect x="56" y="172" width="118" height="44" rx="14" fill="#e9f7ee" />
              <text x="115" y="199" textAnchor="middle" fontSize="14" fontWeight="600" fill="#17803a">SQLite</text>
              <rect x="56" y="228" width="118" height="44" rx="14" fill="#eef3ff" />
              <text x="115" y="255" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1c5fd0">Workouts</text>
              <rect x="56" y="284" width="118" height="44" rx="14" fill="#fff4e1" />
              <text x="115" y="311" textAnchor="middle" fontSize="14" fontWeight="600" fill="#9a5b00">Recovery</text>
            </g>

            <g filter="url(#d-shadow)">
              <rect x="322" y="150" width="170" height="122" rx="18" fill="url(#d-phone)" stroke="#d6d9e2" />
              <rect x="338" y="166" width="138" height="78" rx="8" fill="#f4f5f9" stroke="#e2e4ec" />
              <text x="407" y="201" textAnchor="middle" fontSize="14" fontWeight="650" fill="#1d1d1f">Hevier Sync</text>
              <text x="407" y="222" textAnchor="middle" fontSize="12" fill="#6b6b72">~/HevierBackup</text>
              <rect x="372" y="272" width="70" height="8" rx="4" fill="#d6d9e2" />
              <text x="407" y="305" textAnchor="middle" fontSize="15" fontWeight="650" fill="#1d1d1f">Your PC</text>
            </g>

            <path d="M206 210 H316" stroke="#0873ec" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" />
            <path d="m306 202 10 8-10 8" fill="none" stroke="#0873ec" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="261" y="190" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#1c5fd0">Wi-Fi or USB</text>

            <g opacity="0.95">
              <rect x="250" y="40" width="170" height="38" rx="19" fill="#fff" stroke="#e3e5ec" />
              <circle cx="272" cy="59" r="9" fill="#ffe3e1" />
              <path d="m268 55 8 8m0-8-8 8" stroke="#e0392f" strokeWidth="2.2" strokeLinecap="round" />
              <text x="292" y="64" fontSize="13.5" fontWeight="600" fill="#3a3a3f">No cloud account</text>
              <rect x="262" y="344" width="170" height="38" rx="19" fill="#fff" stroke="#e3e5ec" />
              <circle cx="284" cy="363" r="9" fill="#ffe3e1" />
              <path d="m280 359 8 8m0-8-8 8" stroke="#e0392f" strokeWidth="2.2" strokeLinecap="round" />
              <text x="304" y="368" fontSize="13.5" fontWeight="600" fill="#3a3a3f">No ads, no trackers</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
