# SudhanshuLinks - Personal URL Shortener for GitHub Pages

A personalized URL shortener created by Sudhanshu Tiwari, designed specifically to work with GitHub Pages. This tool allows you to create custom short links that are easy to share and remember, with all data stored securely in your browser.

![SudhanshuLinks](https://via.placeholder.com/800x400?text=SudhanshuLinks)

## Features

- Create short URLs with custom paths
- Generate QR codes for your short links
- Track the number of clicks on your links
- Copy links to clipboard with one click
- Responsive design that works on all devices
- 100% client-side - all data stored in your browser
- No server required - works perfectly on GitHub Pages
- Privacy-focused - your data never leaves your device
- Personalized with your branding
- Simple, clean, and sober design

## How It Works

SudhanshuLinks uses browser local storage to save your shortened URLs. When someone visits a short link (in the format `https://username.github.io/repository/?s=shortcode`), the application checks if the shortcode exists in the database and redirects to the corresponding long URL.

## Deployment Instructions

### Deploying to GitHub Pages

1. Fork this repository to your GitHub account
2. Go to the repository settings
3. Navigate to the "Pages" section
4. Select the branch you want to deploy (usually `main` or `master`)
5. Click "Save"
6. Your URL shortener will be available at `https://yourusername.github.io/repository-name/`

### Using a Custom Domain

1. After deploying to GitHub Pages, go to the repository settings
2. In the "Pages" section, enter your custom domain
3. Update your domain's DNS settings:
   - Add an A record pointing to GitHub Pages IP addresses
   - Or add a CNAME record pointing to `yourusername.github.io`
4. Wait for DNS propagation (may take up to 48 hours)

## Usage

1. Enter the long URL you want to shorten
2. (Optional) Enter a custom path for your short URL
3. Click "Shorten"
4. Copy the generated short URL or QR code
5. Share your short link!

## Limitations

- Since this application uses browser local storage, your shortened URLs are stored in the browser you use to create them
- The application works best with a custom domain
- GitHub Pages has usage limits, so this is best for personal use rather than high-traffic applications

## Connect with Sudhanshu

- Twitter/X: [https://x.com/sudhanshusX](https://x.com/sudhanshusX)
- LinkedIn: [https://www.linkedin.com/in/tiwari-sudhanshu/](https://www.linkedin.com/in/tiwari-sudhanshu/)
- GitHub: [https://github.com/sudhanshutiwari264](https://github.com/sudhanshutiwari264)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2025 Sudhanshu Tiwari. All rights reserved.