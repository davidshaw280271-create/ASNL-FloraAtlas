// =========================
// gallery.js - Statistics Map
// =========================


// Function to show Statistics page
function showStatistics() {
  
  // Hide all pages
  document.getElementById('speciesPage').style.display = 'none';
  document.getElementById('atlasPage').style.display = 'none';
  document.getElementById('photosPage').style.display = 'none';
  
  // Show Statistics page
  const galleryPage = document.getElementById('galleryPage');
  galleryPage.style.display = 'block';
  galleryPage.style.visibility = 'visible';
  galleryPage.style.position = 'relative';
  
  // Update navigation active state
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelectorAll('nav a')[3].classList.add('active'); // Statistics link
  
  // Hide species navigation buttons (not needed on statistics page)
  document.getElementById('speciesNavButtons').style.display = 'none';
  
  // Render the statistics map
  renderStatisticsMap();
}

// Function to render statistics map
function renderStatisticsMap() {
  const mapContainer = document.getElementById('statisticsMap');
  if (!mapContainer) {
    return;
  }
  
  // Clear existing content
  mapContainer.innerHTML = '';
  
  // Load data
  Promise.all([
    d3.csv("metadata.csv"),
    d3.csv("records.csv")
  ]).then(function([metadata, records]) {
    
    // Create species lookup from metadata
    const speciesLookup = new Set();
    metadata.forEach(m => {
      const species = m.species || m.SPECIES || m.latin || m.Latin || '';
      if (species) {
        speciesLookup.add(species);
      }
    });
    
    // Count species per monad (exclude tetrads) - using same logic as All Maps page
    const monadSpeciesCount = new Map();
    
    // Helper function to check if type is tetrad (based on your message)
    function isTetrad(type) {
      // Tetrads are: !, ;, #, 1, |, :, }, |
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
        "2000-2019": ["]", "{"],
        "2020+": ["@", "!"]
      };
      
      // Get current year bin (simplified - in real usage would need actual year)
      // For now, check if type matches any year-specific monad
      for (const [yearBin, monadTypes] of Object.entries(yearSpecificMonadTypes)) {
        if (monadTypes.includes(type)) return false; // It's a monad, not tetrad
      }
      
      // If not a known monad type, assume it's a tetrad
      return true;
    }
    
    
    records.forEach(record => {
      const x = record.x || record.X || '';
      const y = record.y || record.Y || '';
      const type = record.type || record.TYPE || '';
      
      // Only process monads, not tetrads (same as All Maps page)
      if (isTetrad(type)) return; // Skip tetrads
      
      const species = record.species || record.SPECIES || '';
      
      if (x && y && species && speciesLookup.has(species)) {
        const key = `${x},${y}`;
        if (!monadSpeciesCount.has(key)) {
          monadSpeciesCount.set(key, new Set());
        }
        monadSpeciesCount.get(key).add(species);
      }
    });
    
    // Convert to simple count
    const monadCounts = new Map();
    monadSpeciesCount.forEach((speciesSet, key) => {
      monadCounts.set(key, speciesSet.size);
    });
    
    // Create D3 map
    createD3StatisticsMap(monadCounts);
    
  }).catch(function(error) {
    mapContainer.innerHTML = '<p>Error loading statistics data: ' + error.message + '</p>';
  });
}

