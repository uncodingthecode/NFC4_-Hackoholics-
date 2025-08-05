import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        glow: '0 0 10px var(--glow-border)',
      },
      backgroundColor: {
        base: 'var(--background)', // for bg-base
        card: 'var(--card)',       // for bg-card
      },
      textColor: {
        base: 'var(--foreground)',     // for text-base
        muted: 'var(--muted-foreground)',
      },
    },
  },
  plugins: [],
};

export default config;
