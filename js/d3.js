// =========================
// d3.js — FULL VERSION (PART 1/5)
// =========================

// ===== CONSTANTS =====

const cols = 9, rows = 12;
const mapWidth = 200, mapHeight = 200 * (rows / cols);
const marginLeft = 30, marginTop = 10, marginRight = 40, marginBottom = 30;
const labelSpace = 30;
const svgWidth = marginLeft + mapWidth + marginRight;
const svgHeight = marginTop + mapHeight + marginBottom + labelSpace;
const cellW = mapWidth / cols, cellH = mapHeight / rows;
const xMin = 43, yMin = 70;

function xCenter(x) { return (x - xMin + 0.5) * cellW; }
function yCenter(y) { return (rows - (y - yMin) - 0.5) * cellH; }

function yearColor(year, status) {
  const s = (status || "").trim().toLowerCase();
  if (s === "native") {
    if (year >= 2020) return "black";
    if (year >= 2000) return "#333";
    if (year >= 1987) return "#666";
    if (year >= 1970) return "#999";
    if (year >= 1930) return "#ccc";
    return "transparent";
  } else {
    if (year >= 2020) return "red";
    if (year >= 2000) return "#f33";
    if (year >= 1987) return "#f66";
    if (year >= 1970) return "#f99";
    if (year >= 1930) return "#fcc";
    return "transparent";
  }
}

function isTetrad(type) {
  // Tetrads are: !, ;, #, 1, |, :
  // Monads vary by year bin
  const tetradTypes = ["!", ";", "#", "1", "|", ":"];
  
  // Check if it's a tetrad
  if (tetradTypes.includes(type)) return true;
  
  // Check if it's a year-specific monad type
  const yearSpecificMonadTypes = {
    "<1930": ["$"],
    "1930-1969": ["%"],
    "1970-1986": ["^", "("],
    "1987-1999": ["&", ")"],
    "2000-2019": ["[", "{"],
    "2020+": ["@", "]", "}"],
  };
  
  // Get current year bin (simplified - in real usage would need actual year)
  // For now, check if type matches any year-specific monad
  for (const [yearBin, monadTypes] of Object.entries(yearSpecificMonadTypes)) {
    if (monadTypes.includes(type)) return false; // It's a monad, not tetrad
  }
  
  // If not a known monad type, assume it's a tetrad
  return true;
}

// ===== TETRAD MAP =====

const tetradMap = {
  "47A": ["4070", "4071", "4170", "4171"],
  "47B": ["4072", "4073", "4172", "4173"],
  "47C": ["4074", "4075", "4174", "4175"],
  "47D": ["4076", "4077", "4176", "4177"],
  "47E": ["4078", "4079", "4178", "4179"],
  "47F": ["4270", "4271", "4370", "4371"],
  "47G": ["4272", "4273", "4372", "4373"],
  "47H": ["4274", "4275", "4374", "4375"],
  "47I": ["4276", "4277", "4376", "4377"],
  "47J": ["4278", "4279", "4378", "4379"],
  "47K": ["4470", "4471", "4570", "4571"],
  "47L": ["4472", "4473", "4572", "4573"],
  "47M": ["4474", "4475", "4574", "4575"],
  "47N": ["4476", "4477", "4576", "4577"],
  "47P": ["4478", "4479", "4578", "4579"],
  "47Q": ["4670", "4671", "4770", "4771"],
  "47R": ["4672", "4673", "4772", "4773"],
  "47S": ["4674", "4675", "4774", "4775"],
  "47T": ["4676", "4677", "4776", "4777"],
  "47U": ["4678", "4679", "4778", "4779"],
  "47V": ["4870", "4871", "4970", "4971"],
  "47W": ["4872", "4873", "4972", "4973"],
  "47X": ["4874", "4875", "4974", "4975"],
  "47Y": ["4876", "4877", "4976", "4977"],
  "47Z": ["4878", "4879", "4978", "4979"],

  "48A": ["4080", "4081", "4180", "4181"],
  "48B": ["4082", "4083", "4182", "4183"],
  "48C": ["4084", "4085", "4184", "4185"],
  "48D": ["4086", "4087", "4186", "4187"],
  "48E": ["4088", "4089", "4188", "4189"],
  "48F": ["4280", "4281", "4380", "4381"],
  "48G": ["4282", "4283", "4382", "4383"],
  "48H": ["4284", "4285", "4384", "4385"],
  "48I": ["4286", "4287", "4386", "4387"],
  "48J": ["4288", "4289", "4388", "4389"],
  "48K": ["4480", "4481", "4580", "4581"],
  "48L": ["4482", "4483", "4582", "4583"],
  "48M": ["4484", "4485", "4584", "4585"],
  "48N": ["4486", "4487", "4586", "4587"],
  "48P": ["4488", "4489", "4588", "4589"],
  "48Q": ["4680", "4681", "4780", "4781"],
  "48R": ["4682", "4683", "4782", "4783"],
  "48S": ["4684", "4685", "4784", "4785"],
  "48T": ["4686", "4687", "4786", "4787"],
  "48U": ["4688", "4689", "4788", "4789"],
  "48V": ["4880", "4881", "4980", "4981"],
  "48W": ["4882", "4883", "4982", "4983"],
  "48X": ["4884", "4885", "4984", "4985"],
  "48Y": ["4886", "4887", "4986", "4987"],
  "48Z": ["4888", "4889", "4988", "4989"],

  "57A": ["5070", "5071", "5170", "5171"],
  "57B": ["5072", "5073", "5172", "5173"],
  "57C": ["5074", "5075", "5174", "5175"],
  "57D": ["5076", "5077", "5176", "5177"],
  "57E": ["5078", "5079", "5178", "5179"],
  "57F": ["5270", "5271", "5370", "5371"],
  "57G": ["5272", "5273", "5372", "5373"],
  "57H": ["5274", "5275", "5374", "5375"],
  "57I": ["5276", "5277", "5376", "5377"],
  "57J": ["5278", "5279", "5378", "5379"],
  "57K": ["5470", "5471", "5570", "5571"],
  "57L": ["5472", "5473", "5572", "5573"],
  "57M": ["5474", "5475", "5574", "5575"],
  "57N": ["5476", "5477", "5576", "5577"],
  "57P": ["5478", "5479", "5578", "5579"],
  "57Q": ["5670", "5671", "5770", "5771"],
  "57R": ["5672", "5673", "5772", "5773"],
  "57S": ["5674", "5675", "5774", "5775"],
  "57T": ["5676", "5677", "5776", "5777"],
  "57U": ["5678", "5679", "5778", "5779"],
  "57V": ["5870", "5871", "5970", "5971"],
  "57W": ["5872", "5873", "5972", "5973"],
  "57X": ["5874", "5875", "5974", "5975"],
  "57Y": ["5876", "5877", "5976", "5977"],
  "57Z": ["5878", "5879", "5978", "5979"]
};

