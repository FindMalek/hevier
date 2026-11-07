import { SITE } from '@/lib/site';
import { DownloadIcon, GithubIcon } from './icons';
import { Phone } from './phone';

export function Hero() {
  return (
    <section id="top" data-section="hero" className="hero" aria-labelledby="hero-title">
      <div className="aurora" aria-hidden />
      <div className="wrap">
        <div className="hero-copy">
          <p className="pill glass" data-rise style={{ '--i': 0 } as React.CSSProperties}>
            <span className="dot" aria-hidden />
            Free and open source. Android today.
          </p>
          <h1 id="hero-title" className="display" data-rise style={{ '--i': 1 } as React.CSSProperties}>
            Train hard.
            <br />
            <span className="grad-text">Recover smart.</span>
          </h1>
          <p className="lead" data-rise style={{ '--i': 2 } as React.CSSProperties}>
            Hevier is a workout tracker that shows which muscles have recovered and counts sets the way the research says
            they count. No account. No ads. No subscription.
          </p>
          <div className="cta-row" data-rise style={{ '--i': 3 } as React.CSSProperties}>
            <a href={SITE.releases} className="btn btn-primary">
              <DownloadIcon />
              Download for Android
            </a>
            <a href={SITE.repo} className="btn btn-glass">
              <GithubIcon />
              View on GitHub
            </a>
          </div>
          <p className="fine" data-rise style={{ '--i': 4 } as React.CSSProperties}>
            APK from the GitHub releases page. Coming to iOS. AGPL-3.0.
          </p>
        </div>

        <div className="stage">
          <div className="slot slot-l" style={{ '--delay': '520ms' } as React.CSSProperties}>
            <div className="par">
              <Phone src="/screens/home.webp" alt="Hevier home screen showing the next workout in the cycle" sizes="(min-width: 768px) 280px, 190px" />
            </div>
          </div>
          <div className="slot slot-r" style={{ '--delay': '640ms' } as React.CSSProperties}>
            <div className="par">
              <Phone src="/screens/log-workout.webp" alt="Hevier Log Workout screen with a rest timer running" sizes="(min-width: 768px) 280px, 190px" />
            </div>
          </div>
          <div className="slot slot-c" style={{ '--delay': '260ms' } as React.CSSProperties}>
            <div className="par">
              <Phone
                src="/screens/recovery.webp"
                alt="Hevier recovery map: chest and arms in heavy recent load, legs likely ready"
                height={865}
                priority
                sizes="(min-width: 768px) 340px, 228px"
              />
            </div>
          </div>

          <div className="float-chip glass chip-a" data-rise style={{ '--i': 6 } as React.CSSProperties} aria-hidden>
            <span className="swatch sw-ready" />
            <span>
              Legs
              <small>Likely ready</small>
            </span>
          </div>
          <div className="float-chip glass chip-b" data-rise style={{ '--i': 7 } as React.CSSProperties} aria-hidden>
            <span className="swatch sw-heavy" />
            <span>
              Chest
              <small>Heavy recent load</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Facts() {
  const items = [
    ['5,600+', 'exercises'],
    ['4', 'home-screen widgets'],
    ['0', 'accounts, ads or trackers'],
    ['AGPL-3.0', 'open source'],
  ];
  return (
    <section aria-label="At a glance" data-section="facts" className="wrap" style={{ position: 'relative', zIndex: 6 }}>
      <div className="facts glass" data-reveal>
        {items.map(([value, label]) => (
          <div key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
