import "./globals.css";


export const metadata = {
  title: "Cris",
  description:
    "Secure candidate onboarding and background check platform.",
};


export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}