// ===== USED SQUARES =====

const usedSquares = new Set([
  "4376", "4377",
  "4476", "4477", "4478",
  "4573", "4574", "4575", "4576", "4577", "4578", "4579",
  "4673", "4674", "4675", "4676", "4677", "4678", "4679",
  "4770", "4771", "4772", "4773", "4774", "4775", "4776", "4777", "4778", "4779",
  "4780", "4781",
  "4870", "4871", "4872", "4873", "4874", "4875", "4876", "4877", "4878", "4879",
  "4880", "4881",
  "4971", "4972", "4973", "4974", "4975", "4976", "4977", "4978", "4979",
  "4980", "4981",
  "5071", "5072", "5073", "5074", "5075", "5076", "5077", "5078", "5079",
  "5172", "5173", "5174", "5175", "5176", "5177"
]);
// =========================
// drawD3Atlas — controller
// =========================

// Pagination variables (no longer needed but keeping for compatibility)
let currentPage = 1;
let speciesPerPage = 1000; // Large number to show all species
let allSpeciesData = [];

// Cache variables to prevent reloading
let d3AtlasLoaded = false;
let cachedAtlasContent = null;

function drawD3Atlas(selectedSpecies = null, showAll = false, mode = "full") {
  try {
    
    // Safety timeout: reset flag if it's been true for more than 5 seconds
    if (window.d3AtlasInProgress) {
      // Force reset after 5 seconds to prevent permanent blocking
      setTimeout(() => {
        if (window.d3AtlasInProgress) {
          window.d3AtlasInProgress = false;
        }
      }, 5000);
      return;
    }
    
    window.d3AtlasInProgress = true;

    // Clear atlas display
    d3.select("#atlas").html("");

    // Clear summary table for individual species mode (not all-species mode)
    if (!showAll && mode !== "allYearsOnly") {
      const summaryBody = document.querySelector("#summaryTable tbody");
      if (summaryBody) {
        summaryBody.innerHTML = "";
      }
    }

    if (!showAll) {
      // Single species mode
      if (!selectedSpecies || selectedSpecies === "Select") {
        d3.select("#atlas").append("div")
          .style("padding", "20px")
          .style("text-align", "center")
          .text("Please select a species from the dropdown to view its atlas maps.");
        return;
      }
    }

    // Load records
    d3.csv("records.csv?t=" + Date.now(), d => ({
    species: d.species?.trim(),
    x: +d.x,
    y: +d.y,
    order: +d.order,
    year: +d.year,
    month: +d.month,
    day: +d.day,
    type: d.type?.trim(),
    tetrad: d.tetrad?.trim(),
    os: d.os?.trim(),
    location: d.location?.trim(),
    recorder: d.recorder?.trim()
  })).then(function (records) {
    
    // Store records globally for phenology chart access
    allRecords = records;
    window.allRecords = records; // Make globally accessible to shared.js
    
    // Debug: Show what columns are being parsed
    if (records.length > 0) {
    }
    
    // Write day and month data from records.csv for phenology chart
    const recordsWithDates = records.filter(r => r.day && r.month);
    
    // Search for records that actually have day/month data
    const recordsWithActualDates = records.filter(r => {
      const day = parseInt(r.day, 10);
      const month = parseInt(r.month, 10);
      return !isNaN(day) && day >= 1 && day <= 31 && !isNaN(month) && month >= 1 && month <= 12;
    });
    
    if (recordsWithActualDates.length > 0) {
      recordsWithActualDates.slice(0, 5).forEach((record, index) => {
      });
    } else {
    }
    
    // Load metadata
    d3.csv("metadata.csv", d => ({
      species: d.species?.trim(),
      family: d.family?.trim(),
      genus: d.genus?.trim(),
      specific: d.specific?.trim(),
      english: d.english?.trim(),
      status: d.status?.trim(),
      authority: d.authority?.trim(),
      ID: d.ID?.trim(),
      RedList: d.RedList?.trim(),
      WriteUp: d.WriteUp?.trim(),
      Phytogeography: d.Phytogeography?.trim()
    })).then(function (metadata) {

      const atlas = d3.select("#atlas");

      const metaLookup = new Map(metadata.map(d => [d.species, d]));
      
      // Store metaLookup globally for use in other files
      window.metaLookup = metaLookup;
      
      const speciesGroups = d3.group(records, d => d.species);

      if (showAll) {
        // All species mode - load all species at once in metadata order
        allSpeciesData = Array.from(speciesGroups.keys()).sort(); // This will be overridden
        renderSpeciesPage(atlas, speciesGroups, metaLookup, mode);
      } else {
        // Single species mode
        const recs = speciesGroups.get(selectedSpecies) || [];
        const meta = metaLookup.get(selectedSpecies) || {};
        const status = meta.status || "";

        if (recs.length === 0) {
          atlas.append("div")
            .style("padding", "20px")
            .style("text-align", "center")
            .text(`No records found for ${selectedSpecies}`);
          return;
        }

        // All years
        renderAtlasMap(atlas, recs, selectedSpecies, "All years", status, mode, metaLookup);

        if (mode === "full") {
          // 2020+
          const post2020Recs = recs.filter(d => +d.year >= 2020);
          renderAtlasMap(atlas, post2020Recs, selectedSpecies, "2020+", status, mode, metaLookup);

          // <2020
          const pre2020Recs = recs.filter(d => +d.year < 2020);
          renderAtlasMap(atlas, pre2020Recs, selectedSpecies, "<2020", status, mode, metaLookup);

          // Bins
          const binGroups = d3.group(recs, d => getYearBin(d.year));
          const orderedBins = ["2000-2019", "1987-1999", "1970-1986", "1930-1969", "<1930"];

          orderedBins.forEach(binLabel => {
            const binRecords = binGroups.get(binLabel) || [];
            renderAtlasMap(atlas, binRecords, selectedSpecies, binLabel, status, mode, metaLookup);
          });
        }
      }

    });
  });
  } catch (error) {
    // Error in drawD3Atlas
    console.error("❌ Error in drawD3Atlas:", error);
    // Reset the in-progress flag even on error
    window.d3AtlasInProgress = false;
  }
}

