/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2A7FD4',
          light: '#EBF4FF',
        },
        secondary: '#0EA5E9',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        text: '#0F172A',
        muted: '#64748B',
      },
      fontFamily: {
        sans:     ['Inter', 'system-ui', 'sans-serif'],
        inter:    ['Inter', 'system-ui', 'sans-serif'],
        playfair: ['Playfair Display', 'Georgia', 'serif'],
      },

      // ─── Typography — Major Third (1.25) scale ───────────────────────────
      //
      // Anchor: body = 1rem (16px).  Steps up × 1.25 per level:
      //   H5  = 1rem × 1.25¹ = 1.25rem  (20px)
      //   H4  = 1rem × 1.25² = 1.5625rem (25px)
      //   H3  = 1rem × 1.25³ ≈ 2rem      (32px)   ← corrected (was 1.25rem!)
      //   H2  = 1rem × 1.25⁴ ≈ 2.5rem   (40px)   ← kept, very close to scale
      //   H1  = 1rem × 1.25⁵ ≈ 3.5rem   (56px)   ← kept desktop ref; scale gives 3.05rem
      //   Dis = 1rem × 1.25⁶ ≈ 5rem     (80px)   ← kept desktop ref; scale gives 3.8rem
      //
      // Fluid (clamp) targets:
      //   minVW = 320px (20rem)  |  maxVW = 1440px (90rem)  |  span = 70rem
      //   preferred = intercept + slope·vw
      //   intercept = min − slope × minVW
      //   slope     = (max − min) / 70
      //
      fontSize: {
        // Major Third (×1.25) scale — base 16px = 1rem
        //
        // minVW=320px(20rem)  maxVW=1440px(90rem)  span=70rem
        // slope=(max−min)/70   intercept=min−slope×20

        // Display — kept separate for hero/decorative use
        // min=2.5rem  max=5rem  slope=0.0357→3.57vw  intercept=1.79rem
        'display': [
          'clamp(2.5rem, 1.79rem + 3.57vw, 5rem)',
          { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' },
        ],

        // H1 = 1.25^6 = 3.815rem
        // min=2.3rem  slope=(3.815−2.3)/70=0.0216→2.16vw  intercept=1.87rem
        'h1': [
          'clamp(2.3rem, 1.87rem + 2.16vw, 3.815rem)',
          { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' },
        ],

        // H2 = 1.25^5 = 3.052rem
        // min=1.9rem  slope=(3.052−1.9)/70=0.0165→1.65vw  intercept=1.57rem
        'h2': [
          'clamp(1.9rem, 1.57rem + 1.65vw, 3.052rem)',
          { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' },
        ],

        // H3 = 1.25^4 = 2.441rem
        // min=1.5rem  slope=(2.441−1.5)/70=0.0134→1.34vw  intercept=1.23rem
        'h3': [
          '2.2rem',
          { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' },
        ],

        // H4 = 1.25^3 = 1.953rem
        // min=1.3rem  slope=(1.953−1.3)/70=0.0093→0.93vw  intercept=1.11rem
        'h4': [
          'clamp(1.3rem, 1.11rem + 0.93vw, 1.953rem)',
          { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' },
        ],

        // H5 = 1.25^2 = 1.5625rem — static
        'h5': [
          '1.5625rem',
          { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' },
        ],

        // Body Large = 1.25^1 = 1.25rem
        'body-lg': [
          '1.25rem',
          { lineHeight: '1.65' },
        ],

        // Body = 1rem (base)
        'body': [
          '1rem',
          { lineHeight: '1.6' },
        ],

        // Body Small = 0.9rem
        'body-sm': [
          '0.9rem',
          { lineHeight: '1.6' },
        ],

        // Caption — same size as body
        'caption': [
          '1rem',
          { lineHeight: '1.6' },
        ],

        // Stat — large decorative numbers (WhyChooseUs section)
        // min=3.5rem  max=4.5rem  slope=0.0143→1.43vw  intercept=3.21rem
        'stat': [
          'clamp(3.5rem, 3.21rem + 1.43vw, 4.5rem)',
          { lineHeight: '1', letterSpacing: '-0.04em' },
        ],
      },

      spacing: {
        'xs':  '0.5rem',
        'sm':  '1rem',
        'md':  '1.5rem',
        'lg':  '2.5rem',
        'xl':  '4rem',
        '2xl': '6rem',
        '3xl': '8rem',
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(42,127,212,0.12), 0 1px 3px rgba(0,0,0,0.06)',
        'nav':        '0 1px 0 rgba(0,0,0,0.06)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
