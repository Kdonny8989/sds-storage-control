// Main App Logic for SDS Compatibility App
document.addEventListener("DOMContentLoaded", () => {
  // Initialize PDF.js worker
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
  }

  // Application State
  let chemicals = [];
  let shelves = [];
  let shelvesByLocation = {};
  let activeTab = "dashboard";

  // Cache DOM Elements
  const tabs = document.querySelectorAll(".tab-btn");
  const views = document.querySelectorAll(".app-view");
  
  const searchInput = document.getElementById("search-input");
  const filterHazard = document.getElementById("filter-hazard");
  const filterCompliance = document.getElementById("filter-compliance");
  const filterSite = document.getElementById("filter-site");
  const filterCustomer = document.getElementById("filter-customer");
  const inventoryBody = document.getElementById("inventory-body");
  
  const chemicalPool = document.getElementById("chemical-pool");
  const cabinetShelves = document.getElementById("cabinet-shelves");
  const auditLogs = document.getElementById("audit-logs");
  
  const addShelfBtn = document.getElementById("add-shelf-btn");
  const resetShelvesBtn = document.getElementById("reset-shelves-btn");
  const exportAuditBtn = document.getElementById("export-audit-btn");
  const exportExcelBtn = document.getElementById("export-excel-btn");
  
  const modalOverlay = document.getElementById("modal-overlay");
  const modalClose = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");

  // Load Initial Data
  function init() {
    const savedChems = localStorage.getItem("sds_chemicals");

    if (savedChems) {
      chemicals = JSON.parse(savedChems);
    } else {
      // Use sample data on first load
      chemicals = [...window.SAMPLE_CHEMICALS];
      localStorage.setItem("sds_chemicals", JSON.stringify(chemicals));
    }

    // Set up location options
    populateLocationDropdowns();

    // Now load shelf states based on active location selection
    loadShelvesState();

    setupEventListeners();
    renderAll();

    // Auto-sync database from Airtable on startup
    syncFromAirtable();
  }

  // Location Selector Logic
  function getActiveLocationKey() {
    const cabLocSelect = document.getElementById("cabinet-location-group");
    return cabLocSelect ? cabLocSelect.value : "default";
  }

  function loadShelvesState() {
    const saved = localStorage.getItem("sds_shelves_by_location");
    if (saved) {
      shelvesByLocation = JSON.parse(saved);
    } else {
      shelvesByLocation = {
        "site_231": [
          { id: "shelf-1", name: "Shelf 1 (Top)", chemicals: [] },
          { id: "shelf-2", name: "Shelf 2 (Middle)", chemicals: ["chem-001"] }, // Isopropyl Alcohol
          { id: "shelf-3", name: "Shelf 3 (Bottom)", chemicals: [] }
        ],
        "site_241": [
          { id: "shelf-1", name: "Shelf 1 (Top)", chemicals: [] },
          { id: "shelf-2", name: "Shelf 2 (Middle)", chemicals: [] },
          { id: "shelf-3", name: "Shelf 3 (Bottom)", chemicals: ["chem-002"] } // Hydrochloric Acid
        ],
        "site_904": [
          { id: "shelf-1", name: "Shelf 1 (Top)", chemicals: ["chem-005"] }, // Sodium Bicarbonate
          { id: "shelf-2", name: "Shelf 2 (Middle)", chemicals: [] },
          { id: "shelf-3", name: "Shelf 3 (Bottom)", chemicals: [] }
        ]
      };
      // Backwards compatibility migration
      const oldShelves = localStorage.getItem("sds_shelves");
      if (oldShelves) {
        shelvesByLocation["default"] = JSON.parse(oldShelves);
      }
      localStorage.setItem("sds_shelves_by_location", JSON.stringify(shelvesByLocation));
    }

    const key = getActiveLocationKey();
    if (shelvesByLocation[key]) {
      shelves = shelvesByLocation[key];
    } else {
      // Default: create 3 shelves for this location
      shelves = [
        { id: "shelf-1", name: "Shelf 1 (Top)", chemicals: [] },
        { id: "shelf-2", name: "Shelf 2 (Middle)", chemicals: [] },
        { id: "shelf-3", name: "Shelf 3 (Bottom)", chemicals: [] }
      ];
      shelvesByLocation[key] = shelves;
    }
  }

  function saveShelvesState() {
    const key = getActiveLocationKey();
    shelvesByLocation[key] = shelves;
    localStorage.setItem("sds_shelves_by_location", JSON.stringify(shelvesByLocation));
  }

  function populateLocationDropdowns() {
    const sites = new Set();
    const customers = new Set();
    
    chemicals.forEach(chem => {
      if (chem.buildingLocation && chem.buildingLocation !== "Unassigned") {
        sites.add(chem.buildingLocation.toString());
      }
      if (chem.customer && chem.customer !== "Unassigned") {
        customers.add(chem.customer.toString());
      }
    });

    const sortedSites = Array.from(sites).sort();
    const sortedCustomers = Array.from(customers).sort();

    // Populate dashboard filters
    const fSite = document.getElementById("filter-site");
    const fCust = document.getElementById("filter-customer");

    if (fSite) {
      const selected = fSite.value;
      fSite.innerHTML = '<option value="all">All Sites (Building Locations)</option>';
      sortedSites.forEach(site => {
        fSite.insertAdjacentHTML("beforeend", `<option value="${site}">Building ${site}</option>`);
      });
      fSite.value = selected || "all";
      if (fSite.value !== selected) fSite.value = "all";
    }

    if (fCust) {
      const selected = fCust.value;
      fCust.innerHTML = '<option value="all">All Customers</option>';
      sortedCustomers.forEach(cust => {
        fCust.insertAdjacentHTML("beforeend", `<option value="${cust}">${cust}</option>`);
      });
      fCust.value = selected || "all";
      if (fCust.value !== selected) fCust.value = "all";
    }

    updateCabinetLocations();
  }

  function updateCabinetLocations() {
    const modeSelect = document.getElementById("cabinet-group-mode");
    const cabLocSelect = document.getElementById("cabinet-location-group");
    if (!modeSelect || !cabLocSelect) return;

    const mode = modeSelect.value;
    const selectedVal = cabLocSelect.value;
    cabLocSelect.innerHTML = "";

    const sites = new Set();
    const customers = new Set();

    chemicals.forEach(chem => {
      if (chem.buildingLocation && chem.buildingLocation !== "Unassigned") {
        sites.add(chem.buildingLocation.toString());
      }
      if (chem.customer && chem.customer !== "Unassigned") {
        customers.add(chem.customer.toString());
      }
    });

    const sortedSites = Array.from(sites).sort();
    const sortedCustomers = Array.from(customers).sort();

    if (mode === "site") {
      sortedSites.forEach(site => {
        cabLocSelect.insertAdjacentHTML("beforeend", `<option value="site_${site}">Building ${site}</option>`);
      });
    } else {
      sortedCustomers.forEach(cust => {
        cabLocSelect.insertAdjacentHTML("beforeend", `<option value="customer_${cust}">${cust}</option>`);
      });
    }

    if (cabLocSelect.querySelector(`option[value="${selectedVal}"]`)) {
      cabLocSelect.value = selectedVal;
    } else if (cabLocSelect.options.length > 0) {
      cabLocSelect.selectedIndex = 0;
    }
    
    // Update header label
    const titleEl = document.getElementById("cabinet-location-title");
    if (titleEl && cabLocSelect.options.length > 0) {
      titleEl.innerText = cabLocSelect.options[cabLocSelect.selectedIndex].text;
    }
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        views.forEach(v => v.classList.remove("active"));
        
        tab.classList.add("active");
        activeTab = tab.dataset.tab;
        document.getElementById(`${activeTab}-view`).classList.add("active");
        
        renderAll();
      });
    });

    // Search and Filters
    if (searchInput) searchInput.addEventListener("input", renderInventory);
    if (filterHazard) filterHazard.addEventListener("change", renderInventory);
    if (filterCompliance) filterCompliance.addEventListener("change", renderInventory);
    if (filterSite) filterSite.addEventListener("change", renderInventory);
    if (filterCustomer) filterCustomer.addEventListener("change", renderInventory);

    // Cabinet Pool Search
    const poolSearch = document.getElementById("pool-search-input");
    if (poolSearch) {
      poolSearch.addEventListener("input", renderShelfSimulator);
    }

    // Cabinet selectors
    const modeSelect = document.getElementById("cabinet-group-mode");
    const cabLocSelect = document.getElementById("cabinet-location-group");

    if (modeSelect) {
      modeSelect.addEventListener("change", () => {
        updateCabinetLocations();
        loadShelvesState();
        renderShelfSimulator();
      });
    }

    if (cabLocSelect) {
      cabLocSelect.addEventListener("change", () => {
        loadShelvesState();
        updateCabinetLocations(); // Updates title text
        renderShelfSimulator();
      });
    }

    // Shelf interactions
    addShelfBtn.addEventListener("click", () => {
      const nextId = `shelf-${Date.now()}`;
      const nextNum = shelves.length + 1;
      shelves.push({ id: nextId, name: `Shelf ${nextNum}`, chemicals: [] });
      saveShelvesState();
      renderAll();
    });

    resetShelvesBtn.addEventListener("click", () => {
      shelves.forEach(s => s.chemicals = []);
      saveShelvesState();
      renderAll();
    });

    exportAuditBtn.addEventListener("click", exportAuditReport);
    exportExcelBtn.addEventListener("click", exportInventoryExcel);

    // Modal Close
    modalClose.addEventListener("click", hideModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) hideModal();
    });

    // Forms Tab Switcher Events
    const formBtn1 = document.getElementById("form-btn-1");
    const formBtn2 = document.getElementById("form-btn-2");
    const formsIframe = document.getElementById("forms-iframe");

    if (formBtn1 && formBtn2 && formsIframe) {
      formBtn1.addEventListener("click", () => {
        formsIframe.src = "https://airtable.com/embed/appZ8y9RqssldMpDS/pagfLJDQ794DOeYUj/form";
        formBtn1.classList.remove("btn-secondary");
        formBtn1.classList.add("btn-primary");
        formBtn2.classList.remove("btn-primary");
        formBtn2.classList.add("btn-secondary");
      });
      
      formBtn2.addEventListener("click", () => {
        formsIframe.src = "https://airtable.com/embed/appZ8y9RqssldMpDS/pag1hlXJr0ivfRYJy/form";
        formBtn2.classList.remove("btn-secondary");
        formBtn2.classList.add("btn-primary");
        formBtn1.classList.remove("btn-primary");
        formBtn1.classList.add("btn-secondary");
      });
    }
  }

  function setupDropZone(zone, input, handler) {
    zone.addEventListener("click", () => input.click());
    
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("dragover");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("dragover");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        handler(e.dataTransfer.files);
      }
    });

    input.addEventListener("change", () => {
      if (input.files.length > 0) {
        handler(input.files);
      }
    });
  }

  // State Save functions
  function saveChemicalsState() {
    localStorage.setItem("sds_chemicals", JSON.stringify(chemicals));
  }

  function saveShelvesState() {
    localStorage.setItem("sds_shelves", JSON.stringify(shelves));
  }

  // PDF Uploader Parsing
  async function handlePDFUpload(files) {
    for (let file of files) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        addQueueItem(file.name, "Error: Not a PDF file", "error");
        continue;
      }

      const queueId = addQueueItem(file.name, "Extracting text...", "loading");
      
      try {
        const text = await extractTextFromPDF(file);
        updateQueueItem(queueId, "Analyzing SDS content...", "loading");
        
        const chemData = parseSDSText(text, file.name);
        chemicals.push(chemData);
        saveChemicalsState();
        
        updateQueueItem(queueId, "Successfully imported!", "done");
        setTimeout(() => renderAll(), 1000);
      } catch (err) {
        console.error(err);
        updateQueueItem(queueId, `Failed to parse: ${err.message}`, "error");
      }
    }
  }

  // PDF Text Extraction using PDF.js
  async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      text += `\n--- Page ${i} ---\n` + pageText;
    }
    return text;
  }

  // Heuristic SDS Parsing Engine
  function parseSDSText(text, filename) {
    // 1. Identify Chemical Name
    let name = filename.replace(/\.[^/.]+$/, "").replace(/[_\-]/g, " ");
    const nameMatch = text.match(/(?:Product Name|Trade Name|Substance Name)\s*:\s*([^\n\r]+)/i);
    if (nameMatch && nameMatch[1].trim().length > 3) {
      name = nameMatch[1].trim();
    }

    // 2. Identify CAS Number
    let cas = "N/A";
    const casMatch = text.match(/\b(?:CAS|CAS-No\.?)\s*[:\-]?\s*(\d{2,7}-\d{2}-\d)\b/i);
    if (casMatch) {
      cas = casMatch[1].trim();
    }

    // 3. Extract Manufacturer
    let manufacturer = "Unknown Manufacturer";
    const manufMatch = text.match(/(?:Manufacturer|Supplier|Distributed By)\s*:\s*([^\n\r]+)/i);
    if (manufMatch) {
      manufacturer = manufMatch[1].trim();
    }

    // 4. Hazard Codes (H-Codes)
    const hCodeRegex = /\bH\d{3}\b/g;
    const hCodes = [...new Set(text.match(hCodeRegex) || [])];

    // 5. Precautionary Codes (P-Codes)
    const pCodeRegex = /\bP\d{3}(?:\+\d{3})*\b/g;
    const pCodes = [...new Set(text.match(pCodeRegex) || [])];

    // 6. Map Chemical Class Indicators
    let acidBase = "Neutral";
    if (/\b(?:acid|hydrochloric|sulfuric|nitric|phosphoric|acetic|citric)\b/i.test(text) || /\bpH\s*:\s*[0-2](?:\.\d)?\b/i.test(text)) {
      acidBase = "Acid";
    } else if (/\b(?:base|alkali|sodium hydroxide|caustic|potassium hydroxide|ammonia|ammonium|lye)\b/i.test(text) || /\bpH\s*:\s*(?:1[1-4]|9|10)(?:\.\d)?\b/i.test(text)) {
      acidBase = "Base";
    }

    const waterReactive = /\b(?:water-reactive|reacts violently with water|emits flammable gases in contact with water|H260|H261)\b/i.test(text);
    const oxidizer = /\b(?:oxidizer|oxidizing|oxidising|organic peroxide|H272|H271|H270)\b/i.test(text);
    const toxic = /\b(?:toxic|poison|fatal|lethal|skull|H300|H310|H330|H301|H311|H331)\b/i.test(text);
    const explosive = /\b(?:explosive|explosion hazard|exploding bomb|H200|H201|H202|H203|H204|H205)\b/i.test(text);
    const foodGrade = /\b(?:food grade|usp|fcc|food chemicals codex|gras|food additive|suitable for food contact|fda approved)\b/i.test(text);

    // Allergens Check
    const allergensFound = [];
    const allergenKeywords = {
      "Peanut": /\b(?:peanut|groundnut)\b/i,
      "Tree Nut": /\b(?:tree nut|almond|cashew|walnut|pecan|macadamia|pistachio|hazelnut)\b/i,
      "Dairy/Milk": /\b(?:milk|dairy|lactose|casein|whey)\b/i,
      "Egg": /\b(?:egg|albumin)\b/i,
      "Soy": /\b(?:soy|soya|lecithin)\b/i,
      "Wheat/Gluten": /\b(?:wheat|gluten|barley|rye)\b/i,
      "Fish": /\b(?:fish|salmon|tuna|cod)\b/i,
      "Crustacean": /\b(?:shrimp|crab|lobster|shellfish)\b/i,
      "Sesame": /\b(?:sesame)\b/i
    };

    for (let [allergen, regex] of Object.entries(allergenKeywords)) {
      if (regex.test(text)) {
        allergensFound.push(allergen);
      }
    }

    // Storage class determination
    let storageClass = "10"; // Default: General Storage (non-hazardous)
    let hazardsList = [];
    let pictograms = [];

    if (explosive) {
      storageClass = "1";
      hazardsList.push("Explosive");
      pictograms.push("explosive");
    } else if (waterReactive) {
      storageClass = "4.3";
      hazardsList.push("Water-Reactive");
      pictograms.push("flame");
    } else if (oxidizer) {
      storageClass = "5.1";
      hazardsList.push("Oxidizing Agent");
      pictograms.push("oxidizer");
    } else if (/\b(?:flammable liquid|combustible liquid|H225|H226|H224)\b/i.test(text)) {
      storageClass = "3";
      hazardsList.push("Flammable Liquid");
      pictograms.push("flame");
    } else if (/\b(?:flammable solid|spontaneously combustible|self-heating|H228|H251|H252)\b/i.test(text)) {
      storageClass = "4.1";
      hazardsList.push("Flammable Solid");
      pictograms.push("flame");
    } else if (toxic) {
      storageClass = "6.1A";
      hazardsList.push("Toxic Substance");
      pictograms.push("skull");
    } else if (acidBase === "Acid") {
      storageClass = "8A";
      hazardsList.push("Acid Corrosive");
      pictograms.push("corrosive");
    } else if (acidBase === "Base") {
      storageClass = "8B";
      hazardsList.push("Alkali Corrosive");
      pictograms.push("corrosive");
    }

    // Default pictograms if empty but hazard codes suggest it
    if (hCodes.some(c => ["H315", "H319", "H335", "H317"].includes(c)) && pictograms.length === 0) {
      pictograms.push("exclamation");
    }
    if (hCodes.some(c => ["H400", "H410"].includes(c))) {
      pictograms.push("environment");
    }

    if (hazardsList.length === 0) {
      hazardsList.push("Non-Hazardous");
    }

    return {
      id: `chem-${Date.now()}`,
      name,
      cas,
      manufacturer,
      hazards: hazardsList,
      pictograms,
      hCodes,
      pCodes,
      acidBase,
      waterReactive,
      toxic,
      oxidizer,
      explosive,
      foodGrade,
      allergens: allergensFound,
      storageClass,
      sdsText: text
    };
  }

  // Excel Loader / Ingestion Logic using SheetJS
  function handleExcelUpload(files) {
    const file = files[0];
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
      alert("Please upload a valid Excel or CSV spreadsheet.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let importedCount = 0;
      jsonData.forEach((row) => {
        // Standardize row mapping
        const name = row.Name || row["Product Name"] || row.Chemical;
        const cas = row.CAS || row["CAS Number"] || "N/A";
        const manufacturer = row.Manufacturer || row.Supplier || "Unknown";
        
        if (name) {
          // Build a basic chemical configuration based on Excel fields
          const acidBase = (row.AcidBase || row["Acid/Base"] || "").toString().toLowerCase().includes("acid") ? "Acid" : 
                           (row.AcidBase || row["Acid/Base"] || "").toString().toLowerCase().includes("base") ? "Base" : "Neutral";
          
          const waterReactive = !!(row.WaterReactive || row["Water Reactive"]);
          const oxidizer = !!(row.Oxidizer || row["Oxidizing"]);
          const toxic = !!(row.Toxic || row["Poison"]);
          const foodGrade = !!(row.FoodGrade || row["Food Grade"]);
          
          const allergensRaw = row.Allergens || row.Allergen || "";
          const allergens = allergensRaw ? allergensRaw.split(",").map(a => a.trim()).filter(Boolean) : [];

          const storageClass = row.StorageClass || row["Storage Class"] || (oxidizer ? "5.1" : (waterReactive ? "4.3" : (acidBase === "Acid" ? "8A" : (acidBase === "Base" ? "8B" : "10"))));

          chemicals.push({
            id: `chem-xl-${Date.now()}-${importedCount}`,
            name,
            cas,
            manufacturer,
            hazards: row.Hazards ? row.Hazards.split(",") : [storageClass === "10" ? "Non-Hazardous" : "Chemical Hazard"],
            pictograms: row.Pictograms ? row.Pictograms.split(",").map(p => p.trim()) : [],
            hCodes: row.HCodes ? row.HCodes.split(",") : [],
            pCodes: [],
            acidBase,
            waterReactive,
            toxic,
            oxidizer,
            explosive: false,
            foodGrade,
            allergens,
            storageClass: storageClass.toString(),
            sdsText: `Imported via spreadsheet. Custom details: ${JSON.stringify(row)}`
          });
          importedCount++;
        }
      });

      if (importedCount > 0) {
        saveChemicalsState();
        renderAll();
        alert(`Successfully imported ${importedCount} products from spreadsheet.`);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Add Item to Parsing progress queue
  function addQueueItem(name, status, statusClass) {
    const queueId = `queue-${Date.now()}`;
    const html = `
      <div class="parse-item" id="${queueId}">
        <div class="parse-item-info">
          <i class="fas fa-file-pdf"></i>
          <span>${name}</span>
        </div>
        <div class="parse-item-status">
          ${statusClass === "loading" ? '<div class="status-spinner"></div>' : ""}
          <span class="status-${statusClass}">${status}</span>
        </div>
      </div>
    `;
    parsingQueue.insertAdjacentHTML("afterbegin", html);
    return queueId;
  }

  // Update item in Queue
  function updateQueueItem(id, status, statusClass) {
    const item = document.getElementById(id);
    if (item) {
      const statusContainer = item.querySelector(".parse-item-status");
      statusContainer.className = `parse-item-status`;
      statusContainer.innerHTML = `
        ${statusClass === "loading" ? '<div class="status-spinner"></div>' : ""}
        <span class="status-${statusClass}">${status}</span>
      `;
    }
  }

  // Compatibility Engine: Auditing chemical-to-chemical compatibility
  function checkChemicalCompatibility(chem1, chem2) {
    // Rule 1: Acid + Base
    if ((chem1.acidBase === "Acid" && chem2.acidBase === "Base") || (chem1.acidBase === "Base" && chem2.acidBase === "Acid")) {
      return {
        compatible: false,
        level: "danger",
        reason: `Exothermic neutralization hazard. Storing acids (${chem1.acidBase === "Acid" ? chem1.name : chem2.name}) and bases (${chem1.acidBase === "Base" ? chem1.name : chem2.name}) together can trigger violent chemical reactions and release excessive heat.`
      };
    }

    // Rule 2: Flammable + Oxidizer
    if ((chem1.storageClass === "3" && chem2.oxidizer) || (chem1.oxidizer && chem2.storageClass === "3")) {
      return {
        compatible: false,
        level: "danger",
        reason: `Combustion accelerant hazard. Storing flammables (${chem1.storageClass === "3" ? chem1.name : chem2.name}) and oxidizers (${chem1.oxidizer ? chem1.name : chem2.name}) together creates extreme risk of explosive fires that cannot be extinguished easily.`
      };
    }

    // Rule 3: Water-Reactive + Aqueous/Acid/Base
    if (chem1.waterReactive || chem2.waterReactive) {
      const reactive = chem1.waterReactive ? chem1 : chem2;
      const other = chem1.waterReactive ? chem2 : chem1;
      
      // If other has acid, base, or is liquid
      if (other.acidBase !== "Neutral" || other.storageClass === "3" || other.oxidizer || other.toxic) {
        return {
          compatible: false,
          level: "danger",
          reason: `Water-reactive explosion risk. ${reactive.name} releases flammable/explosive hydrogen gas or highly corrosive fumes when contacting moisture or liquid/corrosive chemical solutions (${other.name}).`
        };
      }
    }

    // Rule 4: Cyanide/Sulfide Toxic Solids + Acids
    if ((chem1.toxic && chem1.name.toLowerCase().includes("cyanide") && chem2.acidBase === "Acid") || 
        (chem2.toxic && chem2.name.toLowerCase().includes("cyanide") && chem1.acidBase === "Acid")) {
      const toxicChem = chem1.toxic ? chem1 : chem2;
      return {
        compatible: false,
        level: "danger",
        reason: `Lethal gas emission. Cyanides (${toxicChem.name}) react with acids to instantly liberate highly lethal Hydrogen Cyanide (HCN) gas.`
      };
    }

    // Rule 5: Poison/Toxic + Food Grade
    if ((chem1.toxic && chem2.foodGrade) || (chem2.toxic && chem1.foodGrade)) {
      const toxicChem = chem1.toxic ? chem1 : chem2;
      const foodChem = chem1.foodGrade ? chem1 : chem2;
      return {
        compatible: false,
        level: "danger",
        reason: `Critical contamination risk. Highly toxic substances (${toxicChem.name}) must never be stored on the same shelf or near food-grade ingredients (${foodChem.name}) to prevent ingestion poisoning.`
      };
    }

    // Rule 6: Allergens + Allergen-free Food Grade
    if (chem1.foodGrade && chem2.foodGrade) {
      if (chem1.allergens.length > 0 && chem2.allergens.length === 0) {
        return {
          compatible: false,
          level: "warning",
          reason: `Allergen cross-contamination. Storing allergen-containing ingredient (${chem1.name}: ${chem1.allergens.join(", ")}) on the same shelf as allergen-free ingredients (${chem2.name}) can cause cross-contact sensitization.`
        };
      }
      if (chem2.allergens.length > 0 && chem1.allergens.length === 0) {
        return {
          compatible: false,
          level: "warning",
          reason: `Allergen cross-contamination. Storing allergen-containing ingredient (${chem2.name}: ${chem2.allergens.join(", ")}) on the same shelf as allergen-free ingredients (${chem1.name}) can cause cross-contact sensitization.`
        };
      }
    }

    // Rule 7: Acids + Bleach / Oxidizers
    if (chem1.acidBase === "Acid" && chem2.oxidizer) {
      return {
        compatible: false,
        level: "warning",
        reason: `Chlorine/Toxic gas release warning. Acids (${chem1.name}) mixed with oxidizers (${chem2.name}) can release toxic fumes (like chlorine gas).`
      };
    }

    return { compatible: true };
  }

  // Render Subsystems
  function renderAll() {
    if (activeTab === "dashboard") {
      renderInventory();
    } else if (activeTab === "shelf-simulator") {
      renderShelfSimulator();
    }
  }

  // 1. Dashboard Inventory Render
  function renderInventory() {
    const q = searchInput.value.toLowerCase().trim();
    const hazardFilter = filterHazard.value;
    const complianceFilter = filterCompliance.value;
    const siteFilter = filterSite.value;
    const customerFilter = filterCustomer.value;

    const filtered = chemicals.filter(chem => {
      // Search
      const matchesSearch = chem.name.toLowerCase().includes(q) || 
                            chem.cas.includes(q) || 
                            chem.manufacturer.toLowerCase().includes(q);
      
      // Hazard class
      let matchesHazard = true;
      if (hazardFilter !== "all") {
        if (hazardFilter === "acid") matchesHazard = chem.acidBase === "Acid";
        else if (hazardFilter === "base") matchesHazard = chem.acidBase === "Base";
        else if (hazardFilter === "flammable") matchesHazard = chem.storageClass === "3" || chem.storageClass === "4.1";
        else if (hazardFilter === "oxidizer") matchesHazard = chem.oxidizer;
        else if (hazardFilter === "toxic") matchesHazard = chem.toxic;
        else if (hazardFilter === "water-reactive") matchesHazard = chem.waterReactive;
      }

      // Compliance
      let matchesCompliance = true;
      if (complianceFilter !== "all") {
        if (complianceFilter === "food") matchesCompliance = chem.foodGrade;
        else if (complianceFilter === "allergens") matchesCompliance = chem.allergens.length > 0;
        else if (complianceFilter === "industrial") matchesCompliance = !chem.foodGrade;
      }

      // Site filter
      let matchesSite = true;
      if (siteFilter !== "all") {
        matchesSite = chem.buildingLocation === siteFilter;
      }

      // Customer filter
      let matchesCustomer = true;
      if (customerFilter !== "all") {
        matchesCustomer = chem.customer === customerFilter;
      }

      return matchesSearch && matchesHazard && matchesCompliance && matchesSite && matchesCustomer;
    });

    inventoryBody.innerHTML = "";

    if (filtered.length === 0) {
      inventoryBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">
            No products match the selected filters or search parameters.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(chem => {
      // Build badges
      let complianceBadges = "";
      if (chem.foodGrade) {
        complianceBadges += `<span class="badge badge-food"><i class="fas fa-cookie-bite"></i> Food Grade</span> `;
      }
      if (chem.allergens.length > 0) {
        complianceBadges += `<span class="badge badge-allergen" title="${chem.allergens.join(', ')}"><i class="fas fa-exclamation-triangle"></i> Allergen (${chem.allergens[0]})</span> `;
      }
      if (!chem.foodGrade && chem.storageClass !== "10") {
        complianceBadges += `<span class="badge badge-storage">Industrial</span>`;
      }

      // Pictograms
      let pictoHTML = "";
      if (chem.pictograms.length > 0) {
        pictoHTML = `<div class="picto-container">`;
        chem.pictograms.forEach(p => {
          pictoHTML += `
            <div class="picto-icon" title="GHS Pictogram: ${p}" style="width: 22px; height: 22px; margin: 2px;">
              <img src="https://raw.githubusercontent.com/unep-ch/GHS-pictograms/master/png/${p}.png" onerror="this.src='https://placehold.co/18x18/red/white?text=${p[0].toUpperCase()}'" alt="${p}"/>
            </div>
          `;
        });
        pictoHTML += `</div>`;
      }

      const row = `
        <tr id="row-${chem.id}">
          <td style="vertical-align: middle;">
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.98rem; margin-bottom: 4px;">${chem.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); display: flex; gap: 8px;">
              <span><strong>CAS:</strong> <code>${chem.cas}</code></span>
              <span>|</span>
              <span><strong>Mfg:</strong> ${chem.manufacturer}</span>
            </div>
            <div style="font-size: 0.76rem; color: var(--accent-primary); display: flex; gap: 8px; margin-top: 3px; font-weight: 500;">
              <span><strong>Site:</strong> ${chem.buildingLocation || 'Unassigned'}</span>
              <span>|</span>
              <span><strong>Customer:</strong> ${chem.customer || 'Unassigned'}</span>
            </div>
          </td>
          <td style="vertical-align: middle;">
            <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
              <span class="badge badge-storage">Class ${chem.storageClass}</span>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">${chem.hazards.join(", ")}</span>
            </div>
          </td>
          <td style="vertical-align: middle;">
            <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-start;">
              ${pictoHTML}
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${complianceBadges}
              </div>
            </div>
          </td>
          <td style="vertical-align: middle;">
            <div class="flex-btn-group">
              <button class="btn btn-secondary btn-view-sds" data-id="${chem.id}" style="padding: 6px 12px; font-size: 0.8rem;"><i class="fas fa-eye"></i> View</button>
              <button class="btn btn-danger btn-delete-chem" data-id="${chem.id}" style="padding: 6px 12px; font-size: 0.8rem;"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
      inventoryBody.insertAdjacentHTML("beforeend", row);
    });

    // Wire view/delete buttons
    document.querySelectorAll(".btn-view-sds").forEach(btn => {
      btn.addEventListener("click", () => showSDSDetail(btn.dataset.id));
    });

    document.querySelectorAll(".btn-delete-chem").forEach(btn => {
      btn.addEventListener("click", () => deleteChemical(btn.dataset.id));
    });
  }

  // 2. Interactive Shelf Simulator Render
  function renderShelfSimulator() {
    // Render draggable pool of chemicals (only chemicals that are NOT currently placed on any shelf)
    const placedIds = new Set(shelves.flatMap(s => s.chemicals));
    
    // Determine target location value to show only chemicals belonging to this cabinet
    const activeKey = getActiveLocationKey();
    const isSiteMode = activeKey.startsWith("site_");
    const activeLocVal = activeKey.replace(/^(site_|customer_)/, "");
    
    const poolSearch = document.getElementById("pool-search-input");
    const poolQuery = poolSearch ? poolSearch.value.toLowerCase().trim() : "";

    const availableChems = chemicals.filter(c => {
      // Must not be placed
      if (placedIds.has(c.id)) return false;
      // Must belong to this location, or be unassigned/empty
      let matchesLoc = false;
      if (isSiteMode) {
        matchesLoc = c.buildingLocation === activeLocVal || !c.buildingLocation || c.buildingLocation === "Unassigned";
      } else {
        matchesLoc = c.customer === activeLocVal || !c.customer || c.customer === "Unassigned";
      }
      if (!matchesLoc) return false;

      // Filter by search query
      if (poolQuery) {
        return c.name.toLowerCase().includes(poolQuery) || 
               c.cas.includes(poolQuery) || 
               c.manufacturer.toLowerCase().includes(poolQuery);
      }
      return true;
    });

    chemicalPool.innerHTML = "";
    if (availableChems.length === 0) {
      chemicalPool.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; padding: 10px;">No unplaced products found.</p>`;
    } else {
      availableChems.forEach(chem => {
        let borderClass = "#94a3b8"; // Neutral grey
        if (chem.acidBase === "Acid") borderClass = "var(--color-acid)";
        else if (chem.acidBase === "Base") borderClass = "var(--color-base)";
        else if (chem.storageClass === "3") borderClass = "var(--color-flammable)";
        else if (chem.oxidizer) borderClass = "var(--color-oxidizer)";
        else if (chem.toxic) borderClass = "var(--color-toxic)";
        else if (chem.waterReactive) borderClass = "var(--color-water-reactive)";

        let complianceIcons = "";
        if (chem.foodGrade) {
          complianceIcons += `<i class="fas fa-cookie-bite" style="color: var(--color-safe); margin-left: 5px;" title="Food Grade"></i>`;
        }
        if (chem.allergens && chem.allergens.length > 0) {
          complianceIcons += `<i class="fas fa-exclamation-triangle" style="color: var(--color-warning); margin-left: 5px;" title="Allergens: ${chem.allergens.join(', ')}"></i>`;
        }
        if (chem.toxic) {
          complianceIcons += `<i class="fas fa-skull-crossbones" style="color: var(--color-toxic); margin-left: 5px;" title="Highly Toxic"></i>`;
        }

        const html = `
          <div class="draggable-chemical" draggable="true" data-id="${chem.id}" style="--border-color: ${borderClass}">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div class="chem-name" style="padding-left: 0; max-width: 75%;">${chem.name}</div>
              <div style="font-size: 0.75rem; display: flex; gap: 4px; align-items: center; padding-right: 5px;">
                ${complianceIcons}
              </div>
            </div>
            <div class="chem-info" style="padding-left: 0;">
              <span>CAS: ${chem.cas}</span>
              <span>Class: ${chem.storageClass}</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); padding-left: 0; margin-top: 2px;">
              Site: ${chem.buildingLocation || 'Unassigned'} | Customer: ${chem.customer || 'Unassigned'}
            </div>
          </div>
        `;
        chemicalPool.insertAdjacentHTML("beforeend", html);
      });

      // Add drag listeners to pool items
      chemicalPool.querySelectorAll(".draggable-chemical").forEach(item => {
        item.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", item.dataset.id);
          e.dataTransfer.effectAllowed = "move";
        });
      });
    }

    // Render shelves
    cabinetShelves.innerHTML = "";
    shelves.forEach((shelf, idx) => {
      const shelfChems = shelf.chemicals.map(id => chemicals.find(c => c.id === id)).filter(Boolean);
      
      const html = `
        <div class="shelf" data-shelf-id="${shelf.id}">
          <div class="shelf-header">${shelf.name}</div>
          <div class="shelf-status-indicator" id="status-${shelf.id}"></div>
          <div class="shelf-chemicals-container" style="display: flex; flex-wrap: wrap; gap: 10px; width: 100%; min-height: 80px;">
            ${shelfChems.map(chem => {
              let borderClass = "#94a3b8";
              if (chem.acidBase === "Acid") borderClass = "var(--color-acid)";
              else if (chem.acidBase === "Base") borderClass = "var(--color-base)";
              else if (chem.storageClass === "3") borderClass = "var(--color-flammable)";
              else if (chem.oxidizer) borderClass = "var(--color-oxidizer)";
              else if (chem.toxic) borderClass = "var(--color-toxic)";
              else if (chem.waterReactive) borderClass = "var(--color-water-reactive)";

              return `
                <div class="shelf-chemical" draggable="true" data-id="${chem.id}" data-shelf-id="${shelf.id}" style="--border-color: ${borderClass}">
                  <div class="shelf-chemical-details">
                    <div class="shelf-chemical-name" title="${chem.name}">${chem.name}</div>
                    <div class="shelf-chemical-class">Class ${chem.storageClass}</div>
                  </div>
                  <button class="shelf-chemical-remove" data-id="${chem.id}" data-shelf-id="${shelf.id}">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
      cabinetShelves.insertAdjacentHTML("beforeend", html);
    });

    // Wire drag & drop event handlers to shelves
    const shelfElements = cabinetShelves.querySelectorAll(".shelf");
    shelfElements.forEach(shelfEl => {
      const shelfId = shelfEl.dataset.shelfId;
      const container = shelfEl.querySelector(".shelf-chemicals-container");

      shelfEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        shelfEl.classList.add("drag-hover");
      });

      shelfEl.addEventListener("dragleave", () => {
        shelfEl.classList.remove("drag-hover");
      });

      shelfEl.addEventListener("drop", (e) => {
        e.preventDefault();
        shelfEl.classList.remove("drag-hover");
        
        const chemId = e.dataTransfer.getData("text/plain");
        if (!chemId) return;

        // Remove from previous shelf if it existed
        shelves.forEach(s => {
          s.chemicals = s.chemicals.filter(id => id !== chemId);
        });

        // Add to new shelf
        const targetShelf = shelves.find(s => s.id === shelfId);
        if (targetShelf && !targetShelf.chemicals.includes(chemId)) {
          targetShelf.chemicals.push(chemId);
        }

        saveShelvesState();
        renderShelfSimulator();
      });

      // Draggable items within shelf
      shelfEl.querySelectorAll(".shelf-chemical").forEach(chemEl => {
        chemEl.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", chemEl.dataset.id);
          e.dataTransfer.effectAllowed = "move";
        });
      });

      // Remove button on shelf chemicals
      shelfEl.querySelectorAll(".shelf-chemical-remove").forEach(btn => {
        btn.addEventListener("click", () => {
          const cId = btn.dataset.id;
          const sId = btn.dataset.shelfId;
          const shelf = shelves.find(s => s.id === sId);
          if (shelf) {
            shelf.chemicals = shelf.chemicals.filter(id => id !== cId);
            saveShelvesState();
            renderShelfSimulator();
          }
        });
      });
    });

    // Run audit logic and highlight shelf indicators
    runCompatibilityAudit();
  }

  // 3. Storage Compatibility Auditor
  function runCompatibilityAudit() {
    auditLogs.innerHTML = "";
    
    // Clear shelf indicators first
    shelves.forEach(s => {
      const indicator = document.getElementById(`status-${s.id}`);
      if (indicator) {
        indicator.className = "shelf-status-indicator shelf-status-safe";
        indicator.innerHTML = `<i class="fas fa-check-circle"></i> Compatible`;
      }
    });

    let conflicts = [];

    // Check 1: Same shelf conflicts
    shelves.forEach(shelf => {
      const shelfChems = shelf.chemicals.map(id => chemicals.find(c => c.id === id)).filter(Boolean);
      
      for (let i = 0; i < shelfChems.length; i++) {
        for (let j = i + 1; j < shelfChems.length; j++) {
          const c1 = shelfChems[i];
          const c2 = shelfChems[j];
          const audit = checkChemicalCompatibility(c1, c2);
          
          if (!audit.compatible) {
            conflicts.push({
              shelfId: shelf.id,
              shelfName: shelf.name,
              level: audit.level,
              chem1: c1,
              chem2: c2,
              reason: audit.reason,
              relationship: "same-shelf"
            });

            // Update shelf indicator
            const indicator = document.getElementById(`status-${shelf.id}`);
            if (indicator) {
              if (audit.level === "danger") {
                indicator.className = "shelf-status-indicator shelf-status-danger";
                indicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Incompatible`;
              } else if (audit.level === "warning" && !indicator.className.includes("danger")) {
                indicator.className = "shelf-status-indicator shelf-status-warn";
                indicator.innerHTML = `<i class="fas fa-exclamation-circle"></i> Warning`;
              }
            }
          }
        }
      }
    });

    // Check 2: Vertical/Adjacent Shelf Conflicts
    // E.g. Liquids on higher shelves above water-reactives on lower shelves
    for (let sIdx = 0; sIdx < shelves.length; sIdx++) {
      const upperShelf = shelves[sIdx];
      const upperChems = upperShelf.chemicals.map(id => chemicals.find(c => c.id === id)).filter(Boolean);

      // Check all shelves below this one
      for (let lowerIdx = sIdx + 1; lowerIdx < shelves.length; lowerIdx++) {
        const lowerShelf = shelves[lowerIdx];
        const lowerChems = lowerShelf.chemicals.map(id => chemicals.find(c => c.id === id)).filter(Boolean);

        upperChems.forEach(uChem => {
          lowerChems.forEach(lChem => {
            // Liquids above water-reactives check
            if (uChem.storageClass === "3" && lChem.waterReactive) {
              conflicts.push({
                shelfId: lowerShelf.id,
                shelfName: `${upperShelf.name} (Upper) -> ${lowerShelf.name} (Lower)`,
                level: "danger",
                chem1: uChem,
                chem2: lChem,
                reason: `Liquid overflow water-reactive threat. Placing a liquid (${uChem.name}) on an upper shelf directly above a highly water-reactive solid (${lChem.name}) poses a high threat. Any container leak or spill will trigger a violent reaction.`,
                relationship: "vertical"
              });

              // Mark both shelves as danger/warning
              [upperShelf.id, lowerShelf.id].forEach(sId => {
                const indicator = document.getElementById(`status-${sId}`);
                if (indicator) {
                  indicator.className = "shelf-status-indicator shelf-status-danger";
                  indicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Incompatible`;
                }
              });
            }

            // Strong volatile acids (e.g. HCl) above toxics/bases
            if (uChem.acidBase === "Acid" && lChem.toxic && lChem.name.toLowerCase().includes("cyanide")) {
              conflicts.push({
                shelfId: lowerShelf.id,
                shelfName: `${upperShelf.name} (Upper) -> ${lowerShelf.name} (Lower)`,
                level: "danger",
                chem1: uChem,
                chem2: lChem,
                reason: `Corrosive spill toxic gas threat. Storing corrosive acid (${uChem.name}) above toxic cyanide compounds (${lChem.name}) is unsafe. Spill leakage could trigger toxic hydrogen cyanide gas release in the entire workspace.`,
                relationship: "vertical"
              });
              
              [upperShelf.id, lowerShelf.id].forEach(sId => {
                const indicator = document.getElementById(`status-${sId}`);
                if (indicator) {
                  indicator.className = "shelf-status-indicator shelf-status-danger";
                  indicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Incompatible`;
                }
              });
            }
          });
        });
      }
    }

    // Display conflicts in Audit Logs panel
    if (conflicts.length === 0) {
      auditLogs.innerHTML = `
        <div class="audit-item success">
          <div class="audit-item-icon"><i class="fas fa-check-circle"></i></div>
          <div class="audit-item-content">
            <div class="audit-item-title">All storage configurations are compatible</div>
            <div class="audit-item-explanation">There are no detected storage segregation conflicts. Ensure standard containment practices are followed.</div>
          </div>
        </div>
      `;
      return;
    }

    conflicts.forEach(conflict => {
      const icon = conflict.level === "danger" ? '<i class="fas fa-exclamation-triangle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
      const label = conflict.level === "danger" ? "CRITICAL INCOMPATIBILITY DETECTED" : "REGULATORY COMPLIANCE WARNING";
      const locationLabel = conflict.relationship === "vertical" ? `Vertical Alignment: ${conflict.shelfName}` : `Location: ${conflict.shelfName}`;

      const html = `
        <div class="audit-item ${conflict.level}">
          <div class="audit-item-icon">${icon}</div>
          <div class="audit-item-content">
            <div class="audit-item-title">${label}: ${conflict.chem1.name} & ${conflict.chem2.name}</div>
            <div class="audit-item-explanation">${conflict.reason}</div>
            <div class="audit-item-location">${locationLabel}</div>
          </div>
        </div>
      `;
      auditLogs.insertAdjacentHTML("beforeend", html);
    });
  }

  // 4. Show SDS Detail modal
  function showSDSDetail(chemId) {
    const chem = chemicals.find(c => c.id === chemId);
    if (!chem) return;

    modalTitle.innerText = `${chem.name} — Safety Details`;
    
    // Format SDS details
    let allergensList = chem.allergens.length > 0 
      ? `<span style="color: var(--color-warning); font-weight:700;"><i class="fas fa-exclamation-triangle"></i> ${chem.allergens.join(", ")}</span>`
      : `<span style="color: var(--color-safe);"><i class="fas fa-check-circle"></i> Allergen Free</span>`;
    
    let foodGradeStatus = chem.foodGrade
      ? `<span style="color: var(--color-safe); font-weight:700;"><i class="fas fa-cookie-bite"></i> YES (USP/FCC Grade)</span>`
      : `<span>NO (Industrial Use Only)</span>`;

    let html = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <div class="modal-section-title">Product Information</div>
          <p><strong>Chemical Name:</strong> ${chem.name}</p>
          <p><strong>CAS Registry Number:</strong> ${chem.cas}</p>
          <p><strong>Manufacturer:</strong> ${chem.manufacturer}</p>
          <p><strong>Storage Segregation Class:</strong> Class ${chem.storageClass}</p>
        </div>
        <div>
          <div class="modal-section-title">Compliance Metrics</div>
          <p><strong>Food Grade Certified:</strong> ${foodGradeStatus}</p>
          <p><strong>Allergens Present:</strong> ${allergensList}</p>
          <p><strong>Acid/Base Classification:</strong> ${chem.acidBase}</p>
          <p><strong>Water-Reactive Solid:</strong> ${chem.waterReactive ? "Yes" : "No"}</p>
        </div>
      </div>
      <div>
        <div class="modal-section-title">GHS Safety Codes</div>
        <p style="margin-bottom: 5px;"><strong>Hazard Statements:</strong> ${chem.hCodes.length > 0 ? chem.hCodes.map(c => `<code>${c}</code>`).join(" ") : "None declared"}</p>
        <p><strong>Precautionary Codes:</strong> ${chem.pCodes && chem.pCodes.length > 0 ? chem.pCodes.map(c => `<code>${c}</code>`).join(" ") : "None declared"}</p>
      </div>
      <div>
        <div class="modal-section-title">SDS Raw Content Extract</div>
        <pre style="background: rgba(15, 23, 42, 0.4); padding: 15px; border-radius: var(--border-radius-sm); font-size: 0.8rem; max-height: 250px; overflow-y: auto; font-family: monospace; white-space: pre-wrap; color: var(--text-secondary); border: 1px solid rgba(255,255,255,0.05);">${chem.sdsText}</pre>
      </div>
    `;

    modalBody.innerHTML = html;
    modalOverlay.classList.add("active");
  }

  function hideModal() {
    modalOverlay.classList.remove("active");
  }

  // Delete chemical from inventory
  function deleteChemical(id) {
    if (confirm("Are you sure you want to remove this chemical? It will be removed from all shelves and audit configurations.")) {
      chemicals = chemicals.filter(c => c.id !== id);
      
      // Remove from all locations' shelf configurations
      Object.keys(shelvesByLocation).forEach(locKey => {
        shelvesByLocation[locKey].forEach(s => {
          s.chemicals = s.chemicals.filter(cId => cId !== id);
        });
      });

      // Synchronize active shelves
      const key = getActiveLocationKey();
      if (shelvesByLocation[key]) {
        shelves = shelvesByLocation[key];
      }

      saveChemicalsState();
      saveShelvesState();
      renderAll();
    }
  }

  // Export Audit PDF/Print report
  function exportAuditReport() {
    window.print();
  }

  // Export inventory to Excel using SheetJS
  function exportInventoryExcel() {
    const dataToExport = chemicals.map(chem => ({
      "Product Name": chem.name,
      "CAS Number": chem.cas,
      "Manufacturer": chem.manufacturer,
      "Hazard List": chem.hazards.join(", "),
      "Storage Class": chem.storageClass,
      "Food Grade": chem.foodGrade ? "Yes" : "No",
      "Allergens": chem.allergens.join(", ") || "None",
      "Acid/Base": chem.acidBase
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SDS Inventory");
    XLSX.writeFile(workbook, "SDS_Compatibility_Inventory.xlsx");
  }

  // Airtable Sync Logic
  // Airtable Credentials
  const AIRTABLE_PAT = "patrpVSMIGhVIdpu0.c078317760343e132f5c8800b6aced94c78174acfa8e5e38f5975d32638b5723";
  const AIRTABLE_BASE_ID = "appZ8y9RqssldMpDS";
  const AIRTABLE_TABLE_NAME = "All SDS";

  async function syncFromAirtable() {
    const syncIndicator = document.getElementById("airtable-sync-indicator");
    const syncIcon = document.getElementById("airtable-sync-icon");
    const syncText = document.getElementById("airtable-sync-text");

    if (syncIndicator && syncIcon && syncText) {
      syncIndicator.style.background = "rgba(237, 181, 9, 0.1)";
      syncIndicator.style.color = "var(--accent-primary)";
      syncIndicator.style.borderColor = "rgba(237, 181, 9, 0.2)";
      syncIcon.className = "fa-solid fa-arrows-rotate fa-spin";
      syncText.innerText = "Syncing Airtable...";
    }

    let allRecords = [];
    let offset = "";

    try {
      do {
        let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?pageSize=100`;
        if (offset) {
          url += `&offset=${offset}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${AIRTABLE_PAT}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Airtable API error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        allRecords = allRecords.concat(data.records || []);
        offset = data.offset || "";
      } while (offset);

      if (allRecords.length === 0) {
        throw new Error("No records found in Airtable table.");
      }

      // Map Airtable fields to our chemical schema using fuzzy finder
      const importedChemicals = allRecords.map((r, index) => {
        const fields = r.fields;
        
        const getFieldVal = (fieldNames, defaultValue = null) => {
          for (let name of fieldNames) {
            const cleanTarget = name.toLowerCase().replace(/[\s_\-\/]/g, "");
            const matchingKey = Object.keys(fields).find(k => k.toLowerCase().replace(/[\s_\-\/]/g, "") === cleanTarget);
            if (matchingKey !== undefined) {
              return fields[matchingKey];
            }
          }
          return defaultValue;
        };

        const name = getFieldVal(["name", "productname", "chemical", "product"], "Airtable Chemical #" + (index + 1));
        const cas = getFieldVal(["cas", "casnumber", "casno", "casregistry"], "N/A");
        const manufacturer = getFieldVal(["manufacturer", "supplier", "mfg", "brand"], "Unknown");
        
        let hazardsVal = getFieldVal(["hazards", "hazard", "hazardlist", "hazardclassifications"], null);
        let hazards = ["Non-Hazardous"];
        if (hazardsVal) {
          hazards = Array.isArray(hazardsVal) ? hazardsVal : hazardsVal.toString().split(",").map(h => h.trim()).filter(Boolean);
        }

        let pictogramsVal = getFieldVal(["pictograms", "pictogram", "ghspictograms"], null);
        let pictograms = [];
        if (pictogramsVal) {
          pictograms = Array.isArray(pictogramsVal) ? pictogramsVal : pictogramsVal.toString().split(",").map(p => p.trim()).filter(Boolean);
        }

        let hCodesVal = getFieldVal(["hcodes", "hcode", "hazardcodes", "hstatements"], null);
        let hCodes = [];
        if (hCodesVal) {
          hCodes = Array.isArray(hCodesVal) ? hCodesVal : hCodesVal.toString().split(",").map(c => c.trim()).filter(Boolean);
        }

        const acidBase = getFieldVal(["acidbase", "acidorbase", "phclass"], "Neutral");
        const waterReactive = !!getFieldVal(["waterreactive", "waterreacts", "waterreactivematerial"], false);
        const toxic = !!getFieldVal(["toxic", "poison", "fatal", "lethal"], false);
        const oxidizer = !!getFieldVal(["oxidizer", "oxidising"], false);
        const explosive = !!getFieldVal(["explosive", "explosionhazard"], false);
        const foodGrade = !!getFieldVal(["foodgrade", "foodgradecertified", "uspfcc"], false);

        let allergensVal = getFieldVal(["allergens", "allergen", "allergenslist"], null);
        let allergens = [];
        if (allergensVal) {
          allergens = Array.isArray(allergensVal) ? allergensVal : allergensVal.toString().split(",").map(a => a.trim()).filter(Boolean);
        }

        const storageClassVal = getFieldVal(["storageclass", "storagesegregationclass", "segregationclass"], null);
        const storageClass = (storageClassVal !== null ? storageClassVal : (oxidizer ? "5.1" : (waterReactive ? "4.3" : (acidBase.toLowerCase().includes("acid") ? "8A" : (acidBase.toLowerCase().includes("base") ? "8B" : "10"))))).toString();
        
        const sdsText = getFieldVal(["sdstext", "sdsrawcontent", "sds"], `Synced from Airtable Record ID: ${r.id}`);

        const buildingLocationVal = getFieldVal(["buildinglocation", "location", "site"], "Unassigned");
        const buildingLocation = Array.isArray(buildingLocationVal) ? buildingLocationVal.join(", ") : (buildingLocationVal || "Unassigned").toString().trim();

        const customerVal = getFieldVal(["customer", "client"], "Unassigned");
        const customer = Array.isArray(customerVal) ? customerVal.join(", ") : (customerVal || "Unassigned").toString().trim();

        return {
          id: `chem-at-${r.id}`,
          name,
          cas,
          manufacturer,
          hazards,
          pictograms,
          hCodes,
          pCodes: [],
          acidBase,
          waterReactive,
          toxic,
          oxidizer,
          explosive,
          foodGrade,
          allergens,
          storageClass,
          sdsText,
          buildingLocation,
          customer
        };
      });

      // Update the chemicals state entirely to stay strictly in sync
      chemicals = importedChemicals;
      saveChemicalsState();
      populateLocationDropdowns();
      loadShelvesState();
      renderAll();

      if (syncIndicator && syncIcon && syncText) {
        syncIndicator.style.background = "rgba(16, 185, 129, 0.1)";
        syncIndicator.style.color = "var(--color-safe)";
        syncIndicator.style.borderColor = "rgba(16, 185, 129, 0.2)";
        syncIcon.className = "fa-solid fa-cloud-arrow-down";
        syncText.innerText = `Airtable Synced (${allRecords.length})`;
      }

    } catch (err) {
      console.error(err);
      if (syncIndicator && syncIcon && syncText) {
        syncIndicator.style.background = "rgba(239, 68, 68, 0.1)";
        syncIndicator.style.color = "var(--color-danger)";
        syncIndicator.style.borderColor = "rgba(239, 68, 68, 0.2)";
        syncIcon.className = "fa-solid fa-triangle-exclamation";
        syncText.innerText = "Offline (Airtable Sync Blocked)";
      }

      // Fallback: If chemicals array is empty, load from window.SAMPLE_CHEMICALS so the app is fully functional
      if (chemicals.length === 0) {
        chemicals = [...window.SAMPLE_CHEMICALS];
        saveChemicalsState();
        populateLocationDropdowns();
        loadShelvesState();
        renderAll();
      }
    }
  }

  // Handle Manual Product Submission to Airtable
  async function handleAirtableSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector("button[type='submit']");
    const statusMsg = document.getElementById("form-status-msg");

    const name = document.getElementById("form-chem-name").value.trim();
    const cas = document.getElementById("form-chem-cas").value.trim();
    const manufacturer = document.getElementById("form-chem-mfg").value.trim();
    const storageClass = document.getElementById("form-chem-class").value;
    const foodGrade = document.getElementById("form-chem-food").checked;
    
    const allergensRaw = document.getElementById("form-chem-allergens").value.trim();
    const allergens = allergensRaw ? allergensRaw.split(",").map(a => a.trim()).filter(Boolean) : [];
    
    const hazardsRaw = document.getElementById("form-chem-hazards").value.trim();
    const hazards = hazardsRaw ? hazardsRaw.split(",").map(h => h.trim()).filter(Boolean) : [storageClass === "10" ? "Non-Hazardous" : "Chemical Hazard"];

    const sdsText = document.getElementById("form-chem-sds").value.trim();

    if (statusMsg) {
      statusMsg.style.display = "block";
      statusMsg.style.color = "var(--accent-primary)";
      statusMsg.innerHTML = '<div class="status-spinner" style="display:inline-block; vertical-align:middle; margin-right:8px; border: 2px solid rgba(255,255,255,0.2); border-top-color: var(--accent-primary); width:12px; height:12px; border-radius:50%; animation:spin 1s infinite linear;"></div> Submitting to Airtable...';
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
      const recordFields = {
        "Name": name,
        "CAS": cas,
        "Manufacturer": manufacturer,
        "Hazards": hazards, // Try array first
        "StorageClass": storageClass,
        "FoodGrade": foodGrade,
        "Allergens": allergens, // Try array first
        "SDSText": sdsText
      };

      let response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AIRTABLE_PAT}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ records: [{ fields: recordFields }] })
      });

      // Fallback: If Airtable column is text type, array values will trigger 422. Retry by joining arrays as strings.
      if (response.status === 422 || !response.ok) {
        console.warn("Array field failed validation, retrying with comma-separated text string fields...");
        const textFields = {
          ...recordFields,
          "Hazards": hazards.join(", "),
          "Allergens": allergens.join(", ")
        };

        response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${AIRTABLE_PAT}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ records: [{ fields: textFields }] })
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      if (statusMsg) {
        statusMsg.style.color = "var(--color-safe)";
        statusMsg.innerHTML = '<i class="fas fa-check-circle"></i> Successfully submitted to corporate database!';
        setTimeout(() => statusMsg.style.display = "none", 4000);
      }

      // Reset form
      form.reset();

      // Trigger automatic sync to refresh view
      await syncFromAirtable();

    } catch (err) {
      console.error(err);
      if (statusMsg) {
        statusMsg.style.color = "var(--color-danger)";
        statusMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Submission Failed: ${err.message}`;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  // Start the application
  init();
});
