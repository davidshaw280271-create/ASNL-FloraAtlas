// =========================

// leaflet.js

// =========================



// ===== GLOBAL FUNCTIONS (must be visible to shared.js and d3.js) =====



// Photo viewer

window.updateCarousel = function(speciesName, showThumbnails = false) {
  
  const viewer = document.querySelector(".viewer");
  const thumbs = document.querySelector(".thumbnails");

  viewer.innerHTML = "";
  thumbs.innerHTML = "";

  if (!speciesName) {
    return;
  }

  const matches = photoData.filter(p =>
    p.latinName && p.latinName.toLowerCase() === speciesName.toLowerCase()
  );

  currentMatches = matches;

  currentIndex = 0;

  if (matches.length === 0) {
    viewer.innerHTML = "<p>No photos available</p>";
    viewer.style.display = "flex";
    thumbs.style.display = "none";
    return;
  }

  showImage(currentIndex);

  // Ensure photos container is visible
  const photosContainer = document.getElementById("photos");
  if (photosContainer) {
    photosContainer.style.display = "flex";
    photosContainer.style.flexDirection = "column";
  }

  matches.forEach((p, index) => {
    
    const thumb = document.createElement("img");

    // Convert thumbnail path to full-size path for Species Accounts
    let fullPath;
    if (p.file && p.file.startsWith('thumbnails/')) {
      // Remove thumbnails/ prefix and (Small) suffix to get full-size filename
      let baseFilename = p.file.substring(11); // Remove 'thumbnails/'
      // Remove (Small) suffix and any space before the extension
      baseFilename = baseFilename.replace('(Small)', '').replace(' .', '.');
      fullPath = `photos/${baseFilename}`;
    } else {
      // Use as-is or add photos/ prefix if needed
      fullPath = p.file.startsWith('photos/') ? p.file : `photos/${p.file}`;
    }
    

    thumb.src = encodeURI(fullPath);

    thumb.alt = p.latinName || p.species;

    // Handle thumbnail load
    thumb.onload = function() {
      // Thumbnail loaded - nothing special needed
    };

    thumb.addEventListener("click", () => {

      currentIndex = currentMatches.indexOf(p);

      showImage(currentIndex);

      thumbs.style.display = "none";

      viewer.style.display = "flex";

    });

    thumbs.appendChild(thumb);

  });

  // Adjust thumbnail size based on count
  if (matches.length >= 8) {
    thumbs.querySelectorAll('img').forEach(img => {
      img.style.maxWidth = '120px';
      img.style.height = '100px';
    });
  }

  // Reset scroll position to top when changing species
  thumbs.scrollTop = 0;

  // Only hide thumbnails if not explicitly showing them
  if (!showThumbnails) {
    thumbs.style.display = "none";
    viewer.style.display = "flex";
    // Remove thumbnail-view class from photos container
    document.getElementById("photos").classList.remove("thumbnail-view");
    // Remove padding from photos container when not in thumbnail view
    document.getElementById("photos").style.padding = "0";
  } else {
    thumbs.style.display = "flex";
    viewer.style.display = "none";
    // Add thumbnail-view class to photos container
    document.getElementById("photos").classList.add("thumbnail-view");
    // Add padding to photos container when in thumbnail view
    document.getElementById("photos").style.padding = "6px";
  }

}



