"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetchWithAuth } from "@/lib/api";
import styles from "@/components/styles/PropertyDetails.module.css";

type HostActionsProps = {
    propertyId: string | number;
    hostId?: number;
};

type StoredUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function HostActions({ propertyId, hostId }: HostActionsProps) {
    const router = useRouter();

    const [canDelete, setCanDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser || !hostId) return;

        try {
            const user = JSON.parse(storedUser) as StoredUser;

            if (user.id === hostId) {
                setCanDelete(true);
            }
        } catch {
            setCanDelete(false);
        }
    }, [hostId]);

    async function handleDelete() {
        const confirmed = window.confirm(
            "Êtes-vous sûr de vouloir supprimer cette propriété ?"
        );

        if (!confirmed) return;

        setError("");
        setIsDeleting(true);

        try {
            await apiFetchWithAuth<null>(`/api/properties/${propertyId}`, {
                method: "DELETE",
            });

            router.push("/");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Impossible de supprimer cette propriété."
            );
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <button className={styles.hostButton} type="button">
                Contacter l'hôte
            </button>

            <button className={styles.hostButton} type="button">
                Envoyer un message
            </button>

            {canDelete && (
                <button
                    className={styles.hostButton}
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
            )}

            {error && <p className={styles.deleteError}>{error}</p>}
        </>
    );
}