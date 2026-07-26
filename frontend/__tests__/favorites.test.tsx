import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FavoritesPage from "@/app/favorites/page";
import { apiFetchWithAuth } from "@/lib/api";

vi.mock("@/lib/api", () => ({
    apiFetch: vi.fn(),
    apiFetchWithAuth: vi.fn(),
}));

const mockedApiFetchWithAuth = vi.mocked(apiFetchWithAuth);

describe("FavoritesPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        localStorage.setItem("token", "fake-token");
        localStorage.setItem(
            "user",
            JSON.stringify({
                id: 15,
                name: "Leone Ugo",
                email: "ugomael@gmail.com",
                role: "owner",
            })
        );
    });

    it("shows all favorite property cards returned by the backend", async () => {
        mockedApiFetchWithAuth.mockResolvedValue([
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

        render(<FavoritesPage />);

        expect(
            screen.getByRole("heading", {
                name: "Vos favoris",
            })
        ).toBeTruthy();

        expect(await screen.findByText("Appartement cosy")).toBeTruthy();
        expect(
            await screen.findByText("Magnifique appartement proche Canal Saint Martin")
        ).toBeTruthy();
        expect(await screen.findByText("Studio de charme - Buttes Chaumont"))
            .toBeTruthy();

        expect(screen.getByText("100€")).toBeTruthy();
        expect(screen.getByText("110€")).toBeTruthy();
        expect(screen.getByText("120€")).toBeTruthy();

        expect(
            screen.getAllByRole("button", { name: "Retirer des favoris" })
        ).toHaveLength(3);

        await waitFor(() => {
            expect(mockedApiFetchWithAuth).toHaveBeenCalledWith(
                "/api/users/15/favorites"
            );
        });
    });

    it("shows an empty message when the user has no favorites", async () => {
        mockedApiFetchWithAuth.mockResolvedValue([]);

        render(<FavoritesPage />);

        expect(
            await screen.findByText(
                "Vous n’avez pas encore ajouté de logement à vos favoris."
            )
        ).toBeTruthy();

        expect(mockedApiFetchWithAuth).toHaveBeenCalledWith(
            "/api/users/15/favorites"
        );
    });

    it("shows an error message when favorites cannot be loaded", async () => {
        mockedApiFetchWithAuth.mockRejectedValue(
            new Error("Impossible de charger les favoris.")
        );

        render(<FavoritesPage />);

        expect(
            await screen.findByText("Impossible de charger les favoris.")
        ).toBeTruthy();

        expect(mockedApiFetchWithAuth).toHaveBeenCalledWith(
            "/api/users/15/favorites"
        );
    });
});