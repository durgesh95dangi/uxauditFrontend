"use client";

import { useMemo, useState } from "react";
import {
  CHECKLIST_GROUPS,
  TOTAL_CHECKLIST_ITEMS
} from "../../lib/landing/usabilityChecklist.js";

export default function UsabilityChecklistInteractive() {
  const [checked, setChecked] = useState({});

  const checkedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );

  const progress = Math.round((checkedCount / TOTAL_CHECKLIST_ITEMS) * 100);

  function toggleItem(id) {
    setChecked((current) => ({
      ...current,
      [id]: !current[id]
    }));
  }

  return (
    <div className="checklist-widget">
      <div className="checklist-progress" aria-live="polite">
        <div className="checklist-progress-copy">
          <span className="checklist-progress-count">
            {checkedCount} of {TOTAL_CHECKLIST_ITEMS} checked
          </span>
          <span className="checklist-progress-pct">{progress}%</span>
        </div>
        <div
          className="checklist-progress-bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist progress"
        >
          <div
            className="checklist-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {CHECKLIST_GROUPS.map((group) => (
        <section key={group.id} className="checklist-group">
          <h2>{group.title}</h2>
          <ul className="checklist-items">
            {group.items.map((item) => {
              const isChecked = Boolean(checked[item.id]);
              return (
                <li key={item.id}>
                  <label
                    className={`checklist-item${isChecked ? " checklist-item--checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="checklist-item-copy">
                      <span className="checklist-item-title">{item.title}</span>
                      <span className="checklist-item-body">{item.body}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
