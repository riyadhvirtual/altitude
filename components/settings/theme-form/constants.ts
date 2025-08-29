import { z } from 'zod';

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  callsign: z.string(),
  theme: z
    .string()
    .trim()
    .refine(
      (v) =>
        v === 'default' ||
        /^[a-z0-9-]+$/i.test(v) ||
        /^https?:\/\//i.test(v) ||
        /^\/.+\.css$/i.test(v),
      'Use a preset slug (e.g., aviation-blue), "default", an absolute URL, or a CSS path beginning with /'
    ),
  callsignMinRange: z.number(),
  callsignMaxRange: z.number(),
});

export type FormValues = z.infer<typeof schema>;

export const themes = [
  {
    value: 'default',
    label: 'Default Theme',
    colors: {
      primary: '#000000',
      secondary: '#f5f5f5',
      accent: '#e5e5e5',
      panel: '#f7f7f8',
    },
  },
  {
    value: 'aviation-blue',
    label: 'Aviation Blue',
    colors: {
      primary: '#1e40af',
      secondary: '#dbeafe',
      accent: '#bfdbfe',
      panel: '#f0f9ff',
    },
  },
  {
    value: 'corporate-red',
    label: 'Corporate Red',
    colors: {
      primary: '#dc2626',
      secondary: '#fecaca',
      accent: '#f87171',
      panel: '#fef2f2',
    },
  },
  {
    value: 'executive-green',
    label: 'Executive Green',
    colors: {
      primary: '#059669',
      secondary: '#a7f3d0',
      accent: '#6ee7b7',
      panel: '#ecfdf5',
    },
  },
  {
    value: 'premium-purple',
    label: 'Premium Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#ddd6fe',
      accent: '#c4b5fd',
      panel: '#f5f3ff',
    },
  },
] as const;

export type Preview = {
  primary: string;
  secondary: string;
  accent: string;
  panel: string;
};

export const TEMPLATE_CSS = `@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.98 0.005 240);
  --foreground: oklch(0.15 0.02 240);

  --card: oklch(0.96 0.01 240);
  --card-foreground: oklch(0.2 0.03 240);

  --primary: #0f172a;
  --primary-foreground: #ffffff;

  --secondary: oklch(0.9 0.02 240);
  --secondary-foreground: oklch(0.2 0.03 240);

  --muted: oklch(0.94 0.01 240);
  --muted-foreground: oklch(0.5 0.02 240);

  --accent: oklch(0.85 0.03 240);
  --accent-foreground: oklch(0.25 0.03 240);

  --destructive: oklch(0.64 0.21 25);
  --destructive-foreground: #ffffff;

  --success: oklch(0.6 0.12 140);
  --success-foreground: #ffffff;

  --border: oklch(0.88 0.02 240);
  --input: oklch(0.9 0.02 240);
  --ring: var(--primary);

  --panel-background: var(--card);
  --panel-foreground: var(--card-foreground);
  --panel-primary: var(--primary);
  --panel-primary-foreground: var(--primary-foreground);
  --panel-accent: var(--secondary);
  --panel-accent-foreground: var(--secondary-foreground);
  --panel-border: var(--border);
  --panel-ring: var(--ring);

  --dropdown-background: oklch(0.97 0.008 240);
  --dropdown-foreground: oklch(0.2 0.03 240);

  --nav-hover: oklch(0.95 0 0);
}

.dark {
  --background: oklch(0.18 0.01 240);
  --foreground: oklch(0.96 0.005 240);

  --card: oklch(0.24 0.015 240);
  --card-foreground: oklch(0.98 0.005 240);

  --primary: #93c5fd;
  --primary-foreground: #0b1220;

  --secondary: oklch(0.28 0.025 240);
  --secondary-foreground: oklch(0.95 0.005 240);

  --muted: oklch(0.22 0.02 240);
  --muted-foreground: oklch(0.7 0.01 240);

  --accent: oklch(0.32 0.04 240);
  --accent-foreground: oklch(0.98 0.005 240);

  --destructive: oklch(0.56 0.19 25);
  --destructive-foreground: oklch(0.96 0.005 240);

  --success: oklch(0.6 0.12 140);
  --success-foreground: oklch(0.96 0.005 240);

  --border: oklch(0.32 0.02 240);
  --input: oklch(0.26 0.025 240);
  --ring: var(--primary);

  --panel-background: oklch(0.22 0.012 240);
  --panel-foreground: oklch(0.96 0.005 240);
  --panel-primary: var(--primary);
  --panel-primary-foreground: var(--primary-foreground);
  --panel-accent: oklch(0.36 0.05 240);
  --panel-accent-foreground: oklch(0.98 0.005 240);
  --panel-border: oklch(0.26 0.025 240);
  --panel-ring: var(--ring);

  --dropdown-background: oklch(0.22 0.012 240);
  --dropdown-foreground: oklch(0.96 0.005 240);

  --nav-hover: oklch(0.32 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-panel: var(--panel-background);
  --color-panel-foreground: var(--panel-foreground);
  --color-panel-primary: var(--panel-primary);
  --color-panel-primary-foreground: var(--panel-primary-foreground);
  --color-panel-accent: var(--panel-accent);
  --color-panel-accent-foreground: var(--panel-accent-foreground);
  --color-panel-border: var(--panel-border);
  --color-panel-ring: var(--panel-ring);
  --color-dropdown: var(--dropdown-background);
  --color-dropdown-foreground: var(--dropdown-foreground);
  --color-overlay: var(--overlay);
  --color-nav-hover: var(--nav-hover);
}
`;
