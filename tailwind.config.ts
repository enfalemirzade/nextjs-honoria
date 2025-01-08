import daisyui from "daisyui";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        'bottom-sm': '0 3px 0px 0 rgba(0, 0, 0, 0.2)'
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["dark"]
  }
}

export default config
