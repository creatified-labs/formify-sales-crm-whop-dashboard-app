# Whop Dashboard (Next.js)

A minimal Whop app built with Next.js App Router. It validates the Whop user token on the server using the Whop SDK and exposes a protected dashboard at `/experiences/[experienceId]`.

## Getting started

1. Create a copy of `.env.local.example` as `.env.local` in this folder and paste your Whop credentials:

```
NEXT_PUBLIC_WHOP_CLIENT_ID=
WHOP_CLIENT_SECRET=
WHOP_API_KEY=
NEXT_PUBLIC_BASE_URL=
NEXT_PUBLIC_APP_PATH=/experiences/[experienceId]
```

2. Install dependencies and run locally from this folder:

```
npm install
npm run dev
```

3. In the Whop developer dashboard:

- Set Base URL to your domain (or http://localhost:3000 for local).
- Set App path to `/experiences/[experienceId]`.
- Add this app to a product and open it from the Whop dashboard to pass the token header.

4. Deploy (e.g. Vercel):

- Link this folder as a separate project and copy your `.env.local` values to the host.
- Update Base URL and webhooks in Whop if needed.

## Notes

- The API route `/api/me` returns the authenticated user id derived from the Whop token.
- Expand the dashboard UI inside `app/experiences/[experienceId]/page.tsx`.
