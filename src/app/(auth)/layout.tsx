import { ClerkProvider } from "@clerk/nextjs";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-svh items-center justify-center">
      <ClerkProvider>{children}</ClerkProvider>
    </div>
  );
}
