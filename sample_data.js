// Sample chemical database and simulated SDS documents
window.SAMPLE_CHEMICALS = [
  {
    id: "chem-001",
    name: "Isopropyl Alcohol 99%",
    cas: "67-63-0",
    manufacturer: "Apex Chemical Supply",
    hazards: ["Flammable Liquid", "Eye Irritant", "Specific Target Organ Toxicity (Single Exposure)"],
    pictograms: ["flame", "exclamation"],
    hCodes: ["H225", "H319", "H336"],
    pCodes: ["P210", "P233", "P280", "P305+P351+P338"],
    acidBase: "Neutral",
    waterReactive: false,
    toxic: false,
    oxidizer: false,
    explosive: false,
    foodGrade: false,
    allergens: [],
    storageClass: "3", // Flammable Liquids
    buildingLocation: "231",
    customer: "Worldwide",
    sdsText: `
SECTION 1: Identification
Product Name: Isopropyl Alcohol 99%
CAS Number: 67-63-0
Synonyms: Isopropanol, 2-Propanol, IPA
Manufacturer: Apex Chemical Supply
Emergency Phone: 1-800-555-0199

SECTION 2: Hazard(s) identification
Classification:
Flammable liquids (Category 2), H225
Eye irritation (Category 2A), H319
Specific target organ toxicity - single exposure (Category 3), Central nervous system, H336
Signal Word: Danger
Hazard Statements:
H225 Highly flammable liquid and vapor.
H319 Causes serious eye irritation.
H336 May cause drowsiness or dizziness.
Pictograms: [Flame] [Exclamation mark]

SECTION 3: Composition/information on ingredients
Component: Isopropyl Alcohol
CAS-No.: 67-63-0
Weight %: 99.5%
No allergens detected. Not food grade.

SECTION 10: Stability and reactivity
Reactivity: Vapors may form explosive mixture with air.
Chemical stability: Stable under recommended storage conditions.
Possibility of hazardous reactions: Reacts violently with strong oxidizers.
Incompatible materials: Strong oxidizing agents, Acid anhydrides, Aluminum, Halogens.
Hazardous decomposition products: Carbon oxides.

SECTION 11: Toxicological information
Acute toxicity: LD50 Oral - Rat - 5,045 mg/kg
Skin corrosion/irritation: Mild skin irritation.
Serious eye damage/eye irritation: Causes serious eye irritation.
Respiratory or skin sensitization: Not a known sensitizer.
    `
  },
  {
    id: "chem-002",
    name: "Hydrochloric Acid 37%",
    cas: "7647-01-0",
    manufacturer: "Global Lab Solutions",
    hazards: ["Corrosive to Metals", "Skin Corrosion", "Serious Eye Damage", "Specific Target Organ Toxicity (Single Exposure)"],
    pictograms: ["corrosive", "exclamation"],
    hCodes: ["H290", "H314", "H335"],
    pCodes: ["P260", "P280", "P301+P330+P331", "P303+P361+P353", "P305+P351+P338"],
    acidBase: "Acid",
    waterReactive: false,
    toxic: false,
    oxidizer: false,
    explosive: false,
    foodGrade: false,
    allergens: [],
    storageClass: "8A", // Acid Corrosives
    buildingLocation: "241",
    customer: "EASTMAN",
    sdsText: `
SECTION 1: Identification
Product Name: Hydrochloric Acid 37%
CAS Number: 7647-01-0
Synonyms: Muriatic acid, Hydrogen chloride aqueous
Manufacturer: Global Lab Solutions
Emergency Phone: 1-800-555-0120

SECTION 2: Hazard(s) identification
Classification:
Corrosive to metals (Category 1), H290
Skin corrosion (Category 1B), H314
Serious eye damage (Category 1), H318
Specific target organ toxicity - single exposure (Category 3), Respiratory system, H335
Signal Word: Danger
Hazard Statements:
H290 May be corrosive to metals.
H314 Causes severe skin burns and eye damage.
H335 May cause respiratory irritation.
Pictograms: [Corrosion] [Exclamation mark]

SECTION 3: Composition/information on ingredients
Component: Hydrochloric Acid
CAS-No.: 7647-01-0
Weight %: 37%
No allergens. Industrial grade only.

SECTION 10: Stability and reactivity
Reactivity: Corrosive to metals. Contact with metals may evolve flammable hydrogen gas.
Chemical stability: Stable under recommended storage conditions.
Possibility of hazardous reactions: Exothermic reaction with strong bases / alkalis. Releases toxic chlorine gas when mixed with bleach/oxidizers. Reacts violently with cyanides or sulfides to produce highly toxic hydrogen cyanide or hydrogen sulfide gas.
Incompatible materials: Strong bases, Strong oxidizing agents, Metals, Amines, Cyanides, Sulfides.
Hazardous decomposition products: Hydrogen chloride gas, chlorine.

SECTION 11: Toxicological information
Acute toxicity: Inhalation LC50 - Rat - 3124 ppm/1h
Skin corrosion/irritation: Causes severe skin burns.
Serious eye damage/eye irritation: Causes serious eye damage. Risk of blindness.
    `
  },
  {
    id: "chem-003",
    name: "Sodium Hydroxide Pellets",
    cas: "1310-73-2",
    manufacturer: "Precision Chemical Corp",
    hazards: ["Corrosive to Metals", "Skin Corrosion", "Serious Eye Damage"],
    pictograms: ["corrosive"],
    hCodes: ["H290", "H314"],
    pCodes: ["P260", "P280", "P301+P330+P331", "P305+P351+P338"],
    acidBase: "Base",
    waterReactive: false,
    toxic: false,
    oxidizer: false,
    explosive: false,
    foodGrade: false,
    allergens: [],
    storageClass: "8B", // Alkali/Base Corrosives
    buildingLocation: "904",
    customer: "LANXESS",
    sdsText: `
SECTION 1: Identification
Product Name: Sodium Hydroxide Pellets
CAS Number: 1310-73-2
Synonyms: Caustic soda, Lye
Manufacturer: Precision Chemical Corp
Emergency Phone: 1-800-555-0188

SECTION 2: Hazard(s) identification
Classification:
Corrosive to metals (Category 1), H290
Skin corrosion (Category 1A), H314
Serious eye damage (Category 1), H318
Signal Word: Danger
Hazard Statements:
H290 May be corrosive to metals.
H314 Causes severe skin burns and eye damage.
Pictograms: [Corrosion]

SECTION 3: Composition/information on ingredients
Component: Sodium Hydroxide
CAS-No.: 1310-73-2
Weight %: 98-100%
No allergens.

SECTION 10: Stability and reactivity
Reactivity: Exothermic dissolution in water. Reacts violently with acids.
Chemical stability: Stable under dry conditions. Absorbs water and CO2 from air.
Possibility of hazardous reactions: Exothermic reaction with strong acids. Reacts with aluminum, zinc, and tin, generating flammable hydrogen gas.
Incompatible materials: Strong acids, Water (exothermic dissolution), Organic materials, Chlorinated hydrocarbons, Metals.
Hazardous decomposition products: Sodium oxides.

SECTION 11: Toxicological information
Acute toxicity: LD50 Oral - Not available (highly corrosive).
Skin corrosion/irritation: Causes severe skin burns.
Serious eye damage/eye irritation: Causes serious eye damage. Immediate risk of blindness.
    `
  },
  {
    id: "chem-004",
    name: "Hydrogen Peroxide 30%",
    cas: "7722-84-1",
    manufacturer: "BioLab Reagents",
    hazards: ["Oxidizing Liquid", "Acute Toxicity", "Skin Corrosion", "Serious Eye Damage"],
    pictograms: ["oxidizer", "corrosive", "exclamation"],
    hCodes: ["H272", "H302", "H314", "H332"],
    pCodes: ["P220", "P280", "P301+P312", "P303+P361+P353", "P305+P351+P338"],
    acidBase: "Acid", // Slightly acidic, but primary is Oxidizer
    waterReactive: false,
    toxic: false,
    oxidizer: true,
    explosive: false,
    foodGrade: false,
    allergens: [],
    storageClass: "5.1", // Oxidizers
    buildingLocation: "231",
    customer: "Worldwide",
    sdsText: `
SECTION 1: Identification
Product Name: Hydrogen Peroxide 30%
CAS Number: 7722-84-1
Synonyms: Hydrogen dioxide, Hydroperoxide
Manufacturer: BioLab Reagents

SECTION 2: Hazard(s) identification
Classification:
Oxidizing liquids (Category 2), H272
Acute toxicity, Oral (Category 4), H302
Acute toxicity, Inhalation (Category 4), H332
Skin corrosion (Category 1B), H314
Serious eye damage (Category 1), H318
Signal Word: Danger
Hazard Statements:
H272 May intensify fire; oxidizer.
H302 Harmful if swallowed.
H332 Harmful if inhaled.
H314 Causes severe skin burns and eye damage.
Pictograms: [Flame over circle] [Corrosion] [Exclamation mark]

SECTION 10: Stability and reactivity
Reactivity: Strong oxidizer. Contact with combustible materials may cause fire.
Chemical stability: Stable under recommended storage conditions, contains stabilizers.
Possibility of hazardous reactions: Decomposition is exothermic and releases oxygen gas which accelerates combustion. Reacts violently with reducing agents, organic materials, alcohols, and flammable solvents.
Incompatible materials: Reducing agents, Organic materials, Alcohols, Flammable liquids, Powdered metals, Strong bases.
Hazardous decomposition products: Oxygen, Water.
    `
  },
  {
    id: "chem-005",
    name: "Sodium Bicarbonate USP (Food Grade)",
    cas: "144-55-8",
    manufacturer: "Purity Baking Corp",
    hazards: ["None"],
    pictograms: [],
    hCodes: [],
    pCodes: [],
    acidBase: "Neutral",
    waterReactive: false,
    toxic: false,
    oxidizer: false,
    explosive: false,
    foodGrade: true,
    allergens: [],
    storageClass: "10", // General Storage (Non-hazardous)
    buildingLocation: "904",
    customer: "MEELUNIE AMERICA, INC.",
    sdsText: `
SECTION 1: Identification
Product Name: Sodium Bicarbonate USP
CAS Number: 144-55-8
Synonyms: Baking soda, Sodium hydrogen carbonate
Manufacturer: Purity Baking Corp
Intended Use: Food additive, buffer, pharmaceutical. Suitable for human consumption. Meets USP, FCC (Food Chemicals Codex) specifications.

SECTION 2: Hazard(s) identification
Classification: Not a hazardous substance or mixture.
Signal Word: None
Hazard Statements: None
Pictograms: None

SECTION 3: Composition/information on ingredients
Component: Sodium Bicarbonate
CAS-No.: 144-55-8
Weight %: 99.9%
Allergens: Free from major allergens including gluten, dairy, wheat, soy, peanuts, tree nuts, eggs, and fish.
Grade: Food Grade (USP/FCC).

SECTION 10: Stability and reactivity
Reactivity: Reacts with acids to release carbon dioxide gas (effervescence).
Chemical stability: Stable under dry storage conditions.
Possibility of hazardous reactions: None under normal conditions.
Incompatible materials: Strong acids.
Hazardous decomposition products: Carbon dioxide, Sodium carbonate.

SECTION 11: Toxicological information
Acute toxicity: LD50 Oral - Rat - 4,220 mg/kg
Skin corrosion/irritation: Non-irritating.
Serious eye damage/eye irritation: Mild eye irritation may occur from mechanical dust.
Sensitization: Not an allergen. Free from gluten, peanuts, tree nuts.
    `
  },
  {
    id: "chem-006",
    name: "Pure Peanut Oil Extract",
    cas: "8002-03-7",
    manufacturer: "Baker's Choice Ingredients",
    hazards: ["Allergen Hazard"],
    pictograms: ["exclamation"],
    hCodes: ["H317"], // Simulated allergen sensitization
    pCodes: [],
    acidBase: "Neutral",
    waterReactive: false,
    toxic: false,
    oxidizer: false,
    explosive: false,
    foodGrade: true,
    allergens: ["Peanut"],
    storageClass: "10", // General Storage (Food/Allergen)
    buildingLocation: "4033",
    customer: "MEELUNIE AMERICA, INC.",
    sdsText: `
SECTION 1: Identification
Product Name: Pure Peanut Oil Extract
CAS Number: 8002-03-7
Synonyms: Arachis oil, Groundnut oil
Manufacturer: Baker's Choice Ingredients
Intended Use: Culinary ingredient, food flavoring.

SECTION 2: Hazard(s) identification
Classification:
Skin sensitization (Category 1), H317 (Due to allergen proteins)
Signal Word: Warning
Hazard Statements:
H317 May cause an allergic skin reaction in sensitive individuals.
Pictograms: [Exclamation mark]

SECTION 3: Composition/information on ingredients
Component: Peanut Oil
CAS-No.: 8002-03-7
Weight %: 100%
Allergens: Contains PEANUTS. Peanut proteins are present and may trigger severe anaphylactic reactions in allergic individuals.
Grade: Food Grade (FCC).

SECTION 10: Stability and reactivity
Reactivity: Combustible at elevated temperatures.
Chemical stability: Stable. Avoid excessive heat.
Incompatible materials: Strong oxidizing agents.
    `
  },
  {
    id: "chem-007",
    name: "Sodium Cyanide Solid",
    cas: "143-33-9",
    manufacturer: "Apex Chemical Supply",
    hazards: ["Acute Oral Toxicity", "Acute Dermal Toxicity", "Acute Inhalation Toxicity", "Skin Corrosion", "Aquatic Acute Danger"],
    pictograms: ["skull", "corrosive", "environment"],
    hCodes: ["H300", "H310", "H330", "H314", "H410"],
    pCodes: ["P260", "P262", "P280", "P284", "P301+P310", "P302+P350+P310", "P304+P340+P310", "P305+P351+P338"],
    acidBase: "Neutral",
    waterReactive: false,
    toxic: true,
    oxidizer: false,
    explosive: false,
    foodGrade: false,
    allergens: [],
    storageClass: "6.1A", // Highly Toxic Solids
    buildingLocation: "231",
    customer: "SI GROUP",
    sdsText: `
SECTION 1: Identification
Product Name: Sodium Cyanide Solid
CAS Number: 143-33-9
Manufacturer: Apex Chemical Supply
Emergency Phone: 1-800-555-0199

SECTION 2: Hazard(s) identification
Classification:
Acute toxicity, Oral (Category 1), H300
Acute toxicity, Dermal (Category 1), H310
Acute toxicity, Inhalation (Category 1), H330
Skin corrosion (Category 1B), H314
Short-term (acute) aquatic hazard (Category 1), H400
Long-term (chronic) aquatic hazard (Category 1), H410
Signal Word: Danger
Hazard Statements:
H300 Fatal if swallowed.
H310 Fatal in contact with skin.
H330 Fatal if inhaled.
H314 Causes severe skin burns and eye damage.
H410 Very toxic to aquatic life with long lasting effects.
Pictograms: [Skull and crossbones] [Corrosion] [Environment]

SECTION 10: Stability and reactivity
Reactivity: Reacts with acids to liberate extremely toxic and flammable hydrogen cyanide (HCN) gas. Contact with water/moisture may evolve toxic gases.
Chemical stability: Stable under dry storage. Very hygroscopic.
Possibility of hazardous reactions: Reacts with acids, generating highly toxic hydrogen cyanide gas.
Incompatible materials: Acids, Strong oxidizing agents, Water/moisture (absorbs water, reacts slowly forming ammonia), Carbon dioxide (reacts slowly).
Hazardous decomposition products: Hydrogen cyanide gas, Nitrogen oxides.

SECTION 11: Toxicological information
Acute toxicity:
LD50 Oral - Rat - 6.4 mg/kg
LC50 Inhalation - Rat - 0.16 mg/l (dust, 4h)
LD50 Dermal - Rabbit - 10.4 mg/kg
Sensitization: Not a known allergen.
    `
  },
  {
    id: "chem-008",
    name: "Sodium Hydride 60% in Mineral Oil",
    cas: "7646-69-7",
    manufacturer: "Precision Chemical Corp",
    hazards: ["Substance which in contact with water emits flammable gas", "Skin Corrosion", "Serious Eye Damage"],
    pictograms: ["flame", "corrosive"],
    hCodes: ["H260", "H314"],
    pCodes: ["P223", "P231+P232", "P280", "P301+P330+P331", "P305+P351+P338", "P370+P378"],
    acidBase: "Base", // Strongly basic hydride
    waterReactive: true,
    toxic: false,
    oxidizer: false,
    explosive: false,
    foodGrade: false,
    allergens: [],
    storageClass: "4.3", // Substances emitting flammable gases on contact with water
    buildingLocation: "241",
    customer: "SI GROUP",
    sdsText: `
SECTION 1: Identification
Product Name: Sodium Hydride 60% dispersion in mineral oil
CAS Number: 7646-69-7
Manufacturer: Precision Chemical Corp

SECTION 2: Hazard(s) identification
Classification:
Substances and mixtures which, in contact with water, emit flammable gases (Category 1), H260
Skin corrosion (Category 1B), H314
Serious eye damage (Category 1), H318
Signal Word: Danger
Hazard Statements:
H260 In contact with water releases flammable gases which may ignite spontaneously.
H314 Causes severe skin burns and eye damage.
Pictograms: [Flame] [Corrosion]

SECTION 10: Stability and reactivity
Reactivity: Reacts violently with water, generating highly flammable hydrogen gas and heat, which can cause ignition.
Chemical stability: Stable under inert gas. Moisture sensitive.
Possibility of hazardous reactions: Reacts violently with water releasing hydrogen gas.
Incompatible materials: Water, moisture, alcohols, acids, strong oxidizing agents.
Hazardous decomposition products: Hydrogen gas, Sodium hydroxide.
    `
  }
];