function renderSpeciesPage(atlas, speciesGroups, metaLookup, mode = "full") {
  
  // Create grid container for all species maps (no pagination)
  const gridContainer = atlas.append("div").attr("class", "atlas-grid");

  // Use metadata order instead of alphabetical
  const speciesInMetadataOrder = [];
  metaLookup.forEach((meta, speciesName) => {
    if (speciesGroups.has(speciesName)) {
      speciesInMetadataOrder.push(speciesName);
    }
  });

  // Render all species in metadata order
  let previousFamily = null;
  speciesInMetadataOrder.forEach((speciesName, index) => {
    
    const recs = speciesGroups.get(speciesName) || [];
    const meta = metaLookup.get(speciesName) || {};
    const status = meta.status || "";

    // Add blank spacer between different families
    if (previousFamily !== null && meta.family !== previousFamily) {
      const spacerContainer = gridContainer.append("div").attr("class", "species-container spacer-container");
      spacerContainer.append("div").attr("class", "species-title-container");
      const spacerSvg = spacerContainer.append("svg")
        .attr("width", svgWidth * 0.7)
        .attr("height", svgHeight * 0.7)
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
      // Empty spacer - no map content
    }
    
    previousFamily = meta.family;

    // All years only for all-species mode (to reduce rendering load)
    renderAtlasMap(gridContainer, recs, speciesName, "All years", status, mode, metaLookup);
  });
  
  // Cache the rendered content for future use
  window.d3AtlasLoaded = true;
  window.cachedAtlasContent = document.getElementById('atlas').innerHTML;
  
  // Reset the in-progress flag
  window.d3AtlasInProgress = false;
}

