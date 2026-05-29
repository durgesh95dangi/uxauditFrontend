// sections.js - detects logical page sections and returns their bounding boxes and labels

function isVisible(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
}

function getSelector(el) {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${el.id}`;
  const firstClass = el.classList && el.classList[0];
  if (firstClass) return `${tag}.${firstClass}`;
  return tag;
}

function hasOwnBackground(el) {
  const style = window.getComputedStyle(el);
  const bg = style.backgroundColor;
  const bgImage = style.backgroundImage;
  if (bgImage && bgImage !== "none") return true;
  if (!bg) return false;
  if (bg === "transparent" || bg === "rgba(0, 0, 0, 0)") return false;
  return true;
}

function detectLabel(el) {
  const KEYWORD_MAP = [
    [["hero", "banner", "jumbotron"], "Hero"],
    [["header", "masthead"], "Header"],
    [["nav", "navigation", "menu"], "Navigation"],
    [["footer"], "Footer"],
    [["pricing", "plans", "packages"], "Pricing"],
    [["features", "capabilities"], "Features"],
    [["testimonial", "reviews"], "Social Proof"],
    [["cta", "call-to-action"], "CTA"],
    [["contact"], "Contact"],
    [["about"], "About"],
    [["faq"], "FAQ"],
    [["team", "people"], "Team"],
    [["blog", "news"], "Blog"],
    [["form", "subscribe", "signup"], "Form"],
    [["partners", "clients", "logos"], "Logos"]
  ];

  const TAG_MAP = {
    header: "Header",
    nav: "Navigation",
    main: "Main",
    footer: "Footer",
    aside: "Sidebar"
  };

  const ROLE_MAP = {
    banner: "Header",
    navigation: "Navigation",
    main: "Main",
    contentinfo: "Footer"
  };

  function findKeyword(text) {
    if (!text) return null;
    const lower = String(text).toLowerCase();
    for (const [keys, label] of KEYWORD_MAP) {
      for (const key of keys) {
        if (lower.indexOf(key) !== -1) return label;
      }
    }
    return null;
  }

  for (const attr of Array.from(el.attributes || [])) {
    if (attr.name.indexOf("data-") === 0) {
      const match = findKeyword(`${attr.name} ${attr.value}`);
      if (match) return match;
    }
  }

  if (el.id) {
    const match = findKeyword(el.id);
    if (match) return match;
  }

  if (el.className && typeof el.className === "string") {
    const match = findKeyword(el.className);
    if (match) return match;
  }

  const tag = el.tagName.toLowerCase();
  if (TAG_MAP[tag]) return TAG_MAP[tag];

  const role = el.getAttribute("role");
  if (role && ROLE_MAP[role]) return ROLE_MAP[role];

  const heading = el.querySelector("h1, h2, h3");
  if (heading && heading.textContent) {
    const text = heading.textContent.trim().slice(0, 40);
    if (text) return text;
  }

  return "Section";
}

const SECTION_KEYWORDS = [
  "hero",
  "banner",
  "features",
  "pricing",
  "plans",
  "testimonial",
  "reviews",
  "cta",
  "contact",
  "about",
  "faq",
  "team",
  "blog",
  "partners",
  "form",
  "signup",
  "newsletter",
  "footer",
  "header"
];

const SEMANTIC_SELECTOR =
  'header, nav, main, footer, aside, section, [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]';

export async function detectSections(page) {
  const helperSources = {
    isVisible: isVisible.toString(),
    getSelector: getSelector.toString(),
    hasOwnBackground: hasOwnBackground.toString(),
    detectLabel: detectLabel.toString()
  };

  const sections = await page.evaluate(
    async (config) => {
      const isVisibleFn = new Function("return (" + config.helpers.isVisible + ")")();
      const getSelectorFn = new Function("return (" + config.helpers.getSelector + ")")();
      const hasOwnBackgroundFn = new Function("return (" + config.helpers.hasOwnBackground + ")")();
      const detectLabelFn = new Function("return (" + config.helpers.detectLabel + ")")();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const SECTION_KEYWORDS = config.keywords;
      const SEMANTIC_SELECTOR = config.semanticSelector;

      const found = [];
      const seen = new Set();

      function addElement(el, confidence) {
        if (!el || seen.has(el)) return;
        seen.add(el);
        found.push({ el, confidence });
      }

      // STEP 1 — Semantic HTML
      const semanticEls = document.querySelectorAll(SEMANTIC_SELECTOR);
      for (const el of semanticEls) {
        if (isVisibleFn(el)) addElement(el, "high");
      }

      // STEP 2 — Named class/id keywords
      for (const kw of SECTION_KEYWORDS) {
        const named = document.querySelectorAll(`[class*="${kw}"], [id*="${kw}"]`);
        for (const el of named) {
          if (!isVisibleFn(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width <= viewportWidth * 0.75) continue;
          addElement(el, "high");
        }
      }

      // STEP 3 — CSS-in-JS fallback
      const allEls = document.querySelectorAll("*");
      let hashClassCount = 0;
      for (const el of allEls) {
        if (!el.classList || el.classList.length === 0) continue;
        for (const cls of el.classList) {
          if (/^(sc-|css-|emotion-)/.test(cls)) {
            hashClassCount++;
            break;
          }
        }
      }
      const isCSSinJSSite = allEls.length > 0 && hashClassCount / allEls.length > 0.3;

      if (isCSSinJSSite) {
        const cssJsCandidates = document.querySelectorAll("section, div, article");
        for (const el of cssJsCandidates) {
          if (!isVisibleFn(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width <= viewportWidth * 0.75) continue;
          if (rect.height <= 150) continue;
          if (!hasOwnBackgroundFn(el)) continue;
          addElement(el, "medium");
        }
      }

      // STEP 4 — Geometry fallback
      if (found.length < 3) {
        const blockCandidates = document.querySelectorAll("div, section, article, main");
        for (const el of blockCandidates) {
          if (seen.has(el)) continue;
          if (!isVisibleFn(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width <= viewportWidth * 0.75) continue;
          if (rect.height <= 100) continue;

          let parent = el.parentElement;
          let hasParentInResults = false;
          while (parent) {
            if (seen.has(parent)) {
              hasParentInResults = true;
              break;
            }
            parent = parent.parentElement;
          }
          if (hasParentInResults) continue;

          addElement(el, "low");
        }
      }

      function buildResult(entry) {
        const rect = entry.el.getBoundingClientRect();
        return {
          el: entry.el,
          label: detectLabelFn(entry.el),
          selector: getSelectorFn(entry.el),
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
          confidence: entry.confidence,
          tagName: entry.el.tagName.toLowerCase()
        };
      }

      let results = found.map(buildResult);

      // STEP 5 — Above fold guarantee
      const hasAboveFold = results.some((r) => r.y < viewportHeight);
      if (!hasAboveFold) {
        const candidates = document.querySelectorAll("div, section, article, main");
        for (const el of candidates) {
          if (seen.has(el)) continue;
          if (!isVisibleFn(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < viewportWidth * 0.5) continue;
          if (rect.height < 100) continue;

          seen.add(el);
          results.push(buildResult({ el, confidence: "low" }));
          break;
        }
      }

      // Remove tiny (allow compact nav/header chrome)
      results = results.filter((r) => {
        const minHeight =
          r.tagName === "nav" || r.tagName === "header" ? 50 : 80;
        return r.height >= minHeight;
      });

      // Remove Y overlaps: keep higher confidence, then taller
      const confRank = { high: 3, medium: 2, low: 1 };
      function overlaps(a, b) {
        const aEnd = a.y + a.height;
        const bEnd = b.y + b.height;
        return a.y < bEnd && b.y < aEnd;
      }

      const kept = [];
      for (const r of results) {
        let shouldKeep = true;
        for (let i = 0; i < kept.length; i++) {
          const other = kept[i];
          if (!overlaps(r, other)) continue;

          const rRank = confRank[r.confidence] || 0;
          const oRank = confRank[other.confidence] || 0;

          if (rRank > oRank || (rRank === oRank && r.height > other.height)) {
            kept.splice(i, 1);
            i--;
          } else {
            shouldKeep = false;
            break;
          }
        }
        if (shouldKeep) kept.push(r);
      }
      results = kept;

      // Remove nested: keep outer unless inner is high confidence
      const elToResult = new Map(results.map((r) => [r.el, r]));
      const dropped = new Set();

      for (const r of results) {
        if (dropped.has(r.el)) continue;

        let parent = r.el.parentElement;
        while (parent) {
          if (elToResult.has(parent)) {
            const outer = elToResult.get(parent);
            const innerIsSection = r.tagName === "section";
            const outerIsWrapper =
              outer.tagName === "div" ||
              outer.tagName === "main" ||
              outer.tagName === "article";

            // Prefer granular sections inside main/div over one giant wrapper.
            if (innerIsSection && outerIsWrapper) {
              dropped.add(outer.el);
            } else if (r.confidence === "high" && outer.confidence !== "high") {
              dropped.add(outer.el);
            } else if (
              outerIsWrapper &&
              (r.tagName === "header" ||
                r.tagName === "nav" ||
                r.tagName === "footer")
            ) {
              dropped.add(outer.el);
            } else {
              dropped.add(r.el);
            }
            break;
          }
          parent = parent.parentElement;
        }
      }

      results = results.filter((r) => !dropped.has(r.el));

      // Split monolithic main/div when the page is one tall wrapper (common on SPAs).
      if (results.length === 1) {
        const only = results[0];
        const isWrapper = only.tagName === "main" || only.tagName === "div";
        if (isWrapper && only.height >= viewportHeight * 1.15) {
          const container = only.el;
          const innerSections = Array.from(
            container.querySelectorAll("section")
          ).filter(isVisibleFn);
          const blockPool =
            innerSections.length >= 2
              ? innerSections
              : Array.from(
                  container.querySelectorAll(":scope > section, :scope > div, :scope > article")
                ).filter(isVisibleFn);

          const childResults = [];
          for (const el of blockPool) {
            const rect = el.getBoundingClientRect();
            if (rect.height < 80) continue;
            if (rect.width < viewportWidth * 0.5) continue;
            childResults.push(
              buildResult({ el, confidence: "medium" })
            );
          }

          if (childResults.length >= 2) {
            childResults.sort((a, b) => a.y - b.y);
            results = childResults;
          } else if (only.height >= viewportHeight * 2) {
            // Last resort: slice the wrapper into viewport-sized vertical bands.
            const bandCount = Math.min(
              8,
              Math.max(2, Math.ceil(only.height / viewportHeight))
            );
            const bandHeight = only.height / bandCount;
            const bands = [];
            for (let i = 0; i < bandCount; i += 1) {
              bands.push({
                index: i,
                label:
                  i === 0
                    ? "Hero"
                    : i === bandCount - 1
                      ? "Footer"
                      : `Section ${i + 1}`,
                selector: only.selector,
                x: only.x,
                y: only.y + i * bandHeight,
                width: only.width,
                height: bandHeight,
                confidence: "low",
                tagName: "split"
              });
            }
            results = bands;
          }
        }
      }

      // Sort by Y ascending
      results.sort((a, b) => a.y - b.y);

      // Dedupe labels by appending " 1", " 2"
      const labelCounts = {};
      for (const r of results) {
        labelCounts[r.label] = (labelCounts[r.label] || 0) + 1;
      }
      const labelSeen = {};
      for (const r of results) {
        if (labelCounts[r.label] > 1) {
          labelSeen[r.label] = (labelSeen[r.label] || 0) + 1;
          r.label = `${r.label} ${labelSeen[r.label]}`;
        }
      }

      return results.map((r, index) => ({
        index,
        label: r.label,
        selector: r.selector,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        confidence: r.confidence,
        tagName: r.tagName
      }));
    },
    {
      helpers: helperSources,
      keywords: SECTION_KEYWORDS,
      semanticSelector: SEMANTIC_SELECTOR
    }
  );

  return sections;
}

export async function buildFallbackSections(page) {
  return page.evaluate(() => {
    const width = window.innerWidth;
    const scrollHeight = document.documentElement.scrollHeight;
    const height = Math.max(window.innerHeight, Math.min(scrollHeight, window.innerHeight * 4));

    return [
      {
        index: 0,
        label: "Full Page",
        selector: "body",
        x: 0,
        y: 0,
        width,
        height,
        confidence: "low",
        tagName: "fallback"
      }
    ];
  });
}
