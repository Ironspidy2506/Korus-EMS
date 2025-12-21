
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#DC2626', // Red from logo
					foreground: '#FFFFFF',
					50: '#FEF2F2',
					100: '#FEE2E2',
					500: '#DC2626',
					600: '#B91C1C',
					700: '#991B1B'
				},
				secondary: {
					DEFAULT: '#F59E0B', // Gold from logo
					foreground: '#FFFFFF',
					50: '#FFFBEB',
					100: '#FEF3C7',
					500: '#F59E0B',
					600: '#D97706',
					700: '#B45309'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'bell-shake': {
					'0%': { transform: 'rotate(0deg) translateX(0)' },
					'10%': { transform: 'rotate(-15deg) translateX(-2px)' },
					'20%': { transform: 'rotate(15deg) translateX(2px)' },
					'30%': { transform: 'rotate(-12deg) translateX(-1px)' },
					'40%': { transform: 'rotate(12deg) translateX(1px)' },
					'50%': { transform: 'rotate(-10deg) translateX(-1px)' },
					'60%': { transform: 'rotate(10deg) translateX(1px)' },
					'70%': { transform: 'rotate(-8deg) translateX(-1px)' },
					'80%': { transform: 'rotate(8deg) translateX(1px)' },
					'90%': { transform: 'rotate(-5deg) translateX(0)' },
					'100%': { transform: 'rotate(0deg) translateX(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'bell-shake': 'bell-shake 0.6s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
