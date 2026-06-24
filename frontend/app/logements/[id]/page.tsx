import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/styles/PropertyDetails.module.css";
import { apiFetch } from "@/lib/api";
import type { Property } from "@/types/property";

type PropertyDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PropertyDetailsPage({
    params,
}: PropertyDetailsPageProps) {
    const { id } = await params;

    let property: Property;

    try {
        property = await apiFetch<Property>(`/api/properties/${id}`);
    } catch {
        notFound();
    }

    const pictures =
        property.pictures && property.pictures.length > 0
            ? property.pictures
            : property.cover
                ? [property.cover]
                : [];

    const galleryPictures = pictures.slice(0, 5);

    const hostName = property.host?.name || property.host_name || "Hôte Kasa";
    const hostPicture = property.host?.picture || property.host_picture;
    const rating = Math.round(Number(property.rating_avg || 0));

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Link href="/#logements" className={styles.backLink}>
                    ← Retour aux annonces
                </Link>

                <section className={styles.topSection}>
                    <div className={styles.gallery}>
                        <div className={styles.mainImageWrapper}>
                            {galleryPictures[0] ? (
                                <img
                                    className={styles.mainImage}
                                    src={galleryPictures[0]}
                                    alt={property.title}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder} />
                            )}
                        </div>

                        <div className={styles.sideImages}>
                            {galleryPictures.slice(1, 5).map((picture, index) => (
                                <div className={styles.sideImageWrapper} key={`${picture}-${index}`}>
                                    <img
                                        className={styles.sideImage}
                                        src={picture}
                                        alt={`${property.title} - image ${index + 2}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className={styles.hostCard}>
                        <h2 className={styles.hostTitle}>Votre hôte</h2>

                        <div className={styles.hostInfo}>
                            {hostPicture ? (
                                <img
                                    className={styles.hostPicture}
                                    src={hostPicture}
                                    alt={hostName}
                                />
                            ) : (
                                <div className={styles.hostPictureFallback}>
                                    {hostName.charAt(0)}
                                </div>
                            )}

                            <p className={styles.hostName}>{hostName}</p>

                            <div className={styles.rating}>
                                <span className={styles.star}>★</span>
                                <span>{rating || 3}</span>
                            </div>
                        </div>

                        <button className={styles.hostButton} type="button">
                            Contacter l'hôte
                        </button>

                        <button className={styles.hostButton} type="button">
                            Envoyer un message
                        </button>
                    </aside>
                </section>

                <section className={styles.detailsCard}>
                    <h1 className={styles.title}>{property.title}</h1>

                    {property.location && (
                        <p className={styles.location}>⌾ {property.location}</p>
                    )}

                    {property.description && (
                        <p className={styles.description}>{property.description}</p>
                    )}

                    {property.equipments && property.equipments.length > 0 && (
                        <div className={styles.detailBlock}>
                            <h2 className={styles.sectionTitle}>Équipements</h2>

                            <div className={styles.pills}>
                                {property.equipments.map((equipment) => (
                                    <span className={styles.pill} key={equipment}>
                                        {equipment}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {property.tags && property.tags.length > 0 && (
                        <div className={styles.detailBlock}>
                            <h2 className={styles.sectionTitle}>Catégorie</h2>

                            <div className={styles.pills}>
                                {property.tags.map((tag) => (
                                    <span className={styles.pill} key={tag}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}