/**
 * Simple QR Code Generator
 * This is a fallback QR code generator that creates a QR code image using Google Charts API
 */
function generateGoogleQRCode(text, elementId, width = 150, height = 150) {
  const element = document.getElementById(elementId);
  if (!element) return false;
  
  // Clear the element
  element.innerHTML = '';
  
  // Create an image element
  const img = document.createElement('img');
  
  // Set the source to Google Charts API
  img.src = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(text)}&chs=${width}x${height}&chld=H|0`;
  
  // Set alt text
  img.alt = 'QR Code';
  
  // Add the image to the element
  element.appendChild(img);
  
  return true;
}