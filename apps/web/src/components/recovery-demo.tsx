'use client';

import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react';
import {
  DEFAULT_HOURS,
  DEFAULT_SESSION,
  MUSCLE_LABELS,
  SESSIONS,
  fillVars,
  recoveryState,
  recoveryWindow,
  sessionById,
  summarize,
  type MuscleKey,
  type RecoveryState,
  type SessionId,
} from '@/lib/recovery';

const STATE_COPY: Record<RecoveryState, string> = {
  heavy: 'heavy recent load',
  partly: 'partly recovered',
  ready: 'likely ready',
  idle: 'not trained',
};

const MAX_HOURS = 96;

export function RecoveryDemo() {
  const uid = useId();
  const [sessionId, setSessionId] = useState<SessionId>(DEFAULT_SESSION);
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [selected, setSelected] = useState<MuscleKey | null>(null);

  const session = sessionById(sessionId);

  const summary = useMemo(() => summarize(session, hours), [session, hours]);

  useEffect(() => {
    const bodies = document.querySelector<HTMLElement>('#recovery-map .bodies');
    if (!bodies) return;
    for (const [name, value] of Object.entries(fillVars(session, hours))) bodies.style.setProperty(name, value);
  }, [session, hours]);

  useEffect(() => {
    const bodies = document.querySelector<HTMLElement>('#recovery-map .bodies');
    if (!bodies) return;
    bodies.toggleAttribute('data-has-sel', selected !== null);
    bodies.querySelectorAll<SVGPathElement>('.m').forEach((path) => {
      path.classList.toggle('sel', path.dataset.g === selected);
    });
  }, [selected]);

  const trained = (Object.keys(session.sets) as MuscleKey[]).filter((key) => recoveryWindow(session.sets[key] ?? 0));

  const selectedSets = selected ? (session.sets[selected] ?? 0) : 0;
  const selectedWindow = selected ? recoveryWindow(selectedSets) : null;
  const selectedState = selected ? recoveryState(selectedSets, hours) : 'idle';

  const pick = (key: MuscleKey) => setSelected((current) => (current === key ? null : key));

  const sliderId = `${uid}-hours`;

  return (
    <div className="glass demo-panel" data-reveal>
      <div role="group" aria-labelledby={`${uid}-session`}>
        <span id={`${uid}-session`} className="field-label">
          Your workout
        </span>
        <div className="seg">
          {SESSIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === sessionId}
              onClick={() => {
                setSessionId(s.id);
                setSelected(null);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="time-readout">
        <label htmlFor={sliderId} className="field-label" style={{ margin: 0 }}>
          Time since you trained
        </label>
      </div>
      <div className="time-readout" style={{ marginTop: 10 }}>
        <b>{hours} h</b>
        <span>Day {Math.floor(hours / 24) + 1} after your workout</span>
      </div>
      <input
        id={sliderId}
        className="slider"
        type="range"
        min={0}
        max={MAX_HOURS}
        step={1}
        value={hours}
        style={{ '--pct': `${(hours / MAX_HOURS) * 100}%` } as CSSProperties}
        aria-valuetext={`${hours} hours since your workout`}
        onChange={(event) => setHours(Number(event.target.value))}
      />
      <div className="ticks" aria-hidden>
        <span>0 h</span>
        <span>24 h</span>
        <span>48 h</span>
        <span>72 h</span>
        <span>96 h</span>
      </div>

      <div className="legend" role="status" aria-live="polite">
        <span className="legend-item">
          <span className="swatch-dot sw-heavy" aria-hidden />
          {summary.heavy.length} heavy
        </span>
        <span className="legend-item">
          <span className="swatch-dot sw-partly" aria-hidden />
          {summary.partly.length} partly recovered
        </span>
        <span className="legend-item">
          <span className="swatch-dot sw-ready" aria-hidden />
          {summary.ready.length} likely ready
        </span>
      </div>

      <div className="muscle-chips" role="group" aria-label="Muscles in this workout">
        {trained.map((key) => {
          const state = recoveryState(session.sets[key] ?? 0, hours);
          return (
            <button key={key} type="button" aria-pressed={selected === key} onClick={() => pick(key)}>
              <span className={`swatch-dot sw-${state}`} aria-hidden />
              {MUSCLE_LABELS[key]}
              <span className="sr-only">: {STATE_COPY[state]}</span>
            </button>
          );
        })}
      </div>

      <p className="detail" aria-live="polite">
        {selected && selectedWindow ? (
          <>
            <b>{MUSCLE_LABELS[selected]}</b> got {selectedSets} effective {selectedSets === 1 ? 'set' : 'sets'}. Heavy
            recent load for the first {selectedWindow.heavyUntil} h, partly recovered until{' '}
            {selectedWindow.partlyUntil} h, then likely ready. Right now: <b>{STATE_COPY[selectedState]}</b>.
          </>
        ) : (
          <>
            Tap a muscle to see its numbers. Every window comes from the recovery studies listed below, and counts
            main muscles as 1 set and helpers as half.
          </>
        )}
      </p>
    </div>
  );
}
