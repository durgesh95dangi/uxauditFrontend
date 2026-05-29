function Svg({ children, size = 20, className = "", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconSparkles(props) {
  return (
    <Svg {...props}>
      <path d="M9.5 2.5 11 7l4.5 1.5L11 10l-1.5 4.5L7 10 2.5 8.5 7 7z" />
      <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
    </Svg>
  );
}

export function IconGlobe(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9c-2.5-2.8-4-6.2-4-9s1.5-6.2 4-9z" />
    </Svg>
  );
}

export function IconScreenshot(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.5" />
      <path d="m14 14-2.5-2.5L8 15l3 3 6-6" />
    </Svg>
  );
}

export function IconReport(props) {
  return (
    <Svg {...props}>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  );
}

export function IconPointer(props) {
  return (
    <Svg {...props}>
      <path d="M4 4l7 17 2.5-7.5L21 11z" />
    </Svg>
  );
}

export function IconGauge(props) {
  return (
    <Svg {...props}>
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M12 4v2M4.9 7.1l1.4 1.4M20 12h-2M19.1 7.1l-1.4 1.4M12 20v-2M7.1 19.1l1.4-1.4" />
    </Svg>
  );
}

export function IconEye(props) {
  return (
    <Svg {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.5" />
    </Svg>
  );
}

export function IconPhone(props) {
  return (
    <Svg {...props}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </Svg>
  );
}

export function IconShield(props) {
  return (
    <Svg {...props}>
      <path d="M12 3 20 6v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function IconText(props) {
  return (
    <Svg {...props}>
      <path d="M4 6h16M4 12h10M4 18h14" />
    </Svg>
  );
}

export function IconLink(props) {
  return (
    <Svg {...props}>
      <path d="M10 14a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M14 10a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" />
    </Svg>
  );
}

export function IconClock(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

export function IconList(props) {
  return (
    <Svg {...props}>
      <path d="M9 6h12M9 12h12M9 18h12" />
      <circle cx="4.5" cy="6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.25" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconAlert(props) {
  return (
    <Svg {...props}>
      <path d="M12 3 2.5 19h19z" />
      <path d="M12 10v4M12 17h.01" />
    </Svg>
  );
}

export function IconLayout(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </Svg>
  );
}

export function IconFile(props) {
  return (
    <Svg {...props}>
      <path d="M8 3h6l4 4v14H8z" />
      <path d="M14 3v4h4" />
    </Svg>
  );
}

export function IconCheck(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </Svg>
  );
}

export function IconZap(props) {
  return (
    <Svg {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </Svg>
  );
}

export function IconStar(props) {
  return (
    <Svg {...props}>
      <path d="m12 3 2.4 5.6L20 9.5l-4.5 4.1L16.8 20 12 17.2 7.2 20l1.3-6.4L4 9.5l5.6-.9z" />
    </Svg>
  );
}

export function IconUsers(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M17 8.5a2.5 2.5 0 1 1 0 5M21 19c0-2.2-1.6-4-3.8-4.5" />
    </Svg>
  );
}

export function IconScan(props) {
  return (
    <Svg {...props}>
      <path d="M4 7V5a1 1 0 0 1 1-1h2M20 7V5a1 1 0 0 0-1-1h-2M4 17v2a1 1 0 0 0 1 1h2M20 17v2a1 1 0 0 1-1 1h-2" />
      <path d="M7 12h10" />
    </Svg>
  );
}

export function IconArrowRight(props) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconStackNext(props) {
  return (
    <Svg {...props} fill="currentColor" stroke="none">
      <path d="M12 4 5 8v8l7 4 7-4V8z" opacity="0.35" />
      <path d="M12 4v16l7-4V8z" />
    </Svg>
  );
}

export function IconStackShopify(props) {
  return (
    <Svg {...props} fill="currentColor" stroke="none">
      <path d="M12 3c-1 2.5-3 4.5-5.5 5.8C8.5 10.5 10 12.5 12 14c2-1.5 3.5-3.5 5.5-5.2C15 7.5 13 5.5 12 3z" />
      <path d="M8 16c1.5 1 3.2 1.8 4 2 1.5-.8 3.5-2.2 5-3.8-1.2-.8-2.8-1.5-4-2-1.2.5-3 1.5-5 1.8z" opacity="0.55" />
    </Svg>
  );
}

export function IconStackWebflow(props) {
  return (
    <Svg {...props}>
      <path d="M5 8h14l-2 8H7z" fill="currentColor" stroke="none" />
      <path d="M8 8l2 8M12 8l-2 8M14 8l2 8M16 8l-2 8" />
    </Svg>
  );
}

export function IconStackWordpress(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 9.5c.5 3 1.5 5.5 3.5 7.5M15 8c-2 2.5-3 5-3 8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconStackReact(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="2.25" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
    </Svg>
  );
}

const STACK_ICON_MAP = {
  "Next.js": IconStackNext,
  Shopify: IconStackShopify,
  Webflow: IconStackWebflow,
  WordPress: IconStackWordpress,
  "React SPAs": IconStackReact
};

export function StackIcon({ name, ...props }) {
  const Icon = STACK_ICON_MAP[name] || IconGlobe;
  return <Icon {...props} />;
}

export function IconBadge({ icon: Icon, tone = "indigo", className = "" }) {
  return (
    <span className={`landing-icon-badge landing-icon-badge--${tone} ${className}`.trim()}>
      <Icon size={22} />
    </span>
  );
}

export function SectionEyebrow({ icon: Icon, children, center = false }) {
  return (
    <p className={`section-eyebrow${center ? " section-eyebrow-center" : ""}`}>
      {Icon ? <Icon size={14} /> : null}
      {children}
    </p>
  );
}
