import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserAuthenticationProvider } from '../features/user_authentication/UserAuthenticationContext';
import { ApplicationRouter } from './routing';
import '../shared_user_interface_infrastructure/UserInterfaceDesignSystem.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserAuthenticationProvider>
      <ApplicationRouter />
    </UserAuthenticationProvider>
  </React.StrictMode>
);
