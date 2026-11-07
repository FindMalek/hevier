import type { CSSProperties } from 'react';
import { Phone } from './phone';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export function Features() {
  return (
    <section id="features" data-section="features" className="section" aria-labelledby="features-title">
      <div className="wrap">
        <div className="section-head center" data-reveal>
          <p className="eyebrow">Features</p>
          <h2 id="features-title" className="h2">
            Everything free.
            <br />
            Nothing locked.
          </h2>
          <p className="lead">
            Long-range charts, set counts per muscle and the advanced statistics are part of the app. They are not a plan
            you upgrade to.
          </p>
        </div>

        <div className="bento">
          <article className="card card-wide lift s4 card-tint-blue" data-reveal style={delay(0)}>
            <div className="card-text">
              <p className="card-kicker">Logging</p>
              <h3 className="h3">Built for the set you are doing right now.</h3>
              <p>
                Last session’s numbers sit next to every set. A rest timer per exercise buzzes and chimes when it ends.
                Warm-up and failure sets, per-hand weight, and a live PR medal the moment a set beats your best.
              </p>
            </div>
            <div className="card-chips" aria-hidden>
              <span className="mini-chip glass">
                <span className="swatch-dot sw-partly" />
                <span>
                  01:57
                  <small>Rest timer</small>
                </span>
              </span>
              <span className="mini-chip glass">
                <span className="swatch-dot sw-ready" />
                <span>
                  190 kg x 9
                  <small>Previous, same set</small>
                </span>
              </span>
            </div>
            <div className="card-media" style={{ '--show': '380px' } as CSSProperties}>
              <Phone
                src="/screens/log-workout.webp"
                alt="Log Workout: warm-up and leg press sets with last session’s numbers and a rest timer"
                style={{ '--w': 'clamp(210px, 26vw, 270px)' } as CSSProperties}
                sizes="270px"
              />
            </div>
          </article>

          <article className="card lift s2" data-reveal style={delay(80)}>
            <div className="card-text">
              <p className="card-kicker">Cycle</p>
              <h3 className="h3">Always know what is next.</h3>
              <p>Set a cycle like Upper A, Lower A, Upper B, Lower B. Home shows what is up. A widget keeps it on your screen.</p>
            </div>
            <div className="card-media" style={{ '--show': '300px' } as CSSProperties}>
              <Phone src="/screens/home.webp" alt="Home screen showing Lower B as next in the cycle" style={{ '--w': '210px' } as CSSProperties} sizes="210px" />
            </div>
          </article>

          <article className="card lift s3 card-tint-mint" data-reveal style={delay(0)}>
            <div className="card-text">
              <p className="card-kicker">Statistics</p>
              <h3 className="h3">Charts without lock icons.</h3>
              <p>Sets per muscle, muscle distribution against the period before, push and pull balance, a monthly report.</p>
            </div>
            <div className="card-media" style={{ '--show': '330px' } as CSSProperties}>
              <Phone
                src="/screens/statistics.webp"
                alt="Body graph showing sets per muscle this week in zones from maintenance to growth"
                height={865}
                style={{ '--w': '250px' } as CSSProperties}
                sizes="250px"
              />
            </div>
          </article>

          <article className="card lift s3 card-tint-lilac" data-reveal style={delay(80)}>
            <div className="card-text">
              <p className="card-kicker">Exercises</p>
              <h3 className="h3">5,600+ exercises.</h3>
              <p>
                Barbell, dumbbell, cable, machine, band and bodyweight versions of every common movement. Search by name,
                equipment or muscle.
              </p>
            </div>
            <div className="card-media" style={{ '--show': '330px' } as CSSProperties}>
              <Phone
                src="/screens/exercises.webp"
                alt="Exercise search results for curl with muscles listed under each name"
                style={{ '--w': '250px' } as CSSProperties}
                sizes="250px"
              />
            </div>
          </article>

          <article className="card lift s2 card-tint-peach" data-reveal style={delay(0)}>
            <div className="card-text">
              <p className="card-kicker">Cardio</p>
              <h3 className="h3">Cardio counts too.</h3>
              <p>A Conditioning card tracks your weekly minutes against the WHO guideline.</p>
            </div>
            <div className="ring-wrap" role="img" aria-label="Example: 52 of 75 vigorous minutes this week">
              <div className="ring" />
              <div className="ring-label">
                <b>52</b>
                <span>of 75 min</span>
              </div>
            </div>
          </article>

          <article className="card card-wide lift s4" data-reveal style={delay(80)}>
            <div className="card-text">
              <p className="card-kicker">Your data</p>
              <h3 className="h3">Bring your history. Back it up your way.</h3>
              <p>
                Import a Hevy CSV export. Hevier Sync keeps a backup of your phone on your own PC over Wi-Fi or a USB
                cable, and can restore it. No cloud in between.
              </p>
            </div>
            <div className="flow" aria-hidden>
              <span className="flow-node">Hevy CSV export</span>
              <span className="flow-arrow">↓</span>
              <span className="flow-node">Your phone</span>
              <span className="flow-arrow">⇅</span>
              <span className="flow-node">Your PC, over Wi-Fi or USB</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