function showImage(index) {
  if (currentMatches.length === 0) {
    return;
  }

  const p = currentMatches[index];
  if (!p) {
    return;
  }

  const big = document.createElement("img");

  // Convert thumbnail path to full-size path for Species Accounts
  let fullPath;
  if (p.file && p.file.startsWith('thumbnails/')) {
    // Remove thumbnails/ prefix and (Small) suffix to get full-size filename
    let baseFilename = p.file.substring(11); // Remove 'thumbnails/'
    // Remove (Small) suffix and any space before the extension
    baseFilename = baseFilename.replace('(Small)', '').replace(' .', '.');
    fullPath = `photos/${baseFilename}`;
  } else {
    // Use as-is or add photos/ prefix if needed
    fullPath = currentMatches[index].file.startsWith('photos/') ? currentMatches[index].file : `photos/${currentMatches[index].file}`;
  }
  
  const viewer = document.querySelector(".viewer");

  big.src = encodeURI(fullPath);

  big.alt = currentMatches[index].latinName || currentMatches[index].species;

  // Handle image load
  big.onload = function() {
    viewer.innerHTML = "";
    viewer.appendChild(big);
    
    // Add photo info overlay after image loads
    const filename = currentMatches[index].file || "";
    let info = [];

    const lp = filename.indexOf("(");
    const rp = filename.indexOf(")", lp + 1);
    if (lp !== -1 && rp !== -1) info.push(filename.substring(lp + 1, rp));

    const lb = filename.indexOf("{");
    const rb = filename.indexOf("}", lb + 1);
    if (lb !== -1 && rb !== -1) info.push(filename.substring(lb + 1, rb));

    const ls = filename.indexOf("[");
    const rs = filename.indexOf("]", ls + 1);
    if (ls !== -1 && rs !== -1) info.push(filename.substring(ls + 1, rs));

    if (info.length) {
      const overlay = document.createElement("div");
      overlay.className = "photo-info";
      overlay.textContent = info.join(" • ");
      viewer.appendChild(overlay);
    }
  };

  big.onerror = function() {
    viewer.innerHTML = "<p style='text-align: center; padding: 20px; color: #999;'>Failed to load image</p>";
  };

  // If image is already cached, onload might not fire, so handle that case
  if (big.complete) {
    viewer.innerHTML = "";
    viewer.appendChild(big);
    
    // Add photo info for cached images
    const filename = currentMatches[index].file || "";
    let info = [];

    const lp = filename.indexOf("(");
    const rp = filename.indexOf(")", lp + 1);
    if (lp !== -1 && rp !== -1) info.push(filename.substring(lp + 1, rp));

    const lb = filename.indexOf("{");
    const rb = filename.indexOf("}", lb + 1);
    if (lb !== -1 && rb !== -1) info.push(filename.substring(lb + 1, rb));

    const ls = filename.indexOf("[");
    const rs = filename.indexOf("]", ls + 1);
    if (ls !== -1 && rs !== -1) info.push(filename.substring(ls + 1, rs));

    if (info.length) {
      const overlay = document.createElement("div");
      overlay.className = "photo-info";
      overlay.textContent = info.join(" • ");
      viewer.appendChild(overlay);
    }
  }

}



// Color function

function page1Color(year) {

  if (year < 1930) return "#800080";

  if (year < 1970) return "#0000FF";

  if (year < 1987) return "#008000";

  if (year < 2000) return "#FFFF00";

  if (year < 2020) return "#FFA500";

  return "#FF0000";

}



// TMS tile URL

function tmsUrl(url, coords) {

  var z = coords.z;

  var x = coords.x;

  var yXYZ = coords.y;

  var rows = Math.pow(2, z);

  var yTMS = (rows - 1) - yXYZ;

  return L.Util.template(url, { z: z, x: x, y: yTMS });

}



// OS grid conversion

var worldW = 5376;

var worldH = 8192;

var maxZoom = 5;



var cx = worldW / 2;

var cy = worldH / 2;



var anchor1_px = [cx - 800, cy - 400];

var anchor1_os = [45999, 76907];

var anchor2_px = [cx + 800, cy + 400];

var anchor2_os = [48535, 75665];



var dx_px = anchor2_px[0] - anchor1_px[0];

var dy_px = anchor2_px[1] - anchor1_px[1];

var dx_os = anchor2_os[0] - anchor1_os[0];

var dy_os = anchor2_os[1] - anchor1_os[1];



var px_per_m = dx_px / dx_os;

var py_per_m = dy_px / dy_os;




function osToPixel(easting, northing) {
  // Shift everything left by 1/4 grid square (250 meters)
  const shiftedEasting = easting - 250;
  
  var x = anchor1_px[0] + (shiftedEasting - anchor1_os[0]) * px_per_m;
  var y = anchor1_px[1] + (northing - anchor1_os[1]) * py_per_m;
  return [x, y];
}




