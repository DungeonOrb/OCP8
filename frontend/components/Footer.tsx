import styles from "./styles/Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.logo} aria-label="Kasa">
                <span className={styles.logoIcon}>⌂</span>
            </div>

            <p className={styles.copyright}>
                © 2025 Kasa. All rights reserved
            </p>
        </footer>
    );
}