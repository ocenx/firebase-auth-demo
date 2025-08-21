import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // ✅ import auth
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileEditPage from "./pages/Profile"; 
import Chat from "./pages/Chat";
import TodoPage from "./pages/TodoPage";
import FilesPage from "./pages/FilesPage";
import EventsPage from "./pages/EventsPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import FavoritesPage from "./pages/FavoritePages";
import Products from "./pages/Products";
import AdminEventsPage from "./pages/AdminEventPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import BlogPage from "./pages/BlogPage";
import WelcomePage from "./pages/WelcomePage"; 
import NotificationDetailPage from "./pages/NotificationDetailPage";
import MyPostsPage from "./pages/MyPostPage";
import AuthRoute from "./components/AuthRoute";
import Loader from "./components/Loader"; 
import FeedbackPage from "./pages/FeedbackPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />; // wait for Firebase check

  return (
    <Routes>
      {/* ✅ Public routes (guarded with AuthRoute) */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <Signup />
          </AuthRoute>
        }
      />
      <Route path="/blog" element={<BlogPage />} />

      {/* ✅ Root: smart redirect */}
      <Route
        path="/"
        element={
          user ? (
            user.isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/welcome" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ✅ Authenticated user routes */}
      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/todo"
        element={
          <ProtectedRoute>
            <TodoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <FilesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications/:id"
        element={
          <ProtectedRoute>
            <NotificationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/myposts"
        element={
          <ProtectedRoute>
            <MyPostsPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ Admin-only routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute requireAdmin>
            <AdminEventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute requireAdmin>
            <AdminProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute requireAdmin>
            <AdminNotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
  path="/feedback"
  element={
    <ProtectedRoute>
      <FeedbackPage />
    </ProtectedRoute>
  }
/>
      {/* ✅ NEW: Admin Feedback */}
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute requireAdmin>
            <AdminFeedbackPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ Default fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
