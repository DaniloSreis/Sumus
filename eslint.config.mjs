import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Aplica as regras base do ESLint (o js.configs.recomended)
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        L: 'readonly',
        jwtDecode: "randonly",
        google: "randoly",
        ...globals.browser,
        ...globals.node, // adicionamos node para reconhecer "module"
      },
    },
    rules: {
      'no-unused-vars': 'warn', // Avisa se criar variável e não usar
      'no-undef': 'error', // Dá erro se usar variável que não existe
      eqeqeq: 'error', // Obriga usar === (evita bugs de lógica)
      'prefer-const': 'warn', // Sugere usar const se o valor não muda
      'no-console': 'off', // Deixa o console.log liberado
    },
  },

  prettierConfig,
];
