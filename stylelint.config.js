export default {
  ignores: ['dist/**', '.vite-out/**', 'node_modules/**'],
  rules: {
    'at-rule-no-unknown': [true, { ignoreAtRules: ['custom-variant', 'theme', 'utility', 'layer'] }],
  },
}
