import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App Component", () => {
  test("renders the Home page by default", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to Chess Betting Platform/i)).toBeInTheDocument();
  });

  test("navigates to the Register page", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );

    // Use query to specifically target the <h2> in the Register page
    const heading = screen.getByRole("heading", { name: /Register/i });
    expect(heading).toBeInTheDocument();
  });

  test("redirects to login when accessing protected routes", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    );

    // Use role to find the specific button or heading for User Login
    const heading = screen.getByRole("heading", { name: /User Login/i });
    expect(heading).toBeInTheDocument();
  });
});
