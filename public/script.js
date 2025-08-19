// Global variables
let selectedFile = null;
let isAnalyzing = false;

// DOM elements
const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewImage = document.getElementById("previewImage");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingSection = document.getElementById("loadingSection");
const resultsSection = document.getElementById("resultsSection");
const progressFill = document.getElementById("progressFill");

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  checkServerHealth();
});

// Initialize event listeners
function initializeEventListeners() {
  // File input change
  imageInput.addEventListener("change", handleFileSelect);

  // Drag and drop events
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleDrop);

  // Click to upload
  uploadArea.addEventListener("click", () => imageInput.click());

  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
}

// Prevent default drag behaviors
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Handle drag over
function handleDragOver(e) {
  preventDefaults(e);
  uploadArea.classList.add("dragover");
}

// Handle drag leave
function handleDragLeave(e) {
  preventDefaults(e);
  uploadArea.classList.remove("dragover");
}

// Handle file drop
function handleDrop(e) {
  preventDefaults(e);
  uploadArea.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
}

// Handle file selection
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
}

// Handle file processing
function handleFile(file) {
  // Validate file type
  if (!isValidImageFile(file)) {
    showNotification(
      "Please select a valid image file (JPG, PNG, GIF, WebP, BMP)",
      "error"
    );
    return;
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    showNotification("File size must be less than 10MB", "error");
    return;
  }

  selectedFile = file;
  displayImagePreview(file);
  analyzeBtn.disabled = false;
}

// Validate image file
function isValidImageFile(file) {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];
  return validTypes.includes(file.type);
}

// Display image preview
function displayImagePreview(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    previewImage.src = e.target.result;
    imagePreview.style.display = "block";
    uploadArea.style.display = "none";
  };
  reader.readAsDataURL(file);
}

// Remove image
function removeImage() {
  selectedFile = null;
  imageInput.value = "";
  imagePreview.style.display = "none";
  uploadArea.style.display = "block";
  analyzeBtn.disabled = true;
}

// Analyze image
async function analyzeImage() {
  if (!selectedFile || isAnalyzing) return;

  isAnalyzing = true;
  showLoadingSection();

  try {
    const formData = new FormData();
    formData.append("image", selectedFile);

    // Determine endpoint based on enhanced analysis option
    const enhancedAnalysis =
      document.getElementById("enhancedAnalysis").checked;
    const endpoint = enhancedAnalysis ? "/api/search/enhanced" : "/api/search";

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();
    displayResults(results);
  } catch (error) {
    console.error("Analysis error:", error);
    showNotification("Error analyzing image. Please try again.", "error");
  } finally {
    isAnalyzing = false;
    hideLoadingSection();
  }
}

// Show loading section
function showLoadingSection() {
  document.querySelector(".upload-section").style.display = "none";
  loadingSection.style.display = "block";
  resultsSection.style.display = "none";

  // Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;
    progressFill.style.width = progress + "%";
  }, 200);

  // Store interval for cleanup
  window.progressInterval = progressInterval;
}

// Hide loading section
function hideLoadingSection() {
  if (window.progressInterval) {
    clearInterval(window.progressInterval);
  }
  progressFill.style.width = "100%";

  setTimeout(() => {
    loadingSection.style.display = "none";
  }, 500);
}

// Display results
function displayResults(results) {
  resultsSection.style.display = "block";

  // Update summary
  updateSummary(results);

  // Update detailed results
  updateDetailedResults(results);

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: "smooth" });
}

// Update summary section
function updateSummary(results) {
  const summary = results.summary || {};
  const riskValue = document.getElementById("riskValue");
  const summaryContent = document.getElementById("summaryContent");

  // Update risk level
  riskValue.textContent = summary.overallRisk || "Unknown";
  riskValue.className = "risk-value " + (summary.overallRisk || "low");

  // Update summary content
  let summaryHTML = "";

  if (summary.confidence !== undefined) {
    summaryHTML += `<p><strong>Confidence:</strong> ${Math.round(
      summary.confidence * 100
    )}%</p>`;
  }

  if (summary.keyFindings && summary.keyFindings.length > 0) {
    summaryHTML += "<p><strong>Key Findings:</strong></p><ul>";
    summary.keyFindings.forEach((finding) => {
      summaryHTML += `<li>${finding}</li>`;
    });
    summaryHTML += "</ul>";
  }

  if (summary.recommendations && summary.recommendations.length > 0) {
    summaryHTML += "<p><strong>Recommendations:</strong></p><ul>";
    summary.recommendations.forEach((recommendation) => {
      summaryHTML += `<li>${recommendation}</li>`;
    });
    summaryHTML += "</ul>";
  }

  if (results.processingTime) {
    summaryHTML += `<p><strong>Processing Time:</strong> ${results.processingTime}ms</p>`;
  }

  summaryContent.innerHTML = summaryHTML || "<p>No summary available.</p>";
}

