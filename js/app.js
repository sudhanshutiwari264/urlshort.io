document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const longUrlInput = document.getElementById('long-url');
    const customPathInput = document.getElementById('custom-path');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultContainer = document.getElementById('result-container');
    const shortUrlInput = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    const qrBtn = document.getElementById('qr-btn');
    const qrContainer = document.getElementById('qr-container');
    const qrcodeElement = document.getElementById('qrcode');
    const downloadQrBtn = document.getElementById('download-qr');
    const recentLinksSection = document.getElementById('recent-links');
    const linksContainer = document.getElementById('links-container');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const domainPrefixElement = document.getElementById('domain-prefix');

    // Set the domain prefix based on the current URL
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const baseUrlWithoutFilename = baseUrl.endsWith('index.html')
        ? baseUrl.substring(0, baseUrl.length - 10)
        : (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');
    domainPrefixElement.textContent = baseUrlWithoutFilename;

    // URL data storage
    let urlDatabase = {};

    // Check if localStorage is available
    function isLocalStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Load data from localStorage
    function loadUrlDatabase() {
        if (isLocalStorageAvailable()) {
            try {
                const data = localStorage.getItem('sudhanshulinkUrls');
                if (data) {
                    urlDatabase = JSON.parse(data);
                    console.log('URL database loaded from localStorage');
                }
            } catch (e) {
                console.error('Error loading URL database:', e);
                urlDatabase = {};
            }
        } else {
            showNotification('LocalStorage is not available. Your links will not be saved.', true);
        }
    }

    // Save data to localStorage
    function saveUrlDatabase() {
        if (isLocalStorageAvailable()) {
            try {
                localStorage.setItem('sudhanshulinkUrls', JSON.stringify(urlDatabase));
            } catch (e) {
                console.error('Error saving URL database:', e);
                showNotification('Failed to save your links. LocalStorage might be full.', true);
            }
        }
    }

    // Initialize database
    loadUrlDatabase();
    
    // Generate a random short code
    function generateRandomCode(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
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
    
    // Sanitize custom path
    function sanitizeCustomPath(path) {
        return path.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
    }
    
    // Show notification
    function showNotification(message, isError = false) {
        notificationMessage.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');
        
        if (isError) {
            notification.classList.add('error');
        } else {
            notification.classList.remove('error');
        }
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, 3000);
    }
    
    // Create short URL
    function createShortUrl() {
        const longUrl = longUrlInput.value.trim();
        let customPath = customPathInput.value.trim();
        
        // Validate long URL
        if (!longUrl) {
            showNotification('Please enter a URL to shorten', true);
            return;
        }
        
        if (!isValidUrl(longUrl)) {
            showNotification('Please enter a valid URL', true);
            return;
        }
        
        // Generate or sanitize path
        if (customPath) {
            customPath = sanitizeCustomPath(customPath);
            if (customPath in urlDatabase && urlDatabase[customPath].longUrl !== longUrl) {
                showNotification('This custom name is already taken', true);
                return;
            }
        } else {
            // Generate a unique random code
            do {
                customPath = generateRandomCode();
            } while (customPath in urlDatabase);
        }
        
        // Save to database
        urlDatabase[customPath] = {
            longUrl: longUrl,
            createdAt: new Date().toISOString(),
            clicks: 0
        };
        
        // Save to localStorage
        saveUrlDatabase();
        
        // Generate the short URL
        const shortUrl = `${baseUrlWithoutFilename}?s=${customPath}`;

        // Display the result
        shortUrlInput.value = shortUrl;
        resultContainer.classList.remove('hidden');
        
        // Clear QR code container
        qrContainer.classList.add('hidden');
        qrcodeElement.innerHTML = '';
        
        // Update recent links
        updateRecentLinks();
        
        showNotification('Short URL created successfully!');
    }
    
    // Copy to clipboard
    function copyToClipboard() {
        shortUrlInput.select();
        document.execCommand('copy');
        showNotification('Copied to clipboard!');
    }
    
    // Generate QR code
    function generateQRCode() {
        const shortUrl = shortUrlInput.value;
        qrcodeElement.innerHTML = '';

        if (shortUrl) {
            try {
                // Using qrcode.js library
                QRCode.toCanvas(qrcodeElement, shortUrl, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#6c5ce7',
                        light: '#ffffff'
                    }
                }, function(error) {
                    if (error) {
                        console.error("QR Code error:", error);
                        showNotification('Error generating QR code', true);
                    } else {
                        qrContainer.classList.remove('hidden');
                    }
                });
            } catch (e) {
                console.error("QR Code generation error:", e);

                // Fallback method if the first method fails
                try {
                    new QRCode(qrcodeElement, {
                        text: shortUrl,
                        width: 200,
                        height: 200,
                        colorDark: '#6c5ce7',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                    qrContainer.classList.remove('hidden');
                } catch (err) {
                    console.error("Fallback QR Code error:", err);
                    showNotification('Could not generate QR code', true);
                }
            }
        }
    }
    
    // Download QR code
    function downloadQRCode() {
        // Try to find canvas element first
        const canvas = qrcodeElement.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'sudhanshulinks-qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            return;
        }

        // If no canvas, try to find img element (some QR libraries use img)
        const img = qrcodeElement.querySelector('img');
        if (img) {
            // Create a canvas to convert the img to a downloadable image
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const link = document.createElement('a');
            link.download = 'sudhanshulinks-qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            return;
        }

        showNotification('Could not download QR code', true);
    }
    
    // Update recent links display
    function updateRecentLinks() {
        if (Object.keys(urlDatabase).length === 0) {
            recentLinksSection.classList.add('hidden');
            return;
        }
        
        recentLinksSection.classList.remove('hidden');
        linksContainer.innerHTML = '';
        
        // Sort by creation date (newest first)
        const sortedLinks = Object.entries(urlDatabase)
            .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
            .slice(0, 5); // Show only the 5 most recent
        
        sortedLinks.forEach(([path, data]) => {
            const shortUrl = `${baseUrlWithoutFilename}?s=${path}`;
            
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            
            const linkDetails = document.createElement('div');
            linkDetails.className = 'link-details';
            
            const shortLinkElement = document.createElement('div');
            shortLinkElement.className = 'short-link';
            shortLinkElement.textContent = shortUrl;
            
            const originalLinkElement = document.createElement('div');
            originalLinkElement.className = 'original-link';
            originalLinkElement.textContent = data.longUrl;
            originalLinkElement.title = data.longUrl;
            
            linkDetails.appendChild(shortLinkElement);
            linkDetails.appendChild(originalLinkElement);
            
            const linkActions = document.createElement('div');
            linkActions.className = 'link-actions';
            
            const copyButton = document.createElement('button');
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.title = 'Copy to clipboard';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(shortUrl)
                    .then(() => showNotification('Copied to clipboard!'))
                    .catch(() => showNotification('Failed to copy', true));
            });
            
            const qrButton = document.createElement('button');
            qrButton.innerHTML = '<i class="fas fa-qrcode"></i>';
            qrButton.title = 'Generate QR Code';
            qrButton.addEventListener('click', () => {
                shortUrlInput.value = shortUrl;
                resultContainer.classList.remove('hidden');
                generateQRCode();
                
                // Scroll to the result container
                resultContainer.scrollIntoView({ behavior: 'smooth' });
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.title = 'Delete link';
            deleteButton.style.backgroundColor = '#d63031';
            deleteButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this link?')) {
                    delete urlDatabase[path];
                    saveUrlDatabase();
                    updateRecentLinks();
                    showNotification('Link deleted successfully');
                }
            });
            
            linkActions.appendChild(copyButton);
            linkActions.appendChild(qrButton);
            linkActions.appendChild(deleteButton);
            
            linkItem.appendChild(linkDetails);
            linkItem.appendChild(linkActions);
            
            linksContainer.appendChild(linkItem);
        });
    }
    
    // Handle URL redirection
    function handleRedirection() {
        // Get the shortcode from the query parameter 's'
        const urlParams = new URLSearchParams(window.location.search);
        const shortCode = urlParams.get('s');

        if (shortCode && urlDatabase[shortCode]) {
            // Increment click count
            urlDatabase[shortCode].clicks++;
            saveUrlDatabase();

            // Redirect to the long URL
            window.location.href = urlDatabase[shortCode].longUrl;
        }
    }
    
    // Event Listeners
    shortenBtn.addEventListener('click', createShortUrl);
    copyBtn.addEventListener('click', copyToClipboard);
    qrBtn.addEventListener('click', generateQRCode);
    downloadQrBtn.addEventListener('click', downloadQRCode);
    
    // Handle Enter key press
    longUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createShortUrl();
        }
    });
    
    customPathInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createShortUrl();
        }
    });
    
    // Initialize
    updateRecentLinks();
    handleRedirection();
});