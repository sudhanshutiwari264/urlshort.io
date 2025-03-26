// URL Shortener App - 2025 Edition
// A client-side URL shortener that stores links in localStorage

// DOM Elements
const urlForm = document.getElementById('url-form');
const longUrlInput = document.getElementById('long-url');
const customCodeInput = document.getElementById('custom-code');
const expirationInput = document.getElementById('expiration');
const advancedToggle = document.getElementById('advanced-toggle');
const advancedOptions = document.getElementById('advanced-options');
const shortenBtn = document.getElementById('shorten-btn');
const resultContainer = document.getElementById('result-container');
const shortenerFormContainer = document.getElementById('shortener-form-container');
const shortUrlLink = document.getElementById('short-url-link');
const copyBtn = document.getElementById('copy-btn');
const qrCodeContainer = document.getElementById('qr-code');
const newUrlBtn = document.getElementById('new-url-btn');
const viewLinksBtn = document.getElementById('view-links-btn');
const myLinksSection = document.getElementById('my-links-section');
const linksList = document.getElementById('links-list');
const emptyLinks = document.getElementById('empty-links');
const createFirstLink = document.getElementById('create-first-link');
const clearAllBtn = document.getElementById('clear-all-btn');
const myLinksNav = document.getElementById('my-links-nav');
const themeToggle = document.getElementById('theme-toggle');
const deleteModal = document.getElementById('delete-modal');
const clearAllModal = document.getElementById('clear-all-modal');
const toastContainer = document.getElementById('toast-container');

// App State
let currentLinkToDelete = null;

// Constants
const STORAGE_KEY = 'url2025_links';
const BASE_URL = window.location.href.split('#')[0].split('?')[0];
const CURRENT_YEAR = 2025; // Set to 2025 as requested

// Initialize the app
function initApp() {
  // Set up event listeners
  setupEventListeners();
  
  // Check for theme preference
  initTheme();
  
  // Check if we need to redirect (if this is a shortened URL)
  checkForRedirect();
  
  // Update links list if we're on the My Links page
  updateLinksList();
}

// Set up event listeners
function setupEventListeners() {
  // URL Form submission
  urlForm.addEventListener('submit', handleFormSubmit);
  
  // Toggle advanced options
  advancedToggle.addEventListener('click', toggleAdvancedOptions);
  
  // Copy button
  copyBtn.addEventListener('click', copyToClipboard);
  
  // New URL button
  newUrlBtn.addEventListener('click', resetForm);
  
  // View links button
  viewLinksBtn.addEventListener('click', showMyLinks);
  
  // Create first link button
  createFirstLink.addEventListener('click', hideMyLinks);
  
  // My links navigation
  myLinksNav.addEventListener('click', (e) => {
    e.preventDefault();
    showMyLinks();
  });
  
  // Clear all button
  clearAllBtn.addEventListener('click', showClearAllModal);
  
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Modal close buttons
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
    button.addEventListener('click', closeModals);
  });
  
  // Delete confirmation
  document.querySelectorAll('#delete-modal .modal-confirm').forEach(button => {
    button.addEventListener('click', confirmDelete);
  });
  
  // Clear all confirmation
  document.querySelectorAll('#clear-all-modal .modal-confirm').forEach(button => {
    button.addEventListener('click', confirmClearAll);
  });
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  const longUrl = longUrlInput.value.trim();
  const customCode = customCodeInput.value.trim();
  const expirationDays = parseInt(expirationInput.value) || 0;
  
  // Validate URL
  if (!isValidUrl(longUrl)) {
    showToast('Please enter a valid URL', 'error');
    return;
  }
  
  // Generate short URL
  generateShortUrl(longUrl, customCode, expirationDays);
}

// Generate a short URL
function generateShortUrl(longUrl, customCode, expirationDays) {
  // Format the URL if needed
  const formattedUrl = formatUrl(longUrl);
  
  // Check if custom code is provided and valid
  if (customCode && !isValidCode(customCode)) {
    showToast('Custom code can only contain letters, numbers, hyphens, and underscores', 'error');
    return;
  }
  
  // Check if custom code is already in use
  if (customCode && isCodeTaken(customCode)) {
    showToast('This custom code is already in use', 'error');
    return;
  }
  
  // Generate a unique code if no custom code is provided
  const urlCode = customCode || generateUniqueCode();
  
  // Create the short URL using the redirect.html page
  const shortUrl = `${BASE_URL.replace(/index\.html$/, '')}redirect.html?code=${urlCode}`;
  
  // Calculate expiration date if provided
  let expiresAt = null;
  if (expirationDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
  }
  
  // Create link object
  const linkObj = {
    id: generateId(),
    urlCode,
    longUrl: formattedUrl,
    shortUrl,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    clicks: 0,
    lastClickedAt: null
  };
  
  // Save to localStorage
  saveLink(linkObj);
  
  // Show the result
  showResult(linkObj);
  
  // Generate QR code
  generateQRCode(shortUrl);
}

