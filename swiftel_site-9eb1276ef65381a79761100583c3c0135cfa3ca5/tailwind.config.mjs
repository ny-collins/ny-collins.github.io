/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          'dark': withOpacity('--color-primary-dark'),
        },
        accent: {
          DEFAULT: withOpacity('--color-accent'),
          'dark': withOpacity('--color-accent-dark'),
        },
        'secondary-accent': withOpacity('--color-secondary-accent'),
      },
      textColor: {
        DEFAULT: withOpacity('--color-text'),
        muted: withOpacity('--color-text-muted'),
      },
      backgroundColor: {
        DEFAULT: withOpacity('--color-bg'),
        card: withOpacity('--color-bg-card'),
        border: withOpacity('--color-border'),
      },
      borderColor: {
        DEFAULT: withOpacity('--color-border'),
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(6deg)' },
          '50%': { transform: 'rotate(-6deg)' },
          '75%': { transform: 'rotate(4deg)' },
        }
      },
      animation: {
        wiggle: 'wiggle 0.4s ease-in-out',
      }
    },
  },
  plugins: [],
}