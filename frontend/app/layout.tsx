import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
    title: "Kasa",
    description: "Trouvez votre logement avec Kasa",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}