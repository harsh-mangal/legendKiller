import Architecture from "../models/Architecture.js";

const DEFAULT_ARCHITECTURES = [
  {
    slug: "atp-cellular-forge",
    title: "ATP Cellular Forge™",
    subtitle: "Strength & Endurance Architecture",
    category: "Bioenergetics & Power",
    badge: "5 Pillars • 19 Chapters",
    icon: "Zap",
    shortDescription: "An integrated bioenergetic architecture engineered to influence multiple performance-relevant domains simultaneously: Phosphocreatine Regeneration, Creatine Utilization, Buffering Capacity, Cellular Energetics, and Muscle Contractile Support.",
    overview: "ATP Cellular Forge™ is an integrated physiological architecture embedded within Legend Slayer™: The Viper Protocol™. It moves beyond isolated ingredient mechanisms to establish five complementary functional pillars that collectively produce cascading emergent performance outcomes.",
    sortOrder: 1,
    isActive: true,
    pillars: [
      { name: "Phosphocreatine Regeneration", ingredient: "Creatine Monohydrate", role: "Immediate ATP Restoration" },
      { name: "Creatine Utilization Optimization", ingredient: "Biocreat®", role: "Creatine Bioavailability & Uptake Efficiency" },
      { name: "Intramuscular Buffering", ingredient: "Beta-Alanine", role: "Acid-Base Regulation & Carnosine Synthesis" },
      { name: "Cellular Energetics", ingredient: "Betaine Anhydrous", role: "Osmoregulation & Intracellular Stability" },
      { name: "Muscle Contractile Support", ingredient: "Taurine", role: "Calcium Dynamics & Excitation-Contraction Coupling" }
    ],
    emergentOutcomes: [
      "High-Intensity Energy Availability",
      "Creatine System Efficiency",
      "Fatigue Regulation",
      "Exercise Bioenergetics",
      "Muscle Function",
      "Neuromuscular Performance",
      "Strength Performance",
      "Power Output",
      "Muscular Endurance"
    ],
    chapters: [
      {
        number: 1,
        title: "Why ATP Cellular Forge™ Exists",
        content: `To understand ATP Cellular Forge™, we must first understand a fundamental principle of human performance:
Every repetition, every sprint, every lift and every muscular contraction is ultimately constrained by the body's ability to generate, regenerate and utilize energy. 🔒

Regardless of whether the objective is:
- Strength
- Power
- Explosiveness
- Repeated Effort
- Training Volume
- Muscular Endurance

All performance is dependent upon biological energy systems.
High-intensity performance is not governed by a single energy-producing mechanism, but by multiple interconnected physiological systems working simultaneously. 🔒

### The Universal Energy Requirement
The human body utilizes a single primary energy currency: **ATP (Adenosine Triphosphate)**.
ATP serves as the immediate source of energy for virtually every energy-requiring process within skeletal muscle.

- Muscle Contraction → **ATP**
- Movement → **ATP**
- Force Production → **ATP**
- Power Output → **ATP**

**Without ATP:** No Contraction → No Force → No Performance.
This reality forms the foundation of ATP Cellular Forge™.

### The ATP Problem
One of the most fascinating characteristics of ATP is that skeletal muscle stores only a very limited amount at any given moment.
During high-intensity exercise, ATP can be consumed rapidly.
As a result, the body must continuously:
1. **Generate ATP**
2. **Regenerate ATP**
3. **Recycle ATP**
4. **Utilize ATP**

through multiple interconnected physiological systems. Performance is influenced by several biological domains working simultaneously.

### Traditional Energy Formulations
Historically, many sports nutrition products approached energy support through a single mechanism:
- Creatine Only OR
- Stimulants Only OR
- Hydration Only

Each approach addresses a specific piece of the performance equation. However, muscular performance is not governed by a single variable.

### The ATP Cellular Forge™ Philosophy
ATP Cellular Forge™ was engineered around a different principle. The objective was not to support one isolated mechanism. The objective was to build an integrated bioenergetic architecture capable of influencing multiple performance-relevant domains simultaneously:

**Energy Regeneration + Energy Utilization + Buffering Capacity + Cellular Function + Contractile Support** rather than relying upon a singular mechanism.`
      },
      {
        number: 2,
        title: "Why A Multi-Pillar Architecture Was Necessary",
        content: `Traditional formulations often focus on one dominant mechanism:
- Creatine → ATP Regeneration
- Beta-Alanine → Buffering
- Electrolytes → Hydration

While each mechanism possesses scientific merit, muscular performance itself is far more complex. A muscle cell does not operate through isolated systems. It operates through an interconnected bioenergetic network:

**ATP Availability + Buffering Capacity + Cellular Function + Contractile Efficiency + Fatigue Management**

The objective of ATP Cellular Forge™ was therefore to support multiple complementary domains simultaneously rather than relying upon a singular mechanism.`
      },
      {
        number: 3,
        title: "Phosphocreatine Regeneration — The First Functional Pillar",
        content: `To understand phosphocreatine regeneration, we must first understand one of the most important realities of human performance:
Muscular performance is ultimately constrained by the availability and regeneration of ATP. 🔒

Every explosive movement, every heavy repetition, every sprint and every high-intensity muscular contraction requires energy. The immediate source of that energy is ATP.

### ATP: The Universal Energy Currency
ATP (Adenosine Triphosphate) is widely recognized as the primary energy currency of the human body.
- ATP → Energy Release → Muscular Work

### The ATP Limitation Problem
Although ATP is essential, skeletal muscle stores only a limited amount at any given time.
During intense exercise:
- ATP Utilization → ADP Formation

If ATP cannot be regenerated rapidly enough:
- ATP Availability Falls → Muscular Output Declines → Performance Declines

### The Phosphocreatine System
The fastest ATP regeneration mechanism within skeletal muscle is the phosphocreatine system:
**Phosphocreatine → Phosphate Donation → ADP → ATP**

This reaction is catalyzed by the enzyme **Creatine Kinase**, which functions as one of the most important enzymes involved in exercise bioenergetics.

### Creatine Monohydrate
Creatine Monohydrate occupies the primary position within this pillar:
**Creatine Monohydrate → Creatine Pool → Phosphocreatine Pool → ATP Regeneration**

Within ATP Cellular Forge™, creatine monohydrate serves as the foundational ingredient supporting phosphocreatine regeneration.`
      },
      {
        number: 4,
        title: "Creatine Utilization Optimization — The Second Functional Pillar",
        content: `If the first pillar of ATP Cellular Forge™ addresses the regeneration of ATP through the phosphocreatine system, the second pillar addresses a different question:
How efficiently can the creatine system function once creatine has been introduced into the body? 🔒

### Regeneration vs Utilization
- **First Pillar:** ATP Restoration through the phosphocreatine system.
- **Second Pillar:** Creatine Availability → Creatine Uptake → Creatine Retention → Creatine Utilization → Creatine System Efficiency.

### The Biocreat® Philosophy
Biocreat® occupies the center of this pillar. Biocreat® is a standardized fenugreek seed extract developed by Indus Biotech and positioned as a creatine bioavailability optimization technology.

**Biocreat® → Creatine Bioavailability Optimization Technology → Supports Creatine Utilization Optimization → Creatine System Efficiency**`
      },
      {
        number: 5,
        title: "Intramuscular Buffering — The Third Functional Pillar",
        content: `If the first pillar addresses ATP regeneration and the second pillar addresses creatine system efficiency, the third pillar addresses another fundamental challenge of high-intensity exercise:
The ability of skeletal muscle to maintain functional performance as metabolic stress progressively accumulates. 🔒

Within ATP Cellular Forge™, this domain is supported by **Beta-Alanine**.

**Beta-Alanine → Carnosine Synthesis → Intramuscular Carnosine → Buffering Capacity**`
      },
      {
        number: 6,
        title: "Cellular Energetics — The Fourth Functional Pillar",
        content: `What enables a muscle cell to remain functionally capable of producing, utilizing and managing energy during periods of high physiological demand? 🔒

### Betaine Anhydrous
Betaine Anhydrous occupies the center of this pillar. Betaine is an osmolyte that assists cells in maintaining fluid balance and osmotic stability.

**Betaine → Cellular Osmoregulation → Cellular Hydration → Cellular Environment Stability → Cellular Function → Cellular Energetics**`
      },
      {
        number: 7,
        title: "Muscle Contractile Support — The Fifth Functional Pillar",
        content: `Within ATP Cellular Forge™, Taurine forms the foundation of the Muscle Contractile Support pillar due to its studied relationships with cellular hydration, calcium dynamics, excitation–contraction coupling, muscle function and neuromuscular performance. 🔒

**Taurine → Cellular Hydration → Calcium Dynamics → Excitation–Contraction Coupling → Muscle Function → Neuromuscular Performance → Muscle Contractile Support → Exercise Performance**`
      },
      {
        number: 8,
        title: "The Integrated ATP Cellular Forge™ Architecture",
        content: `The Five Functional Pillars function as a unified performance system:

- **Pillar 1:** Phosphocreatine Regeneration (Creatine Monohydrate)
- **Pillar 2:** Creatine Utilization Optimization (Biocreat®)
- **Pillar 3:** Intramuscular Buffering (Beta-Alanine)
- **Pillar 4:** Cellular Energetics (Betaine Anhydrous)
- **Pillar 5:** Muscle Contractile Support (Taurine)`
      },
      {
        number: 9,
        title: "High-Intensity Energy Availability — 1st Emergent Outcome",
        content: `High-Intensity Energy Availability refers to the capacity to rapidly generate, regenerate and sustain energy during periods of elevated energetic demand. Within ATP Cellular Forge™, this outcome emerges from the integration of phosphocreatine regeneration, creatine utilization optimization, intramuscular buffering, cellular energetics and muscle contractile support. 🔒`
      },
      {
        number: 10,
        title: "Creatine System Efficiency — 2nd Emergent Outcome",
        content: `Creatine System Efficiency refers to the coordinated effectiveness with which the phosphocreatine system is regenerated, maintained, utilized and functionally expressed during high-intensity exercise. 🔒`
      },
      {
        number: 11,
        title: "Fatigue Regulation — 3rd Emergent Outcome",
        content: `Fatigue Regulation refers to the coordinated physiological processes that influence the onset, accumulation and functional consequences of exercise-induced fatigue during high-intensity muscular activity. 🔒`
      },
      {
        number: 12,
        title: "Exercise Bioenergetics — 4th Emergent Outcome",
        content: `Exercise Bioenergetics refers to the integrated physiological processes through which energy is generated, regenerated, transferred, utilized and functionally expressed during exercise. 🔒`
      },
      {
        number: 13,
        title: "Muscle Function — 5th Emergent Outcome",
        content: `Muscle Function refers to the integrated physiological processes through which skeletal muscle generates, coordinates and sustains contractile activity in response to energetic and neuromuscular demands. 🔒`
      },
      {
        number: 14,
        title: "Neuromuscular Performance — 6th Emergent Outcome",
        content: `Neuromuscular Performance refers to the integrated physiological processes through which the nervous system and skeletal musculature coordinate, communicate and execute voluntary muscular activity. 🔒`
      },
      {
        number: 15,
        title: "Strength Performance — 7th Emergent Outcome",
        content: `Strength Performance refers to the capacity to generate and express force against resistance through the coordinated integration of muscular, neuromuscular and energetic systems. 🔒`
      },
      {
        number: 16,
        title: "Power Output — 8th Emergent Outcome",
        content: `Power Output refers to the capacity to generate and express force rapidly through the coordinated integration of energetic, muscular and neuromuscular systems. 🔒`
      },
      {
        number: 17,
        title: "Muscular Endurance — 9th & Final Emergent Outcome",
        content: `Muscular Endurance refers to the capacity to sustain repeated muscular contractions or prolonged muscular activity over time while maintaining functional performance. 🔒`
      },
      {
        number: 18,
        title: "Why These Five Ingredients Were Selected",
        content: `ATP Cellular Forge™ was engineered as a multi-pillar performance architecture in which each ingredient was selected to occupy a distinct physiological role within the system. 🔒`
      },
      {
        number: 19,
        title: "ATP Cellular Forge™ Within Legend Slayer™: The Viper Protocol™",
        content: `Within Legend Slayer™: The Viper Protocol™, ATP Cellular Forge™ serves as the dedicated Strength & Endurance Architecture alongside 6 complementary architectures. 🔒`
      }
    ]
  },
  {
    slug: "neuro-amp",
    title: "Neuro AMP™",
    subtitle: "Cognitive Focus & Neuro-Drive Architecture",
    category: "Neural Drive & Focus",
    badge: "Neuro-Cognitive Matrix",
    icon: "Brain",
    shortDescription: "Engineered for laser-sharp mental focus, reaction speed, cognitive endurance, and high-frequency motor unit recruitment during peak neural demand.",
    overview: "Neuro AMP™ is the cognitive command center of Legend Slayer™: The Viper Protocol™. It targets central nervous system drive, acetylcholine synthesis, neural transmission speed, and focus stability under severe metabolic stress.",
    sortOrder: 2,
    isActive: true,
    pillars: [
      { name: "Acetylcholine Synthesis", ingredient: "Alpha-GPC / Choline Bitartrate", role: "Neurotransmitter Precursor & Synaptic Transmission" },
      { name: "Nootropic Focus & Clarity", ingredient: "L-Tyrosine / Huperzine A", role: "Dopamine Precursor & Acetylcholinesterase Inhibition" },
      { name: "Neural Drive & Motor Recruitment", ingredient: "Neuro-Active Matrix", role: "CNS Stimulation & High-Threshold Motor Unit Fire Rate" }
    ],
    emergentOutcomes: [
      "Laser Focus & Spatial Awareness",
      "Reaction Speed & Processing Velocity",
      "Neural Motor Unit Recruitment",
      "Cognitive Fatigue Resistance"
    ],
    chapters: [
      {
        number: 1,
        title: "The Role of Central Nervous System Drive",
        content: `Every physical effort is initiated by a neural impulse. Neuro AMP™ focuses on optimizing synaptic signal strength, neurotransmitter availability, and motor neuron excitation thresholds. 🔒`
      },
      {
        number: 2,
        title: "Neuro-Cognitive Integration in The Viper Protocol™",
        content: `By pairing high-threshold neural drive with bioenergetic energy systems, Neuro AMP™ ensures that physical performance is always guided by sharp mental execution. 🔒`
      }
    ]
  },
  {
    slug: "neuro-thermal-core-x",
    title: "Neuro-Thermal Core X™",
    subtitle: "Metabolic & Energy Stim Matrix Architecture",
    category: "Metabolism & Energy",
    badge: "Thermogenic Matrix",
    icon: "Flame",
    shortDescription: "Precision thermogenic activation, sustained physical energy, fatty acid oxidation, and smooth CNS stimulation without energy crashes.",
    overview: "Neuro-Thermal Core X™ regulates physical energy expenditure, metabolic rate, catecholamine release, and mitochondrial thermogenesis, providing sustained stamina throughout demanding workouts.",
    sortOrder: 3,
    isActive: true,
    pillars: [
      { name: "Dual-Stage Energy Release", ingredient: "Anhydrous & Infinergy™ Caffeine", role: "Immediate & Sustained Adenosine Receptor Antagonism" },
      { name: "Thermogenic Oxidation", ingredient: "Capsimax® & L-Carnitine", role: "Uncoupling Protein Activation & Fatty Acid Transport" },
      { name: "Smooth Energy Balancing", ingredient: "L-Theanine", role: "Jitter Mitigation & Smooth Neuro-Transmitter Modulating" }
    ],
    emergentOutcomes: [
      "Sustained Physical Energy",
      "Elevated Metabolic Rate & Thermogenesis",
      "Enhanced Lipid Oxidation",
      "Zero-Crash Energy Curve"
    ],
    chapters: [
      {
        number: 1,
        title: "Thermogenic Activation & Energy Expenditure",
        content: `Neuro-Thermal Core X™ optimizes catecholamine output and mitochondrial respiration to elevate core temperature and promote efficient energy utilization during exercise. 🔒`
      },
      {
        number: 2,
        title: "Dual-Phase Caffeine Kinetics",
        content: `By combining rapid-acting caffeine with buffered sustained-release formats, energy availability remains elevated without central nervous system burnout. 🔒`
      }
    ]
  },
  {
    slug: "tripath-quantum-nox-7",
    title: "TriPath Quantum NOX 7™",
    subtitle: "Pump & Hyper-Vasodilation Architecture",
    category: "Vascularity & Nitric Oxide",
    badge: "Triple NO Matrix",
    icon: "Activity",
    shortDescription: "Triple-pathway nitric oxide synthesis, extreme arterial vasodilation, hyper-pumps, plasma volume expansion, and nutrient delivery.",
    overview: "TriPath Quantum NOX 7™ targets endothelial nitric oxide synthase (eNOS), nitrate-nitrite pathways, and arginase inhibition to produce maximal vasodilation and muscle fullness.",
    sortOrder: 4,
    isActive: true,
    pillars: [
      { name: "eNOS Enzymatic Pathway", ingredient: "L-Citrulline Malate", role: "Arginine Plasma Elevation & Direct eNOS Activation" },
      { name: "Nitrate-Nitrite Reductase Pathway", ingredient: "Exogenous Nitrates", role: "Hypoxic & Low-pH Nitric Oxide Generation" },
      { name: "Arginase Inhibition & Cell Swelling", ingredient: "Norvaline & Glycerol", role: "Nitric Oxide Degradation Prevention & Hyper-Hydration" }
    ],
    emergentOutcomes: [
      "Maximal Arterial Vasodilation & Pumps",
      "Increased Muscle Oxygenation & Nutrient Delivery",
      "Metabolic Byproduct Clearance",
      "Intramuscular Vascular Volume Expansion"
    ],
    chapters: [
      {
        number: 1,
        title: "Triple-Pathway Nitric Oxide Activation",
        content: `Unlike single-ingredient pump formulas, TriPath Quantum NOX 7™ activates eNOS, nitrate-nitrite reduction, and arginase suppression simultaneously. 🔒`
      },
      {
        number: 2,
        title: "Vascular Hyper-Pumps and Plasma Expansion",
        content: `Glycerol-induced cell swelling combined with nitric oxide vasodilation forces nutrient-dense blood directly into working muscle bellies. 🔒`
      }
    ]
  },
  {
    slug: "hydration-5x",
    title: "Hydration 5X Electrolyte Spectrum™",
    subtitle: "Osmotic & Hydration Recovery Architecture",
    category: "Hydration & Electrolytes",
    badge: "5-Spectrum Electrolyte",
    icon: "Droplets",
    shortDescription: "Rapid fluid balance restoration, intracellular osmoregulation, bio-available key electrolytes, and cramping prevention.",
    overview: "Hydration 5X Electrolyte Spectrum™ replenishes crucial sodium, potassium, magnesium, calcium, and chloride ions lost through perspiration, maintaining intracellular osmotic pressure and nerve impulse transmission.",
    sortOrder: 5,
    isActive: true,
    pillars: [
      { name: "Osmotic Balance Core", ingredient: "Sodium & Potassium Citrate", role: "Extracellular & Intracellular Fluid Homeostasis" },
      { name: "Neuromuscular Mineral Support", ingredient: "Magnesium & Calcium Glycinate", role: "Muscle Relaxation, Contractile Signaling & Cramp Defense" },
      { name: "Bio-Available Hydration Carrier", ingredient: "Himalayan Pink Salt", role: "Trace Mineral Replenishment & Fluid Absorption" }
    ],
    emergentOutcomes: [
      "Rapid Intracellular & Extracellular Rehydration",
      "Prevention of Exercise-Induced Muscle Cramps",
      "Sustained Nerve Impulses & Muscle Contraction",
      "Optimal Plasma Volume & Endurance Support"
    ],
    chapters: [
      {
        number: 1,
        title: "Electrolyte Spectrum & Osmotic Balance",
        content: `Dehydration directly impairs power output and cognitive stamina. Hydration 5X restores key minerals in precise stoichiometric ratios to maintain fluid homeostasis. 🔒`
      },
      {
        number: 2,
        title: "Cramp Prevention & Cellular Osmolality",
        content: `Magnesium and calcium chelate matrices prevent painful muscular spasms while maintaining smooth excitation-contraction coupling. 🔒`
      }
    ]
  },
  {
    slug: "absorption-cofactor-matrix",
    title: "Absorption Enhancer & Co-Factor Matrix™",
    subtitle: "Bioavailability & Adaptogen Architecture",
    category: "Bioavailability & Adaptogens",
    badge: "Bio-Delivery Matrix",
    icon: "Shield",
    shortDescription: "Enhanced intestinal nutrient absorption, piperine bio-enhancement, adaptogenic stress regulation, and essential B-vitamin enzymatic co-factors.",
    overview: "Absorption Enhancer & Co-Factor Matrix™ ensures that every active molecule in Legend Slayer™ is maximumly absorbed, protected against premature degradation, and intracellularly utilized.",
    sortOrder: 6,
    isActive: true,
    pillars: [
      { name: "Bioavailability Enhancement", ingredient: "AstraGin® / BioPerine®", role: "Intestinal Transporter Upregulation & Enzyme Support" },
      { name: "Adaptogenic Stress Regulation", ingredient: "Ashwagandha / Rhodiola", role: "Cortisol Modulation & Stress Adaptation" },
      { name: "Enzymatic Vitamin Co-Factors", ingredient: "Active B-Complex (B6, B9, B12)", role: "Cellular Energy Synthesis & Amino Acid Metabolism" }
    ],
    emergentOutcomes: [
      "Maximum Intestinal Nutrient Absorption",
      "Blunted Cortisol & Stress Response",
      "Enzymatic Co-Factor Optimization",
      "Full Bio-Utilization of All Formula Compounds"
    ],
    chapters: [
      {
        number: 1,
        title: "Intestinal Nutrient Transporter Upregulation",
        content: `AstraGin® and BioPerine® enhance intestinal permeability and transport proteins (such as GLUT4 and amino acid transporters), ensuring maximum absorption. 🔒`
      },
      {
        number: 2,
        title: "Adaptogenic Support and Enzymatic Synergism",
        content: `Active B-vitamins act as essential enzymatic co-factors for neurotransmitter and ATP synthesis, while adaptogens manage exercise-induced cortisol spikes. 🔒`
      }
    ]
  }
];

