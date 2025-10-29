import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts';
import { ProtectedRoute } from './components';
import { Header, Footer } from './components/navigation';
import ArticleList from './pages/ArticleList';
import ArticleDetail from './pages/ArticleDetail';
import ArticleForm from './pages/ArticleForm';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import MyArticles from './pages/MyArticles';
import LoginNew from './pages/LoginNew';
import RegisterNew from './pages/RegisterNew';
import ArticleFormTest from './pages/ArticleFormTest';
import { colors } from './theme/designTokens';

function App() {
  return (
    <>
      <CssBaseline />
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flexGrow: 1, backgroundColor: colors.background.primary }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<ArticleList />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/login" element={<LoginNew />} />
              <Route path="/register" element={<RegisterNew />} />
              
              {/* Protected Routes - Editor/Admin */}
              {/* Test Route */}
              <Route
                path="/test-form"
                element={
                  <ProtectedRoute requireEditor>
                    <ArticleFormTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/articles/create"
                element={
                  <ProtectedRoute requireEditor>
                    <ArticleForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/articles/:id/edit"
                element={
                  <ProtectedRoute requireEditor>
                    <ArticleForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-articles"
                element={
                  <ProtectedRoute requireEditor>
                    <MyArticles />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Routes - Authenticated */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookmarks"
                element={
                  <ProtectedRoute>
                    <Bookmarks />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}

export default App;
