/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */

import "prettier-plugin-tailwindcss";

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "prettier-plugin-tailwindcss": {},
  },
};

export default config;
