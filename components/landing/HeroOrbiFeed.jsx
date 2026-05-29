"use client";

import { useEffect, useRef, useState } from "react";
import {
  HERO_FEED_ISSUE_COUNT,
  HERO_FEED_ISSUES
} from "../../lib/landing/heroFeedIssues.js";

function FeedSpinner() {
  return (
    <span className="orbi-feed-spinner" aria-hidden="true">
      <span className="orbi-feed-spinner-ring" />
    </span>
  );
}

function FindingCard({ item }) {
  return (
    <article className="orbi-feed-card">
      <div
        className={`orbi-feed-card-icon orbi-feed-card-icon--${item.iconTone}`}
        aria-hidden="true"
      >
        {item.iconLabel}
      </div>
      <div className="orbi-feed-card-main">
        <h3 className="orbi-feed-card-title">{item.title}</h3>
        <p className="orbi-feed-card-snippet">{item.snippet}</p>
      </div>
      <span className="orbi-feed-card-badge">
        {item.score}%
        <span className="orbi-feed-card-arrow" aria-hidden="true">
          ↑
        </span>
      </span>
    </article>
  );
}

export default function HeroOrbiFeed() {
  const [issueCount, setIssueCount] = useState(0);
  const countedRef = useRef(false);

  useEffect(() => {
    if (countedRef.current) return undefined;
    countedRef.current = true;

    const target = HERO_FEED_ISSUE_COUNT;
    const duration = 2200;
    const start = performance.now();

    let frame = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setIssueCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const track = [...HERO_FEED_ISSUES, ...HERO_FEED_ISSUES];

  return (
    <div className="orbi-feed" aria-hidden="true">
      <header className="orbi-feed-header">
        <div className="orbi-feed-header-title">
          <FeedSpinner />
          <p className="orbi-feed-heading">Scanning for issues</p>
        </div>
        <p className="orbi-feed-subline">
          <span className="orbi-feed-count-num">{issueCount}</span> issues found
          today
        </p>
      </header>

      <div className="orbi-feed-viewport">
        <div className="orbi-feed-track">
          {track.map((item, i) => (
            <FindingCard key={`${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
