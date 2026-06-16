import PropertyCard from "@/components/PropertyCard";
import styles from "@/components/styles/Home.module.css";
import { apiFetch } from "@/lib/api";
import type { Property } from "@/types/property";

export default async function HomePage() {
    const properties = await apiFetch<Property[]>("/api/properties");

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <section className={styles.heroHeader}>
                    <h1 className={styles.title}>Chez vous, partout et ailleurs</h1>
                    <p className={styles.subtitle}>
                        Avec Kasa, vivez des séjours uniques dans des hébergements chaleureux,
                        sélectionnés avec soin par nos hôtes.
                    </p>
                </section>

                <section
                    className={styles.heroImage}
                    aria-label="Image de présentation"
                />

                <section className={styles.grid}>
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </section>

                <section className={styles.howItWorks}>
                    <h2 className={styles.howItWorksTitle}>Comment ça marche ?</h2>

                    <p className={styles.howItWorksSubtitle}>
                        Que vous partiez pour un week-end improvisé, des vacances en famille
                        ou un voyage professionnel, Kasa vous aide à trouver un lieu qui vous
                        ressemble.
                    </p>

                    <div className={styles.howItWorksCards}>
                        <article className={styles.howItWorksCard}>
                            <h3>Recherchez</h3>
                            <p>
                                Entrez votre destination, vos dates et laissez Kasa faire le
                                reste
                            </p>
                        </article>

                        <article className={styles.howItWorksCard}>
                            <h3>Réservez</h3>
                            <p>
                                Profitez d'une plateforme sécurisée et de profils d'hôtes
                                vérifiés.
                            </p>
                        </article>

                        <article className={styles.howItWorksCard}>
                            <h3>Vivez l'expérience</h3>
                            <p>
                                Installez-vous, profitez de votre séjour, et sentez-vous chez
                                vous, partout.
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        </main>
    );
}