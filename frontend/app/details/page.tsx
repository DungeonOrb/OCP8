import styles from "@/components/styles/Details.module.css";

export default function DetailsPage() {
    return (
        <main className={styles.main}>
            <section className={styles.header}>
                <h1 className={styles.title}>À propos</h1>

                <p className={styles.intro}>
                    Chez Kasa, nous croyons que chaque voyage mérite un lieu unique où se
                    sentir bien.
                </p>

                <p className={styles.intro}>
                    Depuis notre création, nous mettons en relation des voyageurs en quête
                    d’authenticité avec des hôtes passionnés qui aiment partager leur
                    région et leurs bonnes adresses.
                </p>
            </section>

            <section className={styles.heroImageWrapper}>
                <img
                    className={styles.heroImage}
                    src="/details_house1.jpg"
                    alt="Maison en bois entourée d'arbres"
                />
            </section>

            <section className={styles.contentSection}>
                <div className={styles.textBlock}>
                    <h2 className={styles.missionTitle}>Notre mission est simple :</h2>

                    <ol className={styles.missionList}>
                        <li>Offrir une plateforme fiable et simple d’utilisation</li>
                        <li>Proposer des hébergements variés et de qualité</li>
                        <li>
                            Favoriser des échanges humains et chaleureux entre hôtes et
                            voyageurs
                        </li>
                    </ol>

                    <p className={styles.highlight}>
                        Que vous cherchiez un appartement cosy en centre-ville, une maison
                        en bord de mer ou un chalet à la montagne, Kasa vous accompagne pour
                        que chaque séjour devienne un souvenir inoubliable.
                    </p>
                </div>

                <div className={styles.secondaryImageWrapper}>
                    <img
                        className={styles.secondaryImage}
                        src="/details_house2.jpg"
                        alt="Maison chaleureuse au coucher du soleil"
                    />
                </div>
            </section>
        </main>
    );
}