import { Outlet, useLocation } from "react-router-dom";
import CartDrawer from "../CartDrawer";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import Navbar from "./Navbar";
import RouteMeta from "./RouteMeta";
import ScrollToTop from "./ScrollToTop";

const bottomNavHiddenPrefixes = [
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function Layout() {
  const { pathname } = useLocation();
  const bottomNavHidden = bottomNavHiddenPrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className={`${bottomNavHidden ? "" : "mobile-bottom-offset"} flex min-h-screen flex-col bg-white text-slate-800 lg:pb-0`}>
      <RouteMeta />
      <Navbar />
      <main className="flex-1 pt-[100px] sm:pt-[112px] lg:pt-[128px]">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <MobileBottomNav />
      <CartDrawer />
    </div>
  );
}
