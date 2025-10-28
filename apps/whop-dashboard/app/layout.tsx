export const metadata = {
  title: "Whop Dashboard",
  description: "A minimal Whop-authenticated dashboard app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
