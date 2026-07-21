"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles/Header.module.css";

export default function Header() {
    const router = useRouter();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setIsConnected(Boolean(localStorage.getItem("token")));
    }, []);

    function closeMenu() {
        setIsMenuOpen(false);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsConnected(false);
        setIsMenuOpen(false);

        router.push("/login");
        router.refresh();
    }

    return (
        <header className={styles.header}>
            <nav className={styles.nav} aria-label="Navigation principale">
                <div className={styles.leftLinks}>
                    <Link href="/" className={styles.navLink}>
                        Accueil
                    </Link>

                    <Link href="/details" className={styles.navLink}>
                        À propos
                    </Link>
                </div>

                <Link href="/" className={styles.logo} aria-label="Retour à l'accueil">
                    <span className={styles.logoText}>k</span>
                    <span className={styles.logoIcon}>⌂</span>
                    <span className={styles.logoText}>sa</span>
                </Link>

                <div className={styles.rightLinks}>
                    <Link href="/add-property" className={styles.addButton}>
                        +Ajouter un logement
                    </Link>

                    <Link href="/favorites" className={styles.iconButton} aria-label="Favoris">
                        ♡
                    </Link>

                    <span className={styles.separator}>|</span>

                    <Link href="/messages" className={styles.iconButton} aria-label="Messages">
                        ✉︎
                    </Link>

                    <button
                        className={styles.powerButton}
                        type="button"
                        aria-label="Se déconnecter"
                        title="Se déconnecter"
                        onClick={handleLogout}
                    >
                        ➜]
                    </button>
                </div>

                <div className={styles.mobileTopBar}>
                    <Link href="/" className={styles.mobileLogo} aria-label="Retour à l'accueil">
                        <span className={styles.mobileLogoIcon}>⌂</span>
                    </Link>

                    <button
                        className={styles.menuButton}
                        type="button"
                        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        onClick={() => setIsMenuOpen((current) => !current)}
                    >
                        {isMenuOpen ? "×" : "☰"}
                    </button>
                </div>
            </nav>

            {isMenuOpen && (
                <div className={styles.mobileMenu}>
                    <Link href="/" className={styles.mobileMenuLink} onClick={closeMenu}>
                        Accueil
                    </Link>

                    <Link href="/details" className={styles.mobileMenuLink} onClick={closeMenu}>
                        À propos
                    </Link>

                    <Link href="/messages" className={styles.mobileMenuLink} onClick={closeMenu}>
                        Messagerie
                    </Link>

                    <Link href="/favorites" className={styles.mobileMenuLink} onClick={closeMenu}>
                        Favoris
                    </Link>

                    <Link
                        href="/add-property"
                        className={styles.mobileAddButton}
                        onClick={closeMenu}
                    >
                        Ajouter un logement
                    </Link>

                    {isConnected ? (
                        <button
                            className={styles.mobileAuthButton}
                            type="button"
                            onClick={handleLogout}
                        >
                            Déconnexion
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className={styles.mobileAuthButton}
                            onClick={closeMenu}
                        >
                            Connexion
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}