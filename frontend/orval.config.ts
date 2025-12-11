export default {
  myApi: {
    input: 'http://localhost:3000/doc',
    output: {
      client: 'react-query',
      target: 'api/orval/generated.ts',
      mode: 'tags-split',
      override: {
        mutator: {
          path: 'api/client.ts',
          name: 'customInstance',
        },
        zod: {
          strict: {
            response: true,
          },
        },
      },
    },
  },
  validation: {
    input: 'http://localhost:3000/doc',
    output: {
      client: 'zod',
      target: 'api/zod/generated.ts',
      mode: 'tags-split',
    },
  }
}
