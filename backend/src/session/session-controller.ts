import { Hono } from "hono";
import { auth } from "../../lib/auth";

const sessionController = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null
  }
}>();

sessionController.get("/", (c) => {
  const session = c.get("session")
  const user = c.get("user")

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user
  });
});

export default sessionController;
