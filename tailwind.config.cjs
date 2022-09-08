module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
  darkMode: 'class',
	plugins: [require("@tailwindcss/typography"), require("daisyui"), require('tailwind-scrollbar')],
  daisyui: {
    styled: true,
    themes: ["garden","winter"],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "garden",
  },
};
