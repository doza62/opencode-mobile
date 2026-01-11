module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  jsxSingleQuote: false,
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
  ],
};
