import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCoinBalance } from "../utils/order";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const coins = getCoinBalance(user);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page max-w-4xl">
        <div className="border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-8">
          <p className="section-eyebrow">Athlete Account</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
            <div>
              <h1 className="text-[1.85rem] font-black uppercase leading-tight text-white sm:text-3xl">{user?.name || user?.fullName || "Athlete"}</h1>
              <p className="mt-2 text-sm text-slate-300">Manage your account and review your supplement order history.</p>
            </div>
            <div className="border border-[#FF5500]/40 bg-[#1A1A22] px-5 py-3 rounded-none">
              <p className="text-xs font-black uppercase tracking-wider text-[#FFB800]">Viper Coins</p>
              <p className="mt-1 text-3xl font-black text-white">{coins}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Info label="Email" value={user?.email || "—"} />
            <Info label="Phone" value={user?.phone || user?.mobile || "—"} />
          </div>

          <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-row">
            <Link to="/orders" className="btn-primary text-center">View My Orders</Link>
            <Link to="/addresses" className="btn-outline text-center">Saved Addresses</Link>
            <button type="button" onClick={handleLogout} className="btn-outline text-center text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600">Sign Out</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="border border-slate-800 bg-[#1A1A22] p-4 rounded-none">
      <p className="text-xs font-black uppercase tracking-wider text-[#FFB800]">{label}</p>
      <p className="mt-1 break-words font-bold text-white">{value}</p>
    </div>
  );
}
