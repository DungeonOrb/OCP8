"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import { apiFetchWithAuth } from "@/lib/api";
import type { Property } from "@/types/property";
import styles from "@/components/styles/Favorites.module.css";

type StoredUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function FavoritesPage() {
    const router = useRouter();

    const [favorites, setFavorites] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFavorites() {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (!token || !storedUser) {
                router.push("/login");
                return;
            }

            try {
                const user = JSON.parse(storedUser) as StoredUser;

                const data = await apiFetchWithAuth<Property[]>(
                    `/api/users/${user.id}/favorites`
                );

                setFavorites(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Impossible de charger vos favoris."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadFavorites();
    }, [router]);

    function removeFavoriteFromPage(propertyId: string | number) {
        setFavorites((currentFavorites) =>
            currentFavorites.filter((property) => property.id !== propertyId)
        );
    }

    return (
        <main className={styles.main}>
            <section className={styles.header}>
                <h1 className={styles.title}>Vos favoris</h1>

                <p className={styles.subtitle}>
                    Retrouvez ici tous les logements que vous avez aimés.
                    <br />
                    Prêts à réserver ? Un simple clic et votre prochain séjour est en
                    route.
                </p>
            </section>

            {isLoading && <p className={styles.message}>Chargement des favoris...</p>}

            {error && <p className={styles.error}>{error}</p>}

            {!isLoading && !error && favorites.length === 0 && (
                <p className={styles.message}>
                    Vous n’avez pas encore ajouté de logement à vos favoris.
                </p>
            )}

            {!isLoading && !error && favorites.length > 0 && (
                <section className={styles.grid}>
                    {favorites.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            isFavorite
                            onFavoriteRemoved={removeFavoriteFromPage}
                        />
                    ))}
                </section>
            )}
        </main>
    );
}