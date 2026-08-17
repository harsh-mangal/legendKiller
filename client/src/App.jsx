import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { useAuth } from "./context/AuthContext";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const AddressesPage = lazy(() => import("./pages/AddressesPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ArticlesPage = lazy(() => import("./pages/ArticlesPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CategoryProductsPage = lazy(() => import("./pages/CategoryProductsPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ComboViewPage = lazy(() => import("./pages/ComboViewPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const OrderResultPage = lazy(() => import("./pages/OrderResultPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const PolicyPage = lazy(() => import("./pages/PolicyPage"));
const ProductViewPage = lazy(() => import("./pages/ProductViewPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ProductVerifyPage = lazy(() => import("./pages/ProductVerifyPage"));

function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center" role="status">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
          <p className="mt-3 text-sm text-slate-500">Checking your session…</p>
        </div>
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
}

function TrailingSlashRemover() {
  const location = useLocation();
  if (location.pathname !== "/" && location.pathname.endsWith("/")) {
    return <Navigate to={{ pathname: location.pathname.replace(/\/+$/, ""), search: location.search, hash: location.hash }} replace />;
  }
  return null;
}

export default function App() {
  return (
    <>
      <TrailingSlashRemover />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductViewPage />} />
        <Route path="/combos/:slug" element={<ComboViewPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:slug" element={<CategoryProductsPage />} />
        <Route path="/category/:slug" element={<NavigateCategory />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-result/:orderId" element={<OrderResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/verify/:code" element={<ProductVerifyPage />} />
        <Route path="/verify" element={<ProductVerifyPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/policies/:policy" element={<PolicyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      </Routes>
    </Suspense>
    </>
  );
}

function RouteLoading() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
        <p className="mt-3 text-sm text-slate-500">Loading page…</p>
      </div>
    </div>
  );
}

function NavigateCategory() {
  const location = useLocation();
  const slug = location.pathname.split("/").filter(Boolean).pop();
  return <Navigate to={`/categories/${slug}`} replace />;
}
