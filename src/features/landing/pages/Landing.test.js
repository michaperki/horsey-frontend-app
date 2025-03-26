
// frontend/src/pages/Landing.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Import the default export to mock
import Landing from "./Landing";

// Mocking the `jwt-decode` library
jest.mock("jwt-decode");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Landing Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("redirects to admin dashboard if a valid admin token is present", () => {
    const mockToken = "mockAdminToken";
    const mockDecoded = { role: "admin" };
    localStorage.setItem("token", mockToken);

    // Mock `jwtDecode` to return the decoded token
    jwtDecode.mockReturnValue(mockDecoded);

    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Verify navigation to the admin dashboard
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("redirects to home if a valid non-admin token is present", () => {
    const mockToken = "mockUserToken";
    const mockDecoded = { role: "user" };
    localStorage.setItem("token", mockToken);

    // Mock `jwtDecode` to return the decoded token
    jwtDecode.mockReturnValue(mockDecoded);

    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Verify navigation to the home page
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("removes an invalid token from localStorage", () => {
    const mockToken = "invalidToken";
    localStorage.setItem("token", mockToken);

    // Mock `jwtDecode` to throw an error
    jwtDecode.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Verify that the token is removed
    expect(localStorage.getItem("token")).toBeNull();
    // Ensure no navigation occurs
    expect(mockNavigate).not.toHaveBeenCalled();
  });

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

    // Simulate clicking the 'Get Started' button
    fireEvent.click(screen.getByText("Get Started"));

    // Verify navigation to the register page
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("navigates to the login page when 'Login' is clicked", () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Simulate clicking the 'Login' button
    fireEvent.click(screen.getByText("Login"));

    // Verify navigation to the login page
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
