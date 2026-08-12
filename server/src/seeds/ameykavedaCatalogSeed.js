// Ameykaveda category and product seed data
// Update these import paths to match your project structure.
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const categorySeedData = [
  {
    "name": "Ayurvedic Supplements",
    "slug": "ayurvedic-supplements",
    "description": "Traditional Ayurvedic herbs and daily wellness supplements for energy, vitality, immunity and general wellbeing.",
    "isActive": true
  },
  {
    "name": "Bone & Joint Care",
    "slug": "bone-joint-care",
    "description": "Calcium, mineral and Ayurvedic formulations that support healthy bones, joints, muscles and mobility.",
    "isActive": true
  },
  {
    "name": "Digestive Care",
    "slug": "digestive-care",
    "description": "Ayurvedic and herbal products formulated to support digestion, appetite, bowel regularity and stomach comfort.",
    "isActive": true
  },
  {
    "name": "Brain & Nerve Care",
    "slug": "brain-nerve-care",
    "description": "Nutritional formulations that support normal brain function, memory, focus and nerve wellness.",
    "isActive": true
  },
  {
    "name": "Skin & Hair Care",
    "slug": "skin-hair-care",
    "description": "Everyday herbal and botanical products for cleansing, hydration, nourishment and personal care.",
    "isActive": true
  },
  {
    "name": "Value Combos",
    "slug": "value-combos",
    "description": "Curated multi-product bundles offering complementary wellness and personal-care products at a special website price.",
    "isActive": true
  }
];

