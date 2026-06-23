"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/components/styles/Register.module.css";
import { apiFetch } from "@/lib/api";

type RegisterResponse = {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        picture: string | null;
        role: "client" | "owner";
    };
};

export default function RegisterPage() {
    const router = useRouter();

    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!hasAcceptedTerms) {
            setError("Vous devez accepter les conditions générales d'utilisation.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await apiFetch<RegisterResponse>("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                    email,
                    password,
                    role: "client",
                }),
            });

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            router.push("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue pendant l'inscription."
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className={styles.main}>
            <section className={styles.card}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Rejoignez la communauté Kasa</h1>

                    <p className={styles.subtitle}>
                        Créez votre compte et commencez à voyager autrement : réservez des
                        logements uniques, découvrez de nouvelles destinations et partagez
                        vos propres lieux avec d’autres voyageurs.
                    </p>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="lastName">Nom</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="firstName">Prénom</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="email">Adresse email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                minLength={6}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>

                        <label className={styles.checkboxLine}>
                            <input
                                type="checkbox"
                                checked={hasAcceptedTerms}
                                onChange={(event) => setHasAcceptedTerms(event.target.checked)}
                            />
                            <span>
                                J’accepte les{" "}
                                <button className={styles.termsButton} type="button">
                                    conditions générales d’utilisation
                                </button>
                            </span>
                        </label>

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Inscription..." : "S’inscrire"}
                        </button>
                    </form>

                    <p className={styles.loginText}>
                        Déjà membre ?{" "}
                        <Link href="/login" className={styles.loginLink}>
                            Se connecter
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}