// Plotting functions

function plotMonad(monadCode, size_m = 1000, color = "green", notes = "", zIndex = 0) {
  var easting = parseInt(monadCode.substring(0, 2)) * 1000;

  var northing = parseInt(monadCode.substring(2, 4)) * 1000;

  // Shift monads and tetrads 150 meters to the right (200m - 50m left adjustment)
  var shiftedEasting = easting + 150;

  // Adjust line weight and shrinkage based on size

  var weight, inset_m;

  if (size_m === 2000) {

    // Tetrads: half line width again (1px) and even more shrinkage

    weight = 1;

    var weight_px = 28;  // Even more shrinkage for tetrads

    inset_m = weight_px / px_per_m;

  } else {

    // Monads: normal line width (4px) and normal shrinkage

    weight = 4;

    var weight_px = 14;

    inset_m = weight_px / px_per_m;

  }

  var sw_px = osToPixel(shiftedEasting + inset_m, northing + inset_m);

  var ne_px = osToPixel(shiftedEasting + size_m - inset_m, northing + size_m - inset_m);

  var sw = map.unproject(sw_px, maxZoom);

  var ne = map.unproject(ne_px, maxZoom);

  const rect = L.rectangle([sw, ne], {
    color: color,
    weight: 3, // Thicker border for tetrads
    fill: true,
    fillColor: color,
    fillOpacity: 0,        // Transparent fill
    interactive: true
  });

  // Set z-index via className

  if (zIndex > 0) {

    rect.setStyle({ className: `z-index-${zIndex}` });

  }

  // Add click handler for popup
  rect.on('click', function() {
    showGridInfo(monadCode, size_m);
  });

  return rect;

}

// Function to show grid information popup
function showGridInfo(monadCode, size) {
  const latin = document.getElementById("latinSelect").value;
  if (latin === "Select") return;
  
  // Get the same year bin filters used by records container
  const selectedBins = getCheckedValues(".bins-control");
  
  // Find all records for this grid square and species
  const gridRecords = allData.filter(row => {
    if ((row.species || row.latinName) !== latin || !row.x || !row.y) return false;
    
    const recordMonad = `${row.x}${row.y}`;
    const recordSize = ["!", ";", "#", "1", "|", ":"].includes(row.type) ? 2000 : 1000;
    const year = parseInt(row.year, 10);
    const yearBin = getYearBin(year);
    
    // Apply same year bin filtering as records container
    if (!selectedBins.includes(yearBin)) return false;
    
    if (size === 2000) {
      // For tetrads, only include actual tetrad records, not monad records
      if (recordSize !== 2000) return false; // Skip monad records
      
      // Check if this tetrad record belongs to the same tetrad
      const x = parseInt(recordMonad.substring(0, 2));
      const y = parseInt(recordMonad.substring(2, 4));
      const tetradX = Math.floor(x / 2) * 2;
      const tetradY = Math.floor(y / 2) * 2;
      const tetradBase = tetradX.toString().padStart(2, '0') + tetradY.toString().padStart(2, '0');
      return tetradBase === monadCode;
    } else {
      // For monads, exact match
      return recordMonad === monadCode;
    }
  });
  
  if (gridRecords.length === 0) {
    L.popup()
      .setLatLng(map.getCenter())
      .setContent(`<div style="font-size: 12px;">No records found</div>`)
      .openOn(map);
    return;
  }
  
  // Calculate year range
  const years = gridRecords
    .map(row => parseInt(row.year, 10))
    .filter(year => !isNaN(year))
    .sort((a, b) => a - b);
  
  const earliestYear = years.length > 0 ? years[0] : 'Unknown';
  const latestYear = years.length > 0 ? years[years.length - 1] : 'Unknown';
  const recordCount = gridRecords.length;
  
  const gridType = size === 2000 ? 'Tetrad' : 'Monad';
  const gridRef = size === 2000 ? (gridRecords[0]?.tetrad || monadCode) : `SD${monadCode}`;
  
  const popupContent = `
    <div style="font-size: 12px; font-family: Arial, sans-serif;">
      <strong>${gridType}: ${gridRef}</strong><br>
      Records: ${recordCount}<br>
      Years: ${earliestYear} - ${latestYear}
    </div>
  `;
  
  // Calculate center of this grid square for popup position
  const easting = parseInt(monadCode.substring(0, 2)) * 1000 + size/2;
  const northing = parseInt(monadCode.substring(2, 4)) * 1000 + size/2;
  const center_px = osToPixel(easting, northing);
  const center_latlng = map.unproject(center_px, maxZoom);
  
  L.popup()
    .setLatLng(center_latlng)
    .setContent(popupContent)
    .openOn(map);
}


