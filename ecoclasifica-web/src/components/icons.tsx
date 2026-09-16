// Íconos SVG soft-rounded, tomados 1:1 del mockup de diseño aprobado.
// Todos comparten el mismo estilo: trazo (no relleno), esquinas y
// uniones redondeadas.

import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 22, children, ...props }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconLeaf = (p: Props) => (
  <Base {...p}><path d="M20 4C11 4 4 11 4 20c9 0 16-7 16-16Z" /><path d="M6.5 17.5 17 7" /></Base>
);
export const IconRecycle = (p: Props) => (
  <Base {...p}>
    <path d="M12 3.5 15 8.5H9Z" /><path d="M6.3 9 3.2 14.2l3 5.1" /><path d="M17.7 9l3.1 5.2-3 5.1" />
    <path d="M9 21h6" /><path d="M12 8.5V3.5" /><path d="M6.2 14.3H12" /><path d="M17.8 14.3H12" />
  </Base>
);
export const IconAi = (p: Props) => (
  <Base {...p}>
    <rect x="7" y="7" width="10" height="10" rx="3" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2" />
    <circle cx="10" cy="11" r=".6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13" r=".6" fill="currentColor" stroke="none" />
  </Base>
);
export const IconHome = (p: Props) => (
  <Base {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6.5 10v9.5a1 1 0 0 0 1 1H16.5a1 1 0 0 0 1-1V10" /></Base>
);
export const IconScan = (p: Props) => (
  <Base {...p}><rect x="4" y="7" width="16" height="12" rx="3" /><circle cx="12" cy="13" r="3.2" /><path d="M9 7 10.2 5h3.6L15 7" /></Base>
);
export const IconClock = (p: Props) => (
  <Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Base>
);
export const IconUser = (p: Props) => (
  <Base {...p}><circle cx="12" cy="8.3" r="3.3" /><path d="M5 20c1-3.8 4-5.8 7-5.8s6 2 7 5.8" /></Base>
);
export const IconChart = (p: Props) => (
  <Base {...p}><path d="M5 19V10M12 19V5M19 19v-6" /><path d="M3 19h18" /></Base>
);
export const IconMail = (p: Props) => (
  <Base {...p}><rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="M4.5 7 12 12.5 19.5 7" /></Base>
);
export const IconLock = (p: Props) => (
  <Base {...p}><rect x="5" y="11" width="14" height="9" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.2" r=".6" fill="currentColor" stroke="none" /></Base>
);
export const IconEye = (p: Props) => (
  <Base {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></Base>
);
export const IconEyeOff = (p: Props) => (
  <Base {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /><path d="M4 20 20 4" /></Base>
);
export const IconChevronRight = (p: Props) => (<Base {...p}><path d="M9 5l7 7-7 7" /></Base>);
export const IconChevronLeft = (p: Props) => (<Base {...p}><path d="M15 5 8 12l7 7" /></Base>);
export const IconBolt = (p: Props) => (<Base {...p}><path d="M13 3 5 13.5h5.5L11 21l8-11h-5.5Z" /></Base>);
export const IconFlip = (p: Props) => (
  <Base {...p}><path d="M4 12a8 8 0 0 1 13.5-5.8M20 12a8 8 0 0 1-13.5 5.8" /><path d="M17 3v4h-4M7 21v-4h4" /></Base>
);
export const IconImage = (p: Props) => (
  <Base {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="M4.5 17 9.5 12l3 3 3-4 4 4.5" /></Base>
);
export const IconSearch = (p: Props) => (<Base {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.3-4.3" /></Base>);
export const IconCheck = (p: Props) => (<Base {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Base>);
export const IconShield = (p: Props) => (
  <Base {...p}><path d="M12 3.5 19 6.3v5.4c0 5-3 7.9-7 8.8-4-.9-7-3.8-7-8.8V6.3Z" /><path d="M9 12l2 2 4-4.5" /></Base>
);
export const IconHelp = (p: Props) => (
  <Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.3a2.6 2.6 0 1 1 3.7 2.4c-.9.5-1.2 1-1.2 2" /><circle cx="12" cy="16.7" r=".7" fill="currentColor" stroke="none" /></Base>
);
export const IconInfo = (p: Props) => (
  <Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.2" /><circle cx="12" cy="8" r=".7" fill="currentColor" stroke="none" /></Base>
);
export const IconLogout = (p: Props) => (
  <Base {...p}><path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" /><path d="M15 8l5 4-5 4" /><path d="M20 12H9" /></Base>
);
export const IconEdit = (p: Props) => (
  <Base {...p}><path d="M4 20l1-4.2L15.2 5.6a1.8 1.8 0 0 1 2.6 0l.6.6a1.8 1.8 0 0 1 0 2.6L8.2 19 4 20Z" /></Base>
);
export const IconStar = (p: Props) => (
  <Base {...p}><path d="M12 3.5l2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17.3l-5.4 2.9 1-6.1L3.2 9.9l6.1-.8Z" /></Base>
);
export const IconDroplet = (p: Props) => (
  <Base {...p}><path d="M12 3.5c3 4 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 11.5 9 7.5 12 3.5Z" /></Base>
);
export const IconTree = (p: Props) => (
  <Base {...p}><path d="M12 3l5 6.5h-3l4 5.5h-4.2V21h-3.6v-6h-4.2l4-5.5H8Z" /></Base>
);
export const IconBin = (p: Props) => (
  <Base {...p}>
    <path d="M5 8h14" /><path d="M9 8V6.2A1.2 1.2 0 0 1 10.2 5h3.6A1.2 1.2 0 0 1 15 6.2V8" />
    <path d="M6.5 8 7.3 19a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 8" /><path d="M10.3 11.5v6M13.7 11.5v6" />
  </Base>
);
export const IconAward = (p: Props) => (
  <Base {...p}><circle cx="12" cy="9" r="5.2" /><path d="M9 13.5 7.6 20.5 12 18l4.4 2.5L15 13.5" /></Base>
);
export const IconWarning = (p: Props) => (
  <Base {...p}>
    <path d="M12 3.5 21 19.5H3Z" /><path d="M12 9.5v4.5" /><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none" />
  </Base>
);
export const IconBottle = (p: Props) => (
  <Base {...p}><path d="M10 3h4v2.6l1.4 1.8V19a2 2 0 0 1-2 2h-2.8a2 2 0 0 1-2-2V7.4L10 5.6Z" /><path d="M9.6 11.5h4.8" /></Base>
);
export const IconUsers = (p: Props) => (
  <Base {...p}>
    <circle cx="9" cy="8.3" r="3.1" /><path d="M3 20c.9-3.6 3.6-5.5 6-5.5s5.1 1.9 6 5.5" />
    <path d="M15.5 6.2a3 3 0 0 1 0 5.8" /><path d="M16.5 14.6c2.1.5 3.7 2.3 4.3 5" />
  </Base>
);
export const IconX = (p: Props) => (<Base {...p}><path d="M5 5l14 14M19 5 5 19" /></Base>);
export const IconSettings = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V19a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" />
  </Base>
);
export const IconGrid = (p: Props) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" /><rect x="13" y="13" width="7.5" height="7.5" rx="2" />
  </Base>
);
export const IconBuilding = (p: Props) => (
  <Base {...p}>
    <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
    <path d="M9 8h1.2M9 12h1.2M9 16h1.2M13.8 8H15M13.8 12H15M13.8 16H15" />
  </Base>
);
export const IconBell = (p: Props) => (
  <Base {...p}>
    <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14.5 6 10.5Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Base>
);
export const IconTrendUp = (p: Props) => (
  <Base {...p}><path d="M3.5 16 9.5 10l4 4 6.5-7.5" /><path d="M15 6.3h5v5" /></Base>
);
export const IconDatabase = (p: Props) => (
  <Base {...p}>
    <ellipse cx="12" cy="6" rx="7.5" ry="3" /><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
    <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
  </Base>
);
