import type { CSSProperties } from 'react';
import { SITE } from '@/lib/site';
import { CheckIcon } from './icons';

const WEEK = [
  { day: 'Mon', label: 'Strength only', color: '#ff453a' },
  { day: 'Tue', label: 'Run easy', color: '#ffa61c' },
  { day: 'Wed', label: 'Run easy', color: '#ffa61c' },
  { day: 'Thu', label: 'Run quality', color: '#34c759' },
  { day: 'Fri', label: 'Run quality', color: '#34c759' },
];

export function RunRecovery() {
  return (
    <section id="run-recovery" data-section="run-recovery" className="section" aria-labelledby="run-title">
      <div className="wrap split">
        <div data-reveal>
          <p className="badge-soon">
            <i aria-hidden />
            Coming soon
          </p>
          <h2 id="run-title" className="h2" style={{ marginTop: 18 }}>
            Run Recovery.
            <br />
            Is tomorrow a run day?
          </h2>
          <p className="lead" style={{ marginTop: 20 }}>
            Lift legs at night, run at dawn? Hevier will tell you whether tomorrow’s run should be hard, easy or skipped,
            and show its reasoning. It is in design and not in the app yet.
          </p>
          <ul className="checks">
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>Log a run in seconds.</b> Time, distance and how hard it felt.
              </span>
            </li>
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>One picture of your legs.</b> It reads recovery from your lifting and your runs together.
              </span>
            </li>
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>Four plain answers.</b> Run quality, run easy, strength only, or rest. Each lists why, and what it
                cannot see.
              </span>
            </li>
          </ul>
          <p style={{ marginTop: 26 }}>
            <a className="text-link" href={SITE.issues}>
              Follow progress on GitHub
            </a>
          </p>
        </div>

        <div className="verdict-stage" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
          <div className="verdict glass" role="img" aria-label="Design preview of a Run Recovery answer: Strength only for tomorrow at 6:30 am, with a five day outlook">
            <div className="verdict-top" aria-hidden>
              <span>Tomorrow, 6:30 am</span>
              <span>Preview</span>
            </div>
            <span className="verdict-chip" aria-hidden>
              Strength only
            </span>
            <p aria-hidden>Your legs are still in the heavy window. Skip the run. Upper body or rest is fine.</p>
            <p className="why" aria-hidden>
              Quads: 4 sets tonight, heavy until about 8 pm tomorrow.
            </p>
            <div className="week" aria-hidden>
              {WEEK.map((item) => (
                <div key={item.day}>
                  <b>{item.day}</b>
                  <i style={{ background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <p className="fine" style={{ textAlign: 'center' }}>
            Design preview. Estimates, not medical advice.
          </p>
        </div>
      </div>
    </section>
  );
}
