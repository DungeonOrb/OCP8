import Link from "next/link";
import styles from "@/components/styles/NotFound.module.css";

export default function NotFound() {
    return (
        <main className={styles.main}>
            <div className={styles.content}>
                <h1 className={styles.title}>404</h1>

                <p className={styles.text}>
                    Il semble que la page que vous cherchez ait pris des vacances... ou
                    n’ait jamais existé.
                </p>

                <div className={styles.actions}>
                    <Link href="/" className={styles.button}>
                        Accueil
                    </Link>

                    <Link href="/#logements" className={styles.button}>
                        Logements
                    </Link>
                </div>
            </div>
        </main>
    );
}