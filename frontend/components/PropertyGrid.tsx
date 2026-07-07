"use client";

import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { apiFetchWithAuth } from "@/lib/api";
import type { Property } from "@/types/property";
import styles from "@/components/styles/Home.module.css";

type PropertyGridProps = {
    properties: Property[];
};

type StoredUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function PropertyGrid({ properties }: PropertyGridProps) {
    const [favoriteIds, setFavoriteIds] = useState<Set<string | number>>(
        new Set()
    );

    useEffect(() => {
        async function loadFavoriteIds() {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (!token || !storedUser) return;

            try {
                const user = JSON.parse(storedUser) as StoredUser;

                const favorites = await apiFetchWithAuth<Property[]>(
                    `/api/users/${user.id}/favorites`
                );

                setFavoriteIds(new Set(favorites.map((property) => property.id)));
            } catch (error) {
                console.error("Impossible de charger les favoris", error);
            }
        }

        loadFavoriteIds();
    }, []);

    function handleFavoriteRemoved(propertyId: string | number) {
        setFavoriteIds((currentIds) => {
            const updatedIds = new Set(currentIds);
            updatedIds.delete(propertyId);
            return updatedIds;
        });
    }

    function handleFavoriteAdded(propertyId: string | number) {
        setFavoriteIds((currentIds) => {
            const updatedIds = new Set(currentIds);
            updatedIds.add(propertyId);
            return updatedIds;
        });
    }

    return (
        <section id="logements" className={styles.grid}>
            {properties.map((property) => (
                <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favoriteIds.has(property.id)}
                    onFavoriteAdded={handleFavoriteAdded}
                    onFavoriteRemoved={handleFavoriteRemoved}
                />
            ))}
        </section>
    );
}