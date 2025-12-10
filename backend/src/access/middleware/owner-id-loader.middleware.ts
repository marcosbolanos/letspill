import { createMiddleware } from 'hono/factory';

export const ownerIdLoaderMiddleware = createMiddleware(async (c, next) => {
  //TODO: implement this and pass it to routes that require access
  // We currently use helper functions which are cluttering the code
})

