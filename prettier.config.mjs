// prettier.config.mjs
/** @type {import("prettier").Config} */
const config = {
  trailingComma: "none",
  singleQuote: true,
  printWidth: 80,
  plugins: [],
  overrides: [
    {
      files: "*.html",
      options: {
        parser: "angular",
      },
    },
    {
      files: ["*.ts", "*.js"],
      options: {
        parser: "typescript",
      },
    },
    {
      files: ["*.json"],
      options: {
        parser: "json",
        tabWidth: 2,
      },
    },
  ],
};

export default config;
