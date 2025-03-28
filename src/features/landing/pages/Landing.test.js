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
    // Clear mocks
    jest.clearAllMocks();
    mockStorage = {};
    
    // Setup localStorage mock
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
    
    // Silence console.error for all tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Tests for direct token validation functionality
  describe("Token Validation", () => {
    it("redirects to admin dashboard if a valid admin token is present", () => {
      // Setup - render the component so the testTokenValidation function is available
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      
      // Mock jwtDecode to return admin role
      jwtDecode.mockReturnValue({ role: "admin" });
      
      // Test the token validation function directly
      const result = window.testTokenValidation("adminToken", mockNavigate);
      
      // Verify result and navigation
      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
    
    it("redirects to home if a valid non-admin token is present", () => {
      // Setup - render the component so the testTokenValidation function is available
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      
      // Mock jwtDecode to return user role
      jwtDecode.mockReturnValue({ role: "user" });
      
      // Test the token validation function directly
      const result = window.testTokenValidation("userToken", mockNavigate);
      
      // Verify result and navigation
      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
    
    it("removes an invalid token from localStorage", () => {
      // Setup - render the component so the testTokenValidation function is available
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      
      // Set up localStorage mock
      localStorage.setItem("token", "invalidToken");
      
      // Mock jwtDecode to throw an error
      jwtDecode.mockImplementation(() => {
        throw new Error("Invalid token");
      });
      
      // Test the token validation function directly
      const result = window.testTokenValidation("invalidToken", mockNavigate);
      
      // Verify localStorage removal and no navigation
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
      
      // Check for static content
      expect(screen.getByText("Welcome to Horsey")).toBeInTheDocument();
      expect(
        screen.getByText("Bet, Play, Win. Join the ultimate chess gaming experience!")
      ).toBeInTheDocument();
      expect(screen.getByText("Live Stats")).toBeInTheDocument();
      
      // Check for buttons
      expect(screen.getByText("Get Started")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
    
    it("navigates to the register page when 'Get Started' is clicked", () => {
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      
      // Reset navigation mock
      mockNavigate.mockReset();
      
      // Click the Get Started button
      fireEvent.click(screen.getByText("Get Started"));
      
      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith("/register");
    });
    
    it("navigates to the login page when 'Login' is clicked", () => {
      render(
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      );
      
      // Reset navigation mock
      mockNavigate.mockReset();
      
      // Click the Login button
      fireEvent.click(screen.getByText("Login"));
      
      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});