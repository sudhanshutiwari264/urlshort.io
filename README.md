# Mood Music Player with YouTube Music API

A web application that analyzes your mood from text input and creates personalized playlists using the YouTube Music API.

## Features

- Mood analysis from text input
- YouTube Music API integration
- Multi-source music playback
- Responsive design
- Personalized playlists

## Deployment on Vercel

### Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/download) (optional for local development)

### Steps to Deploy

1. **Install Vercel CLI** (optional for local development)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   # Navigate to your project directory
   cd your-project-directory
   
   # Deploy
   vercel
   ```

4. **Configure Environment Variables** (if needed)
   - Go to your project on the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add any required environment variables

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Alternative: Deploy via GitHub

1. Push your code to a GitHub repository
2. Import your project on Vercel dashboard
3. Configure build settings if needed
4. Deploy

## Local Development

1. **Install dependencies**
   ```bash
   pip install -r api/requirements.txt
   ```

2. **Run the Flask server**
   ```bash
   cd api
   python index.py
   ```

3. **Open in browser**
   Open http://localhost:5000 in your web browser

## Project Structure

- `api/index.py` - Flask server with YouTube Music API integration
- `app.js` - Frontend JavaScript
- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `vercel.json` - Vercel configuration
- `public-music-data/` - Sample music data

## Technologies Used

- YouTube Music API (ytmusicapi)
- Flask
- JavaScript
- HTML/CSS
- Vercel for deployment