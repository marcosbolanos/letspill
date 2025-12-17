import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import CONFIG from '../../envconfig'

const loginController = new OpenAPIHono();

const redirectRoute = createRoute({
  method: 'get',
  path: '/redirect',
  tags: ['Login'],
  responses: {
    302: {
      description: 'Redirect to frontend URL',
    },
  },
});

loginController.openapi(redirectRoute, async (c) => {
  const FRONTEND_URL = process.env.FRONTEND_URL!
  return c.redirect(FRONTEND_URL)
})
export default loginController;
