import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { MainLayout, ProtectedRoute } from '../components/layout';
import { PageLoader } from '../components/common';
import { useAuthStore } from '../store/authStore';
import {
  AdminDashboard,
  ApprovalsPage,
  CategoriesPage,
  ChatsPage,
  CustomerDashboard,
  FavoritesPage,
  HomePage,
  IncomingRequestsPage,
  LoginPage,
  NotFoundPage,
  ProfessionalDashboard,
  ProfessionalProfileEdit,
  ProfessionalProfilePage,
  ProfessionalRegisterPage,
  ProfessionalSettingsPage,
  QuoteRequestPage,
  QuotesPage,
  RegisterPage,
  ReviewsPage,
  SearchPage,
  SettingsPage,
  StatisticsPage,
  UsersPage,
} from './routerImports';

const AppContent = () => {
  const { checkAuth, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated) {
      checkAuth();
    }
  }, [_hasHydrated]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* PUBLIC */}
        <Route element={<MainLayout />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/search' element={<SearchPage />} />
          <Route path='/search/:category' element={<SearchPage />} />
          <Route
            path='/professional/:id'
            element={<ProfessionalProfilePage />}
          />
        </Route>

        {/* AUTH */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* CUSTOMER */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route element={<MainLayout />}>
            <Route path='/dashboard' element={<CustomerDashboard />} />
            <Route path='/favorites' element={<FavoritesPage />} />
            <Route path='/quotes' element={<QuotesPage />} />
            <Route path='/quotes/:id' element={<QuotesPage />} />
            <Route path='/settings' element={<SettingsPage />} />
          </Route>
        </Route>

        {/* QUOTE */}
        <Route element={<MainLayout />}>
          <Route
            path='/professional/:id/quote'
            element={<QuoteRequestPage />}
          />
        </Route>

        {/* PROFESSIONAL - REGISTRATION */}
        <Route element={<MainLayout />}>
          <Route path='/pro/register' element={<ProfessionalRegisterPage />} />
        </Route>

        {/* PROFESSIONAL */}
        <Route element={<ProtectedRoute allowedRoles={['professional']} />}>
          <Route element={<MainLayout />}>
            <Route path='/pro/dashboard' element={<ProfessionalDashboard />} />
            <Route
              path='/pro/profile/edit'
              element={<ProfessionalProfileEdit />}
            />
            <Route path='/pro/requests' element={<IncomingRequestsPage />} />
            <Route path='/pro/chats' element={<ChatsPage />} />
            <Route path='/pro/chats/:id' element={<ChatsPage />} />
            <Route path='/pro/statistics' element={<StatisticsPage />} />
            <Route
              path='/pro/settings'
              element={<ProfessionalSettingsPage />}
            />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
          <Route element={<MainLayout />}>
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/admin/approvals' element={<ApprovalsPage />} />
            <Route path='/admin/users' element={<UsersPage />} />
            <Route path='/admin/professionals' element={<UsersPage />} />
            <Route path='/admin/categories' element={<CategoriesPage />} />
            <Route path='/admin/reviews' element={<ReviewsPage />} />
            <Route path='/admin/complaints' element={<ReviewsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route element={<MainLayout />}>
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
