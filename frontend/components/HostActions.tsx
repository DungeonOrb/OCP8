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

type ConversationResponse = {
  id: number;
  property_id: string | null;
  user_one_id: number;
  user_two_id: number;
};

export default function HostActions({ propertyId, hostId }: HostActionsProps) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [canDelete, setCanDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpeningConversation, setIsOpeningConversation] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser) as StoredUser;
      setCurrentUser(user);

      if (hostId && user.id === hostId) {
        setCanDelete(true);
      }
    } catch {
      setCurrentUser(null);
      setCanDelete(false);
    }
  }, [hostId]);

  async function handleOpenConversation() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!hostId) {
      setError("Impossible de trouver l'hôte de cette propriété.");
      return;
    }

    if (currentUser?.id === hostId) {
      setError("Envie de vous parler à vous-même? Préférez plutôt un miroir.");
      return;
    }

    setError("");
    setIsOpeningConversation(true);

    try {
      const conversation = await apiFetchWithAuth<ConversationResponse>(
        "/api/conversations",
        {
          method: "POST",
          body: JSON.stringify({
            receiver_id: hostId,
            property_id: propertyId,
          }),
        }
      );

      router.push(`/messages?conversationId=${conversation.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'ouvrir la conversation."
      );
    } finally {
      setIsOpeningConversation(false);
    }
  }

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

      <button
        className={styles.hostButton}
        type="button"
        onClick={handleOpenConversation}
        disabled={isOpeningConversation}
      >
        {isOpeningConversation ? "Ouverture..." : "Envoyer un message"}
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