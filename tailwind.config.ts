import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            fontFamily: {
                'poppins': ['Poppins', 'sans-serif'], // Font family for Poppins
                'brice': ['Brice', 'sans-serif'],       // Generic font family for Brice (if you want to use 'Brice' as a general font)
                'brice-bold-semi-condensed': ['Brice Bold Semi Condensed', 'sans-serif'], // Specific Brice variant
                'brice-extra-light-semi-expanded': ['Brice Extra Light Semi Expanded', 'sans-serif'], // ... and so on for other Brice variants
                'brice-light-expanded': ['Brice Light Expanded', 'sans-serif'],
                'brice-bold-expanded': ['Brice Bold Expanded', 'sans-serif'],
                'brice-light-semi-condensed': ['Brice Light Semi Condensed', 'sans-serif'],
                'brice-bold-semi-expanded': ['Brice Bold Semi Expanded', 'sans-serif'],
                'brice-extra-light-condensed': ['Brice Extra Light Condensed', 'sans-serif'],
                'brice-black': ['Brice', 'sans-serif'], // Using 'Brice' family name for Brice-Black.ttf if it's your base 'Brice'
                'brice-expanded': ['Brice Expanded', 'sans-serif'],
                'brice-light-semi-expanded': ['Brice Light Semi Expanded', 'sans-serif'],
                'brice-black-semi-condensed': ['Brice Black Semi Condensed', 'sans-serif'],
                'brice-black-condensed': ['Brice Black Condensed', 'sans-serif'],
                'brice-black-semi-expanded': ['Brice Black Semi Expanded', 'sans-serif'],
                'brice-light': ['Brice Light', 'sans-serif'], // Using 'Brice Light' family name for Brice-Light.ttf
                'brice-light-condensed': ['Brice Light Condensed', 'sans-serif'],
                'brice-extra': ['Brice Extra', 'sans-serif'], // Using 'Brice Extra' for Brice-ExtraLight.ttf
                'brice-bold': ['Brice Bold', 'sans-serif'], // Using 'Brice Bold' for Brice-Bold.ttf
                'brice-extra-light-expanded': ['Brice Extra Light Expanded', 'sans-serif'],
                'brice-bold-condensed': ['Brice Bold Condensed', 'sans-serif'],
                'brice-extra-light-semi-condensed': ['Brice Extra Light Semi Condensed', 'sans-serif'],
                'brice-black-expanded': ['Brice Black Expanded', 'sans-serif'],
                'brice-semi-condensed': ['Brice Semi Condensed', 'sans-serif'],
                'brice-semi-expanded': ['Brice Semi Expanded', 'sans-serif'],
                'brice-semi-bold-semi-condensed': ['Brice Semi Bold Semi Condensed', 'sans-serif'],
                'brice-semi-bold-expanded': ['Brice Semi Bold Expanded', 'sans-serif'],
                'brice-semi-bold-condensed': ['Brice Semi Bold Condensed', 'sans-serif'],
                'brice-semi': ['Brice Semi', 'sans-serif'], // Using 'Brice Semi' for Brice-SemiBold.ttf
                'brice-regular': ['Brice', 'sans-serif'],  // Using 'Brice' family name for Brice-Regular.ttf
                'brice-semi-bold-semi-expanded': ['Brice Semi Bold Semi Expanded', 'sans-serif'],

                sans: ['Poppins', ...require('tailwindcss/defaultTheme').fontFamily.sans], // Set Poppins as default sans-serif
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;