// Format URL (add https:// if missing)
function formatUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

// Check if URL is valid
function isValidUrl(url) {
  // Add protocol if missing for validation
  const urlToCheck = formatUrl(url);
  
  try {
    new URL(urlToCheck);
    return true;
  } catch (e) {
    return false;
  }
}

// Check if code is valid
function isValidCode(code) {
  return /^[a-zA-Z0-9_-]+$/.test(code);
}

// Check if code is already taken
function isCodeTaken(code) {
  const links = getLinks();
  return links.some(link => link.urlCode === code);
}

// Generate a unique code
function generateUniqueCode(length = 6) {
  // Use the year 2025 as part of the code to make it unique and modern
  const prefix = CURRENT_YEAR.toString().substring(2); // "25"
  
  // Characters to use for the random part (excluding similar looking characters)
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  let isUnique = false;
  let code;
  
  while (!isUnique) {
    // Generate random part
    let randomPart = '';
    for (let i = 0; i < length; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Combine prefix and random part
    code = `${prefix}${randomPart}`;
    
    // Check if code is unique
    if (!isCodeTaken(code)) {
      isUnique = true;
    }
  }
  
  return code;
}

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Save link to localStorage
function saveLink(linkObj) {
  const links = getLinks();
  links.push(linkObj);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

// Get all links from localStorage
function getLinks() {
  const linksJson = localStorage.getItem(STORAGE_KEY);
  return linksJson ? JSON.parse(linksJson) : [];
}

// Update link in localStorage
function updateLink(linkObj) {
  const links = getLinks();
  const index = links.findIndex(link => link.id === linkObj.id);
  
  if (index !== -1) {
    links[index] = linkObj;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }
}

// Delete link from localStorage
function deleteLink(id) {
  const links = getLinks();
  const filteredLinks = links.filter(link => link.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLinks));
  
  // Update the links list
  updateLinksList();
}

// Clear all links from localStorage
function clearAllLinks() {
  localStorage.removeItem(STORAGE_KEY);
  
  // Update the links list
  updateLinksList();
}

// Show the result
function showResult(linkObj) {
  // Hide the form and show the result
  shortenerFormContainer.classList.add('hidden');
  resultContainer.classList.remove('hidden');
  
  // Set the short URL
  shortUrlLink.href = linkObj.shortUrl;
  shortUrlLink.textContent = linkObj.shortUrl;
}

// Generate QR code using qrcode.js library
function generateQRCode(url) {
  // Clear previous QR code
  qrCodeContainer.innerHTML = '';

  // Check if QRCode library is available
  if (typeof QRCode !== 'undefined') {
    try {
      // Create a new QRCode instance
      new QRCode(qrCodeContainer, {
        text: url,
        width: 180,
        height: 180,
        colorDark: "#4f46e5", // Use our primary color
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      // Add download button
      const downloadBtn = document.createElement('div');
      downloadBtn.className = 'qr-download';
      downloadBtn.innerHTML = `<button class="btn btn-secondary btn-sm">
        <i class="fas fa-download"></i> Download QR
      </button>`;
      qrCodeContainer.parentNode.appendChild(downloadBtn);

      // Add event listener to download button
      downloadBtn.querySelector('button').addEventListener('click', () => {
        // Create a canvas from the QR code
        const canvas = qrCodeContainer.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = 'qrcode.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        } else {
          showToast('Could not download QR code', 'error');
        }
      });

      console.log('QR code generated using qrcode.js library');
    } catch (e) {
      console.error('Error generating QR code with qrcode.js:', e);
      fallbackQRCode(url);
    }
  } else {
    console.warn('QRCode library not available, using fallback');
    fallbackQRCode(url);
  }
}

// Fallback QR code generation using Google Charts API
function fallbackQRCode(url, container, size = 180) {
  // If no container is provided, use the main QR code container
  const targetContainer = container || qrCodeContainer;

  // Create an image element
  const img = document.createElement('img');

  // Set the source to Google Charts API with our primary color
  img.src = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(url)}&chs=${size}x${size}&chld=H|0&chco=4F46E5`;

  // Set alt text and styling
  img.alt = 'QR Code for ' + url;
  img.className = 'qr-image';

  // Add the image to the container
  targetContainer.innerHTML = '';
  targetContainer.appendChild(img);

  // Add download button
  if (targetContainer === qrCodeContainer) {
    const downloadBtn = document.createElement('div');
    downloadBtn.className = 'qr-download';
    downloadBtn.innerHTML = `<button class="btn btn-secondary btn-sm">
      <i class="fas fa-download"></i> Download QR
    </button>`;
    targetContainer.parentNode.appendChild(downloadBtn);

    // Add event listener to download button
    downloadBtn.querySelector('button').addEventListener('click', () => {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = img.src;
      link.click();
    });
  }

  console.log('QR code generated using Google Charts API (fallback)');
}

// Reset the form
function resetForm() {
  // Clear inputs
  urlForm.reset();
  
  // Hide advanced options
  advancedOptions.classList.remove('active');
  advancedToggle.textContent = 'Show advanced options';
  
  // Hide result and show form
  resultContainer.classList.add('hidden');
  shortenerFormContainer.classList.remove('hidden');
  
  // Focus on long URL input
  longUrlInput.focus();
}

// Toggle advanced options
function toggleAdvancedOptions() {
  advancedOptions.classList.toggle('active');
  advancedToggle.innerHTML = advancedOptions.classList.contains('active')
    ? '<i class="fas fa-chevron-up"></i> Hide advanced options'
    : '<i class="fas fa-cog"></i> Show advanced options';
}

// Copy to clipboard
function copyToClipboard() {
  const textToCopy = shortUrlLink.href;
  
  // Use the Clipboard API if available
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast('Copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        showToast('Failed to copy to clipboard', 'error');
      });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showToast('Copied to clipboard!', 'success');
      } else {
        showToast('Failed to copy to clipboard', 'error');
      }
    } catch (err) {
      console.error('Could not copy text: ', err);
      showToast('Failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textarea);
  }
}

// Show My Links section
function showMyLinks() {
  // Hide the shortener section
  document.querySelector('.url-shortener').classList.add('hidden');
  document.querySelector('.features').classList.add('hidden');
  document.querySelector('.about').classList.add('hidden');
  
  // Show My Links section
  myLinksSection.classList.remove('hidden');
  
  // Update links list
  updateLinksList();
  
  // Update navigation
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.classList.remove('active');
  });
  myLinksNav.classList.add('active');
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Hide My Links section
function hideMyLinks() {
  // Show the shortener section
  document.querySelector('.url-shortener').classList.remove('hidden');
  document.querySelector('.features').classList.remove('hidden');
  document.querySelector('.about').classList.remove('hidden');
  
  // Hide My Links section
  myLinksSection.classList.add('hidden');
  
  // Update navigation
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector('.main-nav a:first-child').classList.add('active');
  
  // Reset form
  resetForm();
}

// Update links list
function updateLinksList() {
  // Get all links
  const links = getLinks();
  
  // Clear the list
  linksList.innerHTML = '';
  
  // Check if there are any links
  if (links.length === 0) {
    linksList.classList.add('hidden');
    emptyLinks.classList.remove('hidden');
    return;
  }
  
  // Show the list and hide empty state
  linksList.classList.remove('hidden');
  emptyLinks.classList.add('hidden');
  
  // Remove expired links
  const now = new Date();
  const validLinks = links.filter(link => {
    if (link.expiresAt) {
      return new Date(link.expiresAt) > now;
    }
    return true;
  });
  
  // If we removed any links, update localStorage
  if (validLinks.length !== links.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validLinks));
  }
  
  // Sort links by creation date (newest first)
  validLinks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Add links to the list
  validLinks.forEach(link => {
    const linkItem = createLinkItem(link);
    linksList.appendChild(linkItem);
  });
}

// Create a link item
function createLinkItem(link) {
  const linkItem = document.createElement('div');
  linkItem.className = 'link-item';
  linkItem.dataset.id = link.id;
  
  // Format dates
  const createdDate = new Date(link.createdAt);
  const formattedCreatedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();
  
  let expiresText = 'Never expires';
  if (link.expiresAt) {
    const expiresDate = new Date(link.expiresAt);
    expiresText = `Expires: ${expiresDate.toLocaleDateString()}`;
  }
  
  // Create link item HTML
  linkItem.innerHTML = `
    <div class="link-details">
      <div class="link-short">
        <a href="${link.shortUrl}" target="_blank" rel="noopener noreferrer">${link.shortUrl}</a>
      </div>
      <div class="link-original" title="${link.longUrl}">${link.longUrl}</div>
      <div class="link-meta">
        <div class="link-meta-item">
          <i class="fas fa-calendar"></i>
          <span>${formattedCreatedDate}</span>
        </div>
        <div class="link-meta-item">
          <i class="fas fa-clock"></i>
          <span>${expiresText}</span>
        </div>
        <div class="link-meta-item">
          <i class="fas fa-mouse-pointer"></i>
          <span>${link.clicks} clicks</span>
        </div>
      </div>
    </div>
    <div class="link-actions">
      <button class="btn btn-sm btn-secondary copy-link" title="Copy link">
        <i class="fas fa-copy"></i>
      </button>
      <button class="btn btn-sm btn-secondary qr-link" title="Show QR code">
        <i class="fas fa-qrcode"></i>
      </button>
      <button class="btn btn-sm btn-danger delete-link" title="Delete link">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  // Add event listeners
  linkItem.querySelector('.copy-link').addEventListener('click', () => {
    copyLinkToClipboard(link.shortUrl);
  });
  
  linkItem.querySelector('.qr-link').addEventListener('click', () => {
    showQRModal(link);
  });
  
  linkItem.querySelector('.delete-link').addEventListener('click', () => {
    showDeleteModal(link.id);
  });
  
  return linkItem;
}

// Copy link to clipboard
function copyLinkToClipboard(url) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => {
        showToast('Copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        showToast('Failed to copy to clipboard', 'error');
      });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showToast('Copied to clipboard!', 'success');
      } else {
        showToast('Failed to copy to clipboard', 'error');
      }
    } catch (err) {
      console.error('Could not copy text: ', err);
      showToast('Failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textarea);
  }
}

