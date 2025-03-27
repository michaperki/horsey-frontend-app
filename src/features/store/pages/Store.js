// src/features/store/pages/Store.js

import React from 'react';
import StoreComponent from '../components/Store';
import { AuthProvider } from 'features/auth/contexts/AuthContext';
import { TokenProvider } from 'features/token/contexts/TokenContext';
import { SelectedTokenProvider } from 'features/token/contexts/SelectedTokenContext';

const StorePage = () => {
  return (
    <AuthProvider>
      <TokenProvider>
        <SelectedTokenProvider>
          <StoreComponent />
        </SelectedTokenProvider>
      </TokenProvider>
    </AuthProvider>
  );
};

export default StorePage;