// Global variables
let allRecords = [];

// =========================
// PHENOLOGY CHART
// =========================

function drawPhenologyChart(selectedSpecies) {
  
  if (!selectedSpecies || selectedSpecies === "Select") {
    d3.select("#phenology-svg").html("<p style='color: #666; text-align: center;'>Select a species to view flowering times</p>");
    return;
  }

  // Filter records for selected species and extract dates
  const speciesRecords = allRecords.filter(record => 
    (record.species || record.latinName) === selectedSpecies && 
    record.year && record.month && record.day
  );


  if (speciesRecords.length === 0) {
    // Still plot the chart structure with empty data
    const monthlyCounts = new Array(12).fill(0);
    drawPhenologyChartBars(monthlyCounts, selectedSpecies, 0);
    return;
  }

  // Count records by month
  const monthlyCounts = new Array(12).fill(0);
  speciesRecords.forEach(record => {
    const month = parseInt(record.month, 10);
    if (month >= 1 && month <= 12) {
      monthlyCounts[month - 1]++;
    }
  });

  monthlyCounts.forEach((count, index) => {
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index];
  });
  
  drawPhenologyChartBars(monthlyCounts, selectedSpecies, speciesRecords.length);
}

function drawPhenologyChartBars(monthlyCounts, selectedSpecies, recordCount) {
  
  // Clear previous chart
  d3.select("#phenology-svg").selectAll("*").remove();
  
  // Chart dimensions
  const containerWidth = 218;
  const containerHeight = 200;
  const width = containerWidth - 20;
  const height = containerHeight - 60;
  const innerRadius = 18; // Reduced from 20 by 10%
  const outerRadius = 47.25; // Reduced from 52.5 by 10%

  // Check if container exists
  const container = document.getElementById("phenology-svg");
  if (!container) {
    return;
  }
  
  
  const svg = d3.select("#phenology-svg")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
    

  const g = svg.append("g")
    .attr("transform", `translate(${width/2}, ${height/2 + 5})`); // Move down 5px

  // Month labels
  const monthNames = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  
  // Create bars
  const maxCount = d3.max(monthlyCounts);
  const radiusScale = d3.scaleLinear()
    .domain([0, maxCount || 1]) // Prevent division by zero - use 1 if maxCount is 0
    .range([innerRadius, outerRadius]);


  const bars = g.selectAll(".bar")
    .data(monthlyCounts)
    .enter()
    .append("g")
    .attr("class", "bar");


  bars.append("path")
    .attr("d", (d, i) => {
      
      // Use exact same positions as labels - no angle calculations needed
      const labelPositions = [
        {x: 12.94, y: -48.30},  // January (y inverted)
        {x: 35.36, y: -35.36},  // February (y inverted)
        {x: 48.30, y: -12.94},  // March (y inverted)
        {x: 48.30, y: 12.94}, // April (y inverted)
        {x: 35.36, y: 35.36}, // May (y inverted)
        {x: 12.94, y: 48.30}, // June (y inverted)
        {x: -12.94, y: 48.30}, // July (y inverted)
        {x: -35.36, y: 35.36}, // August (y inverted)
        {x: -48.30, y: 12.94}, // September (y inverted)
        {x: -48.30, y: -12.94}, // October (y inverted)
        {x: -35.36, y: -35.36}, // November (y inverted)
        {x: -12.94, y: -48.30}, // December (y inverted)
      ];
      
      // Calculate angle from exact label position
      const labelX = labelPositions[i].x;
      const labelY = labelPositions[i].y;
      const angle = Math.atan2(labelY, labelX);
      
      // Rotate clockwise by 90 degrees (add 90 degrees to angle)
      const rotatedAngle = angle + (90 * Math.PI / 180);
      
      // Create bar segment centered on rotated angle
      const segmentWidth = 30 * Math.PI / 180; // 30 degrees per month
      const startAngle = rotatedAngle - (segmentWidth / 2);
      const endAngle = rotatedAngle + (segmentWidth / 2);
      const innerR = innerRadius;
      const outerR = radiusScale(d);
      
      
      return d3.arc()
        .innerRadius(innerR)
        .outerRadius(outerR)
        .startAngle(startAngle)
        .endAngle(endAngle)();
    })
    .attr("fill", (d, i) => {
      // Graded grayscale - black for most records, light gray for least
      const intensity = d / maxCount;
      if (intensity > 0.9) return "#000000";  // Black - highest
      if (intensity > 0.8) return "#1a1a1a";  // Very dark gray
      if (intensity > 0.7) return "#333333";  // Dark gray
      if (intensity > 0.6) return "#4d4d4d";  // Medium dark gray
      if (intensity > 0.5) return "#666666";  // Medium gray
      if (intensity > 0.4) return "#808080";  // Gray
      if (intensity > 0.3) return "#999999";  // Medium light gray
      if (intensity > 0.2) return "#b3b3b3";  // Light gray
      if (intensity > 0.1) return "#cccccc";  // Very light gray
      return "#e6e6e6";  // Lightest visible gray - lowest
    })
    .attr("stroke", "white")
    .attr("stroke-width", 1);

 // Month labels
  g.selectAll(".label")
    .data(monthNames)
    .enter()
    .append("text")
    .attr("x", (d, i) => {
      // User-calculated exact coordinates (standard mathematical: x=right, y=up)
      // Scale down by 0.9 to move labels inward for smaller chart
      const positions = [
        {x: 12.94 * 0.9 * 1.25, y: 48.30 * 0.9 * 1.25},  // January
        {x: 35.36 * 0.9 * 1.25, y: 35.36 * 0.9 * 1.25},  // February
        {x: 48.30 * 0.9 * 1.25, y: 12.94 * 0.9 * 1.25},  // March
        {x: 48.30 * 0.9 * 1.25, y: -12.94 * 0.9 * 1.25}, // April
        {x: 35.36 * 0.9 * 1.25, y: -35.36 * 0.9 * 1.25}, // May
        {x: 12.94 * 0.9 * 1.25, y: -48.30 * 0.9 * 1.25}, // June
        {x: -12.94 * 0.9 * 1.25, y: -48.30 * 0.9 * 1.25}, // July
        {x: -35.36 * 0.9 * 1.25, y: -35.36 * 0.9 * 1.25}, // August
        {x: -48.30 * 0.9 * 1.25, y: -12.94 * 0.9 * 1.25}, // September
        {x: -48.30 * 0.9 * 1.25, y: 12.94 * 0.9 * 1.25}, // October
        {x: -35.36 * 0.9 * 1.25, y: 35.36 * 0.9 * 1.25}, // November
        {x: -12.94 * 0.9 * 1.25, y: 48.30 * 0.9 * 1.25}, // December
      ];
      return positions[i].x;
    })
    .attr("y", (d, i) => {
      // User-calculated exact coordinates (standard mathematical: x=right, y=up)
      // Convert to D3: invert y (up becomes negative) and scale down by 0.9, then scale up by 1.25
      const positions = [
        {x: 12.94 * 0.9 * 1.25, y: -48.30 * 0.9 * 1.25},  // January (y inverted)
        {x: 35.36 * 0.9 * 1.25, y: -35.36 * 0.9 * 1.25},  // February (y inverted)
        {x: 48.30 * 0.9 * 1.25, y: -12.94 * 0.9 * 1.25},  // March (y inverted)
        {x: 48.30 * 0.9 * 1.25, y: 12.94 * 0.9 * 1.25}, // April (y inverted)
        {x: 35.36 * 0.9 * 1.25, y: 35.36 * 0.9 * 1.25}, // May (y inverted)
        {x: 12.94 * 0.9 * 1.25, y: 48.30 * 0.9 * 1.25}, // June (y inverted)
        {x: -12.94 * 0.9 * 1.25, y: 48.30 * 0.9 * 1.25}, // July (y inverted)
        {x: -35.36 * 0.9 * 1.25, y: 35.36 * 0.9 * 1.25}, // August (y inverted)
        {x: -48.30 * 0.9 * 1.25, y: 12.94 * 0.9 * 1.25}, // September (y inverted)
        {x: -48.30 * 0.9 * 1.25, y: -12.94 * 0.9 * 1.25}, // October (y inverted)
        {x: -35.36 * 0.9 * 1.25, y: -35.36 * 0.9 * 1.25}, // November (y inverted)
        {x: -12.94 * 0.9 * 1.25, y: -48.30 * 0.9 * 1.25}, // December (y inverted)
      ];
      return positions[i].y;
    })
    .text(d => d)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "#333")
    .attr("font-weight", "bold");

  // Center info
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .attr("dy", "0.3em") // Move down slightly for vertical centering
    .text(recordCount === 0 ? "No data" : recordCount);

  // Add black circle around the edge of the chart (outside labels)
  g.append("circle")
    .attr("cx", 0)
    .attr("cy", -5) // Move up 5px
    .attr("r", (outerRadius + 20) * 0.9 * 1.1) // Scale down by 10%, then up by 10% (outerRadius 47.25 + label buffer ~18, then +10%)
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5); // 50% of current setting (1px -> 0.5px)

  // Add tooltips
  bars.append("title")
    .text((d, i) => `${monthNames[i]}: ${d} records`);

}

