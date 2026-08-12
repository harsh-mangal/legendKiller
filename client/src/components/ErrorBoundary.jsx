import React from "react";


export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error("Unhandled application error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center">
          <div className="max-w-lg rounded-[8px] border border-slate-200 bg-white p-8 shadow-card">
            <p className="section-eyebrow">Something went wrong</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">We could not load this page.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">Refresh the page to try again. Your cart and saved session remain stored in this browser.</p>
            <button type="button" className="btn-primary mt-7" onClick={() => window.location.reload()}>Refresh page</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
