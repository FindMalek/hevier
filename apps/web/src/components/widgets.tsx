import Image from 'next/image';
import type { CSSProperties } from 'react';
import { CheckIcon } from './icons';

export function Widgets() {
  return (
    <section data-section="widgets" className="section section-soft" aria-labelledby="widgets-title">
      <div className="wrap split">
        <div data-reveal>
          <p className="eyebrow">Widgets and notification</p>
          <h2 id="widgets-title" className="h2" style={{ marginTop: 14 }}>
            Works with the app closed.
          </h2>
          <p className="lead" style={{ marginTop: 20 }}>
            Your rest timer lives in the notification shade. Your week lives on the home screen.
          </p>
          <ul className="checks">
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>A live workout notification.</b> It shows the next set and the rest countdown, with Complete Set, Skip,
                −15s and +15s buttons that work in the background.
              </span>
            </li>
            <li>
              <span className="check-ico">
                <CheckIcon />
              </span>
              <span>
                <b>Four home-screen widgets.</b> This month’s calendar, weekly volume, next in your cycle, and the recovery
                map.
              </span>
            </li>
          </ul>
        </div>

        <div className="widget-stage" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
          <div className="notif">
            <Image
              src="/screens/notification.webp"
              alt="Workout notification: Leg Press, next set 2 of 4, rest 01:45 with Skip, minus 15 seconds and plus 15 seconds buttons"
              width={600}
              height={250}
              sizes="470px"
            />
          </div>
          <Image
            className="widgets-img"
            src="/screens/widgets.webp"
            alt="Four home-screen widgets: calendar, weekly volume, next in cycle and recovery map"
            width={600}
            height={669}
            sizes="440px"
          />
        </div>
      </div>
    </section>
  );
}
