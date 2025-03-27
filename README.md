# SudhanshuLinks - Simple URL Shortener

A simple URL shortener that works entirely in the browser. No server required!

## Features

- Create short URLs with custom paths
- Generate QR codes for your links
- Track click counts
- Works entirely in the browser using localStorage
- No server or database required
- Can be hosted on GitHub Pages

## How to Use

1. Enter a long URL you want to shorten
2. (Optional) Enter a custom path
3. Click "Shorten URL"
4. Copy the shortened URL or generate a QR code
5. Share your short link!

## How to Deploy

1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Your URL shortener will be available at `https://yourusername.github.io/repository-name/`

## How It Works

This URL shortener uses your browser's localStorage to save the mapping between short codes and original URLs. When someone visits a short link, the application looks up the original URL in localStorage and redirects to it.

## Limitations

- Since this uses localStorage, your shortened URLs are only stored in the browser you use to create them
- If you clear your browser data, your shortened URLs will be lost
- This is designed for personal use rather than as a public service

## Created By

Sudhanshu Tiwari

- Twitter/X: [@sudhanshusX](https://x.com/sudhanshusX)
- LinkedIn: [tiwari-sudhanshu](https://www.linkedin.com/in/tiwari-sudhanshu/)
- GitHub: [sudhanshutiwari264](https://github.com/sudhanshutiwari264)

## License

MIT License