// frontend/src/components/Auth/Login.js
import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.open('http://localhost:5000/auth/google', "_self");
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;

