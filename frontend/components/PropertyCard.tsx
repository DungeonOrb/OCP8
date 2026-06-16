import type { Property } from "@/types/property";
import styles from "./styles/PropertyCard.module.css";

type PropertyCardProps = {
    property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.imageWrapper}>
                {property.cover ? (
                    <img
                        className={styles.image}
                        src={property.cover}
                        alt={property.title}
                    />
                ) : (
                    <div className={styles.imagePlaceholder} />
                )}

                <button className={styles.favoriteButton} aria-label="Ajouter aux favoris">
                    ♥
                </button>
            </div>

            <div className={styles.content}>
                <h2 className={styles.title}>{property.title}</h2>

                {property.location && (
                    <p className={styles.location}>{property.location}</p>
                )}

                <p className={styles.price}>
                    <strong>{property.price_per_night ?? 100}€</strong>{" "}
                    <span>par nuit</span>
                </p>
            </div>
        </article>
    );
}