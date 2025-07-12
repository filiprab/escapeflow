import { AppProvider } from "@/context/AppProvider";
import Header from "@/components/Header";

export default function FlowLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <Header />
      {children}
    </AppProvider>
  );
}