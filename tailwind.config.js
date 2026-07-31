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
        // Display  min=2.25rem  max=5rem
        // slope=(5−2.25)/70=0.0393 → 3.93vw  intercept=2.25−0.786=1.46rem
        // Display  min=2.5rem  max=5rem
        // slope=(5−2.5)/70=0.0357 → 3.57vw  intercept=2.5−0.714=1.79rem
        'display': [
          'clamp(2.5rem, 1.79rem + 3.57vw, 5rem)',
          { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' },
        ],

        // H1  min=2.2rem  max=3.5rem
        // slope=(3.5−2.2)/70=0.0186 → 1.86vw  intercept=2.2−0.371=1.83rem
        'h1': [
          'clamp(2.2rem, 1.83rem + 1.86vw, 3.5rem)',
          { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' },
        ],

        // H2  min=1.75rem  max=2.5rem
        // slope=(2.5−1.75)/70=0.0107 → 1.07vw  intercept=1.75−0.214=1.54rem
        'h2': [
          'clamp(1.75rem, 1.54rem + 1.07vw, 2.5rem)',
          { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' },
        ],

        // H3  min=1.5rem  max=2rem
        // slope=(2−1.5)/70=0.00714 → 0.71vw  intercept=1.5−0.143=1.36rem
        'h3': [
          'clamp(1.5rem, 1.36rem + 0.71vw, 2rem)',
          { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' },
        ],

        // H4  = 1.25² = 1.5625rem — static (narrow fluid range, not worth clamp)
        'h4': [
          '1.5625rem',
          { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' },
        ],

        // H5  = 1.25¹ = 1.25rem — static
        'h5': [
          '1.25rem',
          { lineHeight: '1.35', fontWeight: '600' },
        ],

        // Body Large — intermediate between body and H5
        'body-lg': [
          '1.125rem',
          { lineHeight: '1.65' },
        ],

        // Body — Tailwind base (1rem) aliased for explicit token usage
        'body': [
          '1rem',
          { lineHeight: '1.6' },
        ],

        // Body Small — practical small text (Tailwind's text-sm)
        'body-sm': [
          '0.875rem',
          { lineHeight: '1.6' },
        ],

        // Caption — same size as body
        'caption': [
          '1rem',
          { lineHeight: '1.6' },
        ],

        // Stat — large decorative numbers (WhyChooseUs section)
        // min=3.5rem(56px)  max=4.5rem(72px)
        // slope=(4.5−3.5)/70=0.0143 → 1.43vw  intercept=3.5−0.286=3.21rem
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
