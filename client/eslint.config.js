import eslintReact from '@eslint-react/eslint-plugin';
import eslintJs from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig([
    { ignores: ['dist'] },
    {
        files: ['**/*.{js,jsx}'],
        extends: [
            eslintJs.configs.recommended,
            eslintReact.configs.recommended,
            eslintReact.configs['disable-conflict-eslint-plugin-react-hooks'],
        ],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
            'no-case-declarations': 'warn',
            'react-hooks/rules-of-hooks': 'error',
            'react-refresh/only-export-components': 'off',
            '@eslint-react/no-use-context': 'off',
            '@eslint-react/no-context-provider': 'off',
        },
    },
]);
