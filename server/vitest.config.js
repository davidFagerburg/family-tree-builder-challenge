import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.test.js', 'test/**/*.test.js'],
        environment: 'node',
        globals: true,
    },
    plugins: [
    {
      name: 'sql-loader',
      transform(code, id) {
        if (id.endsWith('.sql')) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null,
          };
        }
      },
    },
  ]
})
