import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        gsap: 'readonly',
        imagesLoaded: 'readonly',
        // Additional browser globals
        getComputedStyle: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // External libraries
        Flip: 'readonly',
        Lenis: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
];
