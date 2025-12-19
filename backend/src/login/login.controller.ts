import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

const loginController = new OpenAPIHono();

// Default redirect -  we'll see if Better Auth just uses this one all the tile

const redirectRoute = createRoute({
  method: 'get',
  path: '/redirect',
  tags: ['Login'],
  responses: {
    302: { description: 'Redirect to mobile app via deep link' },
  },
});

loginController.openapi(redirectRoute, async (c) => {
  const MOBILE_URL = process.env.MOBILE_URL || 'letspill://';
  return c.redirect(MOBILE_URL);
});

// Mobile redirect - uses deep link scheme
const mobileRedirectRoute = createRoute({
  method: 'get',
  path: '/redirect/mobile',
  tags: ['Login'],
  responses: {
    302: { description: 'Redirect to mobile app via deep link' },
  },
});

loginController.openapi(mobileRedirectRoute, async (c) => {
  const MOBILE_URL = process.env.MOBILE_URL || 'letspill://';
  return c.redirect(MOBILE_URL);
});

// Web redirect - uses web frontend URL
const webRedirectRoute = createRoute({
  method: 'get',
  path: '/redirect/web',
  tags: ['Login'],
  responses: {
    302: { description: 'Redirect to web frontend' },
  },
});

loginController.openapi(webRedirectRoute, async (c) => {
  const WEB_URL = process.env.WEB_URL || 'http://localhost:8081';
  return c.redirect(WEB_URL);
});

export default loginController;
