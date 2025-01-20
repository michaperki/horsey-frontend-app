// src/App.test.js

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // Adjust import if necessary
import App from "./App";

const renderWithProviders = (ui, { route = "/" } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
};

describe("App Component", () => {
  test("renders the Landing page by default", () => {
    renderWithProviders(<App />, { route: "/" });

    expect(
      screen.getByText(/Welcome to Chess Betting Platform/i)
    ).toBeInTheDocument();
  });

  test("navigates to the Register page", () => {
    renderWithProviders(<App />, { route: "/register" });

    const heading = screen.getByRole("heading", { name: /Register/i });
    expect(heading).toBeInTheDocument();
  });

  test("redirects to login when accessing protected routes without authentication", () => {
    renderWithProviders(<App />, { route: "/home" }); // Updated from "/dashboard"

    expect(screen.getByRole("heading", { name: /User Login/i })).toBeInTheDocument();
  });

  test("renders LichessCallback component", () => {
    renderWithProviders(<App />, { route: "/auth/lichess/callback" });

    expect(screen.getByText(/Lichess Connection/i)).toBeInTheDocument();
  });
});
