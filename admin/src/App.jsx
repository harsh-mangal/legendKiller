import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import Combos from "./pages/Combos";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Reviews from "./pages/Reviews";
import Promotions from "./pages/Promotions";
import Delivery from "./pages/Delivery";
import Enquiries from "./pages/Enquiries";
import Banners from "./pages/Banners";
import Testimonials from "./pages/Testimonials";
import Articles from "./pages/Articles";
import CoinSettings from "./pages/CoinSettings";
import Operations from "./pages/Operations";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
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
              <Route path="blogs" element={<Navigate to="/articles" replace />} />
              <Route path="ameyka-coins" element={<CoinSettings />} />
              <Route path="amyeka-coin-settings" element={<Navigate to="/ameyka-coins" replace />} />
              <Route path="operations" element={<Operations />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
