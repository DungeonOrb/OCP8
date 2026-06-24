"use client";

import { MouseEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/types/property";
import { apiFetchWithAuth } from "@/lib/api";
import styles from "./styles/PropertyCard.module.css";

type PropertyCardProps = {
    property: Property;
    isFavorite?: boolean;
    onFavoriteRemoved?: (propertyId: string | number) => void;
};

export default function PropertyCard({
    property,
    isFavorite = false,
    onFavoriteRemoved,
}: PropertyCardProps) {
    const router = useRouter();
    const [favorite, setFavorite] = useState(isFavorite);
    const [isLoading, setIsLoading] = useState(false);

    function goToProperty() {
        router.push(`/logements/${property.id}`);
    }

    async function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();

        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);

        try {
            if (favorite) {
                await apiFetchWithAuth<{ ok: boolean }>(
                    `/api/properties/${property.id}/favorite`,
                    {
                        method: "DELETE",
                    }
                );

                setFavorite(false);
                onFavoriteRemoved?.(property.id);
            } else {
                await apiFetchWithAuth<{ ok: boolean }>(
                    `/api/properties/${property.id}/favorite`,
                    {
                        method: "POST",
                    }
                );

                setFavorite(true);
            }
        } catch (error) {
            console.error(error);

            if (error instanceof Error && error.message.includes("401")) {
                router.push("/login");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <article className={styles.card} onClick={goToProperty}>
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

                <button
                    className={`${styles.favoriteButton} ${favorite ? styles.favoriteButtonActive : ""
                        }`}
                    type="button"
                    aria-label={
                        favorite ? "Retirer des favoris" : "Ajouter aux favoris"
                    }
                    onClick={handleFavoriteClick}
                    disabled={isLoading}
                >
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