// Update detailed results
function updateDetailedResults(results) {
  const resultsGrid = document.getElementById("resultsGrid");
  const services = results.services || {};

  let resultsHTML = "";

  // Google Vision Results
  if (services.googleVision && !services.googleVision.error) {
    resultsHTML += createServiceCard(
      "Google Vision Analysis",
      "fas fa-eye",
      services.googleVision
    );
  }

  // OCR Results
  if (services.ocr && !services.ocr.error) {
    resultsHTML += createServiceCard(
      "Text Detection (OCR)",
      "fas fa-font",
      services.ocr
    );
  }

  // Facial Recognition Results
  if (services.facialRecognition && !services.facialRecognition.error) {
    resultsHTML += createServiceCard(
      "Facial Recognition",
      "fas fa-user",
      services.facialRecognition
    );
  }

  // Stock Photo Results
  if (services.stockPhoto && !services.stockPhoto.error) {
    resultsHTML += createServiceCard(
      "Stock Photo Detection",
      "fas fa-image",
      services.stockPhoto
    );
  }

  // Metadata Results
  if (services.metadata && !services.metadata.error) {
    resultsHTML += createServiceCard(
      "Image Metadata",
      "fas fa-info-circle",
      services.metadata
    );
  }

  // Custom Search Results
  if (services.googleCustomSearch && !services.googleCustomSearch.error) {
    resultsHTML += createServiceCard(
      "Web Search Results",
      "fas fa-globe",
      services.googleCustomSearch
    );
  }

  resultsGrid.innerHTML =
    resultsHTML || "<p>No analysis results available.</p>";
}

// Create service result card
function createServiceCard(title, icon, data) {
  let content = "";

  // Handle different service types
  switch (title) {
    case "Google Vision Analysis":
      content = formatGoogleVisionResults(data);
      break;
    case "Text Detection (OCR)":
      content = formatOCRResults(data);
      break;
    case "Facial Recognition":
      content = formatFacialRecognitionResults(data);
      break;
    case "Stock Photo Detection":
      content = formatStockPhotoResults(data);
      break;
    case "Image Metadata":
      content = formatMetadataResults(data);
      break;
    case "Web Search Results":
      content = formatCustomSearchResults(data);
      break;
    default:
      content = formatGenericResults(data);
  }

  return `
        <div class="result-card">
            <h4><i class="${icon}"></i>${title}</h4>
            <div class="result-content">
                ${content}
            </div>
        </div>
    `;
}

// Format Google Vision results
function formatGoogleVisionResults(data) {
  let html = "";

  if (data.labels && data.labels.length > 0) {
    html += "<h5>Detected Labels:</h5><ul>";
    data.labels.slice(0, 5).forEach((label) => {
      html += `<li>${label.description} (${Math.round(
        label.score * 100
      )}%)</li>`;
    });
    html += "</ul>";
  }

  if (data.webDetection && data.webDetection.webEntities) {
    html += "<h5>Web Entities:</h5><ul>";
    data.webDetection.webEntities.slice(0, 3).forEach((entity) => {
      html += `<li>${entity.description} (${Math.round(
        entity.score * 100
      )}%)</li>`;
    });
    html += "</ul>";
  }

  if (data.text && data.text.length > 0) {
    html += "<h5>Detected Text:</h5><p>" + data.text[0].description + "</p>";
  }

  return html || "<p>No vision analysis results available.</p>";
}

// Format OCR results
function formatOCRResults(data) {
  let html = "";

  if (data.text && data.text.trim()) {
    html += `<h5>Extracted Text:</h5><p>${data.text}</p>`;
  }

  if (data.confidence !== undefined) {
    html += `<p><strong>Confidence:</strong> ${Math.round(
      data.confidence
    )}%</p>`;
  }

  if (data.words && data.words.length > 0) {
    html += "<h5>Words Detected:</h5><ul>";
    data.words.slice(0, 10).forEach((word) => {
      html += `<li>${word.text} (${Math.round(word.confidence)}%)</li>`;
    });
    html += "</ul>";
  }

  return html || "<p>No text detected in the image.</p>";
}

// Format facial recognition results
function formatFacialRecognitionResults(data) {
  let html = "";

  html += `<p><strong>Faces Detected:</strong> ${data.facesDetected}</p>`;
  html += `<p><strong>Impersonation Risk:</strong> <span class="risk-badge ${data.impersonationRisk}">${data.impersonationRisk}</span></p>`;

  if (data.faces && data.faces.length > 0) {
    html += "<h5>Face Details:</h5><ul>";
    data.faces.forEach((face, index) => {
      html += `<li>Face ${index + 1}: ${face.age} years old, ${
        face.gender
      } (${Math.round(face.genderProbability * 100)}% confidence)</li>`;
    });
    html += "</ul>";
  }

  if (data.analysis && data.analysis.ageRange) {
    html += `<p><strong>Age Range:</strong> ${data.analysis.ageRange.min} - ${data.analysis.ageRange.max} years</p>`;
  }

  return html;
}