// Function to create D3 statistics map
function createD3StatisticsMap(monadCounts) {
  // Use the same constants as the All Maps page
  const cols = 9, rows = 12;
  const mapWidth = 200, mapHeight = 200 * (rows / cols);
  const marginLeft = 30, marginTop = 10, marginRight = 40, marginBottom = 30;
  const labelSpace = 30;
  const svgWidth = marginLeft + mapWidth + marginRight;
  const svgHeight = marginTop + mapHeight + marginBottom + labelSpace;
  const cellW = mapWidth / cols, cellH = mapHeight / rows;
  const xMin = 43, yMin = 70;
  
  // Define the same coordinate functions as All Maps page
  function xCenter(x) { return (x - xMin + 0.5) * cellW; }
  function yCenter(y) { return (rows - (y - yMin) - 0.5) * cellH; }
  
  const container = d3.select("#statisticsMap");
  const width = container.node().offsetWidth;
  const height = 600;
  
  // Ensure container has proper dimensions
  if (width === 0) {
    container.style("width", "800px");
  }
  
  // Create SVG with same scaling as All Maps page
  const svg = container.append("svg")
    .attr("width", Math.max(width, 800))
    .attr("height", height)
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  
  const mapGroup = svg.append("g")
    .attr("transform", `translate(${marginLeft},${marginTop})`);
  
  // Add background map image using same approach as All Maps page
  const defs = svg.append("defs");
  const patternId = "mapPattern_statistics";
  
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
  
  // ---- Grid squares (same as All Maps page) ----
  const usedSquares = new Set();
  monadCounts.forEach((count, key) => {
    const [x, y] = key.split(',').map(Number);
    usedSquares.add(`${x}${y}`);
  });
  
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
  
  // Find max species count for scaling
  const maxCount = Math.max(...Array.from(monadCounts.values()), 1);
  
  // Create color scale - white to black
  const colorScale = d3.scaleSequential(d3.interpolateGreys)
    .domain([0, maxCount]);
  
  // Create size scale
  const sizeScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([3, 15]); // Circle radius from 3px to 15px
  
  // Add monad squares using exact same approach as All Maps page
  monadCounts.forEach((count, key) => {
    // Parse the key like All Maps page does: "48,81" -> x=48, y=81
    const [x, y] = key.split(',').map(Number);
    
    // Use the exact same coordinate functions as All Maps page
    const x0 = (x - xMin) * cellW;
    const y0 = (rows - (y - yMin + 1)) * cellH;
    
    // Create square directly in mapGroup like All Maps page
    const square = mapGroup.append("rect")
      .attr("x", x0)
      .attr("y", y0)
      .attr("width", cellW)
      .attr("height", cellH)
      .attr("fill", colorScale(count))
      .attr("stroke", "none")
      .attr("opacity", 0.5)
      .append("title")
      .text(`Monad ${x}${y}: ${count} species`);
  });
  
  // Add axis labels using same approach as All Maps page
  const labelGroup = svg.append("g").attr("class", "labels");
  
  // X-axis labels (bottom)
  for (let i = 0; i < cols; i++) {
    const gridValue = xMin + i;
    svg.append("text")
      .attr("class", "axislabel")
      .attr("x", marginLeft + i * cellW + cellW / 2)
      .attr("y", marginTop + mapHeight + labelSpace)
      .attr("text-anchor", "middle")
      .text(gridValue);
  }
  
  // Y-axis labels (left)
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
  
  // Create legend
  createStatisticsLegend(colorScale, maxCount);
}

// Function to convert monad code to coordinates
function osGridToCoords(monadCode) {
  if (!monadCode) return null;
  
  // Handle 4-digit monad codes like "7575" (75 easting, 75 northing)
  if (/^\d{4}$/.test(monadCode)) {
    const easting = parseInt(monadCode.substring(0, 2));
    const northing = parseInt(monadCode.substring(2, 4));
    
    return {
      x: easting,
      y: northing
    };
  }
  
  // Handle 2-digit monad codes like "75" (if that's the format)
  if (/^\d{2}$/.test(monadCode)) {
    const easting = parseInt(monadCode.substring(0, 1));
    const northing = parseInt(monadCode.substring(1, 2));
    
    return {
      x: easting,
      y: northing
    };
  }
  
  return null;
}

// Function to create legend
function createStatisticsLegend(colorScale, maxCount) {
  const legendContainer = d3.select("#statisticsLegend");
  legendContainer.html('');
  
  // Create gradient legend
  const legendWidth = 150;
  const legendHeight = 20;
  
  const gradientId = "statistics-gradient";
  
  // Create gradient
  const defs = legendContainer.append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight + 40)
    .append("defs");
  
  const gradient = defs.append("linearGradient")
    .attr("id", gradientId)
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");
  
  // Add gradient stops
  for (let i = 0; i <= 10; i++) {
    const value = (maxCount * i) / 10;
    gradient.append("stop")
      .attr("offset", `${i * 10}%`)
      .attr("stop-color", colorScale(value));
  }
  
  // Add gradient rectangle
  legendContainer.select("svg")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", `url(#${gradientId})`)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1);
  
  // Add labels
  legendContainer.select("svg")
    .append("text")
    .attr("x", 0)
    .attr("y", legendHeight + 15)
    .attr("font-size", "10px")
    .attr("fill", "#333")
    .text("0");
  
  legendContainer.select("svg")
    .append("text")
    .attr("x", legendWidth)
    .attr("y", legendHeight + 15)
    .attr("text-anchor", "end")
    .attr("font-size", "10px")
    .attr("fill", "#333")
    .text(maxCount.toString());
  
  legendContainer.select("svg")
    .append("text")
    .attr("x", legendWidth / 2)
    .attr("y", legendHeight + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "#666")
    .text("Number of Species");
}

// Add initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    // Gallery.js initialized - Statistics page ready
  }, 1000);
});
