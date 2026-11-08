import type { CSSProperties } from 'react';
import { SITE } from '@/lib/site';
import { SOURCES, sourceById, sourceUrl } from '@/lib/science';
import { ExternalIcon } from './icons';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

function SourceChips({ ids }: { ids: string[] }) {
  return (
    <p>
      {ids.map((id) => {
        const source = sourceById(id);
        return (
          <a key={id} className="src" href={sourceUrl(source)} target="_blank" rel="noopener noreferrer">
            {source.cite}
            <ExternalIcon size={12} />
          </a>
        );
      })}
    </p>
  );
}

export function Science() {
  return (
    <section id="science" data-section="science" className="section" aria-labelledby="science-title">
      <div className="wrap">
        <div className="section-head center" data-reveal>
          <p className="eyebrow">Science</p>
          <h2 id="science-title" className="h2">
            Counts what builds muscle.
          </h2>
          <p className="lead">
            Most apps count every set the same. Hevier counts the ones that matter, and each rule names the study it comes
            from.
          </p>
        </div>

        <div className="rules">
          <article className="card rule" data-reveal style={delay(0)}>
            <div className="big grad-text">1</div>
            <h3 className="h3">Hard sets count.</h3>
            <p>The research: muscle growth rises as sets end closer to failure.</p>
            <SourceChips ids={['robinson']} />
            <p>
              Hevier’s choice: a set within about 3 reps of failure counts as one, easier sets count less, and warm-ups
              get a small credit.
            </p>
          </article>

          <article className="card rule" data-reveal style={delay(80)}>
            <div className="big grad-text">½</div>
            <h3 className="h3">Helper muscles count half.</h3>
            <p>
              Your triceps get half a set from a bench press. Across 67 studies, that split fit the data best.
            </p>
            <SourceChips ids={['pelland']} />
          </article>

          <article className="card rule" data-reveal style={delay(0)}>
            <div className="big grad-text">3, then 4+</div>
            <h3 className="h3">Maintain, then grow.</h3>
            <p>
              In one study of young adults, 3 sets a week kept muscle size for 32 weeks. A model of 67 studies puts 4
              sets a week as the smallest dose that grew muscle. Under 3 has not been tested.
            </p>
            <div className="zones" aria-hidden>
              <div className="z1">
                <b>Under 3</b>
                Untested
              </div>
              <div className="z2">
                <b>3</b>
                Maintenance
              </div>
              <div className="z3">
                <b>4+ a week</b>
                Growth
              </div>
            </div>
            <SourceChips ids={['bickel', 'pelland']} />
          </article>

          <article className="card rule" data-reveal style={delay(80)}>
            <div className="big grad-text">24 to 72 h</div>
            <h3 className="h3">Recovery windows.</h3>
            <p>
              One hard set leaves a muscle tired for about a day. Four or more can take up to three. The map uses the same
              table for every muscle, because the studies show no difference between them.
            </p>
            <SourceChips ids={['moran', 'pareja', 'belcher', 'goulart']} />
          </article>
        </div>

        <div className="limits glass" data-reveal>
          <div>
            <h3 className="h3">It is an estimate, and the app says so.</h3>
            <p className="lead" style={{ marginTop: 12 }}>
              The recovery studies are small, mostly young men, mostly bench press and squat. The window for a single set
              is a best guess. One study found no difference between sets to failure and sets stopped short. The notes list every
              gap.
            </p>
          </div>
          <div>
            <p className="link-stack">
              <a className="text-link" href={SITE.scienceRecovery}>
                Read the recovery notes
              </a>
              <a className="text-link" href={SITE.scienceSets}>
                Read the set notes
              </a>
            </p>
            <details className="sources" style={{ marginTop: 18 }}>
              <summary>All sources ({SOURCES.length})</summary>
              <ul>
                {SOURCES.map((source) => (
                  <li key={source.id}>
                    <a href={sourceUrl(source)} target="_blank" rel="noopener noreferrer">
                      {source.cite}
                    </a>
                    , {source.journal}. {source.note}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
