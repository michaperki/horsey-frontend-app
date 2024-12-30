// src/components/__tests__/PlaceBet.test.js

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlaceBet from "./PlaceBet";
import { placeBet } from "../services/api";

// Mock the placeBet function
jest.mock("../services/api", () => ({
  placeBet: jest.fn(),
}));

// Helper function to set up localStorage
const setLocalStorage = (token) => {
  Storage.prototype.getItem = jest.fn(() => token);
};

describe("PlaceBet Component", () => {
  beforeEach(() => {
    fetch.resetMocks();
    jest.clearAllMocks();
  });

  test("renders correctly with initial state", async () => {
    setLocalStorage("mock-token");
    fetch.mockResponseOnce(
      JSON.stringify({ balance: 100 }),
      { status: 200 }
    );

    render(<PlaceBet />);

    expect(screen.getByText(/Place a Bet/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Amount to Bet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Place Bet/i })).toBeInTheDocument();

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 100 PTK/i)).toBeInTheDocument();
    });
  });

  test("displays user balance after fetching", async () => {
    setLocalStorage("mock-token");
    fetch.mockResponseOnce(
      JSON.stringify({ balance: 150 }),
      { status: 200 }
    );

    render(<PlaceBet />);

    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 150 PTK/i)).toBeInTheDocument();
    });
  });

  test("shows message if user is not logged in", async () => {
    setLocalStorage(null); // No token

    render(<PlaceBet />);

    await waitFor(() => {
      expect(screen.getByText(/Please log in to view your balance./i)).toBeInTheDocument();
    });
  });

  test("allows placing a bet with valid amount and color", async () => {
    setLocalStorage("mock-token");
    fetch.mockResponseOnce(
      JSON.stringify({ balance: 200 }),
      { status: 200 }
    );

    // Mock placeBet API response
    placeBet.mockResolvedValueOnce({
      gameLink: "http://example.com/game",
    });

    // Mock window.open
    window.open = jest.fn();

    render(<PlaceBet />);

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 200 PTK/i)).toBeInTheDocument();
    });

    // Select creator color
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "black" } });

    // Enter amount
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: "50" } });

    // Click Place Bet
    fireEvent.click(screen.getByRole("button", { name: /Place Bet/i }));

    // Check loading state
    expect(screen.getByRole("button", { name: /Placing Bet.../i })).toBeDisabled();

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Bet placed successfully!/i)).toBeInTheDocument();
    });

    // Check window.open called
    expect(window.open).toHaveBeenCalledWith("http://example.com/game", "_blank");

    // Check updated balance
    expect(screen.getByText(/Your Balance: 150 PTK/i)).toBeInTheDocument();

    // Check that inputs are reset
    expect(screen.getByRole("combobox")).toHaveValue("random");
    expect(screen.getByPlaceholderText(/Amount to Bet/i)).toHaveValue(null);
  });

  test("handles placing a bet with invalid amount", async () => {
    setLocalStorage("mock-token");
    fetch.mockResponseOnce(
      JSON.stringify({ balance: 100 }),
      { status: 200 }
    );

    render(<PlaceBet />);

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 100 PTK/i)).toBeInTheDocument();
    });

    // Enter invalid amount (zero)
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: "0" } });

    // Click Place Bet
    fireEvent.click(screen.getByRole("button", { name: /Place Bet/i }));

    // Check error message asynchronously
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid bet amount./i)).toBeInTheDocument();
    });
  });

  test("handles placing a bet with insufficient balance", async () => {
    setLocalStorage("mock-token");
    fetch.mockResponseOnce(
      JSON.stringify({ balance: 30 }),
      { status: 200 }
    );

    render(<PlaceBet />);

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 30 PTK/i)).toBeInTheDocument();
    });

    // Enter amount greater than balance
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: "50" } });

    // Click Place Bet
    fireEvent.click(screen.getByRole("button", { name: /Place Bet/i }));

    // Check error message asynchronously
    await waitFor(() => {
      expect(screen.getByText(/Insufficient balance to place the bet./i)).toBeInTheDocument();
    });
  });

  test("handles API failure when fetching balance", async () => {
    setLocalStorage("mock-token");
    fetch.mockRejectOnce(new Error("Network Error"));

    render(<PlaceBet />);

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred while fetching your balance./i)).toBeInTheDocument();
    });
  });

  test("handles API failure when placing a bet", async () => {
    setLocalStorage("mock-token");
    fetch.mockResponseOnce(
      JSON.stringify({ balance: 100 }),
      { status: 200 }
    );

    // Mock placeBet to reject
    placeBet.mockRejectedValueOnce(new Error("Failed to place bet"));

    render(<PlaceBet />);

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 100 PTK/i)).toBeInTheDocument();
    });

    // Enter amount
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: "50" } });

    // Click Place Bet
    fireEvent.click(screen.getByRole("button", { name: /Place Bet/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to place bet/i)).toBeInTheDocument();
    });
  });

  test("disables Place Bet button only when loading or amount is empty", async () => {
    setLocalStorage("mock-token");
    fetch.mockResponseOnce(
      JSON.stringify({ balance: 100 }),
      { status: 200 }
    );

    render(<PlaceBet />);

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 100 PTK/i)).toBeInTheDocument();
    });

    const button = screen.getByRole("button", { name: /Place Bet/i });

    // Initially disabled because amount is empty
    expect(button).toBeDisabled();

    // Enter valid amount
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: "50" } });
    expect(button).not.toBeDisabled();

    // Enter invalid amount (negative)
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: "-10" } });
    expect(button).not.toBeDisabled(); // Button should still be enabled

    // Enter amount exceeding balance
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: "150" } });
    expect(button).not.toBeDisabled(); // Button should still be enabled
  });

  test("prompts user to log in if token is missing when placing a bet", async () => {
    setLocalStorage(null); // No token
    fetch.mockResponseOnce(
      JSON.stringify({ balance: 0 }),
      { status: 200 }
    );

    render(<PlaceBet />);

    await waitFor(() => {
      expect(screen.getByText(/Please log in to view your balance./i)).toBeInTheDocument();
    });

    // Enter a valid amount to bypass the initial balance fetch message
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: "10" } });

    // Click Place Bet
    fireEvent.click(screen.getByRole("button", { name: /Place Bet/i }));

    // Check message prompting to log in asynchronously
    await waitFor(() => {
      expect(screen.getByText(/Please log in to place a bet./i)).toBeInTheDocument();
    });
  });
});
