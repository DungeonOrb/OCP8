import Link from "next/link";
import styles from "./styles/Header.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <nav className={styles.nav} aria-label="Navigation principale">
                <div className={styles.leftLinks}>
                    <Link href="/" className={styles.navLink}>
                        Accueil
                    </Link>

                    <button className={styles.navButton} type="button">
                        À propos
                    </button>
                </div>

                <Link href="/" className={styles.logo} aria-label="Retour à l'accueil">
                    <span className={styles.logoText}>k</span>
                    <span className={styles.logoIcon}>⌂</span>
                    <span className={styles.logoText}>sa</span>
                </Link>

                <div className={styles.rightLinks}>
                    <button className={styles.addButton} type="button">
                        +Ajouter un logement
                    </button>

                    <button className={styles.iconButton} type="button" aria-label="Favoris">
                        ♡
                    </button>

                    <span className={styles.separator}>|</span>

                    <button className={styles.iconButton} type="button" aria-label="Profil">
                        ▭
                    </button>
                </div>
            </nav>
        </header>
    );
}