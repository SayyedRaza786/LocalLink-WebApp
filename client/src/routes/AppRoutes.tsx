import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load public pages
const Home = lazy(() => import('../pages/public/Home'));
const Search = lazy(() => import('../pages/public/Search'));
const ProviderDetail = lazy(() => import('../pages/public/ProviderDetail'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Unauthorized = lazy(() => import('../pages/public/Unauthorized'));
const NotFound = lazy(() => import('../pages/public/NotFound'));

// Lazy load Customer pages
const CustomerDashboard = lazy(() => import('../pages/customer/CustomerDashboard'));
const CustomerBookings = lazy(() => import('../pages/customer/BookingsList'));
const CustomerBookingDetail = lazy(() => import('../pages/customer/BookingDetail'));
const CustomerFavorites = lazy(() => import('../pages/customer/Favorites'));
const CustomerNotifications = lazy(() => import('../pages/customer/Notifications'));
const CustomerProfile = lazy(() => import('../pages/customer/Profile'));

// Lazy load Provider pages
const ProviderDashboard = lazy(() => import('../pages/provider/ProviderDashboard'));
const ProviderServices = lazy(() => import('../pages/provider/ServicesList'));
const ProviderBookings = lazy(() => import('../pages/provider/BookingsQueue'));
const ProviderAvailability = lazy(() => import('../pages/provider/AvailabilityPlanner'));
const ProviderGallery = lazy(() => import('../pages/provider/GalleryManager'));
const ProviderReviews = lazy(() => import('../pages/provider/ReviewsList'));
const ProviderNotifications = lazy(() => import('../pages/provider/Notifications'));
const ProviderProfile = lazy(() => import('../pages/provider/Profile'));

// Lazy load Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminCategories = lazy(() => import('../pages/admin/CategoriesManager'));
const AdminUsers = lazy(() => import('../pages/admin/UsersManager'));
const AdminProviders = lazy(() => import('../pages/admin/ProvidersManager'));
const AdminReports = lazy(() => import('../pages/admin/ReportsManager'));
const AdminProfile = lazy(() => import('../pages/admin/Profile'));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner minHeight="100vh" message="Initializing LocalLink..." />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/providers/:id" element={<ProviderDetail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Auth Routes without Navbar and Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/bookings" element={<CustomerBookings />} />
            <Route path="/customer/bookings/:id" element={<CustomerBookingDetail />} />
            <Route path="/customer/favorites" element={<CustomerFavorites />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
          </Route>
        </Route>

        {/* Protected Provider Routes */}
        <Route element={<ProtectedRoute allowedRoles={['PROVIDER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/services" element={<ProviderServices />} />
            <Route path="/provider/bookings" element={<ProviderBookings />} />
            <Route path="/provider/availability" element={<ProviderAvailability />} />
            <Route path="/provider/gallery" element={<ProviderGallery />} />
            <Route path="/provider/reviews" element={<ProviderReviews />} />
            <Route path="/provider/notifications" element={<ProviderNotifications />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* 404 Route */}
        <Route element={<MainLayout />}>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
export default AppRoutes;
