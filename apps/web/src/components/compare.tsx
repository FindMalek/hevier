import type { CSSProperties } from 'react';
import { CheckIcon } from './icons';

interface Row {
  feature: string;
  hevier: string;
  elsewhere: string;
}

const ROWS: Row[] = [
  {
    feature: 'Routines',
    hevier: 'Unlimited.',
    elsewhere: 'Hevy’s own site says its free plan caps routines at 4. A third-party review says Strong’s caps them at 3.',
  },
  {
    feature: 'Graph history',
    hevier: 'All of it.',
    elsewhere: 'Hevy’s own site says its free plan shows 3 months of graphs. Third-party reviews say Strong keeps charts in its paid plan.',
  },
  {
    feature: 'Sets per muscle per week',
    hevier: 'Free.',
    elsewhere: 'Third-party reviews list it as a paid feature in Hevy and Liftosaur.',
  },
  {
    feature: 'Per-muscle recovery map',
    hevier: 'Free.',
    elsewhere: 'We could not find one in Hevy or Strong.',
  },
  {
    feature: 'Where numbers come from',
    hevier: 'Every rule cites its study.',
    elsewhere: 'We did not find another tracker that cites sources for how it counts sets.',
  },
  {
    feature: 'Account',
    hevier: 'Not needed.',
    elsewhere: 'Hevy and Strong are built around an account.',
  },
  {
    feature: 'Price',
    hevier: 'Nothing. No subscription.',
    elsewhere: 'Paid plans are monthly, yearly or one time, depending on the app.',
  },
];

const BEHIND = ['iOS app (in progress)', 'Watch app', 'Social feed', 'Health Connect and Strava sync', 'Built-in programs'];

export function Compare() {
  return (
    <section id="compare" data-section="compare" className="section section-soft" aria-labelledby="compare-title">
      <div className="wrap">
        <div className="section-head center" data-reveal>
          <p className="eyebrow">Free, for real</p>
          <h2 id="compare-title" className="h2">
            What others paywall,
            <br />
            Hevier doesn’t.
          </h2>
          <p className="lead">
            Compared with the free plans of other trackers as of November 2026, from each app’s public pricing pages and
            third-party reviews, not a hands-on test. Plans change, so check the store listing before you decide.
          </p>
        </div>

        <div className="compare glass" data-reveal>
          <div className="compare-head" aria-hidden>
            <span>Feature</span>
            <span>Hevier</span>
            <span>Elsewhere, at time of writing</span>
          </div>
          <ul>
            {ROWS.map((row) => (
              <li key={row.feature} className="compare-row">
                <h3>{row.feature}</h3>
                <p className="compare-cell yes">
                  <span className="cell-label">Hevier</span>
                  <span className="yes-mark" aria-hidden>
                    <CheckIcon size={13} />
                  </span>
                  {row.hevier}
                </p>
                <p className="compare-cell">
                  <span className="cell-label">Elsewhere</span>
                  {row.elsewhere}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="behind glass" data-reveal style={{ '--d': '80ms' } as CSSProperties}>
          <div>
            <h3 className="h3">Where Hevy and others are ahead.</h3>
            <p className="lead" style={{ marginTop: 12 }}>
              Hevier is a small hobby project. If you need these today, another app is the better pick.
            </p>
          </div>
          <ul className="tags">
            {BEHIND.map((item) => (
              <li key={item} className="tag">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
