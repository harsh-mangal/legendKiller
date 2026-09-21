import { ChevronDown, Headphones, LogOut, MapPin, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { SITE } from "../../config/site";
import { useAuth } from "../../context/AuthContext";
import { ARCHITECTURES } from "../../data/architecturesData";
import { useModalDialog } from "../../hooks/useModalDialog";

export default function Sidebar({ open, onClose, links }) {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const [archOpen, setArchOpen] = useState(false);
  const { dialogRef, initialFocusRef } = useModalDialog(open, onClose);

  if (!open) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex min-h-12 items-center border-l-4 px-4 py-3 text-sm font-black uppercase tracking-wider transition ${isActive ? "border-[#FF5500] bg-[#1A1A22] text-[#FFB800]" : "border-transparent text-slate-300 hover:border-[#FF5500] hover:bg-[#121216] hover:text-white"}`;

  return (
    <div className="fixed inset-0 z-[110] xl:hidden" role="presentation">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-label="Close menu" />
      <aside ref={dialogRef} className="mobile-safe-bottom absolute left-0 top-0 flex h-full w-[88vw] max-w-[360px] flex-col overflow-y-auto bg-[#0A0A0C] border-r border-slate-800 px-5 pt-[calc(1rem+env(safe-area-inset-top))] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <Link to="/" onClick={onClose} className="block p-0" aria-label="Legend Killer Home">
            <img src="/logo.png" alt="Legend Killer" className="h-14 sm:h-16 w-auto max-w-[260px] object-contain block" />
          </Link>
          <button ref={initialFocusRef} type="button" onClick={onClose} className="icon-button" aria-label="Close menu"><X size={20} className="text-white" /></button>
        </div>

        <nav className="mt-5 flex flex-col gap-1" aria-label="Mobile navigation">
          {links.map((link) => {
            if (link.hasDropdown) {
              return (
                <div key={link.path} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <NavLink to={link.path} end={link.end} onClick={onClose} className={`flex-1 ${linkClass({ isActive: false })}`}>
                      {link.label}
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => setArchOpen((prev) => !prev)}
                      className="p-3 text-slate-400 hover:text-[#FFB800]"
                      aria-label="Toggle Architectures sub-menu"
                    >
                      <ChevronDown size={18} className={`transition-transform ${archOpen ? "rotate-180 text-[#FF5500]" : ""}`} />
                    </button>
                  </div>

                  {archOpen && (
                    <div className="ml-4 border-l border-slate-800 space-y-1 py-1">
                      {ARCHITECTURES.map((arch) => (
                        <NavLink
                          key={arch.id}
                          to={`/architectures/${arch.slug}`}
                          onClick={onClose}
                          className="block px-4 py-2 text-xs font-bold uppercase text-slate-400 hover:text-[#FFB800]"
                        >
                          {arch.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return <NavLink key={link.path} to={link.path} end={link.end} onClick={onClose} className={linkClass}>{link.label}</NavLink>;
          })}
          <NavLink to="/wishlist" onClick={onClose} className={linkClass}>WISHLIST</NavLink>
          <NavLink to="/track-order" onClick={onClose} className={linkClass}>TRACK ORDER</NavLink>
          {isLoggedIn && <NavLink to="/orders" onClick={onClose} className={linkClass}>MY ORDERS</NavLink>}
        </nav>

        <div className="mt-7 grid gap-3 border-y border-slate-800 py-5 text-sm">
          <a href={`tel:${SITE.supportPhoneHref}`} className="flex min-h-11 items-center gap-3 text-slate-300 font-bold"><Headphones size={18} className="text-[#FF5500]" /> {SITE.supportPhoneDisplay}</a>
          <Link to="/track-order" onClick={onClose} className="flex min-h-11 items-center gap-3 text-slate-300 font-bold"><MapPin size={18} className="text-[#FF5500]" /> Live Delivery Tracking</Link>
        </div>

        <div className="mt-auto border border-slate-800 bg-[#121216] p-4 rounded-none">
          {isLoggedIn ? (
            <>
              <p className="text-sm font-black uppercase text-white">{user?.name || user?.fullName || "Athlete"}</p>
              <Link to="/profile" onClick={onClose} className="mt-1 block min-h-8 text-xs font-bold text-[#FFB800] hover:underline">View Account</Link>
              <button type="button" onClick={handleLogout} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-black text-red-500 hover:text-red-400"><LogOut size={16} /> Sign Out</button>
            </>
          ) : (
            <div className="grid gap-2">
              <Link to="/login" onClick={onClose} className="btn-primary w-full text-center">Log In</Link>
              <Link to="/register" onClick={onClose} className="btn-outline w-full text-center">Create Account</Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
