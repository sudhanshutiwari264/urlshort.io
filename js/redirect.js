// URL Shortener Redirect Handler

document.addEventListener('DOMContentLoaded', function() {
  // Get the code from the URL path
  const path = window.location.pathname;
  const code = path.substring(path.lastIndexOf('/') + 1);
  
  // If there's no code in the path, check query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const queryCode = urlParams.get('code');
  
  // Use the code from the path or query parameter
  const finalCode = code || queryCode;
  
  if (!finalCode) {
    // If no code is found, redirect to the home page
    window.location.href = '/';
    return;
  }
  
  // Get links from localStorage
  const linksJson = localStorage.getItem('url2025_links');
  const links = linksJson ? JSON.parse(linksJson) : [];
  
  // Find the link with this code
  const link = links.find(link => link.urlCode === finalCode);
  
  if (link) {
    // Update click count
    link.clicks = (link.clicks || 0) + 1;
    link.lastClickedAt = new Date().toISOString();
    
    // Save updated link back to localStorage
    const updatedLinks = links.map(l => l.id === link.id ? link : l);
    localStorage.setItem('url2025_links', JSON.stringify(updatedLinks));
    
    // Redirect to the long URL
    window.location.href = link.longUrl;
  } else {
    // If no link is found, redirect to the home page
    window.location.href = '/';
  }
});