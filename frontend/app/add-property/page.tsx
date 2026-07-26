"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetchWithAuth } from "@/lib/api";
import styles from "@/components/styles/AddProperty.module.css";

const equipments = [
    "Micro-Ondes",
    "Douche italienne",
    "Frigo",
    "WIFI",
    "Parking",
    "Sèche Cheveux",
    "Machine à laver",
    "Cuisine équipée",
    "Télévision",
    "Chambre Séparée",
    "Climatisation",
    "Frigo Américain",
    "Clic-clac",
    "Four",
    "Rangements",
    "Lit",
    "Bouilloire",
    "SDB",
    "Toilettes sèches",
    "Cintres",
    "Baie vitrée",
    "Hotte",
    "Baignoire",
    "Vue Parc",
];

const defaultTags = [
    "Parc",
    "Night Life",
    "Culture",
    "Nature",
    "Touristique",
    "Vue sur mer",
    "Pour les couples",
    "Famille",
    "Forêt",
];

type StoredUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

type CreatedProperty = {
    id: string;
};

export default function AddPropertyPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [location, setLocation] = useState("");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [pictureFiles, setPictureFiles] = useState<File[]>([]);
    const [hostPictureFile, setHostPictureFile] = useState<File | null>(null);
    const [hostName, setHostName] = useState("");
    const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState("");
    const coverInputRef = useRef<HTMLInputElement | null>(null);
    const pictureInputRef = useRef<HTMLInputElement | null>(null);
    const hostPictureInputRef = useRef<HTMLInputElement | null>(null);

    const [user, setUser] = useState<StoredUser | null>(null);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser) as StoredUser;

        if (parsedUser.role !== "owner" && parsedUser.role !== "admin") {
            router.push("/");
            return;
        }

        setUser(parsedUser);
        setHostName(parsedUser.name);
    }, [router]);
    async function uploadImage(
        file: File,
        propertyId: string,
        imageName: string
    ): Promise<string> {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("propertyId", propertyId);
        formData.append("imageName", imageName);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || "Impossible d'envoyer l'image.");
        }

        return data.url;
    }
    function toggleEquipment(equipment: string) {
        setSelectedEquipments((current) =>
            current.includes(equipment)
                ? current.filter((item) => item !== equipment)
                : [...current, equipment]
        );
    }

    function toggleTag(tag: string) {
        setSelectedTags((current) =>
            current.includes(tag)
                ? current.filter((item) => item !== tag)
                : [...current, tag]
        );
    }

    function addCustomTag() {
        const trimmedTag = customTag.trim();

        if (!trimmedTag) return;

        if (!selectedTags.includes(trimmedTag)) {
            setSelectedTags((current) => [...current, trimmedTag]);
        }

        setCustomTag("");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!user) {
            router.push("/login");
            return;
        }

        if (!title.trim()) {
            setError("Le titre de la propriété est obligatoire.");
            return;
        }

        setIsSubmitting(true);

        try {
            const propertyId = crypto.randomUUID();

            const coverUrl = coverFile
                ? await uploadImage(coverFile, propertyId, "cover")
                : null;

            const pictureUrls = await Promise.all(
                pictureFiles.map((file, index) =>
                    uploadImage(file, propertyId, `${index + 1}`)
                )
            );

            const hostPictureUrl = hostPictureFile
                ? await uploadImage(hostPictureFile, propertyId, "host_profile")
                : null;

            const created = await apiFetchWithAuth<CreatedProperty>("/api/properties", {
                method: "POST",
                body: JSON.stringify({
                    id: propertyId,
                    title: title.trim(),
                    description: description.trim(),
                    cover: coverUrl,
                    location: [postalCode.trim(), location.trim()]
                        .filter(Boolean)
                        .join(" - "),
                    host_id: user.id,
                    host: {
                        name: hostName.trim() || user.name,
                        picture: hostPictureUrl,
                    },
                    pictures: pictureUrls,
                    equipments: selectedEquipments,
                    tags: selectedTags,
                }),
            });

            router.push(`/logements/${created.id}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Impossible d'ajouter cette propriété."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <button
                    className={styles.backButton}
                    type="button"
                    onClick={() => router.back()}
                >
                    ← Retour
                </button>

                <form onSubmit={handleSubmit}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.title}>Ajouter une propriété</h1>

                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Ajout..." : "Ajouter"}
                        </button>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.grid}>
                        <section className={styles.card}>
                            <div className={styles.field}>
                                <label htmlFor="title">Titre de la propriété</label>
                                <input
                                    id="title"
                                    type="text"
                                    placeholder="Ex : Appartement cosy au coeur de paris"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    placeholder="Décrivez votre propriété en détail..."
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="postalCode">Code postal</label>
                                <input
                                    id="postalCode"
                                    type="text"
                                    value={postalCode}
                                    onChange={(event) => setPostalCode(event.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="location">Localisation</label>
                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                />
                            </div>
                        </section>

                        <div className={styles.rightColumn}>
                            <section className={styles.card}>
                                <div className={styles.field}>
                                    <label htmlFor="cover">Image de couverture</label>

                                    <div className={styles.inlineInput}>
                                        <div className={styles.fakeFileInput}>
                                            {coverFile ? coverFile.name : "Aucun fichier sélectionné"}
                                        </div>

                                        <button
                                            className={styles.squareButton}
                                            type="button"
                                            aria-label="Sélectionner une image de couverture"
                                            onClick={() => coverInputRef.current?.click()}
                                        >
                                            +
                                        </button>

                                        <input
                                            id="cover"
                                            ref={coverInputRef}
                                            className={styles.hiddenFileInput}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={(event) => {
                                                setCoverFile(event.target.files?.[0] ?? null);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="picture">Image du logement</label>

                                    <div className={styles.inlineInput}>
                                        <div className={styles.fakeFileInput}>
                                            {pictureFiles.length > 0
                                                ? `${pictureFiles.length} image(s) sélectionnée(s)`
                                                : "Aucun fichier sélectionné"}
                                        </div>

                                        <button
                                            className={styles.squareButton}
                                            type="button"
                                            aria-label="Sélectionner des images du logement"
                                            onClick={() => pictureInputRef.current?.click()}
                                        >
                                            +
                                        </button>

                                        <input
                                            id="picture"
                                            ref={pictureInputRef}
                                            className={styles.hiddenFileInput}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            multiple
                                            onChange={(event) => {
                                                setPictureFiles(Array.from(event.target.files ?? []));
                                            }}
                                        />
                                    </div>

                                    <p className={styles.textAction}>+Ajouter une image</p>
                                </div>
                            </section>

                            <section className={styles.card}>
                                <div className={styles.field}>
                                    <label htmlFor="hostName">Nom de l’hôte</label>
                                    <input
                                        id="hostName"
                                        type="text"
                                        value={hostName}
                                        onChange={(event) => setHostName(event.target.value)}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="hostPicture">Photo de profil</label>

                                    <div className={styles.inlineInput}>
                                        <div className={styles.fakeFileInput}>
                                            {hostPictureFile ? hostPictureFile.name : "Aucun fichier sélectionné"}
                                        </div>

                                        <button
                                            className={styles.squareButton}
                                            type="button"
                                            aria-label="Sélectionner une photo de profil"
                                            onClick={() => hostPictureInputRef.current?.click()}
                                        >
                                            +
                                        </button>

                                        <input
                                            id="hostPicture"
                                            ref={hostPictureInputRef}
                                            className={styles.hiddenFileInput}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={(event) => {
                                                setHostPictureFile(event.target.files?.[0] ?? null);
                                            }}
                                        />
                                    </div>

                                    <p className={styles.textAction}>+Ajouter une image</p>
                                </div>
                            </section>
                        </div>

                        <section className={styles.card}>
                            <h2 className={styles.sectionTitle}>Équipements</h2>

                            <div className={styles.checkboxGrid}>
                                {equipments.map((equipment) => (
                                    <label className={styles.checkboxLabel} key={equipment}>
                                        <input
                                            type="checkbox"
                                            checked={selectedEquipments.includes(equipment)}
                                            onChange={() => toggleEquipment(equipment)}
                                        />
                                        {equipment}
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section className={styles.card}>
                            <h2 className={styles.sectionTitle}>Catégories</h2>

                            <div className={styles.tags}>
                                {defaultTags.map((tag) => (
                                    <button
                                        className={`${styles.tag} ${selectedTags.includes(tag) ? styles.tagActive : ""
                                            }`}
                                        type="button"
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            <div className={styles.customTagBlock}>
                                <label htmlFor="customTag">
                                    Ajouter une catégorie personnalisée
                                </label>

                                <div className={styles.inlineInput}>
                                    <input
                                        id="customTag"
                                        type="text"
                                        placeholder="Nouveau tag"
                                        value={customTag}
                                        onChange={(event) => setCustomTag(event.target.value)}
                                    />
                                    <button
                                        className={styles.squareButton}
                                        type="button"
                                        onClick={addCustomTag}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className={styles.textAction}
                                    type="button"
                                    onClick={addCustomTag}
                                >
                                    +Ajouter un tag
                                </button>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </main>
    );
}