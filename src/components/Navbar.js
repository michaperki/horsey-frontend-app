
// frontend/src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import Logout from "./Auth/Logout";

const Navbar = () => {
  const token = localStorage.getItem("token");

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>
        Home
      </Link>
      {token && (
        <>
          <Link to="/admin/mint" style={styles.link}>
            Mint Tokens
          </Link>
          <Link to="/admin/balance" style={styles.link}>
            Check Balance
          </Link>
          <Link to="/admin/transfer" style={styles.link}>
            Transfer Tokens
          </Link>
          <Link to="/admin/validate-result" style={styles.link}>
            Validate Result
          </Link>
          <Logout />
        </>
      )}
      {!token && (
        <Link to="/admin/login" style={styles.link}>
          Admin Login
        </Link>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px",
    backgroundColor: "#343a40",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "0 10px",
  },
};

export default Navbar;

