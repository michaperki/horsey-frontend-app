
// src/App.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock the AuthContext before importing App
jest.mock("./contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Now import useAuth and App after mocking
import { useAuth } from "./contexts/AuthContext";
import App from "./App";

describe("App Routing", () => {
  beforeEach(() => {
    // Set default mock implementation for useAuth
    useAuth.mockReturnValue({
      token: "test-token",
      user: { role: "user" }, // Default to 'user' role
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  afterEach(() => {
    // Reset all mocks after each test to avoid interference
    jest.resetAllMocks();
  });

  test("renders Landing page by default", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // Match the correct text from the Landing page
    expect(screen.getByText(/Welcome to Horsey/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Bet, Play, Win. Join the ultimate chess gaming experience!/i)
    ).toBeInTheDocument();
  });

  test("renders Register page when navigated to /register", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );

    // Use `getAllByText` since there are multiple elements with "Register"
    const registerTexts = screen.getAllByText(/Register/i);
    expect(registerTexts.length).toBeGreaterThan(0);
  });

  test("renders UserLogin page when navigated to /login", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    // Use `getAllByText` since there are multiple elements with "Login"
    const loginTexts = screen.getAllByText(/Login/i);
    expect(loginTexts.length).toBeGreaterThan(0);
  });

  test("renders AdminLogin page when navigated to /admin/login", () => {
    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <App />
      </MemoryRouter>
    );

    // Match the correct text from the AdminLogin page
    expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();
  });

  test("renders Lobby page for protected route", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <App />
      </MemoryRouter>
    );

    // Match the correct text from the Lobby page
    expect(screen.getByText(/Lobby/i)).toBeInTheDocument();
  });

  // test("renders Admin Dashboard for admin role", () => {
  //   // Override the default mock to simulate an admin user
  //   useAuth.mockReturnValue({
  //     token: "admin-token",
  //     user: { role: "admin" },
  //     login: jest.fn(),
  //     logout: jest.fn(),
  //   });
  //
  //   render(
  //     <MemoryRouter initialEntries={["/admin/dashboard"]}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //
  //   // Match the correct text from the Admin Dashboard
  //   expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  // });

  test("renders Store page when navigated to /store", () => {
    render(
      <MemoryRouter initialEntries={["/store"]}>
        <App />
      </MemoryRouter>
    );

    // Use `getAllByText` since there are multiple elements with "Store"
    const storeTexts = screen.getAllByText(/Store/i);
    expect(storeTexts.length).toBeGreaterThan(0);
  });
});

