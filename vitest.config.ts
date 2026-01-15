import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // чтобы не писать import { describe, it } в каждом файле
    environment: 'node', // Node.js окружение
    coverage: {
      provider: 'v8', // рекомендуемый провайдер покрытия для Node.js
      reporter: ['text', 'lcov'],
    },
  },
});
