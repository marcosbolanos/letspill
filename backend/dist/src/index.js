import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { auth } from '../lib/auth';
import { apiReference } from '@scalar/hono-api-reference';
import 'dotenv/config';
import sessionController from './session/session.controller';
import loginController from './login/login.controller';
import accessController from './access/access.controller';
import userPreferencesController from './user-preferences/user-preferences.controller';
import pillEventsController from './pill-events/pill-events.controller';
import sessionMiddleware from './session/middleware/session.middleware';
// This is the root hono object that will define all routes
const app = new OpenAPIHono();
// Session middleware, this makes user and session available in every request's context
app.use("*", sessionMiddleware);
// CORS middleware for the Better Auth routes, /api/auth/*
// This sets the allowed origins for /api/auth and subroutes
app.use("/api/auth/*", // or replace with "*" to enable cors for all routes
cors({
    origin: process.env.FRONTEND_URL,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
}));
// Logging middleware that prints out incoming requests
app.use('*', async (c, next) => {
    console.log('Request:', c.req.method, c.req.path);
    return next();
});
// Better Auth configuration : we reroute all GET and POST to its handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});
// Hello world route to test if it's working
app.get('/', (c) => {
    return c.text('Hello Hono!');
});
// Here's where we add all our controllers to the main router
// This one is responsible for redirecting the user to the frontend url (/login/redirect route)
app.route('/login', loginController);
// This one provides session info, useful for sanity checking
app.route('/session', sessionController);
// This controller manages the creation and updating of access invites and grants (but not authorization)
app.route('/access', accessController);
// This controller is subject to access and allows to view a user's pill events
app.route('/pill-events', pillEventsController);
// This controller is subject to access and allows to view a user's preferences
app.route('/user-preferences', userPreferencesController);
// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'My API',
    },
});
// Interactive API documentation with Scalar UI at /reference
app.get('/reference', apiReference({
    theme: 'purple',
    spec: { url: '/doc' },
}));
export default app;
serve({
    fetch: app.fetch,
    hostname: '0.0.0.0',
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
