import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // 1. Ігнорування файлів та директорій, які не повинні перевірятися
  globalIgnores(['dist', 'node_modules', 'landing', 'backend', 'eslint.config.js', 'docs', 'scripts']),
  
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    // 2. Базові правила лінтингу під потреби проєкту
    rules: {
      // Стиль та чистота: попереджати про оголошені змінні, які не використовуються
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      
      // Надійність: суворо вимагати строге порівняння (=== замість ==)
      'eqeqeq': 'error',
      
      // Продуктивність: попереджати про залишені відлагоджувальні console.log
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
])
