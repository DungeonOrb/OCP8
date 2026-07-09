"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./styles/Header.module.css";

export default function Header() {
    const router = useRouter();

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

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
                        ▭
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
            </nav>
        </header>
    );
}