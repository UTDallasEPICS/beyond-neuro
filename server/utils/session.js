// Returns the session user attached by the auth gateway (server/middleware/auth.ts).
// Throws 401 if it is absent, so protected routes get a typed, non-null user
// instead of asserting event.context.user! and trusting the middleware ran.
export function requireUser(event) {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    return user;
}
