import { VIPER_PROTOCOL_SLUG } from "../../content/viperProtocol";

export default function ProductNutrition({ product }) {
  const graphic = product.nutritionGraphic || (!product.nutritionText && !product.nutritionPdf && !product.nutritionalFacts?.length && product.slug === VIPER_PROTOCOL_SLUG ? "/viper-protocol-nutrition-facts.png" : "");
  const facts = Array.isArray(product.nutritionalFacts) ? product.nutritionalFacts : [];
  return <div>
    <p className="section-eyebrow">Formula Breakdown</p>
    <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">Nutritional Facts</h2>
    {product.nutritionText && <div className="mt-6 whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-800 sm:p-6">{product.nutritionText}</div>}
    {graphic && <a href={graphic} target="_blank" rel="noreferrer" className="mt-6 block" aria-label="Open full-size nutritional facts">
      <img src={graphic} alt={`${product.name} nutrition facts: serving sizes, ingredients and quantities`} className="mx-auto h-auto w-full max-w-4xl" loading="lazy" />
      <span className="mt-3 block text-center text-sm font-semibold text-orange-700 underline">View full-size nutritional facts</span>
    </a>}
    {product.nutritionPdf && <a href={product.nutritionPdf} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 items-center rounded-lg border border-orange-300 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-800 underline">View nutritional table (PDF)</a>}
    {facts.length > 0 && <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{product.name} nutritional table</caption>
        <thead className="bg-slate-50"><tr><th scope="col" className="px-5 py-3">Nutrient</th><th scope="col" className="px-5 py-3">Amount</th><th scope="col" className="px-5 py-3">Daily value</th></tr></thead>
        <tbody>{facts.map((item, index) => <tr key={item._id || index} className="border-t border-slate-200"><th scope="row" className="px-5 py-4 font-medium">{item.name || item.nutrient}</th><td className="px-5 py-4">{item.amount || item.value}</td><td className="px-5 py-4">{item.dailyValue || "—"}</td></tr>)}</tbody>
      </table>
    </div>}
    {!graphic && !product.nutritionText && !product.nutritionPdf && !facts.length && <p className="mt-6 text-sm text-slate-500">Nutritional information is not available for this product.</p>}
  </div>;
}
