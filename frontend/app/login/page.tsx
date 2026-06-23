"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/styles/Login.module.css";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type LoginResponse = {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
};

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await apiFetch<LoginResponse>("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            router.push("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue pendant la connexion."
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className={styles.main}>
            <section className={styles.card}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Heureux de vous revoir</h1>

                    <p className={styles.subtitle}>
                        Connectez-vous pour retrouver vos réservations, vos annonces et tout
                        ce qui rend vos séjours uniques.
                    </p>

                    <form className={styles.form} onSubmit={handleSubmit}>
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
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button className={styles.submitButton} type="submit">
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </button>
                    </form>

                    <button className={styles.textButton} type="button">
                        Mot de passe oublié
                    </button>

                    <p className={styles.registerText}>
                        Pas encore de compte ?{" "}
                        <Link href="/register" className={styles.inlineButton}>
                            Inscrivez-vous
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}