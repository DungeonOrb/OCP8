"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetchWithAuth } from "@/lib/api";
import styles from "@/components/styles/Messages.module.css";

type StoredUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    picture?: string | null;
};

type Conversation = {
    id: number;
    property_id: string | null;
    property_title?: string | null;
    other_user: {
        id: number;
        name: string;
        picture: string | null;
    };
    last_message?: string | null;
    last_message_at?: string | null;
    unread_count: number;
};

type Message = {
    id: number;
    conversation_id: number;
    sender_id: number;
    body: string;
    created_at: string;
    sender: {
        id: number;
        name: string;
        picture: string | null;
    };
};

export default function MessagesPage() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const [user, setUser] = useState<StoredUser | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/login");
            return;
        }

        setUser(JSON.parse(storedUser));

        async function loadConversations() {
            try {
                const data = await apiFetchWithAuth<Conversation[]>("/api/conversations");
                setConversations(data);

                const conversationIdFromUrl = searchParams.get("conversationId");

                if (conversationIdFromUrl) {
                    setSelectedConversationId(Number(conversationIdFromUrl));
                } else {
                    setSelectedConversationId(null);
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Impossible de charger les conversations."
                );
            }
        }

        loadConversations();
    }, [router, searchParams]);

    useEffect(() => {
        if (!selectedConversationId) return;

        async function loadMessages() {
            try {
                const data = await apiFetchWithAuth<Message[]>(
                    `/api/conversations/${selectedConversationId}/messages`
                );

                setMessages(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Impossible de charger les messages."
                );
            }
        }

        loadMessages();
    }, [selectedConversationId]);

    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedConversationId || !newMessage.trim()) return;

        try {
            const sentMessage = await apiFetchWithAuth<Message>(
                `/api/conversations/${selectedConversationId}/messages`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        body: newMessage.trim(),
                    }),
                }
            );

            setMessages((current) => [...current, sentMessage]);
            setNewMessage("");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Impossible d'envoyer le message."
            );
        }
    }

    const selectedConversation = conversations.find(
        (conversation) => conversation.id === selectedConversationId
    );

    return (
        <main
            className={`${styles.main} messages-page ${selectedConversation ? styles.hasSelectedConversation : ""
                }`}
        >
            <aside className={styles.sidebar}>
                <button
                    className={styles.backButton}
                    type="button"
                    onClick={() => router.back()}
                >
                    ← Retour
                </button>

                <h1 className={styles.title}>Messages</h1>

                <div className={styles.conversationList}>
                    {conversations.map((conversation) => (
                        <button
                            key={conversation.id}
                            className={`${styles.conversationItem} ${conversation.id === selectedConversationId
                                ? styles.conversationItemActive
                                : ""
                                }`}
                            type="button"
                            onClick={() => {
                                setSelectedConversationId(conversation.id);
                                router.push(`/messages?conversationId=${conversation.id}`);
                            }}
                        >
                            <div className={styles.avatar}>
                                {conversation.other_user.picture ? (
                                    <img
                                        src={conversation.other_user.picture}
                                        alt={conversation.other_user.name}
                                    />
                                ) : null}
                            </div>

                            <div className={styles.conversationText}>
                                <div className={styles.conversationTop}>
                                    <strong>{conversation.other_user.name}</strong>
                                    <span>11:04 am</span>
                                </div>

                                <p>
                                    {conversation.last_message ||
                                        "Aucun message pour le moment..."}
                                </p>
                            </div>

                            {conversation.unread_count > 0 && (
                                <span className={styles.unreadDot} />
                            )}
                        </button>
                    ))}
                </div>
            </aside>

            <section className={styles.chat}>
                <button
                    className={styles.mobileBackButton}
                    type="button"
                    onClick={() => {
                        setSelectedConversationId(null);
                        router.push("/messages");
                    }}
                >
                    ← Retour
                </button>

                {error && <p className={styles.error}>{error}</p>}

                {!selectedConversation && !error && (
                    <p className={styles.emptyState}>Aucune conversation sélectionnée.</p>
                )}

                {selectedConversation && (
                    <>
                        <div className={styles.messages}>
                            {messages.map((message) => {
                                const isMine = user?.id === message.sender_id;

                                return (
                                    <div
                                        key={message.id}
                                        className={`${styles.messageRow} ${isMine ? styles.messageRowMine : ""
                                            }`}
                                    >
                                        {!isMine && (
                                            <div className={styles.messageAvatar}>
                                                {message.sender.picture ? (
                                                    <img
                                                        src={message.sender.picture}
                                                        alt={message.sender.name}
                                                    />
                                                ) : null}
                                            </div>
                                        )}

                                        <div>
                                            <div className={styles.messageMeta}>
                                                {message.sender.name} • 11:04pm
                                            </div>

                                            <p
                                                className={`${styles.bubble} ${isMine ? styles.bubbleMine : ""
                                                    }`}
                                            >
                                                {message.body}
                                            </p>
                                        </div>

                                        {isMine && (
                                            <div className={styles.messageAvatar}>
                                                {message.sender.picture ? (
                                                    <img
                                                        src={message.sender.picture}
                                                        alt={message.sender.name}
                                                    />
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <form className={styles.inputBar} onSubmit={handleSendMessage}>
                            <label htmlFor="messageInput" className={styles.srOnly}>
                                Message à envoyer
                            </label>

                            <input
                                id="messageInput"
                                name="message"
                                type="text"
                                placeholder="Envoyer un message"
                                value={newMessage}
                                onChange={(event) => setNewMessage(event.target.value)}
                            />

                            <button type="submit" aria-label="Envoyer le message">
                                ↑
                            </button>
                        </form>
                    </>
                )}
            </section>
        </main>
    );
}