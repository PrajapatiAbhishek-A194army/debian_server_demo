import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthentication } from '../features/user_authentication/UserAuthenticationContext';
import { GlobalLayout } from '../shared_user_interface_infrastructure/LayoutComponents';
import { UserLoginComponent } from '../features/user_authentication/UserLoginComponent';
import { UserRegistrationComponent } from '../features/user_authentication/UserRegistrationComponent';
import { CustomerShoeCatalogComponent } from '../features/shoe_catalog/CustomerShoeCatalogComponent';
import { AdminShoeCatalogComponent } from '../features/shoe_catalog/AdminShoeCatalogComponent';
import { ShoppingCartComponent } from '../features/shopping_cart/ShoppingCartComponent';
import { WishlistComponent } from '../features/wishlist/WishlistComponent';
import { CustomerOrderHistoryComponent } from '../features/order_management/CustomerOrderHistoryComponent';
import { AdminOrderManagementComponent } from '../features/order_management/AdminOrderManagementComponent';

// Guard for authenticated customer actions
const CustomerRouteGuard = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuthentication();

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || user.role !== 'customer') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Guard for administrator actions
const AdministratorRouteGuard = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuthentication();

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const ApplicationRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          {/* Public Routes */}
          <Route index element={<Navigate to="/catalog" replace />} />
          <Route path="catalog" element={<CustomerShoeCatalogComponent />} />
          <Route path="login" element={<UserLoginComponent />} />
          <Route path="register" element={<UserRegistrationComponent />} />

          {/* Customer Guarded Routes */}
          <Route
            path="cart"
            element={
              <CustomerRouteGuard>
                <ShoppingCartComponent />
              </CustomerRouteGuard>
            }
          />
          <Route
            path="wishlist"
            element={
              <CustomerRouteGuard>
                <WishlistComponent />
              </CustomerRouteGuard>
            }
          />
          <Route
            path="orders"
            element={
              <CustomerRouteGuard>
                <CustomerOrderHistoryComponent />
              </CustomerRouteGuard>
            }
          />

          {/* Administrator Guarded Routes */}
          <Route
            path="admin/catalog"
            element={
              <AdministratorRouteGuard>
                <AdminShoeCatalogComponent />
              </AdministratorRouteGuard>
            }
          />
          <Route
            path="admin/orders"
            element={
              <AdministratorRouteGuard>
                <AdminOrderManagementComponent />
              </AdministratorRouteGuard>
            }
          />

          {/* Fallback Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
