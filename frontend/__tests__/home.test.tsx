import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import { apiFetch } from "@/lib/api";

vi.mock("@/lib/api", () => ({
    apiFetch: vi.fn(),
    apiFetchWithAuth: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);

describe("HomePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("shows all property cards returned by the backend", async () => {
        mockedApiFetch.mockResolvedValue([
            {
                id: "1",
                title: "Appartement cosy",
                cover: "/images/cosy.jpg",
                location: "Ile de France - Paris 17e",
                price_per_night: 100,
            },
            {
                id: "2",
                title: "Magnifique appartement proche Canal Saint Martin",
                cover: "/images/canal.jpg",
                location: "Ile de France - Paris 10e",
                price_per_night: 110,
            },
            {
                id: "3",
                title: "Studio de charme - Buttes Chaumont",
                cover: "/images/studio.jpg",
                location: "Ile de France - Paris 20e",
                price_per_night: 120,
            },
        ]);

        const page = await HomePage();
        render(page);

        expect(
            screen.getByRole("heading", {
                name: "Chez vous, partout et ailleurs",
            })
        ).toBeTruthy();

        expect(screen.getByText("Appartement cosy")).toBeTruthy();
        expect(
            screen.getByText("Magnifique appartement proche Canal Saint Martin")
        ).toBeTruthy();
        expect(screen.getByText("Studio de charme - Buttes Chaumont")).toBeTruthy();

        expect(screen.getByText("100€")).toBeTruthy();
        expect(screen.getByText("110€")).toBeTruthy();
        expect(screen.getByText("120€")).toBeTruthy();

        expect(
            screen.getAllByRole("button", { name: "Ajouter aux favoris" })
        ).toHaveLength(3);

        await waitFor(() => {
            expect(mockedApiFetch).toHaveBeenCalledWith("/api/properties");
        });
    });

    it("shows the how-it-works section", async () => {
        mockedApiFetch.mockResolvedValue([]);

        const page = await HomePage();
        render(page);

        expect(
            screen.getByRole("heading", {
                name: "Comment ça marche ?",
            })
        ).toBeTruthy();

        expect(screen.getByText("Recherchez")).toBeTruthy();
        expect(screen.getByText("Réservez")).toBeTruthy();
        expect(screen.getByText("Vivez l'expérience")).toBeTruthy();
    });
});