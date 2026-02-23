// =========================
// shared.js
// =========================


let allData = [];
let photoData = [];
let currentMatches = [];
let currentIndex = 0;

// Global D3 concurrency flag - accessible from all scripts
window.d3AtlasInProgress = false;

// Function to update Records container header by reading directly from the page
function updateRecordsHeader() {
  const recordsContent = document.getElementById("records-content");
  if (!recordsContent) {
    return;
  }
  
  // Get species name from the top bar (species-info-content)
  const speciesInfoContent = document.getElementById("species-info-content");
  let fullName = speciesInfoContent ? speciesInfoContent.textContent.trim() : "";
  
  // Extract just the Latin name (before " - ")
  const latinName = fullName.split(" - ")[0];
  
  // Extract English name (after " - ")
  const englishName = fullName.includes(" - ") ? fullName.split(" - ")[1] : "";
  
  // Get ID, authority, and RedList from metadata
  let speciesId = "";
  let authority = "";
  let redList = "";
  let status = "";
  let writeUp = "";
  let phytogeography = "";
  const meta = window.metaLookup ? window.metaLookup.get(latinName) : null;
  if (meta) {
    speciesId = meta.ID || meta.id || "";
    authority = meta.authority || "";
    redList = meta.RedList || "";
    status = meta.status || "";
    writeUp = meta.WriteUp || "";
    phytogeography = meta.Phytogeography || "";
  }
  
  // Get 2020+ value from summary table
  let value2020Plus = 0;
  let valuePre2020 = 0;
  let summaryTableLoaded = false;
  const summaryRows = document.querySelectorAll("#summaryTable tbody tr");
  summaryRows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 3) {
      const yearBin = cells[0].textContent.trim();
      const total = parseInt(cells[2].textContent.trim()) || 0; // Changed from cells[1] to cells[2]
      if (yearBin === "2020+") {
        value2020Plus = total;
        summaryTableLoaded = true;
      } else if (yearBin === "<2020") {
        valuePre2020 = total;
      }
    }
  });
  
  // Only update if we have a species name AND the summary table is loaded
  if (!latinName || latinName === "Select a species to view information" || !summaryTableLoaded) {
    return;
  }
  
  // Calculate difference
  const difference = value2020Plus - valuePre2020;
  
  
  // Calculate frequency based on 2020+ value
  let frequency = "";
  if (value2020Plus === 0) {
    frequency = "Not recorded";
  } else if (value2020Plus <= 5) {
    frequency = "Rare";
  } else if (value2020Plus <= 15) {
    frequency = "Occasional";
  } else if (value2020Plus <= 40) {
    frequency = "Frequent";
  } else {
    frequency = "Common";
  }
  
  // Determine arrow and color based on difference
  let arrowHtml = "";
  let differenceDisplay = "";
  if (difference > 0) {
    arrowHtml = `<span style="color: green; font-size: 26px;">▲</span>`;
    differenceDisplay = `+${difference}`;
  } else if (difference < 0) {
    arrowHtml = `<span style="color: red; font-size: 26px;">▼</span>`;
    differenceDisplay = difference.toString();
  } else {
    arrowHtml = `<span style="color: black; font-size: 26px;">◄─►</span>`;
    differenceDisplay = difference.toString();
  }
  
  const headerHtml = `<div style="margin-bottom: 8px; font-size: 13px; font-weight: bold;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
      <div>${speciesId} ${latinName} ${authority}</div>
      ${redList ? `<div style="background: black; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${redList}</div>` : ""}
    </div>
    <div style="margin-bottom: 4px;">
      <em style="font-style: italic; font-weight: normal;">${englishName}</em>
    </div>
    ${status ? `<div style="margin-bottom: 4px; font-size: 14px; color: ${status.toLowerCase() === 'native' ? 'black' : 'red'}; font-weight: normal;">${status.charAt(0).toUpperCase() + status.slice(1)}</div>` : ""}
    <div style="margin-bottom: 4px;">
      ${value2020Plus}, ${frequency}
    </div>
    <div>
      ${arrowHtml} ${differenceDisplay}
    </div>
    ${phytogeography ? `<div style="margin-top: 4px; font-size: 12px; color: #666; font-weight: normal;">🌿 ${phytogeography}</div>` : ""}
    ${writeUp ? `<div style="margin-top: 4px; font-size: 12px; color: #333; font-style: italic;">${writeUp}</div>` : ""}
  </div>`;
  
  // Remove existing header if present, then add new one
  const existingHeader = recordsContent.querySelector('div[style*="margin-bottom: 8px"]');
  if (existingHeader) {
    existingHeader.remove();
  }
  
  // Add new header at the beginning
  recordsContent.insertAdjacentHTML('afterbegin', headerHtml);
  
  // Write day and month data for selected species
  if (latinName && latinName !== "Select a species to view information") {
    
    // Show all species that have day/month data
    const speciesWithDates = window.allRecords ? window.allRecords.filter(record => 
      record.year && record.month && record.day
    ).map(record => record.species || record.latinName).filter((name, index, self) => name && self === index) : [];
    
    
    const speciesRecords = window.allRecords ? window.allRecords.filter(record => 
      (record.species || record.latinName) === latinName && 
      record.year && record.month && record.day
    ) : [];
    
    if (speciesRecords.length > 0) {
      speciesRecords.forEach((record, index) => {
      });
      
      // Create phenology chart directly here
      if (window.drawPhenologyChart) {
        window.drawPhenologyChart(latinName);
      }
    } else {
      // Still call phenology chart with empty data
      if (window.drawPhenologyChart) {
        window.drawPhenologyChart(latinName);
      }
    }
  }
}

// Apply black borders to summary table
function styleSummaryTable() {
  const summaryTable = document.querySelector("#summaryTable");
  if (summaryTable) {
    summaryTable.style.border = "none"; // Remove all borders
    summaryTable.style.borderCollapse = "collapse";
    summaryTable.style.borderSpacing = "0";
    summaryTable.style.background = "white";
    summaryTable.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    
    // Style header cells - only bottom border
    const headers = summaryTable.querySelectorAll("th");
    headers.forEach(th => {
      th.style.border = "none";
      th.style.borderBottom = "2px solid #000"; // Keep only bottom border
      th.style.padding = "8px 12px";
    });
    
    // Style data cells - no borders
    const cells = summaryTable.querySelectorAll("td");
    cells.forEach(cell => {
      cell.style.border = "none"; // Remove all borders
      cell.style.padding = "8px 12px";
    });
    
  }
}

// Helper functions
function getCheckedValues(selector) {
  return Array.from(document.querySelectorAll(selector + " input[type=checkbox]:checked"))
    .map(cb => cb.value);
}

function getYearBin(year) {
  if (year < 1930) return "<1930";
  if (year <= 1969) return "1930-1969";
  if (year <= 1986) return "1970-1986";
  if (year <= 1999) return "1987-1999";
  if (year <= 2019) return "2000-2019";
  return "2020+";
}

function getPrePostBin(year) {
  return year < 2020 ? "<2020" : "2020+";
}

function showLeafletPage() {
  document.getElementById('leafletViewer').style.display = 'flex';
  document.getElementById('d3Viewer').style.display = 'none';
  document.getElementById('photosViewer').style.display = 'none';
  document.getElementById('galleryPage').style.display = 'none';
}

function showD3Page() {
  document.getElementById('leafletViewer').style.display = 'none';
  document.getElementById('photosViewer').style.display = 'none';
  document.getElementById('galleryPage').style.display = 'none';
  document.getElementById('d3Viewer').style.display = 'flex';
  
  // Check if D3 atlas is already loaded AND if content is already displayed
  const atlasElement = document.getElementById('atlas');
  const currentContent = atlasElement.innerHTML;
  
  const speciesInfoContent = document.getElementById("species-info-content");
  const fullName = speciesInfoContent ? speciesInfoContent.textContent.trim() : "";
  const latinName = fullName.split(" - ")[0];
  
  if (latinName && latinName !== "Select a species to view information" && window.drawPhenologyChart) {
    window.drawPhenologyChart(latinName);
  }
  
  if (window.d3AtlasLoaded && window.cachedAtlasContent && currentContent === window.cachedAtlasContent) {
    // D3 atlas already loaded and content is already displayed - no action needed
  } else if (window.d3AtlasLoaded && window.cachedAtlasContent) {
    // D3 atlas already loaded, restoring from cache
    atlasElement.innerHTML = window.cachedAtlasContent;
  } else {
    // First time loading D3 atlas, rendering all species
    drawD3Atlas(null, true, "allYearsOnly");
  }
}

function showPhotosPage() {
  document.getElementById('leafletViewer').style.display = 'none';
  document.getElementById('d3Viewer').style.display = 'none';
  document.getElementById('galleryPage').style.display = 'none';
  document.getElementById('photosViewer').style.display = 'flex';
  
  // Check if photos gallery is already loaded
  if (window.photosGalleryLoaded && window.cachedPhotosContent) {
    // Photos gallery already loaded, using cache
    document.getElementById('photosGallery').innerHTML = window.cachedPhotosContent;
  } else {
    // First time loading photos gallery, calling drawPhotosGallery
    drawPhotosGallery();
  }
}

function showStatisticsPage() {
  document.getElementById('leafletViewer').style.display = 'none';
  document.getElementById('d3Viewer').style.display = 'none';
  document.getElementById('photosViewer').style.display = 'none';
  document.getElementById('galleryPage').style.display = 'block';
  
  // Update navigation active state
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelectorAll('nav a')[3].classList.add('active'); // Statistics link
  
  // Hide species navigation buttons (not needed on statistics page)
  document.getElementById('speciesNavButtons').style.display = 'none';
  
  // Render statistics map
  if (typeof renderStatisticsMap === 'function') {
    renderStatisticsMap();
  }
}

function updateMap() {
  const activeBins = [];
  document.querySelectorAll(".bins-control input[type=checkbox]").forEach(box => {
    if (box.checked) activeBins.push(box.value);
  });

  const activeGrids = [];
  document.querySelectorAll(".grids-control input[type=checkbox]").forEach(box => {
    if (box.checked) activeGrids.push(box.value);
  });

  // Only draw grid if gridLayer exists (i.e., after initLeaflet has run)
  if (typeof gridLayer !== "undefined" && gridLayer) {
    drawGridOverlay(activeGrids);
  }
}

function drawGridOverlay(selectedGridTypes) {
  if (typeof gridLayer === "undefined" || !gridLayer) {
    return;
  }
  gridLayer.clearLayers();

  if (selectedGridTypes.length === 0) {
    return;
  }

  const displayed = new Set();

  // Draw ALL unique monad codes from entire dataset (not filtered by species)
  // This creates a complete background grid showing all survey squares
  allData.forEach(row => {
    if (!row.x || !row.y) return;

    const monadCode = `${row.x}${row.y}`;

    // Draw grid (1km x 1km)
    if (selectedGridTypes.includes("grid")) {
      if (!displayed.has(`grid-${monadCode}`)) {
        displayed.add(`grid-${monadCode}`);
        plotGridSquare(monadCode).addTo(gridLayer);
      }
    }
  });
}

// =========================
// INIT FUNCTION
// =========================

function initShared() {

  // Load main CSV
  fetch('records.csv?t=' + Date.now())  // Add timestamp to prevent caching
    .then(response => response.text())
    .then(csvText => {
      allData = Papa.parse(csvText, { header: true }).data;

      const latinSelectEl = document.getElementById("latinSelect");
      
      
      // Add change event listener to dropdown
      latinSelectEl.addEventListener("change", function() {
        const speciesName = this.value;
        
        // Write metadata for selected species with ^^^^^^ prefix
        if (speciesName && speciesName !== "Select") {
          // Get the metadata for this species
          const metadata = window.metadataLookup ? window.metadataLookup.get(speciesName) : null;
          
        } else {
          // No valid species selected or default option chosen
        }
        
        // Update everything when species is selected - IN CORRECT ORDER
        
        // 1. Update map FIRST
        drawFiltered();
        
        // 2. Update D3 atlas SECOND  
        drawD3Atlas(speciesName, true);
        
        // 3. Update records header THIRD (after summary table is populated)
        setTimeout(() => {
          updateRecordsHeader();
          
          // 4. Update phenology chart FOURTH
          if (typeof drawPhenologyChart === 'function') {
            try {
              drawPhenologyChart(speciesName);
            } catch (error) {
            }
          } else {
          }
          
          // 5. Update photos FIFTH - REMOVED to prevent clearing photos
          // updateCarousel(); // This was clearing the photos immediately after loading
        }, 500);
        
        // Update species info container immediately
        const speciesInfoContent = document.getElementById("species-info-content");
        
        if (speciesInfoContent) {
          if (speciesName && speciesName !== "Select") {
            speciesInfoContent.innerHTML = `<strong>${speciesName}</strong>`;
          } else {
            speciesInfoContent.innerHTML = "Select a species to view information";
          }
        }
      });
      
      const latinSet = new Set(allData.map(r => r.species || r.latinName).filter(Boolean));
      const latinNames = Array.from(latinSet).sort((a, b) => a.localeCompare(b));

      latinSelectEl.innerHTML = '<option value="Select">Select</option>';
      latinNames.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        latinSelectEl.appendChild(opt);
      });
      
      // Simple search functionality
      setTimeout(() => {
        const speciesSearchInput = document.getElementById("speciesSearch");
        if (speciesSearchInput) {
          
          speciesSearchInput.addEventListener("keyup", function() {
            const searchTerm = this.value.toLowerCase();
            const dropdown = document.getElementById("latinSelect");
            
            if (!dropdown) return;
            
            // Only run search if dropdown is fully populated and not during other operations
            if (dropdown.options.length < 10) return; // Wait for full population
            
            // Simple approach: filter existing options
            const options = dropdown.getElementsByTagName("option");
            
            for (let i = 0; i < options.length; i++) {
              const option = options[i];
              const text = option.textContent.toLowerCase();
              
              // Show if matches or if it's the default option
              if (searchTerm === "" || text.includes(searchTerm)) {
                option.style.display = "";
              } else {
                option.style.display = "none";
              }
            }
          });
        }
      }, 1500); // Wait longer to ensure dropdown is fully populated
    })
    .catch(err => {
      // Failed to load CSV
    });

  // Load photos.json
  fetch("photos.json")
    .then(res => res.json())
    .then(data => { photoData = data; })
    .catch(err => {
      // Failed to load JSON
    });

  // Set default checkbox states (all on except tetrad)
  setTimeout(() => {
    
    // Set all year bin checkboxes to checked
    document.querySelectorAll(".bins-control input[type=checkbox]").forEach(box => {
      box.checked = true;
    });
    
    // Set all grid checkboxes to checked except tetrad
    document.querySelectorAll(".grids-control input[type=checkbox]").forEach(box => {
      box.checked = box.value !== "tetrad";
    });
    
  }, 500);

  // Apply button is hidden - all functionality is now dynamic via dropdown change

  // Show All Species button for D3 Atlas
  const showAllBtn = document.getElementById("showAllSpeciesBtn");
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      // Reset pagination
      if (typeof currentPage !== "undefined") {
        currentPage = 1;
      }
      drawD3Atlas(null, true);
    });
  }


  // Previous/Next Species functionality
  const prevBtn = document.getElementById("prevSpecies");
  const nextBtn = document.getElementById("nextSpecies");
  
  
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      const latinSelect = document.getElementById("latinSelect");
      if (latinSelect && latinSelect.selectedIndex > 0) {
        // Reset D3 concurrency flag IMMEDIATELY for navigation
        window.d3AtlasInProgress = false;
        
        latinSelect.selectedIndex--;
        latinSelect.dispatchEvent(new Event("change"));
        
        // If we're in thumbnail view, switch to main photo first, then back to thumbnails
        const thumbs = document.querySelector(".thumbnails");
        const viewer = document.querySelector(".viewer");
        if (thumbs && thumbs.style.display !== "none") {
          // Switch to main photo view
          thumbs.style.display = "none";
          viewer.style.display = "flex";
          
          // Then switch back to thumbnails after a brief delay
          setTimeout(() => {
            const speciesName = latinSelect.value;
            if (speciesName && speciesName !== "Select" && typeof window.updateCarousel === 'function') {
              window.updateCarousel(speciesName, false); // Pass false to show main photo
            }
          }, 100);
        }
      }
    });
    
    nextBtn.addEventListener("click", () => {
      const latinSelect = document.getElementById("latinSelect");
      if (latinSelect && latinSelect.selectedIndex < latinSelect.options.length - 1) {
        // Reset D3 concurrency flag IMMEDIATELY for navigation
        window.d3AtlasInProgress = false;
        
        latinSelect.selectedIndex++;
        latinSelect.dispatchEvent(new Event("change"));
        
        // If we're in thumbnail view, switch to main photo first, then back to thumbnails
        const thumbs = document.querySelector(".thumbnails");
        const viewer = document.querySelector(".viewer");
        if (thumbs && thumbs.style.display !== "none") {
          // Switch to main photo view
          thumbs.style.display = "none";
          viewer.style.display = "flex";
          
          // Then switch back to thumbnails after a brief delay
          setTimeout(() => {
            const speciesName = latinSelect.value;
            if (speciesName && speciesName !== "Select" && typeof window.updateCarousel === 'function') {
              window.updateCarousel(speciesName, false); // Pass false to show main photo
            }
          }, 100);
        }
      }
    });
  } else {
    // Previous/Next buttons not found - may be hidden by CSS
  }
}

// Add event listener for "All Years" tickbox - SIMPLE DIRECT APPROACH
document.addEventListener('DOMContentLoaded', function() {
  
  // Wait longer than checkbox replacement script (1500ms + 500ms buffer)
  setTimeout(() => {
    
    // Find All Years checkbox
    const allYearsCheckbox = document.querySelector('input[value="All Years"]');
    
    if (allYearsCheckbox) {
      
      // Try both change and click events
      allYearsCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        
        // Find 2020+ checkbox specifically
        const year2020Checkbox = document.querySelector('input[value="2020+"]');
        
        if (year2020Checkbox) {
          year2020Checkbox.checked = isChecked;
        }
        
        // Also find all other year checkboxes
        const otherYears = ['2000-2019', '1987-1999', '1970-1986', '1930-1969', '<1930'];
        otherYears.forEach(yearValue => {
          const checkbox = document.querySelector(`input[value="${yearValue}"]`);
          if (checkbox) {
            checkbox.checked = isChecked;
          }
        });
        
        // Update map
        if (typeof drawFiltered === 'function') {
          drawFiltered();
        }
      });
      
      // Add click event as backup
      allYearsCheckbox.addEventListener('click', function() {
        setTimeout(() => {
          const isChecked = this.checked;
          
          // Find 2020+ checkbox specifically
          const year2020Checkbox = document.querySelector('input[value="2020+"]');
          
          if (year2020Checkbox) {
            year2020Checkbox.checked = isChecked;
          }
          
          // Find <2020 checkbox specifically
          const pre2020Checkbox = document.querySelector('input[value="<2020"]');
          
          if (pre2020Checkbox) {
            pre2020Checkbox.checked = isChecked;
          }
          
          // Also find all other year checkboxes
          const otherYears = ['2000-2019', '1987-1999', '1970-1986', '1930-1969', '<1930'];
          otherYears.forEach(yearValue => {
            const checkbox = document.querySelector(`input[value="${yearValue}"]`);
            if (checkbox) {
              checkbox.checked = isChecked;
            }
          });
          
          // Update map
          if (typeof drawFiltered === 'function') {
            drawFiltered();
          }
        }, 10);
      });
      
      
      // Add event listeners to all other year checkboxes to uncheck "All Years" when they're unchecked
      const otherYears = ['2020+', '<2020', '2000-2019', '1987-1999', '1970-1986', '1930-1969', '<1930'];
      otherYears.forEach(yearValue => {
        const checkbox = document.querySelector(`input[value="${yearValue}"]`);
        if (checkbox) {
          checkbox.addEventListener('change', function() {
            if (!this.checked) {
              // Uncheck "All Years" if this checkbox is unchecked
              const allYearsCheckbox = document.querySelector('input[value="All Years"]');
              if (allYearsCheckbox && allYearsCheckbox.checked) {
                allYearsCheckbox.checked = false;
              }
            } else {
              // Check if all year checkboxes are now checked, and if so, check "All Years"
              const allYearsCheckbox = document.querySelector('input[value="All Years"]');
              if (allYearsCheckbox && !allYearsCheckbox.checked) {
                const allOtherChecked = otherYears.every(year => {
                  const cb = document.querySelector(`input[value="${year}"]`);
                  return cb && cb.checked;
                });
                
                if (allOtherChecked) {
                  allYearsCheckbox.checked = true;
                }
              }
            }
            
            // Update Records container when year checkbox changes
            updateRecordsHeader();
          });
        }
      });
      
      // Special handling for <2020 checkbox
      const pre2020Checkbox = document.querySelector('input[value="<2020"]');
      if (pre2020Checkbox) {
        pre2020Checkbox.addEventListener('change', function() {
          const isChecked = this.checked;
          
          // Find all year checkboxes below <2020
          const belowYears = ['2000-2019', '1987-1999', '1970-1986', '1930-1969', '<1930'];
          
          belowYears.forEach(yearValue => {
            const checkbox = document.querySelector(`input[value="${yearValue}"]`);
            if (checkbox) {
              checkbox.checked = isChecked;
            }
          });
          
          // Update map
          if (typeof drawFiltered === 'function') {
            drawFiltered();
          }
        });
      }
      
    } else {
      // All Years checkbox NOT found!
      // List all checkboxes to debug
      const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
      allCheckboxes.forEach((cb, index) => {
        // Checkbox found
      });
    }
  }, 2000); // Wait 2000ms (after the 1500ms replacement script)
});

