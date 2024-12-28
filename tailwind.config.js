/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  safelist: [
    "justify-center",
    "justify-start",
    "justify-end",
    "justify-between",
    "justify-around",
     "sm:justify-center",
     "sm:justify-start",
     "sm:justify-end", 
     "hidden",
     "aspect-square",
     "aspect-video",
     "aspect-[16/9]",
     "aspect-[4/3]",
     "translate-y-1",
     "w-[360px]",
     "md:w-1/2",
     "h-[40vw]",
  ],
  theme: {
    screens: {
      sm: '560px',
      md: '768px',
      lg: '1024px',
      xl: '1340px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      light:'#C2D1D9',
      dark: '#424B5A',
    },
    extend: {
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'fast-slow':'cubic-bezier(.5,0,0,1)'
      },
      height: {
        'screen-75': '75vh',
        'screen-50': '50vh',
        'screen-25': '25vh',
        'screen-10': '10vh',
        'screen-5': '5vh',
        'screen-75': '75vh',
        'screen-50': '50vh',
        'screen-25': '25vh',
        'screen-10': '10vh',
        'screen-5': '5vh',
        'screen-75': '75vh',
        'screen-50': '50vh',
        'screen-25': '25vh',
        'screen-10': '10vh',
        'screen-5': '5vh',
        'screen-75': '75vh',
        'screen-50': '50vh',
        'screen-25': '25vh',
        'screen-10': '10vh',
        'screen-5': '5vh',
        'screen-75': '75vh',
        'screen-50': '50vh',
        'screen-25': '25vh',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '192': '48rem',
        '256': '64rem',
        '384': '96rem',
        '512': '128rem',
        '640': '160rem',
        'full': '100%',
        'screen': '100vh',
        'min': 'min-content',
        'max': 'max-content',
        'fit': 'fit-content',
        'proportion': 'proportion'
      }
    },
  },
  plugins: [],
}