// Show QR modal
function showQRModal(link) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal active';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">QR Code</h3>
        <button class="modal-close" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body text-center">
        <div class="qr-container">
          <p class="qr-label">Scan to visit</p>
          <div id="qr-modal-code" class="qr-code"></div>
          <div class="qr-url">${link.shortUrl}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-close">Close</button>
        <button class="btn btn-primary" id="download-qr-modal">
          <i class="fas fa-download"></i> Download
        </button>
      </div>
    </div>
  `;

  // Add to body
  document.body.appendChild(modal);

  // Generate QR code for the modal
  const qrModalContainer = modal.querySelector('#qr-modal-code');

  // Check if QRCode library is available
  if (typeof QRCode !== 'undefined') {
    try {
      // Create a new QRCode instance
      new QRCode(qrModalContainer, {
        text: link.shortUrl,
        width: 200,
        height: 200,
        colorDark: "#4f46e5", // Use our primary color
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      console.log('Modal QR code generated using qrcode.js library');

      // Add download functionality
      const downloadBtn = modal.querySelector('#download-qr-modal');
      downloadBtn.addEventListener('click', () => {
        const canvas = qrModalContainer.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = 'qrcode.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        } else {
          showToast('Could not download QR code', 'error');
        }
      });
    } catch (e) {
      console.error('Error generating modal QR code with qrcode.js:', e);

      // Fallback to Google Charts API
      fallbackQRCode(link.shortUrl, qrModalContainer, 200);

      // Add download functionality for fallback
      const downloadBtn = modal.querySelector('#download-qr-modal');
      downloadBtn.addEventListener('click', () => {
        const img = qrModalContainer.querySelector('img');
        if (img) {
          const link = document.createElement('a');
          link.download = 'qrcode.png';
          link.href = img.src;
          link.click();
        } else {
          showToast('Could not download QR code', 'error');
        }
      });
    }
  } else {
    // Fallback to Google Charts API
    fallbackQRCode(link.shortUrl, qrModalContainer, 200);

    // Add download functionality for fallback
    const downloadBtn = modal.querySelector('#download-qr-modal');
    downloadBtn.addEventListener('click', () => {
      const img = qrModalContainer.querySelector('img');
      if (img) {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = img.src;
        link.click();
      } else {
        showToast('Could not download QR code', 'error');
      }
    });
  }

  // Add event listeners
  modal.querySelectorAll('.modal-close').forEach(button => {
    button.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  });

  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Show delete modal
function showDeleteModal(id) {
  currentLinkToDelete = id;
  deleteModal.classList.add('active');
}

// Show clear all modal
function showClearAllModal() {
  clearAllModal.classList.add('active');
}

// Close all modals
function closeModals() {
  deleteModal.classList.remove('active');
  clearAllModal.classList.remove('active');
  currentLinkToDelete = null;
}

// Confirm delete
function confirmDelete() {
  if (currentLinkToDelete) {
    deleteLink(currentLinkToDelete);
    showToast('Link deleted successfully', 'success');
  }
  closeModals();
}

// Confirm clear all
function confirmClearAll() {
  clearAllLinks();
  showToast('All links cleared successfully', 'success');
  closeModals();
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="toast-message">${message}</div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Initialize theme
function initTheme() {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  } else {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
      updateThemeIcon('dark');
    }
  }
}

// Toggle theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  updateThemeIcon(newTheme);
}

// Update theme icon
function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }
}

// Check if we need to redirect (if this is a shortened URL)
function checkForRedirect() {
  // Get the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  // If there's a code parameter, redirect to the redirect.html page
  if (code) {
    console.log('Found code parameter on main page, redirecting to redirect.html');
    window.location.href = `redirect.html?code=${code}`;
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);