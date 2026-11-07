import type { CSSProperties } from 'react';
import { SITE } from '@/lib/site';
import { ArrowRightIcon, DownloadIcon, GithubIcon } from './icons';

export function Get() {
  return (
    <section id="get" data-section="get" className="section section-soft" aria-labelledby="get-title">
      <div className="wrap">
        <div className="section-head center" data-reveal>
          <p className="eyebrow">Get Hevier</p>
          <h2 id="get-title" className="h2">
            Free to download.
            <br />
            Open to read.
          </h2>
        </div>

        <div className="get">
          <div className="card get-main" data-reveal>
            <p className="card-kicker">Android</p>
            <h3 className="h3">Download the APK.</h3>
            <p className="lead" style={{ marginTop: 12, maxWidth: 460 }}>
              Grab the latest build from the GitHub releases page. No account, no store sign-in.
            </p>
            <div className="cta-row" style={{ justifyContent: 'flex-start' }}>
              <a href={SITE.releases} className="btn btn-primary">
                <DownloadIcon />
                Download for Android
              </a>
            </div>
            <div style={{ marginTop: 30, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
              <p className="card-kicker" style={{ color: '#6b6b72' }}>
                iOS
              </p>
              <p className="lead" style={{ fontSize: 18 }}>
                Coming to iOS. It is in progress, with no release date yet.
              </p>
            </div>
          </div>

          <div className="card" data-reveal style={{ '--d': '100ms' } as CSSProperties}>
            <p className="card-kicker">Open source</p>
            <h3 className="h3">Read it. Fix it. Make it yours.</h3>
            <p className="lead" style={{ marginTop: 12, fontSize: 18 }}>
              AGPL-3.0. Pull requests are welcome, and the exercise catalogue takes one file per exercise.
            </p>
            <pre className="code" tabIndex={0} aria-label="Commands to run Hevier from source">
              <code>
                <span>$ </span>git clone {SITE.repo}.git{'\n'}
                <span>$ </span>pnpm install{'\n'}
                <span>$ </span>pnpm android
              </code>
            </pre>
            <div className="cta-row" style={{ justifyContent: 'flex-start' }}>
              <a href={SITE.repo} className="btn btn-glass btn-sm">
                <GithubIcon size={18} />
                View the code
              </a>
              <a href={SITE.contributing} className="btn btn-glass btn-sm">
                Contribute
                <ArrowRightIcon size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