// Make phenology chart function globally accessible
window.drawPhenologyChart = drawPhenologyChart;

// =========================
// renderAtlasMap — draws one map panel
// =========================

function renderAtlasMap(atlas, records, speciesName, label, status, mode = "full", metaLookup = null) {

  const container = atlas.append("div").attr("class", "species-container");

  // Only show label if not "All years" in all-species mode
  if (!(mode === "allYearsOnly" && label === "All years")) {
    container.append("div")
      .attr("class", "species-title")
      .text(`${speciesName} — ${label}`);
  } else {
    // For all-species mode with "All years", show detailed taxonomy in separate rows
    const titleContainer = container.append("div")
      .attr("class", "species-title-container");
    
    // Get metadata for this species
    const meta = metaLookup ? metaLookup.get(speciesName) : null;
    
    if (meta) {
      // Family
      if (meta.family) {
        titleContainer.append("div")
          .attr("class", "species-family")
          .text(meta.family);
      }
      
      // Genus
      if (meta.genus) {
        titleContainer.append("div")
          .attr("class", "species-genus")
          .text(meta.genus);
      }
      
      // Specific epithet
      if (meta.specific) {
        titleContainer.append("div")
          .attr("class", "species-specific")
          .text(meta.specific);
      }
      
      // English name
      if (meta.english) {
        titleContainer.append("div")
          .attr("class", "species-english")
          .text(meta.english);
      } else {
        // Add a single space to maintain consistent height
        titleContainer.append("div")
          .attr("class", "species-english")
          .text(" ");
      }
    } else {
      // Fallback to species name if no metadata
      titleContainer.append("div")
        .attr("class", "species-title")
        .text(speciesName);
    }
  }

  const svg = container.append("svg")
    .attr("width", svgWidth * 0.7) // Reduced from 0.75 to 0.7
    .attr("height", svgHeight * 0.7) // Reduced from 0.75 to 0.7
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  const mapGroup = svg.append("g")
    .attr("transform", `translate(${marginLeft},${marginTop})`);

  // ---- Background map image ----
  const defs = svg.append("defs");
  const safeId = (speciesName + label).replace(/[^A-Za-z0-9_-]/g, "_");
  const patternId = "mapPattern_" + safeId;

  defs.append("pattern")
    .attr("id", patternId)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .append("image")
    .attr("xlink:href", "map.jpg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

  mapGroup.append("rect")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .attr("fill", `url(#${patternId})`);

  // ---- Borders (usedSquares) ----
  usedSquares.forEach(key => {
    const x = parseInt(key.slice(0, -2), 10);
    const y = parseInt(key.slice(-2), 10);

    const x0 = (x - xMin) * cellW;
    const y0 = (rows - (y - yMin + 1)) * cellH;

    mapGroup.append("rect")
      .attr("class", "gridcell")
      .attr("x", x0)
      .attr("y", y0)
      .attr("width", cellW)
      .attr("height", cellH);
  });

  // ---- Monads ----
  const monadSquares = new Set(
    records
      .filter(d => !isTetrad(d.type))
      .map(d => `${d.x}${d.y}`)
  );

  const monadGroups = d3.group(
    records.filter(d => !isTetrad(d.type)),
    d => `${d.x},${d.y}`
  );

  monadGroups.forEach((sqRecords) => {
    const latest = d3.max(sqRecords, d => d.year);
    const sample = sqRecords[0];

    mapGroup.append("circle")
      .attr("cx", xCenter(sample.x))
      .attr("cy", yCenter(sample.y))
      .attr("r", 10) // Increased from 8 to 10 for larger maps
      .attr("fill", yearColor(latest, status))
      .attr("stroke", "black");
  });

  // ---- Tetrads ----
  const tetradRecords = records.filter(d => isTetrad(d.type));
  const tetradGroups = d3.group(tetradRecords, d => d.tetrad);

  tetradGroups.forEach((trs, tetradCode) => {
    const squares = tetradMap[tetradCode];
    if (!squares) return;

    // Skip tetrads overlapping monads
    const overlaps = squares.some(sq => monadSquares.has(sq));
    if (overlaps) return;

    const latest = d3.max(trs, d => d.year);

    const coords = squares.map(key => {
      const x = parseInt(key.slice(0, -2), 10);
      const y = parseInt(key.slice(-2), 10);
      return [xCenter(x), yCenter(y)];
    });

    const avgX = d3.mean(coords, c => c[0]);
    const avgY = d3.mean(coords, c => c[1]);

    mapGroup.append("rect")
      .attr("x", avgX - 8) // Increased from 6 to 8 for larger maps
      .attr("y", avgY - 8) // Increased from 6 to 8 for larger maps
      .attr("width", 16) // Increased from 12 to 16 for larger maps
      .attr("height", 16) // Increased from 12 to 16 for larger maps
      .attr("fill", yearColor(latest, status))
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  });

  // ---- Axis labels (X) ----
  for (let i = 0; i < cols; i++) {
    const gridValue = xMin + i;
    svg.append("text")
      .attr("class", "axislabel")
      .attr("x", marginLeft + i * cellW + cellW / 2)
      .attr("y", marginTop + mapHeight + labelSpace)
      .attr("text-anchor", "middle")
      .text(gridValue);
  }

  // ---- Axis labels (Y) ----
  for (let j = 0; j < rows; j++) {
    const gridValue = yMin + j;
    svg.append("text")
      .attr("class", "axislabel")
      .attr("x", marginLeft + mapWidth + 10)
      .attr("y", marginTop + mapHeight - j * cellH - cellH / 2)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .text(gridValue);
  }

  // Summary table generation - only for single species mode, not all-species mode
  if (mode !== "allYearsOnly") {
    const summaryBody = document.querySelector("#summaryTable tbody");
    if (summaryBody) {
      
      // Hide the summary table but keep it functional
      const summaryTable = document.querySelector("#summaryTable");
      if (summaryTable) {
        summaryTable.style.display = 'none'; 
      }
      
      // Also hide the summary table container if it exists
      const summaryTableContainer = document.querySelector("#atlasSummary");
      if (summaryTableContainer) {
        summaryTableContainer.style.display = 'none'; 
      }

      // Style table header - no borders except bottom
      const headerCells = document.querySelectorAll("#summaryTable th");
      headerCells.forEach(th => {
        th.style.border = "none"; 
        th.style.borderBottom = "2px solid #000"; 
        th.style.borderBottom = "2px solid #000"; // Keep only bottom border
        th.style.padding = "8px 12px";
      });

      // Style existing rows - no borders
      const existingRows = document.querySelectorAll("#summaryTable tr");
      existingRows.forEach(tr => {
        const cells = tr.querySelectorAll("td, th");
        cells.forEach(cell => {
          cell.style.border = "none"; // Remove all borders
          cell.style.padding = "8px 12px";
        });
      });

      const row = document.createElement("tr");

      const cellLabel = document.createElement("td");
      cellLabel.textContent = label;
      cellLabel.style.border = "none"; // Remove border
      cellLabel.style.padding = "8px 12px";
      row.appendChild(cellLabel);

      // Add color-coded indicator column (narrower)
      const cellColor = document.createElement("td");
      cellColor.style.border = "none"; // Remove border
      cellColor.style.padding = "8px 4px"; // Much narrower padding
      cellColor.style.textAlign = "center";
      cellColor.style.width = "30px"; // Fixed narrow width
      
      // Set color based on year bin
      if (label === "All years") {
        cellColor.innerHTML = ""; // Empty for "All years"
      } else if (label === "2020+") {
        cellColor.innerHTML = '<div style="width: 12px; height: 12px; background-color: red; margin: 0 auto;"></div>';
      } else if (label === "2000-2019") {
        cellColor.innerHTML = '<div style="width: 12px; height: 12px; background-color: orange; margin: 0 auto;"></div>';
      } else if (label === "1987-1999") {
        cellColor.innerHTML = '<div style="width: 12px; height: 12px; background-color: yellow; margin: 0 auto;"></div>';
      } else if (label === "1970-1986") {
        cellColor.innerHTML = '<div style="width: 12px; height: 12px; background-color: green; margin: 0 auto;"></div>';
      } else if (label === "1930-1969") {
        cellColor.innerHTML = '<div style="width: 12px; height: 12px; background-color: blue; margin: 0 auto;"></div>';
      } else if (label === "<1930") {
        cellColor.innerHTML = '<div style="width: 12px; height: 12px; background-color: purple; margin: 0 auto;"></div>';
      }
      
      row.appendChild(cellColor);

      // Count circles (monads)
      const monadCount = monadGroups.size;

      // Count squares (tetrads) that were actually drawn
      let tetradCount = 0;
      tetradGroups.forEach((trs, tetradCode) => {
        const squares = tetradMap[tetradCode];
        if (!squares) return;
        
        // Count all unique tetrads that don't overlap with any monads
        const overlapsWithAnyMonad = squares.some(sq => monadSquares.has(sq));
        if (!overlapsWithAnyMonad) tetradCount++;
      });

      const total = monadCount + tetradCount;

      const cellCount = document.createElement("td");
      cellCount.textContent = total;
      cellCount.style.border = "none"; // Remove border
      cellCount.style.padding = "8px 12px";
      
      // Add class to zero values for CSS targeting
      if (total === 0) {
        cellCount.classList.add("zero-value");
      }
      
      row.appendChild(cellCount);

      summaryBody.appendChild(row);
    }
    
    // Update Records header after summary table is complete
    if (typeof updateRecordsHeader === 'function') {
      updateRecordsHeader();
    }
    
    // Automatically capture summary table data
    captureSummaryTableData();
  }
}

// =========================
// Function to capture summary table data without interfering with table creation
// =========================
function captureSummaryTableData() {
  const summaryRows = document.querySelectorAll("#summaryTable tbody tr");
  if (summaryRows.length > 0) {
    // Get current species from DOM instead of undefined variable
    const latinSelect = document.getElementById("latinSelect");
    const currentSpecies = latinSelect ? latinSelect.value : "All Species";
    
    window.summaryTableData = {
      species: currentSpecies,
      yearBins: {},
      timestamp: new Date().toISOString()
    };
    
    // Extract all year bin data
    summaryRows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        const yearBin = cells[0].textContent.trim();
        const total = parseInt(cells[2].textContent.trim()) || 0;
        window.summaryTableData.yearBins[yearBin] = total;
      }
    });
    
    // Write summary numbers to year tickboxes
    // First, clear all existing tickbox numbers to prevent accumulation
    document.querySelectorAll('.tickbox-count').forEach(element => {
      element.remove();
    });
    
    Object.keys(window.summaryTableData.yearBins).forEach(yearBin => {
      const count = window.summaryTableData.yearBins[yearBin];
      const checkbox = document.querySelector(`input[value="${yearBin}"]`);
      if (checkbox && count > 0) {
        const parentDiv = checkbox.parentElement;
        const span = checkbox.nextElementSibling;
        if (parentDiv && span) {
          const countElement = document.createElement('span');
          countElement.className = 'tickbox-count';
          countElement.textContent = ` ${count}`;
          countElement.style.fontSize = '11px';
          countElement.style.color = '#666';
          countElement.style.marginLeft = '30px';
          countElement.style.display = 'inline-block';
          countElement.style.width = '20px';
          countElement.style.textAlign = 'right';
          span.insertAdjacentElement('afterend', countElement);
        }
      }
    });
    
    // Also add "All years" count if present
    const allYearsTotal = window.summaryTableData.yearBins["All years"];
    if (allYearsTotal && allYearsTotal > 0) {
      const allYearsCheckbox = document.querySelector('input[value="All Years"]');
      if (allYearsCheckbox) {
        const parentDiv = allYearsCheckbox.parentElement;
        const span = allYearsCheckbox.nextElementSibling;
        
        if (parentDiv && span) {
          // Remove existing count element if present
          const existingCount = parentDiv.querySelector('.tickbox-count');
          if (existingCount) {
            existingCount.remove();
          }
          
          // Create new count element
          const countElement = document.createElement('span');
          countElement.className = 'tickbox-count';
          countElement.textContent = ` ${allYearsTotal}`;
          countElement.style.fontSize = '11px';
          countElement.style.color = '#666';
          countElement.style.marginLeft = '30px';
          countElement.style.display = 'inline-block';
          countElement.style.width = '20px';
          countElement.style.textAlign = 'right';
          
          // Add count element after the span
          span.insertAdjacentElement('afterend', countElement);
        }
      }
    }
    
    return window.summaryTableData;
  } else {
    return null;
  }
}

// =========================
// initD3 — Initialize D3 Atlas
// =========================

function initD3() {
  // Check if D3 atlas is already loaded and cached
  if (window.d3AtlasLoaded && window.cachedAtlasContent) {
    // Restore cached content
    const atlasElement = document.getElementById('atlas');
    if (atlasElement) {
      atlasElement.innerHTML = window.cachedAtlasContent;
    }
  } else {
    // Automatically load all species with "All years" maps
    drawD3Atlas(null, true, "allYearsOnly");
  }
}
