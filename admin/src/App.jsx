import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoadingState } from "./components/ui";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Categories = lazy(() => import("./pages/Categories"));
const Combos = lazy(() => import("./pages/Combos"));
const Orders = lazy(() => import("./pages/Orders"));
const Customers = lazy(() => import("./pages/Customers"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Promotions = lazy(() => import("./pages/Promotions"));
const Delivery = lazy(() => import("./pages/Delivery"));
const Enquiries = lazy(() => import("./pages/Enquiries"));
const Banners = lazy(() => import("./pages/Banners"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Articles = lazy(() => import("./pages/Articles"));
const Architectures = lazy(() => import("./pages/Architectures"));
const Patents = lazy(() => import("./pages/Patents"));
const PartnerInquiries = lazy(() => import("./pages/PartnerInquiries"));
const CoinSettings = lazy(() => import("./pages/CoinSettings"));
const Operations = lazy(() => import("./pages/Operations"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<div className="p-6"><LoadingState label="Loading admin section…" /></div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="categories" element={<Categories />} />
                <Route path="combos" element={<Combos />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="users" element={<Navigate to="/customers" replace />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="promotions" element={<Promotions />} />
                <Route path="delivery" element={<Delivery />} />
                <Route path="enquiries" element={<Enquiries />} />
                <Route path="banners" element={<Banners />} />
                <Route path="testimonials" element={<Testimonials />} />
                <Route path="articles" element={<Articles />} />
                <Route path="architectures" element={<Architectures />} />
                <Route path="patents" element={<Patents />} />
                <Route path="partner-inquiries" element={<PartnerInquiries />} />
                <Route path="blogs" element={<Navigate to="/articles" replace />} />
                <Route path="ameyka-coins" element={<CoinSettings />} />
                <Route path="amyeka-coin-settings" element={<Navigate to="/ameyka-coins" replace />} />
                <Route path="operations" element={<Operations />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
