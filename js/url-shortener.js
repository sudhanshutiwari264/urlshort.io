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
const CURRENT_YEAR = 2025; // Set to 2025 as requested

// Base URL for shortened links
const BASE_URL = window.location.origin + '/';

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

  // About link navigation
  document.querySelector('.main-nav a[href="#about"]').addEventListener('click', (e) => {
    e.preventDefault();
    showAboutSection();
  });

  // Home link navigation
  document.querySelector('.main-nav a:first-child').addEventListener('click', (e) => {
    e.preventDefault();
    hideMyLinks();
  });
  
  // Clear all button
  clearAllBtn.addEventListener('click', () => {
    showModal(clearAllModal);
  });
  
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Modal close buttons
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
    button.addEventListener('click', hideModals);
  });
  
  // Delete confirmation
  document.querySelector('#delete-modal .modal-confirm').addEventListener('click', confirmDelete);
  
  // Clear all confirmation
  document.querySelector('#clear-all-modal .modal-confirm').addEventListener('click', confirmClearAll);
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

  // Create a shorter URL format - use r.html for maximum brevity
  const shortUrl = `${BASE_URL}r.html#${urlCode}`;

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
function generateUniqueCode(length = 5) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;

  do {
    code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (isCodeTaken(code));

  return code;
}

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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

// Get a link by code
function getLinkByCode(code) {
  const links = getLinks();
  return links.find(link => link.urlCode === code);
}

// Update a link
function updateLink(linkObj) {
  const links = getLinks();
  const index = links.findIndex(link => link.id === linkObj.id);
  
  if (index !== -1) {
    links[index] = linkObj;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }
}

// Delete a link
function deleteLink(id) {
  console.log('Deleting link with ID:', id);
  const links = getLinks();
  console.log('Before delete - Links count:', links.length);
  const filteredLinks = links.filter(link => link.id !== id);
  console.log('After delete - Links count:', filteredLinks.length);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLinks));
}

