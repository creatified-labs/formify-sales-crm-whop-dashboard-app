import { headers } from "next/headers";
import { validateToken } from "@whop-apps/sdk";

export default async function ExperiencePage({
  params,
}: {
  params: { experienceId: string };
}) {
  const h = headers();

  try {
    const headerObj = Object.fromEntries(h.entries());
    const result = await validateToken({ headers: headerObj });
    const userId = (result as any)?.userId ?? null;

    if (!userId) {
      return (
        <main style={{ padding: 24 }}>
          <h1>Authentication required</h1>
          <p>
            This page must be opened from the Whop dashboard as an App with the
            correct headers. In development, add this app to a Whop product and
            open it via the developer tools overlay.
          </p>
        </main>
      );
    }

    return (
      <main style={{ padding: 24 }}>
        <h1>Whop Dashboard</h1>
        <p>Experience: {params.experienceId}</p>
        <p>Authenticated user: {userId}</p>
        <section style={{ marginTop: 24 }}>
          <p>Build your dashboard here.</p>
        </section>
      </main>
    );
  } catch (e) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Unauthorized</h1>
        <p>
          Unable to validate your session. Make sure this app is launched from
          Whop and your environment variables are set.
        </p>
      </main>
    );
  }
}
