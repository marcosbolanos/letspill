import { Hono } from 'hono';
import 'dotenv/config';

const loginController = new Hono();

// This route redirects the user to the frontend after logging in
// It's helpful when using a separate frontend from expo
loginController.get('/redirect', async (c) => {
  return c.redirect(process.env.FRONTEND_URL!)
})

export default loginController;