// Clear all links
function clearAllLinks() {
  localStorage.removeItem(STORAGE_KEY);
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

// Generate QR code
function generateQRCode(url) {
  // Clear previous QR code
  qrCodeContainer.innerHTML = '';
  
  // Check if QRCode library is available
  if (typeof QRCode !== 'undefined') {
    try {
      // Generate QR code
      new QRCode(qrCodeContainer, {
        text: url,
        width: 180,
        height: 180,
        colorDark: '#4f46e5',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
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
  
  console.log('QR code generated using Google Charts API (fallback)');
}

// Reset the form
function resetForm() {
  // Clear inputs
  urlForm.reset();
  
  // Hide advanced options
  advancedOptions.style.display = 'none';
  advancedToggle.innerHTML = '<i class="fas fa-cog"></i> Advanced options';
  
  // Hide result and show form
  resultContainer.classList.add('hidden');
  shortenerFormContainer.classList.remove('hidden');
  
  // Focus on long URL input
  longUrlInput.focus();
}

// Toggle advanced options
function toggleAdvancedOptions() {
  // Simple direct toggle
  if (advancedOptions.style.display === 'none') {
    advancedOptions.style.display = 'block';
    advancedToggle.innerHTML = '<i class="fas fa-chevron-up"></i> Hide advanced options';
  } else {
    advancedOptions.style.display = 'none';
    advancedToggle.innerHTML = '<i class="fas fa-cog"></i> Advanced options';
  }
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
  document.querySelector('.social-proof').classList.add('hidden');

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
  document.querySelector('.social-proof').classList.remove('hidden');

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

// Show About section
function showAboutSection() {
  // Show the about section and hide others
  document.querySelector('.url-shortener').classList.add('hidden');
  document.querySelector('.features').classList.add('hidden');
  document.querySelector('.social-proof').classList.add('hidden');
  document.querySelector('.about').classList.remove('hidden');

  // Hide My Links section
  myLinksSection.classList.add('hidden');

  // Update navigation
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector('.main-nav a[href="#about"]').classList.add('active');

  // Scroll to the about section
  document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
}

// Update links list
function updateLinksList() {
  console.log('Updating links list');
  // Get all links
  const links = getLinks();
  console.log('Total links:', links.length);

  // Clear the list
  linksList.innerHTML = '';

  // Check if there are any links
  if (links.length === 0) {
    console.log('No links found, showing empty state');
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
      const expiryDate = new Date(link.expiresAt);
      return expiryDate > now;
    }
    return true;
  });

  console.log('Valid links after expiry check:', validLinks.length);

  // Sort links by creation date (newest first)
  validLinks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Add links to the list
  validLinks.forEach(link => {
    console.log('Adding link to list:', link.id, link.shortUrl);
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
  const formattedCreatedDate = createdDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Format expiry date if exists
  let expiryInfo = 'Never expires';
  if (link.expiresAt) {
    const expiryDate = new Date(link.expiresAt);
    const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    expiryInfo = `Expires on ${formattedExpiryDate}`;
  }
  
  // Format last clicked date if exists
  let lastClickedInfo = 'Never clicked';
  if (link.lastClickedAt) {
    const lastClickedDate = new Date(link.lastClickedAt);
    const formattedLastClickedDate = lastClickedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    lastClickedInfo = `Last clicked on ${formattedLastClickedDate}`;
  }
  
  linkItem.innerHTML = `
    <div class="link-info">
      <div class="link-main">
        <div class="link-original">
          <span class="link-label">Original URL:</span>
          <a href="${link.longUrl}" target="_blank" rel="noopener noreferrer" class="link-url">${truncateUrl(link.longUrl, 50)}</a>
        </div>
        <div class="link-short">
          <span class="link-label">Short URL:</span>
          <a href="${link.shortUrl}" target="_blank" rel="noopener noreferrer" class="link-url">${link.shortUrl}</a>
          <button class="icon-button copy-link-btn" title="Copy to clipboard">
            <i class="fas fa-copy"></i>
          </button>
          <button class="icon-button qr-link-btn" title="Show QR code">
            <i class="fas fa-qrcode"></i>
          </button>
        </div>
      </div>
      <div class="link-meta">
        <div class="link-meta-item">
          <i class="fas fa-calendar-alt"></i>
          <span>Created on ${formattedCreatedDate}</span>
        </div>
        <div class="link-meta-item">
          <i class="fas fa-clock"></i>
          <span>${expiryInfo}</span>
        </div>
        <div class="link-meta-item">
          <i class="fas fa-chart-line"></i>
          <span>${link.clicks} clicks</span>
        </div>
        <div class="link-meta-item">
          <i class="fas fa-mouse-pointer"></i>
          <span>${lastClickedInfo}</span>
        </div>
      </div>
    </div>
    <div class="link-actions">
      <div class="qr-preview"></div>
      <button class="btn btn-danger btn-sm delete-link-btn">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
  `;
  
  // Add event listeners
  const copyBtn = linkItem.querySelector('.copy-link-btn');
  copyBtn.addEventListener('click', () => {
    copyLinkToClipboard(link.shortUrl);
  });
  
  const qrBtn = linkItem.querySelector('.qr-link-btn');
  const qrPreview = linkItem.querySelector('.qr-preview');
  qrBtn.addEventListener('click', () => {
    toggleQRPreview(qrPreview, link.shortUrl);
  });
  
  const deleteBtn = linkItem.querySelector('.delete-link-btn');
  deleteBtn.addEventListener('click', () => {
    showDeleteModal(link.id);
  });
  
  return linkItem;
}

// Truncate URL for display
function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
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
    // Fallback
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

// Toggle QR code preview
function toggleQRPreview(container, url) {
  if (container.innerHTML === '') {
    // Generate QR code
    fallbackQRCode(url, container, 120);
    container.style.display = 'block';
  } else {
    // Hide QR code
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

// Show delete modal
function showDeleteModal(id) {
  console.log('Showing delete modal for ID:', id);
  currentLinkToDelete = id;
  showModal(deleteModal);
}

// Confirm delete
function confirmDelete() {
  console.log('Confirming delete for ID:', currentLinkToDelete);
  if (currentLinkToDelete) {
    deleteLink(currentLinkToDelete);
    updateLinksList();
    hideModals();
    showToast('Link deleted successfully', 'success');
    currentLinkToDelete = null;
  } else {
    console.error('No link ID to delete');
  }
}

// Confirm clear all
function confirmClearAll() {
  clearAllLinks();
  updateLinksList();
  hideModals();
  showToast('All links cleared successfully', 'success');
}

// Show modal
function showModal(modal) {
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// Hide all modals
function hideModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  });
}

// Check for redirect
function checkForRedirect() {
  // We're now using redirect.html with hash-based routing
  // This function is kept for compatibility but doesn't need to do anything
  console.log('Using hash-based redirection through redirect.html');
}

// Show toast notification
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Set icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';

  // Set content
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="toast-message">${message}</div>
  `;

  // Add to container
  toastContainer.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('fadeOut');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

// Theme is always dark
function toggleTheme() {
  // No toggling - always dark
  document.body.classList.add('dark-mode');
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  localStorage.setItem('theme', 'dark');
}

// Initialize theme - always dark
function initTheme() {
  document.body.classList.add('dark-mode');
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  localStorage.setItem('theme', 'dark');
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initApp();
  initCountdown();
});

// Initialize countdown timer for the limited offer
function initCountdown() {
  const daysElement = document.getElementById('countdown-days');
  const hoursElement = document.getElementById('countdown-hours');
  const minutesElement = document.getElementById('countdown-minutes');

  if (!daysElement || !hoursElement || !minutesElement) return;

  // Update the countdown every minute
  updateCountdown();
  setInterval(updateCountdown, 60000);

  function updateCountdown() {
    // Randomly decrease the time to create urgency
    let days = parseInt(daysElement.textContent);
    let hours = parseInt(hoursElement.textContent);
    let minutes = parseInt(minutesElement.textContent);

    minutes -= Math.floor(Math.random() * 5) + 1;

    if (minutes < 0) {
      minutes += 60;
      hours--;
    }

    if (hours < 0) {
      hours += 24;
      days--;
    }

    // Don't let it go below 0
    if (days < 0) {
      days = 0;
      hours = 0;
      minutes = 0;
    }

    daysElement.textContent = days;
    hoursElement.textContent = hours < 10 ? '0' + hours : hours;
    minutesElement.textContent = minutes < 10 ? '0' + minutes : minutes;
  }
}