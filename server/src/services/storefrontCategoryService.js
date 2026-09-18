import Category from "../models/Category.js";

export const storefrontCategories = [
  {
    name: "Pre-Workout",
    slug: "pre-workout-energy",
    description: "Explosive energy, sharp focus, and powerful pump support for high-intensity training.",
    isActive: true,
  },
  {
    name: "Coconut Water",
    slug: "coconut-water",
    description: "Electrolyte-rich hydration support for endurance, recovery, and sustained performance.",
    isActive: true,
  },
];

export const ensureStorefrontCategories = async () => {
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
