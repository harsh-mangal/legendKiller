import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error("Admin render error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f2eb] p-5">
        <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-7 text-center shadow-panel">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-700"><AlertTriangle size={26} /></div>
          <h1 className="mt-5 text-2xl font-bold text-stone-950">The admin screen could not be displayed</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Your data has not been changed. Reload the application and try the action again.</p>
          {import.meta.env.DEV && <pre className="mt-4 max-h-36 overflow-auto rounded-xl bg-stone-950 p-3 text-left text-xs text-white">{String(this.state.error?.message || this.state.error)}</pre>}
          <button type="button" className="btn btn-primary btn-md mt-5" onClick={() => window.location.reload()}><RefreshCw size={17} /> Reload admin</button>
        </section>
      </main>
    );
  }
}
