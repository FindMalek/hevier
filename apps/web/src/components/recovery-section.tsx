import { MALE_BACK, MALE_FRONT } from '@musclemap/assets';
import type { CSSProperties } from 'react';
import { DEFAULT_HOURS, DEFAULT_SESSION, fillVars, sessionById } from '@/lib/recovery';
import { BodyMap } from './body-map';
import { RecoveryDemo } from './recovery-demo';

function Gradients() {
  const stops = (id: string, colors: [string, string, string]) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={colors[0]} />
      <stop offset="0.55" stopColor={colors[1]} />
      <stop offset="1" stopColor={colors[2]} />
    </linearGradient>
  );
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute' }}>
      <defs>
        {stops('g-heavy', ['#ff8e86', '#ff4f44', '#dc3027'])}
        {stops('g-partly', ['#ffcb6b', '#ffa61c', '#ee8a00'])}
        {stops('g-ready', ['#7be79a', '#34c759', '#22a448'])}
        {stops('g-idle', ['#d9dce4', '#cdd1db', '#bcc1cd'])}
        {stops('g-body', ['#f3f4f8', '#e8eaf0', '#dcdfe8'])}
      </defs>
    </svg>
  );
}

export function RecoverySection() {
  const initial = fillVars(sessionById(DEFAULT_SESSION), DEFAULT_HOURS) as CSSProperties;
  return (
    <section id="recovery" data-section="recovery" className="section section-soft" aria-labelledby="recovery-title">
      <div className="wrap">
        <div className="section-head center" data-reveal>
          <p className="eyebrow">Recovery map</p>
          <h2 id="recovery-title" className="h2">
            See what is ready to train again.
          </h2>
          <p className="lead">
            Pick a workout and drag the clock. This is the same logic the app uses, simplified. Red means heavy recent
            load, orange means partly recovered, green means likely ready.
          </p>
        </div>
        <div className="demo">
          <RecoveryDemo />
          <div id="recovery-map" className="map-panel" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
            <Gradients />
            <div className="bodies" style={initial}>
              <figure>
                <BodyMap diagram={MALE_FRONT} />
                <figcaption>Front</figcaption>
              </figure>
              <figure>
                <BodyMap diagram={MALE_BACK} />
                <figcaption>Back</figcaption>
              </figure>
            </div>
          </div>
        </div>
        <p className="fine" style={{ textAlign: 'center' }} data-reveal>
          A demo with illustrative workouts. Recovery is an estimate, not medical advice.
        </p>
      </div>
    </section>
  );
}
