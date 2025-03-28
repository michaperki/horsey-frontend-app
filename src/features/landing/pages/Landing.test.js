// src/features/landing/pages/Landing.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Landing from "./Landing";

// Mocking the jwt-decode library
jest.mock("jwt-decode");

// Mock for useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock socket context
jest.mock("features/common/contexts/SocketContext", () => ({
  useSocket: () => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  })
}));

describe("Landing Component", () => {
  // Mock localStorage
  let mockStorage = {};
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => mockStorage[key] || null),
        setItem: jest.fn((key, value) => {
          mockStorage[key] = String(value);
        }),
        removeItem: jest.fn(key => {
          delete mockStorage[key];
        }),
        clear: jest.fn(() => {
          mockStorage = {};
        })
      },
      writable: true
    });
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Tests for direct token validation functionality
  describe("Token Validation", () => {
    it("redirects to admin dashboard if a valid admin token is present", () => {
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      jwtDecode.mockReturnValue({ role: "admin" });
      const result = window.testTokenValidation("adminToken", mockNavigate);
      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
    
    it("redirects to home if a valid non-admin token is present", () => {
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      jwtDecode.mockReturnValue({ role: "user" });
      const result = window.testTokenValidation("userToken", mockNavigate);
      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
    
    it("removes an invalid token from localStorage", () => {
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      localStorage.setItem("token", "invalidToken");
      jwtDecode.mockImplementation(() => {
        throw new Error("Invalid token");
      });
      const result = window.testTokenValidation("invalidToken", mockNavigate);
      expect(result).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // UI tests
  describe("UI Elements", () => {
    it("renders the landing page content correctly", () => {
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      // Verify content matches the updated component text
      expect(screen.getByText("HORSEY")).toBeInTheDocument();
      expect(screen.getByText("The Ultimate Chess Betting Platform")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Bet, Play, Win. Challenge players, make strategic wagers, and climb the leaderboards."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Live Platform Stats")).toBeInTheDocument();
      // Verify buttons
      expect(screen.getByText("Get Started")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Join Horsey Now")).toBeInTheDocument();
    });
    
    it("navigates to the register page when 'Get Started' is clicked", () => {
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      mockNavigate.mockReset();
      fireEvent.click(screen.getByText("Get Started"));
      expect(mockNavigate).toHaveBeenCalledWith("/register");
    });
    
    it("navigates to the login page when 'Login' is clicked", () => {
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      mockNavigate.mockReset();
      fireEvent.click(screen.getByText("Login"));
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
