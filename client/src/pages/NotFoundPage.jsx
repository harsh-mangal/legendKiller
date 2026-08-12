import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="page-section bg-slate-50">
      <div className="container-page max-w-2xl text-center">
        <p className="section-eyebrow">404</p>
        <h1 className="section-title mt-3">Page not found</h1>
        <p className="mt-4 text-slate-600">The page may have moved or the link may be incorrect.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">Return home</Link>
          <Link to="/products" className="btn-outline">Browse products</Link>
        </div>
      </div>
    </section>
  );
}
