/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                metro: {
                    50: '#f0f4ff',
                    100: '#dbe4ff',
                    200: '#bac8ff',
                    300: '#91a7ff',
                    400: '#748ffc',
                    500: '#5c7cfa',
                    600: '#4c6ef5',
                    700: '#4263eb',
                    800: '#3b5bdb',
                    900: '#364fc7',
                    950: '#1e3a8a',
                },
                accent: {
                    50: '#fff3e0',
                    100: '#ffe0b2',
                    200: '#ffcc80',
                    300: '#ffb74d',
                    400: '#ffa726',
                    500: '#ff9800',
                    600: '#fb8c00',
                    700: '#f57c00',
                    800: '#ef6c00',
                    900: '#e65100',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            animation: {
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'fade-in': 'fadeIn 0.4s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'train-move': 'trainMove 3s ease-in-out infinite',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-20px)', opacity: 0 },
                    '100%': { transform: 'translateX(0)', opacity: 1 },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(92,124,250,0.3)' },
                    '50%': { boxShadow: '0 0 20px rgba(92,124,250,0.6)' },
                },
                trainMove: {
                    '0%': { transform: 'translateX(-100%)' },
                    '50%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
            },
        },
    },
    plugins: [],
};
