import type { CSSProperties } from 'react';
import { CheckIcon } from './icons';

const NOS = ['No cloud account', 'No ads', 'No trackers'];

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
          <svg
            viewBox="0 0 560 360"
            role="img"
            aria-label="Diagram: your phone keeps the database and backs up straight to your own PC over Wi-Fi or USB. No cloud sits in between."
          >
            <defs>
              <linearGradient id="d-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#eceff6" />
              </linearGradient>
              <linearGradient id="d-green" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5fdc82" />
                <stop offset="1" stopColor="#22a448" />
              </linearGradient>
              <linearGradient id="d-link" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#22a448" />
                <stop offset="1" stopColor="#0873ec" />
              </linearGradient>
              <pattern id="d-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#c9cddb" opacity="0.55" />
              </pattern>
              <filter id="d-shadow" x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#1e2850" floodOpacity="0.16" />
              </filter>
            </defs>

            <rect width="560" height="360" fill="url(#d-dots)" />

            <g filter="url(#d-shadow)">
              <rect x="30" y="34" width="176" height="292" rx="38" fill="url(#d-body)" stroke="#d6dae5" />
              <rect x="92" y="48" width="52" height="14" rx="7" fill="#e1e4ed" />
              <text x="52" y="102" fontSize="16" fontWeight="650" fill="#1d1d1f">Your phone</text>
              <text x="52" y="122" fontSize="12.5" fill="#6b6b72">Database on the device</text>
              <rect x="50" y="142" width="136" height="42" rx="14" fill="#eef3ff" />
              <circle cx="70" cy="163" r="5" fill="#0873ec" />
              <text x="84" y="168" fontSize="14" fontWeight="600" fill="#1c5fd0">Workouts</text>
              <rect x="50" y="192" width="136" height="42" rx="14" fill="#fff4e1" />
              <circle cx="70" cy="213" r="5" fill="#ff9f0a" />
              <text x="84" y="218" fontSize="14" fontWeight="600" fill="#9a5b00">Recovery</text>
              <rect x="50" y="242" width="136" height="42" rx="14" fill="#e9f7ee" />
              <circle cx="70" cy="263" r="5" fill="#34c759" />
              <text x="84" y="268" fontSize="14" fontWeight="600" fill="#17803a">History</text>
              <circle cx="190" cy="52" r="22" fill="url(#d-green)" stroke="#fff" strokeWidth="3" />
              <rect x="181" y="52" width="18" height="13" rx="3.5" fill="none" stroke="#fff" strokeWidth="2.4" />
              <path d="M185 52v-4a5 5 0 0 1 10 0v4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </g>

            <g filter="url(#d-shadow)">
              <rect x="338" y="76" width="192" height="148" rx="18" fill="url(#d-body)" stroke="#d6dae5" />
              <path d="M338 94a18 18 0 0 1 18-18h156a18 18 0 0 1 18 18v10H338Z" fill="#eef0f6" />
              <circle cx="358" cy="90" r="4.5" fill="#ff5f57" />
              <circle cx="374" cy="90" r="4.5" fill="#febc2e" />
              <circle cx="390" cy="90" r="4.5" fill="#28c840" />
              <path transform="translate(0 -22)" d="M360 132h20l6 7h30a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6h-56a6 6 0 0 1-6-6v-43a6 6 0 0 1 6-6Z" fill="#cfe1ff" stroke="#9bbcf5" />
              <text x="368" y="196" fontSize="14" fontWeight="650" fill="#1d1d1f">Hevier Sync</text>
              <text x="368" y="214" fontSize="12" fill="#6b6b72" fontFamily="var(--font-mono), monospace">~/HevierBackup</text>
              <rect x="410" y="224" width="40" height="16" fill="#dfe2eb" />
              <rect x="384" y="238" width="92" height="9" rx="4.5" fill="#d3d7e2" />
              <text x="434" y="278" textAnchor="middle" fontSize="16" fontWeight="650" fill="#1d1d1f">Your PC</text>
            </g>

            <path className="link" d="M214 176 C 262 176, 292 150, 334 150" fill="none" stroke="url(#d-link)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="m224 168-9 8 9 8" fill="none" stroke="#22a448" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m324 142 9 8-9 8" fill="none" stroke="#0873ec" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="232" y="196" width="94" height="28" rx="14" fill="#fff" stroke="#dfe3ee" />
            <text x="279" y="215" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#1c5fd0">Wi-Fi or USB</text>
            <text x="279" y="258" textAnchor="middle" fontSize="12.5" fill="#6b6b72">Backup and restore.</text>
            <text x="279" y="276" textAnchor="middle" fontSize="12.5" fill="#6b6b72">No server in between.</text>
          </svg>
          <ul className="nos" aria-label="What is not involved">
            {NOS.map((item) => (
              <li key={item}>
                <span aria-hidden>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="m2 2 6 6M8 2 2 8" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
