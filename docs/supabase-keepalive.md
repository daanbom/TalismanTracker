# Supabase keepalive

Supabase Free can pause projects with low database activity over seven days.
The `supabase-keepalive` Netlify scheduled function reads one character ID every
six hours, including when nobody is visiting the site. It uses the existing
public character read policy and does not write data or need a service-role key.

The schedule in `netlify.toml` is `17 */6 * * *`: 00:17, 06:17, 12:17 and 18:17
UTC. This is four function invocations per day, which count towards the site's
Netlify usage allowance. No paid Supabase plan or new dependency is required.

## Deployment

1. If Supabase is paused, resume the project in the Supabase dashboard first.
   A database read cannot resume an already paused project.
2. In the Netlify site's environment variables, ensure `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` are available at function runtime, as well as during
   builds. If scopes are configurable, include **Functions**. Variables declared
   only in `netlify.toml` are not available at function runtime.
3. Deploy the changes to the published production site. Schedules do not run
   automatically on deploy previews or branch deploys. Redeploy after changing
   environment variables.
4. In Netlify's Functions page, open `supabase-keepalive`, confirm the Scheduled
   badge and next run time, then click **Run now**. Its log should contain
   `Supabase keepalive succeeded.`

Missing configuration, HTTP errors, a ten-second request timeout, or an empty
character result fail the invocation so they are visible in the function logs.
The function does not log API keys or character data. Scheduled functions cannot
be invoked through a public URL.

Supabase says a few database requests each day are typically enough to avoid
pausing. This is a best-effort approach on the Free plan; it is not a guarantee
against future pauses. Check the scheduled function logs if another pause
warning arrives.

## References

* [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
* [Netlify scheduled functions](https://docs.netlify.com/build/functions/scheduled-functions/)
* [Netlify function environment variables](https://docs.netlify.com/build/functions/environment-variables/)
