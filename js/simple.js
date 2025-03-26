// Simple URL Shortener JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const urlForm = document.getElementById('url-form');
  const longUrlInput = document.getElementById('long-url');
  const customSlugInput = document.getElementById('custom-slug');
  const expirationSelect = document.getElementById('expiration');
  const advancedOptionsToggle = document.getElementById('advanced-options-toggle');
  const advancedOptions = document.getElementById('advanced-options');
  const resultContainer = document.getElementById('result-container');
  const shortUrlLink = document.getElementById('short-url-link');
  const copyButton = document.getElementById('copy-button');
  const qrCodeContainer = document.getElementById('qr-code');
  const downloadQrButton = document.getElementById('download-qr');
  const downloadModalQrButton = document.getElementById('download-modal-qr');
  const newUrlButton = document.getElementById('new-url-button');
  const viewLinksButton = document.getElementById('view-links-button');
  const myLinksNav = document.getElementById('my-links-nav');
  const linksContainer = document.getElementById('links-container');
  const linksList = document.getElementById('links-list');
  const clearAllButton = document.getElementById('clear-all-button');
  
  // Base URL for the shortened links
  const baseUrl = window.location.origin + '/';
  
  // Local storage key
  const STORAGE_KEY = 'url_shortener_links';
  
  // Initialize
  init();
  
  // Event Listeners
  urlForm.addEventListener('submit', handleFormSubmit);
  advancedOptionsToggle.addEventListener('click', toggleAdvancedOptions);
  copyButton.addEventListener('click', copyShortUrl);
  downloadQrButton.addEventListener('click', downloadQRCode);
  downloadModalQrButton.addEventListener('click', downloadModalQRCode);
  newUrlButton.addEventListener('click', resetForm);
  viewLinksButton.addEventListener('click', showMyLinks);
  myLinksNav.addEventListener('click', showMyLinks);
  clearAllButton.addEventListener('click', showClearAllModal);

  // Focus on the URL input when the page loads
  longUrlInput.focus();
  
  // Initialize the app
  function init() {
    // Load links from local storage
    loadLinks();
    
    // Set up modal close buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
      button.addEventListener('click', closeModals);
    });
    
    // Set up delete modal confirm button
    document.querySelector('#delete-modal .modal-confirm').addEventListener('click', deleteLink);
    
    // Set up clear all modal confirm button
    document.querySelector('#clear-all-modal .modal-confirm').addEventListener('click', clearAllLinks);
  }
  
  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const longUrl = longUrlInput.value.trim();
    const customSlug = customSlugInput.value.trim();
    const expiration = expirationSelect.value;
    
    // Validate URL
    if (!isValidUrl(longUrl)) {
      alert('Please enter a valid URL');
      return;
    }
    
    // Generate a short URL
    const shortUrl = generateShortUrl(longUrl, customSlug, expiration);
    
    // Display the result
    displayResult(shortUrl);
  }
  
  // Toggle advanced options
  function toggleAdvancedOptions() {
    const isHidden = advancedOptions.style.display === 'none';
    advancedOptions.style.display = isHidden ? 'block' : 'none';
    advancedOptionsToggle.textContent = isHidden ? 'Hide advanced options' : 'Advanced options';
  }
  
  // Validate URL
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Generate a short URL
  function generateShortUrl(longUrl, customSlug, expiration) {
    // In a real app, this would make an API call to a backend service
    // For this demo, we'll generate a random string or use the custom slug
    
    const slug = customSlug || generateRandomSlug(6);
    const shortUrl = baseUrl + slug;
    
    // Calculate expiration date if provided
    let expirationDate = null;
    if (expiration) {
      expirationDate = calculateExpirationDate(expiration);
    }
    
    // Save to local storage
    saveLink({
      id: Date.now().toString(),
      originalUrl: longUrl,
      shortUrl: shortUrl,
      slug: slug,
      createdAt: new Date().toISOString(),
      expirationDate: expirationDate,
      clicks: 0
    });
    
    return shortUrl;
  }
  
  // Generate a random slug
  function generateRandomSlug(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  // Calculate expiration date
  function calculateExpirationDate(expiration) {
    const now = new Date();
    
    switch (expiration) {
      case '1h':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      case '1d':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  }
  
  // Display the result
  function displayResult(shortUrl) {
    // Update the short URL link
    shortUrlLink.href = shortUrl;
    shortUrlLink.textContent = shortUrl;
    
    // Generate QR code
    generateQRCode(shortUrl);
    
    // Show the result container
    resultContainer.style.display = 'block';
    
    // Hide the links container if it's visible
    linksContainer.style.display = 'none';
  }
  
  // Generate QR code
  function generateQRCode(url, container = qrCodeContainer, size = 128) {
    // Clear previous QR code
    container.innerHTML = '';

    // Check if QRCode library is available
    if (typeof QRCode !== 'undefined') {
      try {
        // Create a new QRCode instance
        return new QRCode(container, {
          text: url,
          width: size,
          height: size,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      } catch (e) {
        console.error('Error generating QR code:', e);
        return fallbackQRCode(url, container, size);
      }
    } else {
      return fallbackQRCode(url, container, size);
    }
  }

  // Fallback QR code generation
  function fallbackQRCode(url, container, size = 128) {
    const img = document.createElement('img');
    img.src = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(url)}&chs=${size}x${size}&chld=H|0`;
    img.alt = 'QR Code for ' + url;
    container.appendChild(img);
    return img;
  }

  // Download QR code
  function downloadQRCode() {
    downloadQRCodeFromContainer(qrCodeContainer, shortUrlLink.textContent);
  }

  // Download QR code from modal
  function downloadModalQRCode() {
    const modalQrContainer = document.getElementById('qr-modal-code');
    const url = document.getElementById('qr-modal-url').textContent;
    downloadQRCodeFromContainer(modalQrContainer, url);
  }

  // Helper function to download QR code from a container
  function downloadQRCodeFromContainer(container, url) {
    try {
      // Get the canvas or image from the container
      let imageElement;

      if (container.querySelector('canvas')) {
        imageElement = container.querySelector('canvas');
      } else if (container.querySelector('img')) {
        imageElement = container.querySelector('img');
      } else {
        throw new Error('No QR code image found');
      }

      // Create a temporary link element
      const link = document.createElement('a');

      // If it's a canvas, convert to data URL
      if (imageElement.tagName === 'CANVAS') {
        link.href = imageElement.toDataURL('image/png');
      } else {
        // For fallback image
        link.href = imageElement.src;
      }

      // Set download attributes
      link.download = 'qrcode-' + url.replace(/[^a-zA-Z0-9]/g, '-') + '.png';

      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      alert('QR code downloaded successfully!');
    } catch (e) {
      console.error('Error downloading QR code:', e);
      alert('Failed to download QR code. Please try again.');
    }
  }
  
  // Copy short URL to clipboard
  function copyShortUrl() {
    const url = shortUrlLink.textContent;
    
    // Use the Clipboard API if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          // Change button text temporarily
          const originalText = copyButton.innerHTML;
          copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
          
          // Reset button text after 2 seconds
          setTimeout(() => {
            copyButton.innerHTML = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          fallbackCopy(url);
        });
    } else {
      fallbackCopy(url);
    }
  }
  
  // Fallback copy method
  function fallbackCopy(text) {
    // Create a temporary input element
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    
    // Select and copy the text
    input.select();
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(input);
    
    // Change button text temporarily
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
    
    // Reset button text after 2 seconds
    setTimeout(() => {
      copyButton.innerHTML = originalText;
    }, 2000);
  }
  
  // Reset the form
  function resetForm() {
    urlForm.reset();
    resultContainer.style.display = 'none';
    advancedOptions.style.display = 'none';
    advancedOptionsToggle.textContent = 'Advanced options';
  }
  
  // Show my links
  function showMyLinks(e) {
    e.preventDefault();
    
    // Hide the result container
    resultContainer.style.display = 'none';
    
    // Show the links container
    linksContainer.style.display = 'block';
    
    // Refresh the links list
    renderLinks();
    
    // Update navigation
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.remove('active');
    });
    e.target.classList.add('active');
  }
  
  // Save link to local storage
  function saveLink(link) {
    const links = getLinks();
    links.push(link);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }
  
  // Get links from local storage
  function getLinks() {
    const links = localStorage.getItem(STORAGE_KEY);
    return links ? JSON.parse(links) : [];
  }
  
  // Load links from local storage
  function loadLinks() {
    const links = getLinks();
    renderLinks(links);
  }
  
  // Render links in the UI
  function renderLinks() {
    const links = getLinks();

    // Clear the links list
    linksList.innerHTML = '';

    if (links.length === 0) {
      linksList.innerHTML = '<div class="empty-links">No links yet. Create your first shortened URL!</div>';
      return;
    }

    // Sort links by creation date (newest first)
    links.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Add each link to the list
    links.forEach(link => {
      const linkItem = document.createElement('div');
      linkItem.className = 'link-item';
      linkItem.dataset.id = link.id;

      // Format the creation date
      const createdDate = new Date(link.createdAt);
      const formattedDate = createdDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      // Format expiration date if it exists
      let expirationInfo = '';
      if (link.expirationDate) {
        const expirationDate = new Date(link.expirationDate);
        const now = new Date();

        if (expirationDate > now) {
          const daysLeft = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
          expirationInfo = `<div class="link-meta-item"><i class="fas fa-clock"></i> Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</div>`;
        } else {
          expirationInfo = `<div class="link-meta-item"><i class="fas fa-exclamation-circle"></i> Expired</div>`;
        }
      }

      linkItem.innerHTML = `
        <div class="link-details">
          <div class="link-short">
            <a href="${link.shortUrl}" target="_blank" rel="noopener noreferrer">${link.shortUrl}</a>
          </div>
          <div class="link-original" title="${link.originalUrl}">${truncateUrl(link.originalUrl, 50)}</div>
          <div class="link-meta">
            <div class="link-meta-item"><i class="fas fa-calendar-alt"></i> ${formattedDate}</div>
            <div class="link-meta-item"><i class="fas fa-chart-bar"></i> ${link.clicks || 0} clicks</div>
            ${expirationInfo}
          </div>
        </div>
        <div class="link-actions">
          <button class="btn btn-primary btn-sm copy-link" title="Copy to clipboard">
            <i class="fas fa-copy"></i>
          </button>
          <button class="btn btn-secondary btn-sm qr-link" title="Show QR Code">
            <i class="fas fa-qrcode"></i>
          </button>
          <button class="btn btn-danger btn-sm delete-link" title="Delete link">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      // Add event listeners
      linkItem.querySelector('.copy-link').addEventListener('click', () => {
        copyToClipboard(link.shortUrl);
      });

      linkItem.querySelector('.qr-link').addEventListener('click', () => {
        showQRModal(link);
      });

      linkItem.querySelector('.delete-link').addEventListener('click', () => {
        showDeleteModal(link.id);
      });

      // Make the entire link item clickable to open the short URL
      linkItem.querySelector('.link-short a').addEventListener('click', (e) => {
        e.stopPropagation(); // Don't prevent the default link behavior

        // Increment click count
        link.clicks = (link.clicks || 0) + 1;
        saveLinks(links);

        // Update the UI
        renderLinks();
      });

      linksList.appendChild(linkItem);
    });
  }
  
  // Truncate URL for display
  function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  }
  
  // Copy to clipboard
  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          showToast('Copied to clipboard!', 'success');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          fallbackCopyToClipboard(text);
        });
    } else {
      fallbackCopyToClipboard(text);
    }
  }

  // Fallback copy to clipboard
  function fallbackCopyToClipboard(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('Copied to clipboard!', 'success');
  }

  // Show toast notification
  function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Add icon based on type
    let icon = '';
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      default:
        icon = '<i class="fas fa-info-circle"></i>';
    }

    // Set toast content
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  // Show QR modal
  function showQRModal(link) {
    const modal = document.getElementById('qr-modal');
    const qrModalCode = document.getElementById('qr-modal-code');
    const qrModalUrl = document.getElementById('qr-modal-url');

    // Set the URL text
    qrModalUrl.textContent = link.shortUrl;

    // Generate QR code with larger size
    generateQRCode(link.shortUrl, qrModalCode, 200);

    // Show the modal with animation
    modal.classList.add('active');

    // Increment click count for analytics
    if (link.id) {
      const links = getLinks();
      const linkToUpdate = links.find(l => l.id === link.id);

      if (linkToUpdate) {
        // We don't count this as a regular click, just track QR code views
        linkToUpdate.qrViews = (linkToUpdate.qrViews || 0) + 1;
        saveLinks(links);
      }
    }
  }
  
  // Show delete modal
  function showDeleteModal(id) {
    const modal = document.getElementById('delete-modal');
    modal.dataset.id = id;
    modal.classList.add('active');
  }
  
  // Show clear all modal
  function showClearAllModal() {
    const modal = document.getElementById('clear-all-modal');
    modal.classList.add('active');
  }
  
  // Close all modals
  function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }
  
  // Delete a link
  function deleteLink() {
    const modal = document.getElementById('delete-modal');
    const id = modal.dataset.id;
    
    if (!id) return;
    
    // Get links from local storage
    let links = getLinks();
    
    // Filter out the link to delete
    links = links.filter(link => link.id !== id);
    
    // Save the updated links
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    
    // Close the modal
    closeModals();
    
    // Refresh the links list
    renderLinks();
  }
  
  // Clear all links
  function clearAllLinks() {
    // Clear local storage
    localStorage.removeItem(STORAGE_KEY);
    
    // Close the modal
    closeModals();
    
    // Refresh the links list
    renderLinks();
  }
});