export const getArchitectures = async (req, res, next) => {
  try {
    const isAdmin = req.query.admin === "true";
    const filter = isAdmin ? {} : { isActive: true };

    let items = await Architecture.find(filter).sort({ sortOrder: 1, createdAt: -1 });

    if (items.length === 0 && !isAdmin) {
      // Auto seed default architectures if collection is empty
      await Architecture.insertMany(DEFAULT_ARCHITECTURES);
      items = await Architecture.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    }

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

export const getArchitectureBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let item = await Architecture.findOne({
      $or: [{ slug: slug.toLowerCase() }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Architecture not found" });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createArchitecture = async (req, res, next) => {
  try {
    const { title, slug, subtitle, category, badge, icon, shortDescription, overview, pillars, emergentOutcomes, chapters, sortOrder, isActive } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ success: false, message: "Title and slug are required" });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
    const existing = await Architecture.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: "Architecture slug already exists" });
    }

    const architecture = await Architecture.create({
      title,
      slug: cleanSlug,
      subtitle: subtitle || "",
      category: category || "Viper Protocol",
      badge: badge || "5 Pillars",
      icon: icon || "Zap",
      shortDescription: shortDescription || "",
      overview: overview || "",
      pillars: pillars || [],
      emergentOutcomes: emergentOutcomes || [],
      chapters: chapters || [],
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: architecture });
  } catch (error) {
    next(error);
  }
};

