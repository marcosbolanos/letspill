import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from '../lib/auth';

import 'dotenv/config';

import loginController from './login/login-controller'
import sessionController from './session/session-controller'
import sessionMiddleware from './session/session-middleware'

// This is the root hono object that will define all routes
const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null
  }
}>();

// Session middleware, this makes user and session available in every request's context
app.use("*", sessionMiddleware);

// CORS middleware for the Better Auth routes, /api/auth/*
// This sets the allowed origins for /api/auth and subroutes
app.use(
  "/api/auth/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: process.env.FRONTEND_URL!,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Better Auth configuration : we reroute all GET and POST to its handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Hello world route to test if it's working
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Here's where we add all our controllers to the main router

// This one is responsible for redirecting the user after logging in
app.route('/login', loginController)
// This one provides session info, useful for sanity checking
app.route('/session', sessionController)

export default app;

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