export const productSeedData = [
  {
    "manufacturerName": "",
    "marketerName": "Ameyka Life Sciences",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Gastila Herbal Digestive Syrup with Ginger, Amla and Mint – 200 ml",
    "slug": "gastila-herbal-digestive-syrup-200ml",
    "sku": "AV-GAS-200ML",
    "categorySlug": "digestive-care",
    "shortDescription": "Herbal digestive syrup formulated to support digestion, appetite and stomach comfort during occasional gas, acidity and bloating.",
    "description": "Gastila Herbal Digestive Syrup combines traditionally used digestive herbs to support healthy digestion, appetite and everyday stomach comfort. Its herbal blend is suitable for use according to the product label or under professional guidance.",
    "longDescription": "Gastila is a herbal digestive syrup presented in a 200 ml bottle. The formulation includes traditional ingredients such as ginger, amla and mint and is designed to support digestion, appetite and comfort during occasional heaviness, gas, acidity and bloating. Use the measuring cup or spoon and follow the final product label.",
    "benefits": [
      "Supports healthy digestion",
      "Supports appetite",
      "Helps manage occasional gas and bloating",
      "Supports relief from occasional acidity and heartburn",
      "Promotes everyday stomach comfort"
    ],
    "ingredients": [
      "Ginger",
      "Amla",
      "Mint (Pudina)",
      "Traditional herbal digestive blend; complete composition as per product label"
    ],
    "howToUse": "Shake well before use. Take 5–10 ml after meals or as directed by a physician. Follow the dosage printed on the final product label.",
    "suitableFor": [
      "Adults",
      "Senior citizens",
      "Teenagers aged 12 years and above",
      "People seeking digestive and appetite support"
    ],
    "warnings": [
      "Children, pregnant or breastfeeding individuals should use only under professional guidance",
      "Do not exceed the recommended dosage",
      "Keep out of reach of children",
      "Check the label for allergens and complete composition"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight. Keep the cap tightly closed.",
    "legalDisclaimer": "This product is intended for wellness support and is not a substitute for a varied diet or professional medical advice. Use according to the approved label.",
    "seoTitle": "Gastila Herbal Digestive Syrup 200 ml | Ameykaveda",
    "seoDescription": "Buy Gastila herbal digestive syrup with ginger, amla and mint. Supports digestion, appetite and comfort during occasional gas, acidity and bloating.",
    "price": 127,
    "mrp": 145,
    "unit": "Bottle",
    "weight": "200 ml",
    "isFeatured": true,
    "isBestSeller": true
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameyka Life Sciences",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "BestO Brain Omega-3, Vitamin A and Vitamin D3 Suspension – 150 ml",
    "slug": "besto-brain-omega-3-vitamin-a-d3-suspension-150ml",
    "sku": "AV-BOB-150ML",
    "categorySlug": "brain-nerve-care",
    "shortDescription": "Mango-flavoured Omega-3, Vitamin A and Vitamin D3 suspension formulated to support normal brain function, vision and development.",
    "description": "BestO Brain is a nutraceutical suspension containing Omega-3 fatty acids including EPA and DHA, along with Vitamin A and Vitamin D3. The formulation supports normal brain function, cognitive wellness, vision and overall growth and development.",
    "longDescription": "BestO Brain is supplied as a 150 ml mango-flavoured suspension. Omega-3 fatty acids, including EPA and DHA, are combined with Vitamin A and Vitamin D3 in an easy-to-take liquid format. Dosage can vary by age, so follow the final label or advice from a healthcare professional.",
    "benefits": [
      "Supports normal brain function",
      "Supports memory, focus and cognitive wellness",
      "Supports normal vision",
      "Supports neural health",
      "Supports normal growth and development"
    ],
    "ingredients": [
      "Omega-3 Fatty Acids",
      "EPA",
      "DHA",
      "Vitamin A",
      "Vitamin D3"
    ],
    "howToUse": "Shake well before use. Take only according to the age-appropriate dosage printed on the final product label or as directed by a healthcare professional.",
    "suitableFor": [
      "Children under professional guidance",
      "Students",
      "Adults",
      "People seeking Omega-3 supplementation",
      "People seeking memory and focus support"
    ],
    "warnings": [
      "Do not exceed the recommended dosage",
      "Use for children only under adult and professional supervision",
      "Consult a healthcare professional during pregnancy, breastfeeding or while taking medication",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight. Keep tightly closed and follow any refrigeration instruction on the label.",
    "legalDisclaimer": "This nutraceutical is not intended to diagnose, treat, cure or prevent any disease. Use according to the approved label and professional advice.",
    "seoTitle": "BestO Brain Omega-3 Suspension 150 ml | Ameykaveda",
    "seoDescription": "Omega-3 EPA and DHA suspension with Vitamins A and D3 to support normal brain function, memory, focus, vision and development.",
    "price": 617,
    "mrp": 955,
    "unit": "Bottle",
    "weight": "150 ml",
    "isFeatured": true,
    "isBestSeller": true
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameyka Life Sciences",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Amcal Max Calcium, Magnesium, Zinc, Vitamin D3 and K2-7 Tablets",
    "slug": "amcal-max-calcium-magnesium-zinc-d3-k2-tablets",
    "sku": "AV-AMC-30T",
    "categorySlug": "bone-joint-care",
    "shortDescription": "Calcium, vitamin and mineral supplement formulated to support healthy bones, muscles and normal nerve function.",
    "description": "Amcal Max combines Calcium Citrate Malate, Magnesium, Zinc, Vitamin D3, Vitamin K2-7, Vitamin B12 and Folic Acid. The formulation supports bone strength, calcium utilisation, healthy muscle function and everyday nutritional requirements.",
    "longDescription": "Amcal Max is supplied in a bottle of 30 tablets. Its combination of calcium, magnesium, zinc and supporting vitamins is intended for adults seeking convenient daily bone and mineral supplementation. Use only in the recommended quantity and consider professional guidance where dietary or medical requirements are involved.",
    "benefits": [
      "Supports bone strength",
      "Supports calcium absorption and utilisation",
      "Supports healthy muscles",
      "Supports normal nerve function",
      "Helps meet daily vitamin and mineral requirements"
    ],
    "ingredients": [
      "Calcium Citrate Malate",
      "Magnesium Oxide",
      "Zinc Sulphate",
      "Vitamin K2-7",
      "Cholecalciferol (Vitamin D3)",
      "Cyanocobalamin (Vitamin B12)",
      "Folic Acid"
    ],
    "howToUse": "Take 1 tablet daily after food or as directed by a physician.",
    "suitableFor": [
      "Adults",
      "People seeking calcium supplementation",
      "People seeking bone-health support",
      "People with increased mineral requirements",
      "People seeking Vitamin D3 and K2 support"
    ],
    "warnings": [
      "Do not exceed the recommended daily dosage",
      "Consult a physician if pregnant, breastfeeding, taking anticoagulants or managing kidney-related conditions",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight and moisture. Keep the container tightly closed.",
    "legalDisclaimer": "This health supplement is not intended to diagnose, treat, cure or prevent any disease and is not a substitute for a varied diet.",
    "seoTitle": "Amcal Max Calcium, D3 and K2 Tablets | Ameykaveda",
    "seoDescription": "Calcium, magnesium, zinc, Vitamin D3, K2-7, B12 and folic acid tablets for bone, muscle and everyday nutritional support.",
    "price": 379,
    "mrp": 496,
    "unit": "Bottle",
    "weight": "30 Tablets",
    "isFeatured": true,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameyka Life Sciences",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "NervoEase XT Nerve Health Support Capsules",
    "slug": "nervoease-xt-nerve-health-support-capsules",
    "sku": "AV-NVX-30C",
    "categorySlug": "brain-nerve-care",
    "shortDescription": "Nutraceutical capsules formulated to support nerve health and the nutritional management of tingling, numbness and nerve-related discomfort.",
    "description": "NervoEase XT contains Palmitic Acid Monoethanolamide, Cytidine Monophosphate, Uridine Monophosphate, Folic Acid and Cyanocobalamin. It is formulated to support normal nerve function and nutritional nerve wellness.",
    "longDescription": "NervoEase XT is supplied in a bottle of 30 capsules. Its combination of nucleotides, Palmitic Acid Monoethanolamide, folic acid and Vitamin B12 is intended for nutritional nerve support. The product should be used under medical or professional supervision, particularly where symptoms are persistent.",
    "benefits": [
      "Supports nerve health",
      "Supports normal nerve function",
      "Supports nutritional management of tingling and numbness",
      "Supports comfort during nerve-related discomfort",
      "Supports joint and mobility wellness"
    ],
    "ingredients": [
      "Palmitic Acid Monoethanolamide",
      "Cytidine Monophosphate",
      "Uridine Monophosphate",
      "Folic Acid",
      "Cyanocobalamin"
    ],
    "howToUse": "Take 1 capsule daily after food or as directed by a physician.",
    "suitableFor": [
      "Adults",
      "People seeking nerve-health support",
      "People experiencing tingling or numbness under medical evaluation",
      "People requiring nutritional nerve support"
    ],
    "warnings": [
      "Use under medical or professional supervision",
      "Persistent tingling, weakness or numbness requires medical evaluation",
      "Consult a physician during pregnancy, breastfeeding or while taking medication",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight and moisture. Keep the bottle tightly closed.",
    "legalDisclaimer": "This nutraceutical is intended for nutritional support and is not a substitute for diagnosis or treatment by a qualified healthcare professional.",
    "seoTitle": "NervoEase XT Nerve Health Capsules | Ameykaveda",
    "seoDescription": "Nutritional nerve-health capsules with PEA, CMP, UMP, folic acid and Vitamin B12 to support normal nerve function and wellness.",
    "price": 503,
    "mrp": 649,
    "unit": "Bottle",
    "weight": "30 Capsules",
    "isFeatured": true,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Ashwagandha 500 mg Capsules",
    "slug": "ameykaveda-ashwagandha-500mg-capsules",
    "sku": "AV-ASH-500-60C",
    "categorySlug": "ayurvedic-supplements",
    "shortDescription": "Ashwagandha root extract capsules formulated to support energy, immunity, nervous-system wellness and everyday stress management.",
    "description": "Each Ameykaveda Ashwagandha capsule contains 500 mg of Ashwagandha root extract. This traditionally used Ayurvedic herb supports natural energy, immune wellness, nervous-system health and the body's response to everyday stress.",
    "longDescription": "Ameykaveda Ashwagandha 500 mg Capsules are intended for adults seeking a convenient Ayurvedic supplement for vitality and general wellness. The 60-capsule bottle can be incorporated into a regular routine under the guidance of a qualified healthcare professional.",
    "benefits": [
      "Supports everyday stress management",
      "Supports natural energy",
      "Supports immunity",
      "Supports nervous-system wellness",
      "Promotes overall vitality"
    ],
    "ingredients": [
      "Ashwagandha Root Extract 500 mg",
      "Withania somnifera",
      "Magnesium Stearate",
      "Silicon Dioxide"
    ],
    "howToUse": "Take 1–2 capsules twice daily after food or as directed by a physician.",
    "suitableFor": [
      "Adults",
      "Working professionals",
      "People seeking stress support",
      "People seeking energy and vitality support",
      "People seeking general wellness support"
    ],
    "warnings": [
      "Consult a physician during pregnancy, breastfeeding, thyroid treatment, autoimmune conditions or while taking sedatives",
      "Do not exceed the recommended dosage",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight and moisture. Keep the bottle tightly closed.",
    "legalDisclaimer": "This Ayurvedic product is intended for wellness support. Individual results may vary. Use according to the label or a qualified physician's advice.",
    "seoTitle": "Ashwagandha 500 mg Capsules – 60 Count | Ameykaveda",
    "seoDescription": "Ashwagandha root extract capsules for everyday stress, energy, immunity, vitality and nervous-system wellness support.",
    "price": 332,
    "mrp": 425,
    "unit": "Bottle",
    "weight": "60 Capsules",
    "isFeatured": true,
    "isBestSeller": true
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Moringa 500 mg Capsules",
    "slug": "ameykaveda-moringa-500mg-capsules",
    "sku": "AV-MOR-500-60C",
    "categorySlug": "ayurvedic-supplements",
    "shortDescription": "Moringa leaf extract capsules with naturally occurring plant nutrients and antioxidants for immunity, energy and overall wellness support.",
    "description": "Each Ameykaveda Moringa capsule contains 500 mg of Moringa leaf extract. Moringa is naturally rich in plant-based nutrients and antioxidants and supports natural immunity, energy, stamina, vitality and general wellness.",
    "longDescription": "Ameykaveda Moringa 500 mg Capsules provide a convenient way to include Moringa oleifera leaf extract in a daily wellness routine. The bottle contains 60 capsules and is intended for adult use according to the label or professional guidance.",
    "benefits": [
      "Supports natural immunity",
      "Provides plant-based antioxidant support",
      "Supports energy and stamina",
      "Supports vitality",
      "Promotes overall wellness"
    ],
    "ingredients": [
      "Moringa Leaf Extract 500 mg",
      "Moringa oleifera",
      "Sehjan Extract",
      "Magnesium Stearate",
      "Silicon Dioxide"
    ],
    "howToUse": "Take 1–2 capsules twice daily after food or as directed by a physician.",
    "suitableFor": [
      "Adults",
      "People seeking immunity support",
      "People seeking antioxidant support",
      "People seeking energy and stamina support",
      "Health-conscious individuals"
    ],
    "warnings": [
      "Consult a physician during pregnancy, breastfeeding or while taking medication",
      "Do not exceed the recommended dosage",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight and moisture. Keep the bottle tightly closed.",
    "legalDisclaimer": "This Ayurvedic product is intended for wellness support and is not a substitute for a varied diet or professional medical advice.",
    "seoTitle": "Moringa 500 mg Capsules – 60 Count | Ameykaveda",
    "seoDescription": "Moringa leaf extract capsules for natural immunity, antioxidant, energy, stamina and everyday vitality support.",
    "price": 379,
    "mrp": 499,
    "unit": "Bottle",
    "weight": "60 Capsules",
    "isFeatured": true,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Piles Care Ayurvedic Capsules",
    "slug": "ameykaveda-piles-care-ayurvedic-capsules",
    "sku": "AV-PLC-60C",
    "categorySlug": "digestive-care",
    "shortDescription": "Traditional Ayurvedic herbal capsules formulated to support bowel regularity, digestive wellness and comfort associated with piles.",
    "description": "Ameykaveda Piles Care is an Ayurvedic proprietary formulation containing traditionally used herbs such as Haritaki, Amlaki, Bibhitaki, Lajjalu, Neem, Guduchi, Nagkesar and Kachnar. It supports bowel regularity, comfortable bowel movements and digestive wellness.",
    "longDescription": "Ameykaveda Piles Care Capsules are supplied in a bottle of 60 capsules. The formulation is designed for adults seeking Ayurvedic support for irregular bowel habits, occasional constipation and discomfort associated with piles. Use only under guidance from a qualified physician.",
    "benefits": [
      "Supports bowel regularity",
      "Supports comfortable bowel movements",
      "Supports digestive wellness",
      "Helps manage occasional constipation",
      "Provides wellness support for discomfort associated with piles"
    ],
    "ingredients": [
      "Haritaki 80 mg",
      "Amlaki 50 mg",
      "Amba Haldi 50 mg",
      "Bibhitaki 50 mg",
      "Lajjalu 50 mg",
      "Neem 30 mg",
      "Harshingar 20 mg",
      "Guduchi 80 mg",
      "Chitrak 20 mg",
      "Nagkesar 50 mg",
      "Kachnar 20 mg"
    ],
    "howToUse": "Take 2 capsules twice daily after food or as directed by a qualified physician.",
    "suitableFor": [
      "Adults",
      "People experiencing occasional constipation",
      "People seeking bowel-wellness support",
      "People experiencing irregular bowel habits",
      "People seeking Ayurvedic piles support"
    ],
    "warnings": [
      "Use under the guidance of a qualified physician",
      "Rectal bleeding, severe pain or persistent symptoms require medical evaluation",
      "Consult a physician during pregnancy, breastfeeding or while taking medication",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight and moisture. Keep the bottle tightly closed.",
    "legalDisclaimer": "This Ayurvedic proprietary product should be used according to its approved label and under qualified professional guidance. Individual results may vary.",
    "seoTitle": "Piles Care Ayurvedic Capsules – 60 Count | Ameykaveda",
    "seoDescription": "Ayurvedic herbal capsules to support bowel regularity, comfortable bowel movements, digestive wellness and piles-care routines.",
    "price": 341,
    "mrp": 449,
    "unit": "Bottle",
    "weight": "60 Capsules",
    "isFeatured": false,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Hadjod 500 mg Capsules",
    "slug": "ameykaveda-hadjod-500mg-capsules",
    "sku": "AV-HAD-500-60C",
    "categorySlug": "bone-joint-care",
    "shortDescription": "Hadjod whole-plant extract capsules formulated to support bone strength, joint comfort, mobility and natural recovery.",
    "description": "Each Ameykaveda Hadjod capsule contains 500 mg of Cissus quadrangularis whole-plant extract. Hadjod is traditionally used in Ayurveda to support bones, joints, mobility and the body's natural recovery processes.",
    "longDescription": "Ameykaveda Hadjod 500 mg Capsules are supplied in a 60-capsule bottle for adults seeking Ayurvedic bone and joint wellness support. Use according to the product label or under the guidance of a qualified healthcare professional.",
    "benefits": [
      "Supports bone strength",
      "Supports joint comfort",
      "Supports normal mobility",
      "Supports recovery after physical stress",
      "Supports healthy bones and joints"
    ],
    "ingredients": [
      "Hadjod Extract 500 mg",
      "Cissus quadrangularis Whole-Plant Extract",
      "Magnesium Stearate",
      "Silicon Dioxide"
    ],
    "howToUse": "Take 1 capsule twice daily after food or as directed by a physician.",
    "suitableFor": [
      "Adults",
      "People seeking bone-strength support",
      "People seeking joint-comfort support",
      "Physically active individuals",
      "People seeking mobility support"
    ],
    "warnings": [
      "Consult a physician during pregnancy, breastfeeding, diabetes treatment or while taking medication",
      "Do not exceed the recommended dosage",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight and moisture. Keep the bottle tightly closed.",
    "legalDisclaimer": "This Ayurvedic product is intended for wellness support and is not a substitute for medical evaluation or treatment of an injury.",
    "seoTitle": "Hadjod 500 mg Capsules – 60 Count | Ameykaveda",
    "seoDescription": "Cissus quadrangularis Hadjod capsules for bone strength, joint comfort, mobility and natural recovery support.",
    "price": 379,
    "mrp": 499,
    "unit": "Bottle",
    "weight": "60 Capsules",
    "isFeatured": false,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Premium Aloe Vera Multipurpose Skin & Hair Gel – 100 g",
    "slug": "ameykaveda-premium-aloe-vera-gel-100g",
    "sku": "AV-ALG-100G",
    "categorySlug": "skin-hair-care",
    "shortDescription": "Multipurpose Aloe Vera gel with Vitamin E and moisturising ingredients for everyday skin and hair hydration and nourishment.",
    "description": "Ameykaveda Premium Aloe Vera Gel is a multipurpose external-use gel enriched with Aloe Vera extract, Vitamin E and moisturising ingredients. It helps moisturise and nourish the skin, leaving it feeling soft, smooth and refreshed, and can also be used in a regular hair-care routine.",
    "longDescription": "This 100 g multipurpose gel is designed for external use on skin and hair. The lightweight gel format is suitable for everyday moisturising, post-cleansing care and dry-feeling areas. Apply a small amount to clean skin or hair and patch test before first use.",
    "benefits": [
      "Helps moisturise dry-feeling skin",
      "Helps nourish and soften the skin",
      "Provides a cooling and refreshing feel",
      "Suitable for multipurpose skin and hair care",
      "Supports everyday hydration"
    ],
    "ingredients": [
      "Aloe Vera Extract",
      "Vitamin E",
      "Glycerin",
      "Carbomer",
      "Triethanolamine",
      "Phenoxyethanol",
      "Fragrance",
      "Purified Water"
    ],
    "howToUse": "Apply a small amount to clean skin or hair and massage gently until absorbed. Use as required. Patch test before first use.",
    "suitableFor": [
      "Adults",
      "Men and women",
      "People seeking everyday skin hydration",
      "People seeking a multipurpose skin and hair gel"
    ],
    "warnings": [
      "For external use only",
      "Avoid contact with eyes",
      "Discontinue use if irritation occurs",
      "Patch test before first use",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight. Keep the lid tightly closed.",
    "legalDisclaimer": "Cosmetic product for external use only. Results vary by skin and hair type. This product is not intended to treat a medical condition.",
    "seoTitle": "Premium Aloe Vera Skin & Hair Gel 100 g | Ameykaveda",
    "seoDescription": "Multipurpose Aloe Vera gel with Vitamin E and moisturising ingredients for soft, smooth, refreshed skin and everyday hair care.",
    "price": 189,
    "mrp": 249,
    "unit": "Jar",
    "weight": "100 g",
    "isFeatured": true,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Gulab Jal Rose Water",
    "slug": "ameykaveda-gulab-jal-rose-water",
    "sku": "AV-GJ-01",
    "categorySlug": "skin-hair-care",
    "shortDescription": "Refreshing Gulab Jal rose water for everyday cleansing, toning and skin-refreshing care.",
    "description": "Ameykaveda Gulab Jal is an everyday rose-water personal-care product designed to refresh the skin and complement cleansing and moisturising routines. It can be used directly with cotton or incorporated into face-pack and skin-care routines according to the product label.",
    "longDescription": "Use Ameykaveda Gulab Jal as a simple daily skin refresher after cleansing or whenever the skin needs a fresh feel. The exact net quantity and complete ingredient declaration must be taken from the current bottle before the listing is published.",
    "benefits": [
      "Refreshes the skin",
      "Supports everyday cleansing and toning",
      "Helps soothe dry-feeling or tired-looking skin",
      "Can be used with face packs",
      "Complements daily skin-care routines"
    ],
    "ingredients": [
      "Rose Water; verify the complete ingredient declaration on the current product label"
    ],
    "howToUse": "Apply to clean skin using cotton or spray as directed on the bottle. It may also be mixed with a suitable face pack. Patch test before first use.",
    "suitableFor": [
      "Adults",
      "Men and women",
      "People seeking an everyday facial toner",
      "People seeking a refreshing rose-water skin-care product"
    ],
    "warnings": [
      "For external use only unless the label specifically states otherwise",
      "Avoid contact with eyes",
      "Discontinue use if irritation occurs",
      "Verify ingredients and net quantity from the current label before publishing"
    ],
    "storageInstructions": "Store in a cool, dry place away from direct sunlight. Keep the bottle tightly closed.",
    "legalDisclaimer": "Cosmetic or personal-care use only according to the final product label. This listing must be checked against the current pack before publication.",
    "seoTitle": "Gulab Jal Rose Water for Skin Care | Ameykaveda",
    "seoDescription": "Refreshing Gulab Jal rose water for everyday cleansing, toning, face packs and skin-refreshing personal care.",
    "price": 142,
    "mrp": 199,
    "unit": "Bottle",
    "weight": "",
    "isFeatured": false,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Aloe Vera Gel & Gulab Jal Skin Care Combo",
    "slug": "aloe-vera-gel-gulab-jal-skin-care-combo",
    "sku": "AV-COMBO-ALG-GJ",
    "categorySlug": "value-combos",
    "shortDescription": "A two-product skin-care combo with Aloe Vera Gel and Gulab Jal for cleansing, refreshing, hydration and everyday care.",
    "description": "This value combo pairs Ameykaveda Premium Aloe Vera Gel with Ameykaveda Gulab Jal. Use the Gulab Jal as part of cleansing or toning and follow with Aloe Vera Gel for lightweight hydration and nourishment.",
    "longDescription": "The combo contains one Aloe Vera Gel and one Gulab Jal product. It is designed as a simple daily skin-care pairing and offers a lower website price than purchasing the two listed products separately.",
    "benefits": [
      "Supports a simple two-step skin-care routine",
      "Refreshes and tones the skin",
      "Supports lightweight hydration",
      "Helps soften and nourish dry-feeling skin",
      "Special website combo price"
    ],
    "ingredients": [
      "1 × Ameykaveda Premium Aloe Vera Gel",
      "1 × Ameykaveda Gulab Jal"
    ],
    "howToUse": "Use Gulab Jal on clean skin, allow it to dry, then apply a small amount of Aloe Vera Gel. Follow each individual product label.",
    "suitableFor": [
      "Adults",
      "Men and women",
      "People seeking a simple daily skin-care combo",
      "Gifting and personal use"
    ],
    "warnings": [
      "For external use only",
      "Patch test both products before first use",
      "Avoid contact with eyes",
      "Discontinue use if irritation occurs"
    ],
    "storageInstructions": "Store both products in a cool, dry place away from direct sunlight and keep containers tightly closed.",
    "legalDisclaimer": "This combo contains cosmetic or personal-care products. Follow the individual product labels and verify the Gulab Jal pack details before publication.",
    "seoTitle": "Aloe Vera Gel & Gulab Jal Skin Care Combo | Ameykaveda",
    "seoDescription": "A two-product skin-care combo with Aloe Vera Gel and Gulab Jal for refreshing, toning, lightweight hydration and everyday care.",
    "price": 284,
    "mrp": 448,
    "unit": "Combo",
    "weight": "2 Products",
    "isFeatured": true,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameyka Life Sciences",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "BestO Brain & Gastila Daily Wellness Combo",
    "slug": "besto-brain-gastila-daily-wellness-combo",
    "sku": "AV-COMBO-BOB-GAS",
    "categorySlug": "value-combos",
    "shortDescription": "A two-product liquid wellness combo pairing Omega-3 brain-support nutrition with herbal digestive support.",
    "description": "This combo includes BestO Brain Omega-3 Suspension and Gastila Herbal Digestive Syrup. It is designed for households seeking convenient brain, vision, development and digestive-wellness support in liquid formats.",
    "longDescription": "The pack contains one 150 ml BestO Brain suspension and one 200 ml Gastila Herbal Digestive Syrup. Each product must be taken separately according to its own label and age-appropriate professional guidance.",
    "benefits": [
      "Supports normal brain function and cognitive wellness",
      "Supports memory and focus",
      "Supports healthy digestion and appetite",
      "Supports everyday stomach comfort",
      "Special website combo price"
    ],
    "ingredients": [
      "1 × BestO Brain Omega-3, Vitamin A and Vitamin D3 Suspension – 150 ml",
      "1 × Gastila Herbal Digestive Syrup – 200 ml"
    ],
    "howToUse": "Use each product separately according to its final label. Shake both bottles well before use. Do not combine doses in the same measuring cup unless directed by a professional.",
    "suitableFor": [
      "Families under professional guidance",
      "Students",
      "Adults",
      "People seeking cognitive and digestive-wellness support"
    ],
    "warnings": [
      "Follow the age-appropriate dosage on each product",
      "Do not exceed either product's recommended dosage",
      "Use for children only under adult and professional supervision",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store both bottles in a cool, dry place away from direct sunlight and follow any label-specific storage instruction.",
    "legalDisclaimer": "The products in this combo are intended for nutritional and wellness support and are not substitutes for professional medical advice.",
    "seoTitle": "BestO Brain & Gastila Wellness Combo | Ameykaveda",
    "seoDescription": "BestO Brain Omega-3 suspension and Gastila herbal digestive syrup together at a special website combo price.",
    "price": 712,
    "mrp": 1100,
    "unit": "Combo",
    "weight": "2 Bottles",
    "isFeatured": true,
    "isBestSeller": true
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Ashwagandha & Moringa Wellness Combo",
    "slug": "ashwagandha-moringa-wellness-combo",
    "sku": "AV-COMBO-ASH-MOR",
    "categorySlug": "value-combos",
    "shortDescription": "Ashwagandha and Moringa capsule combo for everyday stress, energy, immunity, antioxidant and vitality support.",
    "description": "This wellness combo pairs Ameykaveda Ashwagandha 500 mg Capsules with Ameykaveda Moringa 500 mg Capsules. Together they provide complementary support for stress management, natural energy, immunity, antioxidants and general vitality.",
    "longDescription": "The combo contains two 60-capsule bottles: one Ashwagandha and one Moringa. Take each product according to its own label and avoid exceeding the recommended dose.",
    "benefits": [
      "Supports everyday stress management",
      "Supports natural energy and stamina",
      "Supports immunity",
      "Provides plant-based antioxidant support",
      "Special website combo price"
    ],
    "ingredients": [
      "1 × Ameykaveda Ashwagandha 500 mg – 60 Capsules",
      "1 × Ameykaveda Moringa 500 mg – 60 Capsules"
    ],
    "howToUse": "Take each product separately according to its label or a physician's advice. Do not exceed the recommended dosage of either product.",
    "suitableFor": [
      "Adults",
      "Working professionals",
      "Health-conscious individuals",
      "People seeking stress, energy and immunity support"
    ],
    "warnings": [
      "Consult a physician during pregnancy, breastfeeding or while taking medication",
      "Review both ingredient lists before use",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store both bottles in a cool, dry place away from direct sunlight and moisture.",
    "legalDisclaimer": "This Ayurvedic wellness combo is not a substitute for a varied diet or professional medical advice. Individual results may vary.",
    "seoTitle": "Ashwagandha & Moringa Wellness Combo | Ameykaveda",
    "seoDescription": "Two 60-capsule bottles combining Ashwagandha and Moringa for stress, energy, immunity, antioxidant and vitality support.",
    "price": 617,
    "mrp": 924,
    "unit": "Combo",
    "weight": "2 Bottles · 60 Capsules Each",
    "isFeatured": true,
    "isBestSeller": true
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Hadjod & Moringa Bone and Vitality Combo",
    "slug": "hadjod-moringa-bone-vitality-combo",
    "sku": "AV-COMBO-HAD-MOR",
    "categorySlug": "value-combos",
    "shortDescription": "Hadjod and Moringa capsule combo for bone, joint, mobility, energy, antioxidant and everyday vitality support.",
    "description": "This combo pairs Ameykaveda Hadjod 500 mg Capsules with Ameykaveda Moringa 500 mg Capsules. It brings together traditional bone and joint wellness support with plant-based nutrition, antioxidants and vitality support.",
    "longDescription": "The combo contains two 60-capsule bottles: one Hadjod and one Moringa. Use both products separately according to their labels or professional guidance.",
    "benefits": [
      "Supports bone strength",
      "Supports joint comfort and mobility",
      "Supports natural energy and stamina",
      "Provides antioxidant support",
      "Special website combo price"
    ],
    "ingredients": [
      "1 × Ameykaveda Hadjod 500 mg – 60 Capsules",
      "1 × Ameykaveda Moringa 500 mg – 60 Capsules"
    ],
    "howToUse": "Take each product separately according to its label or a physician's advice. Do not exceed the recommended dosage.",
    "suitableFor": [
      "Adults",
      "Physically active individuals",
      "People seeking bone and mobility support",
      "People seeking everyday vitality support"
    ],
    "warnings": [
      "Consult a physician during pregnancy, breastfeeding, diabetes treatment or while taking medication",
      "Review both ingredient lists before use",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store both bottles in a cool, dry place away from direct sunlight and moisture.",
    "legalDisclaimer": "This Ayurvedic wellness combo supports general wellbeing and is not a substitute for diagnosis or treatment of an injury or medical condition.",
    "seoTitle": "Hadjod & Moringa Bone and Vitality Combo | Ameykaveda",
    "seoDescription": "Hadjod and Moringa capsule combo for bone strength, joint comfort, mobility, energy, antioxidants and vitality support.",
    "price": 708,
    "mrp": 998,
    "unit": "Combo",
    "weight": "2 Bottles · 60 Capsules Each",
    "isFeatured": false,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Piles Care & Gastila Digestive Support Combo",
    "slug": "piles-care-gastila-digestive-support-combo",
    "sku": "AV-COMBO-PLC-GAS",
    "categorySlug": "value-combos",
    "shortDescription": "Piles Care capsules and Gastila syrup combined for bowel regularity, digestion, appetite and everyday stomach-comfort support.",
    "description": "This combo contains Ameykaveda Piles Care Ayurvedic Capsules and Gastila Herbal Digestive Syrup. It is designed for adults seeking complementary bowel-regularity and digestive-wellness support under professional guidance.",
    "longDescription": "The combo contains one 60-capsule bottle of Piles Care and one 200 ml bottle of Gastila. Each product should be used separately according to its approved label and the advice of a qualified physician.",
    "benefits": [
      "Supports bowel regularity",
      "Supports comfortable bowel movements",
      "Supports digestion and appetite",
      "Helps manage occasional gas and bloating",
      "Special website combo price"
    ],
    "ingredients": [
      "1 × Ameykaveda Piles Care – 60 Capsules",
      "1 × Gastila Herbal Digestive Syrup – 200 ml"
    ],
    "howToUse": "Use each product separately according to its label or a qualified physician's advice. Shake Gastila well before use.",
    "suitableFor": [
      "Adults",
      "People seeking bowel-regularity support",
      "People seeking digestive and appetite support",
      "People following a physician-guided piles-care routine"
    ],
    "warnings": [
      "Use under the guidance of a qualified physician",
      "Rectal bleeding, severe pain or persistent symptoms require medical evaluation",
      "Do not exceed either product's recommended dosage",
      "Keep out of reach of children"
    ],
    "storageInstructions": "Store both products in a cool, dry place away from direct sunlight and keep containers tightly closed.",
    "legalDisclaimer": "This combo is intended for Ayurvedic and digestive wellness support. It is not a substitute for medical evaluation or treatment.",
    "seoTitle": "Piles Care & Gastila Digestive Combo | Ameykaveda",
    "seoDescription": "Piles Care capsules and Gastila herbal digestive syrup for bowel regularity, digestion, appetite and stomach-comfort support.",
    "price": 427,
    "mrp": 594,
    "unit": "Combo",
    "weight": "2 Products",
    "isFeatured": false,
    "isBestSeller": false
  },
  {
    "manufacturerName": "",
    "marketerName": "Ameykaveda",
    "countryOfOrigin": "India",
    "licenceType": "",
    "licenceNumber": "",
    "hsnCode": "",
    "gstRate": 0,
    "vegetarian": null,
    "batchTrackingEnabled": true,
    "expiryTrackingEnabled": true,
    "images": [],
    "stock": 100,
    "lowStockThreshold": 5,
    "rating": 0,
    "numReviews": 0,
    "reviews": [],
    "isActive": true,
    "name": "Ameykaveda Aloe Vera Gel, Gulab Jal & Gastila Wellness Combo",
    "slug": "aloe-vera-gel-gulab-jal-gastila-wellness-combo",
    "sku": "AV-COMBO-ALG-GJ-GAS",
    "categorySlug": "value-combos",
    "shortDescription": "A three-product combo combining everyday skin care with herbal digestive and appetite support.",
    "description": "This value bundle contains Ameykaveda Premium Aloe Vera Gel, Ameykaveda Gulab Jal and Gastila Herbal Digestive Syrup. It combines a simple external skin-care routine with herbal digestive-wellness support.",
    "longDescription": "Use the Gulab Jal and Aloe Vera Gel externally as part of a skin-care routine and take Gastila separately according to its label. The combo offers all three listed products at a special website price.",
    "benefits": [
      "Supports refreshing and toning skin care",
      "Supports lightweight skin hydration",
      "Supports healthy digestion and appetite",
      "Helps manage occasional gas and bloating",
      "Special website combo price"
    ],
    "ingredients": [
      "1 × Ameykaveda Premium Aloe Vera Gel",
      "1 × Ameykaveda Gulab Jal",
      "1 × Gastila Herbal Digestive Syrup – 200 ml"
    ],
    "howToUse": "Use Gulab Jal and Aloe Vera Gel externally according to their labels. Shake Gastila well and take only according to its dosage instructions.",
    "suitableFor": [
      "Adults",
      "Men and women",
      "Households seeking personal-care and digestive-wellness products",
      "Gifting and personal use"
    ],
    "warnings": [
      "Aloe Vera Gel and Gulab Jal are for external use according to their labels",
      "Patch test personal-care products before use",
      "Do not exceed the recommended Gastila dosage",
      "Keep all products out of reach of children"
    ],
    "storageInstructions": "Store all products in a cool, dry place away from direct sunlight and keep containers tightly closed.",
    "legalDisclaimer": "Follow each individual product label. Personal-care products are for external use, while Gastila is a wellness product to be used according to its approved dosage.",
    "seoTitle": "Aloe Vera, Gulab Jal & Gastila Combo | Ameykaveda",
    "seoDescription": "Three-product value combo with Aloe Vera Gel, Gulab Jal and Gastila syrup for everyday skin care and digestive wellness.",
    "price": 379,
    "mrp": 593,
    "unit": "Combo",
    "weight": "3 Products",
    "isFeatured": true,
    "isBestSeller": false
  }
];

export async function seedAmeykavedaCatalog() {
  // Do not start database operations until Mongoose is connected.
  if (mongoose.connection.readyState !== 1) {
    throw new Error(
      "MongoDB is not connected. Call and await mongoose.connect(MONGO_URI) before running the catalogue seed."
    );
  }

  const categoryIds = new Map();

  for (const category of categorySeedData) {
    const savedCategory = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: category },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    categoryIds.set(category.slug, savedCategory._id);
  }

  for (const item of productSeedData) {
    const { categorySlug, ...product } = item;
    const category = categoryIds.get(categorySlug);

    if (!category) {
      throw new Error(`Category not found for product ${product.name}: ${categorySlug}`);
    }

    if (Number(product.mrp) < Number(product.price)) {
      throw new Error(`Invalid pricing for ${product.name}: MRP is below website price`);
    }

    await Product.findOneAndUpdate(
      { slug: product.slug },
      { $set: { ...product, category } },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  return {
    categories: categorySeedData.length,
    products: productSeedData.length,
  };
}

// Example usage from your main seed runner:
// const result = await seedAmeykavedaCatalog();
// console.log("Ameykaveda catalogue seeded:", result);