export const updateArchitecture = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, subtitle, category, badge, icon, shortDescription, overview, pillars, emergentOutcomes, chapters, sortOrder, isActive } = req.body;

    const architecture = await Architecture.findById(id);
    if (!architecture) {
      return res.status(404).json({ success: false, message: "Architecture not found" });
    }

    if (slug && slug.toLowerCase() !== architecture.slug) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
      const existing = await Architecture.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Architecture slug already exists" });
      }
      architecture.slug = cleanSlug;
    }

    if (title) architecture.title = title;
    if (subtitle !== undefined) architecture.subtitle = subtitle;
    if (category !== undefined) architecture.category = category;
    if (badge !== undefined) architecture.badge = badge;
    if (icon !== undefined) architecture.icon = icon;
    if (shortDescription !== undefined) architecture.shortDescription = shortDescription;
    if (overview !== undefined) architecture.overview = overview;
    if (pillars !== undefined) architecture.pillars = pillars;
    if (emergentOutcomes !== undefined) architecture.emergentOutcomes = emergentOutcomes;
    if (chapters !== undefined) architecture.chapters = chapters;
    if (sortOrder !== undefined) architecture.sortOrder = sortOrder;
    if (isActive !== undefined) architecture.isActive = isActive;

    await architecture.save();

    res.json({ success: true, data: architecture });
  } catch (error) {
    next(error);
  }
};

export const deleteArchitecture = async (req, res, next) => {
  try {
    const { id } = req.params;
    const architecture = await Architecture.findByIdAndDelete(id);
    if (!architecture) {
      return res.status(404).json({ success: false, message: "Architecture not found" });
    }
    res.json({ success: true, message: "Architecture deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const seedArchitectures = async (req, res, next) => {
  try {
    await Architecture.deleteMany({});
    const items = await Architecture.insertMany(DEFAULT_ARCHITECTURES);
    res.json({ success: true, message: "Seeded default architectures successfully", count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};