function plotGridSquare(monadCode) {

  var easting = parseInt(monadCode.substring(0, 2)) * 1000;

  var northing = parseInt(monadCode.substring(2, 4)) * 1000;

  // Shift grey grid squares 150 meters to the right (200m - 50m left adjustment)
  var shiftedEasting = easting + 150;

  var sw_px = osToPixel(shiftedEasting, northing);

  var ne_px = osToPixel(shiftedEasting + 1000, northing + 1000);

  var sw = map.unproject(sw_px, maxZoom);

  var ne = map.unproject(ne_px, maxZoom);

  return L.rectangle([sw, ne], {
    color: "grey",
    weight: 0.5, // Thin border for grid squares
    fill: false,
    interactive: false
  });

}



// Filtering

function drawFiltered() {
  // console.log("🗺️ Step 2: drawFiltered() called");
  currentLayer.clearLayers();
  const latin = document.getElementById("latinSelect").value;

  if (latin === "Select") {
    // console.log("❌ No species selected, returning");
    return;
  }

  // console.log("📋 Getting selected bins and grids");
  const selectedBins = getCheckedValues(".bins-control");
  const selectedGrids = getCheckedValues(".grids-control");


  


  // Z-index map: newer records on top

  const zIndexMap = {

    "<1930": 1,

    "1930-1969": 2,

    "1970-1986": 3,

    "1987-1999": 4,

    "2000-2019": 5,

    "2020+": 6

  };

  const plotted = new Set();

  // Create separate arrays for map plotting and records display
  const recordsToDisplay = [];
  const recordsForMap = [];

  const sorted = allData
    .filter(row => (row.species || row.latinName) === latin && row.x && row.y)
    .map(row => {
      const year = parseInt(row.year, 10);
      row.year = isNaN(year) ? "" : year;
      row.yearBin = getYearBin(year);
      row.monad = `${row.x}${row.y}`;
      row.size = ["!", ";", "#", "1", "|", ":"].includes(row.type) ? 2000 : 1000;
      row.color = page1Color(year);
      return row;
    })

    .sort((a, b) => {

      // Sort by year ascending so older records are drawn first

      // This ensures newer records appear on top due to higher z-index

      return (a.year || 0) - (b.year || 0);

    });

  sorted.forEach(row => {

    let monadCode = row.monad.replace(/,/g, "");

    const size = row.size;

    const yearBin = row.yearBin;

    const gridType = (size === 1000 ? "monad" : "tetrad");

    // Debug: Log 2020+ records that contribute to summary table count
    if (yearBin === "2020+") {
      console.log(`🟢 2020+ Summary Record: ${row.species || row.latinName}, Year: ${row.year}, Monad: ${monadCode}, Type: ${gridType}, Size: ${size}`);
    }

    // Add to records display if both year bin AND grid type match
    if (selectedBins.includes(yearBin) && selectedGrids.includes(gridType)) {
      recordsToDisplay.push(row);
    }

    // For map plotting, check both year bin and grid type, and prevent duplicates
    if (!selectedBins.includes(yearBin) || !selectedGrids.includes(gridType)) {
      return;
    }

    let plotCode = monadCode;

    if (size === 2000) {

      // Get the tetrad base (even coordinates)

      const x = parseInt(monadCode.substring(0, 2));

      const y = parseInt(monadCode.substring(2, 4));

      const tetradX = Math.floor(x / 2) * 2;

      const tetradY = Math.floor(y / 2) * 2;

      plotCode = tetradX.toString().padStart(2, '0') + tetradY.toString().padStart(2, '0');

    }

    const key = plotCode + "|" + yearBin + "|" + size;

    if (!plotted.has(key)) {
      plotted.add(key);
      const zIndex = zIndexMap[yearBin] || 0;
      const rect = plotMonad(plotCode, size, row.color, "", zIndex);
      rect.addTo(currentLayer);
      recordsForMap.push(row);

      // Debug: Log when 2020+ records are actually plotted
      // if (yearBin === "2020+") {
      //   console.log(`📌 PLOTTED 2020+: ${row.species || row.latinName}, Year: ${row.year}, PlotCode: ${plotCode}, Type: ${gridType}`);
      // }
    } else {
      // Allow @ records to be displayed even if there's a duplicate key
      if (row.type === "@") {
        recordsForMap.push(row);
      }
    }

  });

  // Display ALL records in the records container (not just unique map records)
  displayRecords(recordsToDisplay);

}

