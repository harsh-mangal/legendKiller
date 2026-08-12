import { useEffect, useMemo, useState } from "react";
import { ExternalLink, LogOut, Menu, Search, ShieldCheck, X } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import API, { STOREFRONT_URL } from "../api/axios";
import { navigationGroups, routeTitles } from "../config/navigation";
import { useAuth } from "../context/AuthContext";
import { IconButton } from "./ui";

const findTitle = (pathname) => {
  if (routeTitles[pathname]) return routeTitles[pathname];
  const entry = Object.entries(routeTitles).find(([path]) => path !== "/" && pathname.startsWith(path));
  return entry?.[1] || "Operations";
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [signals, setSignals] = useState({ lowStock: 0, pendingContacts: 0 });
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = findTitle(location.pathname);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    API.get("/admin/dashboard")
      .then(({ data }) => setSignals({ lowStock: Number(data.data?.lowStock || 0), pendingContacts: Number(data.data?.pendingContacts || 0) }))
      .catch(() => {});
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return navigationGroups.flatMap((group) => group.items).filter((item) => item.label.toLowerCase().includes(value)).slice(0, 6);
  }, [query]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    const first = searchResults[0];
    if (first) { navigate(first.path); setQuery(""); }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const badgeFor = (path) => path === "/inventory" ? signals.lowStock : path === "/enquiries" ? signals.pendingContacts : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      {mobileOpen && <button type="button" className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-slate-800 bg-[#121216] text-white shadow-2xl transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src="/admin-icon.png" alt="Legend Killer" className="h-11 w-11 rounded-none border border-[#FF5500]/30 bg-black object-contain p-1" />
            <div className="min-w-0"><p className="truncate text-base font-black uppercase tracking-wider text-[#FFB800]">Legend Killer</p><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5500]">The Viper Protocol</p></div>
          </Link>
          <button type="button" className="rounded-none p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {navigationGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB800]">{group.label}</p>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const count = badgeFor(item.path);
                  return <NavLink key={item.path} to={item.path} end={item.path === "/"} className={({ isActive }) => `flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition ${isActive ? "bg-gradient-to-r from-[#FFB800] to-[#FF5500] text-black shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}><Icon size={18} /><span className="flex-1">{item.label}</span>{count > 0 && <span className="grid min-w-5 place-items-center rounded-none bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">{count > 99 ? "99+" : count}</span>}</NavLink>;
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 rounded-none bg-[#1A1A22] p-3 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-white"><ShieldCheck size={16} className="text-[#FFB800]" /><span className="truncate">{admin?.name || "Administrator"}</span></div>
            <p className="mt-1 truncate text-[11px] text-slate-400">{admin?.email}</p>
          </div>
          <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-none border border-slate-700 px-3 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-red-600 hover:text-white hover:border-red-600"><LogOut size={17} /> Sign Out</button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[286px]">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0A0A0C]/95 backdrop-blur-xl">
          <div className="flex h-20 items-center gap-3 px-4 sm:px-6 xl:px-8">
            <IconButton label="Open navigation" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} className="text-white" /></IconButton>
            <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB800]">Legend Operations</p><h2 className="truncate text-lg font-black uppercase text-white">{pageTitle}</h2></div>
            <form onSubmit={onSearchSubmit} className="relative hidden w-full max-w-sm lg:block">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="input pl-10 border-slate-800 bg-[#121216] text-white placeholder:text-slate-500" placeholder="Search products, orders, coupons..." aria-label="Search admin sections" />
              {searchResults.length > 0 && <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-none border border-slate-800 bg-[#121216] shadow-2xl">{searchResults.map((item) => <button key={item.path} type="button" onClick={() => { navigate(item.path); setQuery(""); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-[#1A1A22] hover:text-[#FFB800]"><item.icon size={17} className="text-[#FF5500]" />{item.label}</button>)}</div>}
            </form>
            <a href={STOREFRONT_URL} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm hidden sm:inline-flex rounded-none border-slate-700 bg-[#121216] text-white hover:border-[#FF5500]"><ExternalLink size={16} /> View Store</a>
          </div>
        </header>
        <main className="px-4 py-5 pb-12 sm:px-6 sm:py-7 xl:px-8"><Outlet /></main>
      </div>
    </div>
  );
}
