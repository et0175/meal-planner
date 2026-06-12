import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Meal Forge",
  description: "Client-rendered MealPlanner prototype"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