// ... (rest of the code remains the same)

function displayRecords(records) {
  // console.log("📋 Step 3: displayRecords() called with", records.length, "records");
  const recordsContent = document.getElementById("records-content");

  

  if (records.length === 0) {

    // Still show species header information even when no records
    const latin = document.getElementById("latinSelect").value;
    if (latin && latin !== "Select") {
      // Create a simple header display without depending on summary table
      const recordsContent = document.getElementById("records-content");
      
      // Get species info from metadata - try both sources
      // console.log("🔍 DEBUG: window.metaLookup exists:", !!window.metaLookup);
      // console.log("🔍 DEBUG: window.metadataLookup exists:", !!window.metadataLookup);
      
      let meta = null;
      
      // Try window.metaLookup first (from d3.js)
      if (window.metaLookup) {
        meta = window.metaLookup.get(latin);
        // console.log("🔍 DEBUG: Tried window.metaLookup, got:", !!meta);
      }
      
      // Fallback to window.metadataLookup (from index.html)
      if (!meta && window.metadataLookup) {
        meta = window.metadataLookup.get(latin);
        // console.log("🔍 DEBUG: Tried window.metadataLookup, got:", !!meta);
      }
      
      // console.log("🔍 DEBUG: Final metadata for", latin, ":", meta);
      
      let speciesId = meta ? (meta.ID || meta.id || "") : "";
      let authority = meta ? (meta.authority || "") : "";
      let redList = meta ? (meta.RedList || "") : "";
      let status = meta ? (meta.status || "") : "";
      let writeUp = meta ? (meta.WriteUp || "") : "";
      
      // console.log("📝 DEBUG: WriteUp found:", !!writeUp, "for species:", latin);
      
      // Get English name from species info
      const speciesInfoContent = document.getElementById("species-info-content");
      let fullName = speciesInfoContent ? speciesInfoContent.textContent.trim() : "";
      let englishName = fullName.includes(" - ") ? fullName.split(" - ")[1] : "";
      
      // Get frequency data from summary table
      let value2020Plus = 0;
      let valuePre2020 = 0;
      let difference = 0; // Initialize difference early
      let frequency = ""; 
      const summaryRows = document.querySelectorAll("#summaryTable tbody tr");
      summaryRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 3) {
          const yearBin = cells[0].textContent.trim();
          const total = parseInt(cells[2].textContent.trim()) || 0;
          if (yearBin === "2020+") {
            value2020Plus = total;
          } else if (yearBin === "<2020") {
            valuePre2020 = total;
          }
        }
      });
      
      // Store summary data in global variable
      window.summaryTableData = {
        species: latin,
        yearBins: {},
        frequency: frequency,
        difference: difference,
        value2020Plus: value2020Plus,
        valuePre2020: valuePre2020
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
      
      
      // Create arrow display
      let arrowHtml = "";
      let differenceDisplay = "";
      if (difference > 0) {
        arrowHtml = `<span style="color: green; font-size: 26px;">▲</span>`;
        differenceDisplay = `+${difference}`;
      } else if (difference < 0) {
        arrowHtml = `<span style="color: red; font-size: 26px;">▼</span>`;
        differenceDisplay = `${difference}`;
      } else {
        arrowHtml = `<span style="color: black; font-size: 26px;">◄─►</span>`;
        differenceDisplay = "0";
      }
      
      // Create header HTML
      const headerHtml = `<div style="margin-bottom: 8px; font-size: 13px; font-weight: bold;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div>${speciesId} ${latin} ${authority}</div>
          ${redList ? `<div style="background: black; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${redList}</div>` : ""}
        </div>
        <div style="margin-bottom: 4px;">
          <em style="font-style: italic; font-weight: normal;">${englishName}</em>
        </div>
        ${status ? `<div style="margin-bottom: 4px; font-size: 14px; color: ${status.toLowerCase() === 'native' ? 'black' : 'red'}; font-weight: normal;">${status.charAt(0).toUpperCase() + status.slice(1)}${writeUp ? ` - ${writeUp}` : ""}</div>` : ""}
        ${writeUp && !status ? `<div style="margin-bottom: 4px; font-size: 14px; color: #333; font-weight: normal;">${writeUp}</div>` : ""}
        <div style="margin-bottom: 4px;">
          ${value2020Plus}, ${frequency}
        </div>
        <div>
          ${arrowHtml} ${differenceDisplay}
        </div>
      </div>`;
      
      if (writeUp) {
        // console.log("📝 WriteUp being written to records container for:", latin);
      }
      
      recordsContent.innerHTML = headerHtml + "<p>No records to display</p>";
    } else {
      recordsContent.innerHTML = "<p>No records to display</p>";
    }

    return;

  }

  // ... (rest of the code remains the same)


  // Sort by year descending (newest first)
  const sorted = records.sort((a, b) => (b.year || 0) - (a.year || 0));

  // Filter out identical records (same year, grid, location, recorder)
  const uniqueRecords = [];
  const seenRecords = new Set();
  
  sorted.forEach(row => {
    const type = row.size === 2000 ? "Tetrad" : "Monad";
    let gridRef = "";
    
    if (type === "Tetrad") {
      gridRef = row.tetrad || "";
    } else {
      gridRef = row.monad || "";
    }
    
    let location = row.location || "";
    let recorder = row.recorder || "";
    
    // Create a unique key based on all identifying fields
    const uniqueKey = `${row.year || ""}|${gridRef}|${location}|${recorder}`;
    
    if (!seenRecords.has(uniqueKey)) {
      seenRecords.add(uniqueKey);
      uniqueRecords.push(row);
    }
  });

  let html = "<table style='width: 100%; font-size: 11px; border-collapse: collapse;'>";

  html += "<tr style='border-bottom: 1px solid #ccc;'><th style='text-align: left; padding: 4px;'>Year</th><th style='text-align: left; padding: 4px;'>Grid</th><th style='text-align: left; padding: 4px;'>Location</th><th style='text-align: left; padding: 4px;'>Recorder</th></tr>";

  

  uniqueRecords.forEach(row => {

    const type = row.size === 2000 ? "Tetrad" : "Monad";

    

    // Show monad or tetrad identifier

    let gridRef = "";

    if (type === "Tetrad") {

      gridRef = row.tetrad || ""; // e.g. SD47W

    } else {

      gridRef = row.monad || ""; // e.g. SD4567

    }

    

    // Use the actual field names from your CSV headers

    let location = row.location || "";

    let recorder = row.recorder || "";
    
    // Create formatted date string if day and month are available
    let dateString = "";
    if (row.day && row.month) {
      // Format month name
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthName = monthNames[parseInt(row.month) - 1] || row.month;
      dateString = ` (${row.day}/${monthName})`;
    }
    
    // Combine location with date
    const locationWithDate = location + dateString;

    

    html += `<tr style='border-bottom: 1px solid #eee;'>
      <td style='padding: 4px;'>${row.year || ""}</td>
      <td style='padding: 4px;'>${gridRef}</td>
      <td style='padding: 4px;'>${locationWithDate}</td>
      <td style='padding: 4px;'>${recorder}</td>
    </tr>`;

  });

  

  html += "</table>";
  recordsContent.innerHTML = html;
  
  // Restore the header after updating records
  if (typeof updateRecordsHeader === 'function') {
    updateRecordsHeader();
  }
}



// =========================

// INIT FUNCTION

// =========================



let map;

let currentLayer;

let gridLayer;



function initLeaflet() {



  // Map setup

  map = L.map('map', {

    crs: L.CRS.Simple,

    minZoom: 0,

    maxZoom: maxZoom,

    zoomSnap: 0.5,

    zoomDelta: 0.5,

    zoomControl: true

  });



  map.setView([worldH / 2, worldW / 2], 4.5);



  var southWest = map.unproject([0, worldH], maxZoom);

  var northEast = map.unproject([worldW, 0], maxZoom);

  var bounds = new L.LatLngBounds(southWest, northEast);



  var tiles = L.gridLayer({

    tileSize: 256,

    noWrap: true,

    bounds: bounds,

    maxNativeZoom: maxZoom

  });



  tiles.createTile = function (coords, done) {

    var img = document.createElement('img');

    img.style.width = '256px';

    img.style.height = '256px';

    img.onload = function () { done(null, img); };

    img.onerror = function () { done(null, img); };

    img.src = tmsUrl('tiles_output/{z}/{x}/{y}.png', coords);

    return img;

  };



  tiles.addTo(map);

  map.fitBounds(bounds);

  map.setMaxBounds(bounds);

  map.setMinZoom(map.getZoom());



  currentLayer = L.layerGroup().addTo(map);

  gridLayer = L.layerGroup().addTo(map);



  // Create custom control container for all map buttons
  const customControls = L.control({ position: 'topleft' });
  customControls.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-map-controls');
    container.style.display = 'flex';
    container.style.gap = '2px';
    
    // Add zoom in button
    const zoomIn = L.DomUtil.create('button', 'map-control-btn');
    zoomIn.innerHTML = '+';
    zoomIn.style.width = '30px';
    zoomIn.style.height = '30px';
    zoomIn.style.fontSize = '18px';
    zoomIn.style.borderRadius = '4px';
    zoomIn.addEventListener('click', () => map.zoomIn());
    container.appendChild(zoomIn);
    
    // Add zoom out button
    const zoomOut = L.DomUtil.create('button', 'map-control-btn');
    zoomOut.innerHTML = '-';
    zoomOut.style.width = '30px';
    zoomOut.style.height = '30px';
    zoomOut.style.fontSize = '18px';
    zoomOut.style.borderRadius = '4px';
    zoomOut.addEventListener('click', () => map.zoomOut());
    container.appendChild(zoomOut);
    
    // Add fit button
    const fitBtn = L.DomUtil.create('button', 'map-control-btn');
    fitBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:20px; height:20px; fill:currentColor;"><rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="14" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="14" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="0" x2="6" y2="3" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="0" x2="18" y2="3" stroke="currentColor" stroke-width="1.5"/><line x1="0" y1="6" x2="3" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="0" y1="18" x2="3" y2="18" stroke="currentColor" stroke-width="1.5"/></svg>';
    fitBtn.style.width = '30px';
    fitBtn.style.height = '30px';
    fitBtn.style.borderRadius = '4px';
    fitBtn.title = 'Fit to data';
    fitBtn.addEventListener('click', () => {
      map.invalidateSize();
      setTimeout(() => {
        map.fitBounds(bounds, { padding: [20, 20] });
      }, 100);
    });
    container.appendChild(fitBtn);
    
    return container;
  };
  customControls.addTo(map);

  // Hide default zoom controls
  map.zoomControl.remove();

  // Add coordinate grid labels
  function addGridLabels() {
    // Clear existing labels more thoroughly
    const layersToRemove = [];
    map.eachLayer(function(layer) {
      if (layer.options && layer.options.icon && layer.options.icon.options && layer.options.icon.options.className === 'grid-label') {
        layersToRemove.push(layer);
      }
    });
    
    // Remove all found label layers
    layersToRemove.forEach(layer => {
      map.removeLayer(layer);
    });

    // Calculate current zoom scale
    const zoom = map.getZoom();
    const scale = Math.pow(2, zoom);
    
    // Base font size that scales with zoom (50% larger)
    const fontSize = Math.max(12, Math.min(24, 18 * (zoom / 3)));
    
    // X-axis labels (bottom) - 43 to 51, shifted half square right and 3/16 square down
    for (let x = 43; x <= 51; x++) {
      const easting = (x + 0.5) * 1000; // Shift half square right
      const pixel = osToPixel(easting, 69625); // Move down by 3/16 square (70000 - 375)
      const latLng = map.unproject(pixel, maxZoom);
      
      const marker = L.marker(latLng, {
        icon: L.divIcon({
          className: 'grid-label',
          html: `<div style="font-size: ${fontSize}px; color: #333; text-align: center;">${x}</div>`,
          iconSize: [30, 20],
          iconAnchor: [15, 15]
        })
      }).addTo(map);
    }
    
    // Y-axis labels (left) - 70 to 81, shifted quarter square up and moved slightly in from left edge
    for (let y = 70; y <= 81; y++) {
      const northing = (y + 0.25) * 1000; // Shift quarter square up (lower than before)
      const pixel = osToPixel(42900, northing); // Move another 100m left to 42900
      const latLng = map.unproject(pixel, maxZoom);
      
      const marker = L.marker(latLng, {
        icon: L.divIcon({
          className: 'grid-label',
          html: `<div style="font-size: ${fontSize}px; color: #333; text-align: center;">${y}</div>`,
          iconSize: [30, 20],
          iconAnchor: [15, 15]
        })
      }).addTo(map);
    }
  }

  // Add labels on zoom change
  map.on('zoomend', addGridLabels);
  
  // Add labels on species change
  const latinSelect = document.getElementById("latinSelect");
  if (latinSelect) {
    latinSelect.addEventListener("change", function() {
      setTimeout(addGridLabels, 200); // Delay to allow map to update
    });
  }
  
  // Add labels on autofit button click
  const fitControl = document.querySelector(".leaflet-control-fit");
  if (fitControl) {
    fitControl.addEventListener("click", function() {
      setTimeout(addGridLabels, 200); // Delay to allow map to update
    });
  }
  
  // Add initial labels
  setTimeout(addGridLabels, 100);



  // Photo controls

  document.getElementById("toggleThumbs").addEventListener("click", () => {
    const viewer = document.querySelector(".viewer");
    const thumbs = document.querySelector(".thumbnails");

    if (thumbs.style.display === "none") {
      thumbs.style.display = "flex";
      viewer.style.display = "none";
      // Add thumbnail-view class to photos container
      document.getElementById("photos").classList.add("thumbnail-view");
    } else {
      thumbs.style.display = "none";
      viewer.style.display = "flex";
      // Remove thumbnail-view class from photos container
      document.getElementById("photos").classList.remove("thumbnail-view");
      
      // Ensure main image is displayed when switching back
      if (currentMatches.length > 0 && currentIndex >= 0) {
        const img = viewer.querySelector("img");
        if (!img) {
          showImage(currentIndex);
        }
      }
    }
  });



  document.getElementById("fullscreenBtn").addEventListener("click", () => {

    const img = document.querySelector(".viewer img");

    if (!img) return;

    if (!document.fullscreenElement) {
      img.requestFullscreen().catch(err => {});
    } else {
      document.exitFullscreen();
    }

  });



  document.getElementById("prevBtn").addEventListener("click", () => {

    if (currentMatches.length > 0) {

      currentIndex = (currentIndex - 1 + currentMatches.length) % currentMatches.length;

      showImage(currentIndex);

    }

  });



  document.getElementById("nextBtn").addEventListener("click", () => {

    if (currentMatches.length > 0) {

      currentIndex = (currentIndex + 1) % currentMatches.length;

      showImage(currentIndex);

    }

  });



  map.invalidateSize();

}

