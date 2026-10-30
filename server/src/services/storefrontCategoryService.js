import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const storefrontCategories = [
  {
    name: "Pre-Workout",
    slug: "pre-workout-energy",
    description: "Explosive energy, sharp focus, and powerful pump support for high-intensity training.",
    isActive: true,
  },
];

export const ensureStorefrontCategories = async () => {
  // Archive the retired standalone category without changing formula ingredients or old orders.
  const retiredCategory = await Category.findOne({ slug: "coconut-water" });
  if (retiredCategory) {
    await Product.updateMany({ category: retiredCategory._id, isActive: true }, { $set: { isActive: false } });
    await Category.updateOne({ _id: retiredCategory._id }, { $set: { isActive: false } });
  }
  const results = await Promise.all(
    storefrontCategories.map((category) =>
      Category.updateOne(
        { slug: category.slug },
        {
          $setOnInsert: {
            name: category.name,
            slug: category.slug,
            description: category.description,
          },
          $set: { isActive: true },
        },
        { upsert: true }
      )
    )
  );

  return results.reduce((total, result) => total + Number(result.upsertedCount || 0), 0);
};