// Format stock photo results
function formatStockPhotoResults(data) {
  let html = "";

  html += `<p><strong>Stock Photo Detected:</strong> <span class="risk-badge ${
    data.isStockPhoto ? "high" : "low"
  }">${data.isStockPhoto ? "Yes" : "No"}</span></p>`;

  if (data.confidence !== undefined) {
    html += `<p><strong>Confidence:</strong> ${Math.round(
      data.confidence * 100
    )}%</p>`;
  }

  if (data.matches && data.matches.length > 0) {
    html += "<h5>Detection Factors:</h5><ul>";
    data.matches.forEach((match) => {
      html += `<li>${match}</li>`;
    });
    html += "</ul>";
  }

  return html;
}

// Format metadata results
function formatMetadataResults(data) {
  let html = "";

  if (data.metadata) {
    const meta = data.metadata;

    if (meta.imageInfo) {
      html += `<p><strong>Dimensions:</strong> ${meta.imageInfo.width} × ${meta.imageInfo.height}</p>`;
      html += `<p><strong>Format:</strong> ${meta.imageInfo.format?.toUpperCase()}</p>`;
      html += `<p><strong>File Size:</strong> ${meta.fileInfo?.sizeInMB} MB</p>`;
    }

    if (meta.exif) {
      if (meta.exif.make || meta.exif.model) {
        html += `<p><strong>Camera:</strong> ${meta.exif.make || ""} ${
          meta.exif.model || ""
        }</p>`;
      }
      if (meta.exif.dateTimeOriginal) {
        html += `<p><strong>Date Taken:</strong> ${new Date(
          meta.exif.dateTimeOriginal
        ).toLocaleDateString()}</p>`;
      }
      if (meta.exif.gps) {
        html += `<p><strong>Location:</strong> GPS coordinates detected</p>`;
      }
    }

    if (meta.qualityIndicators) {
      html += "<h5>Quality Indicators:</h5><ul>";
      Object.entries(meta.qualityIndicators).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          html += `<li>${key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}: ${
            value ? "Yes" : "No"
          }</li>`;
        }
      });
      html += "</ul>";
    }
  }

  return html || "<p>No metadata available.</p>";
}

// Format custom search results
function formatCustomSearchResults(data) {
  let html = "";

  if (data.items && data.items.length > 0) {
    html += "<h5>Web Search Results:</h5><ul>";
    data.items.slice(0, 5).forEach((item) => {
      html += `<li><a href="${item.link}" target="_blank">${item.title}</a></li>`;
    });
    html += "</ul>";
  }

  if (data.searchInformation) {
    html += `<p><strong>Total Results:</strong> ${
      data.searchInformation.totalResults || "Unknown"
    }</p>`;
  }

  return html || "<p>No web search results available.</p>";
}

// Format generic results
function formatGenericResults(data) {
  if (typeof data === "object") {
    return (
      "<ul>" +
      Object.entries(data)
        .map(([key, value]) => {
          if (typeof value === "object") return "";
          return `<li><strong>${key}:</strong> ${value}</li>`;
        })
        .join("") +
      "</ul>"
    );
  }
  return `<p>${data}</p>`;
}

// Reset analysis
function resetAnalysis() {
  removeImage();
  resultsSection.style.display = "none";
  document.querySelector(".upload-section").style.display = "block";
}

// Check server health
async function checkServerHealth() {
  try {
    const response = await fetch("/health");
    const health = await response.json();

    if (!health.status === "healthy") {
      console.warn("Server health check failed");
    }
  } catch (error) {
    console.error("Health check error:", error);
  }
}

// Show notification
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

  // Set background color based on type
  switch (type) {
    case "error":
      notification.style.backgroundColor = "#dc3545";
      break;
    case "success":
      notification.style.backgroundColor = "#28a745";
      break;
    default:
      notification.style.backgroundColor = "#17a2b8";
  }

  // Add to page
  document.body.appendChild(notification);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Modal functions
function showAbout() {
  document.getElementById("aboutModal").style.display = "block";
}

function showPrivacy() {
  document.getElementById("privacyModal").style.display = "block";
}

function showAPI() {
  document.getElementById("apiModal").style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Close modals when clicking outside
window.addEventListener("click", function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .risk-badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .risk-badge.low {
        background: #d4edda;
        color: #155724;
    }
    
    .risk-badge.medium {
        background: #fff3cd;
        color: #856404;
    }
    
    .risk-badge.high {
        background: #f8d7da;
        color: #721c24;
    }
    
    .result-content h5 {
        margin: 15px 0 8px 0;
        color: #333;
        font-size: 0.95rem;
    }
    
    .result-content ul {
        margin: 0;
        padding-left: 20px;
    }
    
    .result-content li {
        margin-bottom: 5px;
    }
    
    .result-content a {
        color: #667eea;
        text-decoration: none;
    }
    
    .result-content a:hover {
        text-decoration: underline;
    }
`;
document.head.appendChild(style);
