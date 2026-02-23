// =========================
// Photos Gallery Functions
// =========================


// Cache variables to prevent reloading (these are now set as window variables for shared.js access)
// let photosGalleryLoaded = false;
// let cachedPhotosContent = null;

function drawPhotosGallery() {
  try {
    
    // Check if photosGallery element exists
    const galleryElement = document.getElementById('photosGallery');
    if (!galleryElement) {
      return;
    }
    
    // Clear gallery display
    d3.select("#photosGallery").html("");
    
    // Load all data including photos.json
    Promise.all([
      d3.csv("metadata.csv"),
      d3.csv("records.csv"),
      fetch("photos.json").then(res => res.json())
    ]).then(([metadata, records, photoData]) => {
      
      // Create metadata lookup
      const metaLookup = new Map();
      
      metadata.forEach(meta => {
        // Check what field contains the species name
        const speciesField = meta.latin || meta.species || meta.Latin || meta.Species;
        if (speciesField) {
          metaLookup.set(speciesField, meta);
        }
      });
      
      
      // Group records by species
      const speciesGroups = d3.group(records, d => d.latin || d.species || d.Latin || d.Species);
      
      // Create grid container for all species photos (no pagination)
      const gridContainer = d3.select("#photosGallery")
        .append("div")
        .attr("class", "photos-grid");
      
      // Use metadata order instead of alphabetical
      const speciesInMetadataOrder = [];
      metaLookup.forEach((meta, speciesName) => {
        if (speciesGroups.has(speciesName)) {
          speciesInMetadataOrder.push(speciesName);
        }
      });
      
      // Render all species in metadata order
      speciesInMetadataOrder.forEach((speciesName, index) => {
        
        const meta = metaLookup.get(speciesName) || {};
        
        // Try multiple matching strategies for photos
        let photos = photoData.filter(p => p.latinName === speciesName);
        if (photos.length === 0) {
          photos = photoData.filter(p => p.species === speciesName);
        }
        if (photos.length === 0) {
          photos = photoData.filter(p => p.latin === speciesName);
        }
        if (photos.length === 0) {
          photos = photoData.filter(p => p.Species === speciesName);
        }
        
        
        renderPhotoContainer(gridContainer, speciesName, meta, photos);
      });
      
      // Cache the rendered content for future use
      window.photosGalleryLoaded = true;
      window.cachedPhotosContent = document.getElementById('photosGallery').innerHTML;
      
    }).catch(error => {
      // Error loading data for photos gallery
    });
    
  } catch (error) {
    // Error in drawPhotosGallery
  }
}

function loadWithoutPhotos() {
  // Load metadata and records only
  Promise.all([
    d3.csv("metadata.csv"),
    d3.csv("records.csv")
  ]).then(([metadata, records]) => {
    
    // Create metadata lookup and render without photos
    const metaLookup = new Map();
    metadata.forEach(meta => {
      const speciesField = meta.latin || meta.species || meta.Latin || meta.Species;
      if (speciesField) {
        metaLookup.set(speciesField, meta);
      }
    });
    
    const speciesGroups = d3.group(records, d => d.latin || d.species || d.Latin || d.Species);
    
    // Create grid container
    const gridContainer = d3.select("#photosGallery")
      .append("div")
      .attr("class", "photos-grid");
    
    // Use metadata order
    const speciesInMetadataOrder = [];
    metaLookup.forEach((meta, speciesName) => {
      if (speciesGroups.has(speciesName)) {
        speciesInMetadataOrder.push(speciesName);
      }
    });
    
    // Render all species without photos
    speciesInMetadataOrder.forEach((speciesName, index) => {
      const meta = metaLookup.get(speciesName) || {};
      renderPhotoContainer(gridContainer, speciesName, meta, []);
    });
    
  }).catch(error => {
    // Error loading data for photos gallery
  });
}

function renderPhotoContainer(gridContainer, speciesName, meta, photos) {
  
  const container = gridContainer.append("div").attr("class", "photo-species-container");
  
  // Title container with taxonomic information
  const titleContainer = container.append("div").attr("class", "photo-title-container");
  
  // Family
  if (meta.family) {
    titleContainer.append("div")
      .attr("class", "photo-family")
      .text(meta.family);
  }
  
  // Genus
  if (meta.genus) {
    titleContainer.append("div")
      .attr("class", "photo-genus")
      .text(meta.genus);
  }
  
  // Specific epithet
  if (meta.specific) {
    titleContainer.append("div")
      .attr("class", "photo-specific")
      .text(meta.specific);
  }
  
  // English name
  if (meta.english) {
    titleContainer.append("div")
      .attr("class", "photo-english")
      .text(meta.english);
  } else {
    // Add a single space to maintain consistent height
    titleContainer.append("div")
      .attr("class", "photo-english")
      .text(" ");
  }
  
  // Photo container
  const photoContainer = container.append("div").attr("class", "photo-image-container");
  
  // Check if photos exist
  
  // Check if photos exist
  if (photos && photos.length > 0) {
    // Use the first available photo
    const photo = photos[0];
    const filename = photo.file || photo.filename || "";
    
    // Convert thumbnail path to full-size path like in Species Accounts
    let photoPath = filename;
    if (filename && filename.startsWith('thumbnails/')) {
      // Remove thumbnails/ prefix and (Small) suffix to get full-size filename
      let baseFilename = filename.substring(11); // Remove 'thumbnails/'
      // Remove (Small) suffix and any space before the extension
      baseFilename = baseFilename.replace('(Small)', '').replace(' .', '.');
      photoPath = `photos/${baseFilename}`;
    } else {
      // Use as-is or add photos/ prefix if needed
      photoPath = filename.startsWith('photos/') ? filename : `photos/${filename}`;
    }
    
    photoContainer.append("img")
      .attr("src", photoPath)
      .attr("alt", meta.english || speciesName)
      .attr("class", "species-photo")
      .attr("loading", "lazy") // Add lazy loading for better performance
      .on("error", function() {
        // If photo fails to load, show blank placeholder
        d3.select(this).remove();
        photoContainer.append("div")
          .attr("class", "photo-placeholder")
          .text("No photo");
      })
      .on("load", function() {
        // Photo loaded successfully
      })
      .on("click", function() {
        // Disabled lightbox - All Photos page now only shows thumbnails
      });
  } else {
    // No photos available - show blank placeholder
    photoContainer.append("div")
      .attr("class", "photo-placeholder")
      .text("No photo");
  }
}

function initPhotos() {
  // Set up lightbox event listeners
  setupLightbox();
}

function setupLightbox() {
  // Get lightbox elements
  const lightbox = document.getElementById('photoLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.querySelector('.lightbox-close');
  
  // Close lightbox when clicking the close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }
  
  // Close lightbox when clicking outside the image
  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
  
  // Close lightbox when pressing ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
}

function openLightbox(imageSrc, caption) {
  const lightbox = document.getElementById('photoLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  
  if (lightbox && lightboxImage && lightboxCaption) {
    lightboxImage.src = imageSrc;
    lightboxCaption.textContent = caption;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('photoLightbox');
  if (lightbox) {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
}
