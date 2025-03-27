document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const moodInput = document.getElementById('mood-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsSection = document.getElementById('results-section');
    const moodEmoji = document.getElementById('mood-emoji');
    const moodTitle = document.getElementById('mood-title');
    const moodDescription = document.getElementById('mood-description');
    const tracksContainer = document.getElementById('tracks-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const shareModal = document.getElementById('share-modal');
    const sharePlaylistBtn = document.getElementById('share-playlist');
    const closeModalBtn = document.querySelector('.close-modal');
    const shareLink = document.getElementById('share-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const playAllBtn = document.getElementById('play-all');
    const savePlaylistBtn = document.getElementById('save-playlist');

    // Mood configurations with corresponding emojis, descriptions, and music genres
    const moodConfigs = {
        happy: {
            emoji: '😊',
            title: 'Happy & Upbeat',
            description: 'You\'re feeling positive and cheerful! Here\'s a playlist to match your upbeat mood.',
            genres: ['pop', 'happy', 'feel-good', 'upbeat'],
            color: '#fdcb6e'
        },
        excited: {
            emoji: '🤩',
            title: 'Excited & Energetic',
            description: 'You\'re bursting with energy and excitement! This playlist will keep your enthusiasm going.',
            genres: ['dance', 'electronic', 'party', 'edm'],
            color: '#ff7675'
        },
        relaxed: {
            emoji: '😌',
            title: 'Calm & Relaxed',
            description: 'You\'re feeling peaceful and relaxed. These tracks will help maintain your tranquil state.',
            genres: ['chill', 'ambient', 'acoustic', 'lofi'],
            color: '#74b9ff'
        },
        sad: {
            emoji: '😢',
            title: 'Melancholic & Reflective',
            description: 'You\'re feeling a bit down. This playlist offers comfort and emotional resonance.',
            genres: ['sad', 'emotional', 'indie', 'ballad'],
            color: '#a29bfe'
        },
        angry: {
            emoji: '😠',
            title: 'Intense & Powerful',
            description: 'You\'re feeling intense emotions. Channel that energy with this powerful playlist.',
            genres: ['rock', 'metal', 'intense', 'workout'],
            color: '#d63031'
        },
        tired: {
            emoji: '😴',
            title: 'Tired & Mellow',
            description: 'You\'re feeling low on energy. These gentle tracks will provide a soothing backdrop.',
            genres: ['sleep', 'ambient', 'piano', 'background'],
            color: '#0984e3'
        },
        focused: {
            emoji: '🧠',
            title: 'Focused & Productive',
            description: 'You\'re in a productive mindset. This playlist will help maintain your concentration.',
            genres: ['focus', 'instrumental', 'study', 'concentration'],
            color: '#00b894'
        },
        romantic: {
            emoji: '❤️',
            title: 'Romantic & Loving',
            description: 'You\'re feeling romantic and affectionate. Enjoy these love-inspired tracks.',
            genres: ['love', 'romantic', 'r&b', 'soul'],
            color: '#e84393'
        }
    };

    // Keywords associated with each mood
    const moodKeywords = {
        happy: ['happy', 'joy', 'cheerful', 'great', 'wonderful', 'fantastic', 'delighted', 'pleased', 'glad', 'content', 'satisfied', 'thrilled', 'excited', 'good', 'positive', 'awesome', 'amazing', 'excellent', 'ecstatic', 'elated'],
        excited: ['excited', 'thrilled', 'enthusiastic', 'eager', 'energetic', 'pumped', 'hyped', 'stoked', 'amped', 'psyched', 'animated', 'lively', 'spirited', 'vibrant', 'dynamic', 'exhilarated', 'fired up', 'passionate'],
        relaxed: ['relaxed', 'calm', 'peaceful', 'tranquil', 'serene', 'chill', 'mellow', 'laid-back', 'easy-going', 'composed', 'collected', 'untroubled', 'placid', 'quiet', 'still', 'zen', 'soothing', 'gentle'],
        sad: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'gloomy', 'melancholy', 'somber', 'sorrowful', 'miserable', 'heartbroken', 'upset', 'disappointed', 'dejected', 'downcast', 'despondent', 'disheartened', 'grief', 'mourning'],
        angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'enraged', 'outraged', 'irate', 'incensed', 'indignant', 'exasperated', 'heated', 'infuriated', 'provoked', 'resentful', 'hostile', 'bitter'],
        tired: ['tired', 'exhausted', 'fatigued', 'weary', 'drained', 'sleepy', 'drowsy', 'lethargic', 'worn out', 'spent', 'burned out', 'beat', 'dead tired', 'knackered', 'bushed', 'pooped', 'wiped out'],
        focused: ['focused', 'concentrated', 'determined', 'productive', 'efficient', 'diligent', 'attentive', 'alert', 'sharp', 'engaged', 'absorbed', 'immersed', 'dedicated', 'committed', 'studious', 'industrious', 'working'],
        romantic: ['love', 'romantic', 'affectionate', 'passionate', 'intimate', 'tender', 'loving', 'adoring', 'fond', 'smitten', 'infatuated', 'enamored', 'devoted', 'attracted', 'charmed', 'enchanted', 'relationship', 'date']
    };

    // Current playlist data
    let currentPlaylist = {
        mood: '',
        tracks: []
    };

    // Event Listeners
    analyzeBtn.addEventListener('click', analyzeMood);
    sharePlaylistBtn.addEventListener('click', openShareModal);
    closeModalBtn.addEventListener('click', closeShareModal);
    copyLinkBtn.addEventListener('click', copyShareLink);
    playAllBtn.addEventListener('click', playAllTracks);
    savePlaylistBtn.addEventListener('click', savePlaylist);

    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            closeShareModal();
        }
    });

    // Function to analyze mood from text input
    async function analyzeMood() {
        const text = moodInput.value.trim();
        
        if (!text) {
            showNotification('Please describe your mood first!', true);
            return;
        }
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        loadingText.textContent = 'Analyzing your mood...';
        
        try {
            // Analyze text to determine mood
            const mood = determineMood(text);
            
            // Update mood display
            updateMoodDisplay(mood);
            
            // Show loading message for playlist generation
            loadingText.textContent = 'Creating your personalized playlist...';
            
            // Generate playlist based on mood
            await generatePlaylist(mood);
            
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            // Show results section
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Save this mood to history
            saveMoodToHistory(mood, text);
            
        } catch (error) {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            showNotification('An error occurred. Please try again.', true);
        }
    }

    // Function to determine mood from text
    function determineMood(text) {
        text = text.toLowerCase();
        
        // Count occurrences of keywords for each mood
        const moodScores = {};
        
        for (const [mood, keywords] of Object.entries(moodKeywords)) {
            moodScores[mood] = 0;
            
            for (const keyword of keywords) {
                // Check if the keyword is in the text
                if (text.includes(keyword)) {
                    // Add score based on the keyword match
                    moodScores[mood] += 1;
                }
            }
        }
        
        // Find the mood with the highest score
        let highestScore = 0;
        let detectedMood = 'happy'; // Default mood
        
        for (const [mood, score] of Object.entries(moodScores)) {
            if (score > highestScore) {
                highestScore = score;
                detectedMood = mood;
            }
        }
        
        // If no mood was detected strongly, use sentiment analysis for backup
        if (highestScore === 0) {
            // Simple sentiment analysis
            const positiveWords = ['good', 'great', 'nice', 'love', 'happy', 'wonderful', 'excellent', 'amazing', 'fantastic', 'awesome'];
            const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'upset', 'disappointed', 'horrible', 'worst'];
            
            let positiveScore = 0;
            let negativeScore = 0;
            
            for (const word of positiveWords) {
                if (text.includes(word)) positiveScore++;
            }
            
            for (const word of negativeWords) {
                if (text.includes(word)) negativeScore++;
            }
            
            if (positiveScore > negativeScore) {
                detectedMood = 'happy';
            } else if (negativeScore > positiveScore) {
                detectedMood = 'sad';
            }
        }
        
        return detectedMood;
    }

    // Function to update mood display
    function updateMoodDisplay(mood) {
        const moodConfig = moodConfigs[mood];
        
        moodEmoji.textContent = moodConfig.emoji;
        moodTitle.textContent = moodConfig.title;
        moodDescription.textContent = moodConfig.description;
        
        // Update emoji background color
        moodEmoji.style.backgroundColor = moodConfig.color;
        
        // Store current mood
        currentPlaylist.mood = mood;
    }

    // Function to generate playlist based on mood
    async function generatePlaylist(mood) {
        const moodConfig = moodConfigs[mood];
        
        // Clear previous tracks
        tracksContainer.innerHTML = '';
        currentPlaylist.tracks = [];
        
        try {
            // Get tracks from Deezer API (via RapidAPI)
            const tracks = await fetchTracksFromAPI(moodConfig.genres);
            
            // Display tracks
            displayTracks(tracks);
            
        } catch (error) {
            console.error('Error generating playlist:', error);
            
            // Fallback to mock data if API fails
            const mockTracks = generateMockTracks(mood);
            displayTracks(mockTracks);
        }
    }

    // Function to fetch tracks from API
    async function fetchTracksFromAPI(genres) {
        // Randomly select one of the genres
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        
        try {
            // Using the Deezer API via RapidAPI
            // Note: In a real app, you would need to sign up for RapidAPI and get your own API key
            // This is a mock implementation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Return mock data for demonstration
            return generateMockTracks(currentPlaylist.mood);
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Function to generate mock tracks (fallback if API fails)
    function generateMockTracks(mood) {
        const moodConfig = moodConfigs[mood];
        const tracks = [];
        
        // Mock track data based on mood
        const mockArtists = {
            happy: ['Pharrell Williams', 'Justin Timberlake', 'Katy Perry', 'Bruno Mars', 'Taylor Swift'],
            excited: ['David Guetta', 'Calvin Harris', 'Martin Garrix', 'The Chainsmokers', 'Avicii'],
            relaxed: ['Jack Johnson', 'Norah Jones', 'Bon Iver', 'Coldplay', 'Enya'],
            sad: ['Adele', 'Sam Smith', 'Lana Del Rey', 'Billie Eilish', 'The Weeknd'],
            angry: ['Linkin Park', 'Metallica', 'Rage Against The Machine', 'System of a Down', 'Slipknot'],
            tired: ['Brian Eno', 'Sigur Rós', 'Max Richter', 'Ludovico Einaudi', 'Yann Tiersen'],
            focused: ['Hans Zimmer', 'Mozart', 'Bach', 'Explosions in the Sky', 'Tycho'],
            romantic: ['Ed Sheeran', 'John Legend', 'Beyoncé', 'Frank Sinatra', 'Marvin Gaye']
        };
        
        const mockSongs = {
            happy: ['Happy', 'Can\'t Stop the Feeling', 'Uptown Funk', 'Good as Hell', 'Walking on Sunshine'],
            excited: ['Titanium', 'Don\'t You Worry Child', 'Levels', 'Closer', 'Wake Me Up'],
            relaxed: ['Better Together', 'Don\'t Know Why', 'Skinny Love', 'Fix You', 'Only Time'],
            sad: ['Someone Like You', 'Stay With Me', 'Summertime Sadness', 'when the party\'s over', 'Call Out My Name'],
            angry: ['In The End', 'Enter Sandman', 'Killing In The Name', 'Chop Suey!', 'Duality'],
            tired: ['Ambient 1: Music for Airports', 'Hoppípolla', 'Sleep', 'Experience', 'Comptine d\'un autre été'],
            focused: ['Time', 'Piano Concerto No. 21', 'Air on the G String', 'Your Hand in Mine', 'Awake'],
            romantic: ['Perfect', 'All of Me', 'Halo', 'The Way You Look Tonight', 'Let\'s Stay Together']
        };
        
        // Generate 8 mock tracks
        for (let i = 0; i < 8; i++) {
            const artistIndex = i % 5;
            const songIndex = i % 5;
            
            tracks.push({
                id: `mock-${mood}-${i}`,
                title: mockSongs[mood][songIndex],
                artist: mockArtists[mood][artistIndex],
                album: `${mockArtists[mood][artistIndex]} - Greatest Hits`,
                cover: `https://picsum.photos/seed/${mood}${i}/300/300`,
                preview: null // No actual preview URL in mock data
            });
        }
        
        return tracks;
    }

    // Function to display tracks in the UI
    function displayTracks(tracks) {
        tracksContainer.innerHTML = '';
        currentPlaylist.tracks = tracks;
        
        tracks.forEach(track => {
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            trackCard.dataset.trackId = track.id;
            
            trackCard.innerHTML = `
                <img src="${track.cover}" alt="${track.title}" class="track-image">
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                    <div class="track-controls">
                        <button class="track-btn play-track" title="Play">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="track-btn add-to-favorites" title="Add to favorites">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="track-btn share-track" title="Share">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            
            tracksContainer.appendChild(trackCard);
            
            // Add event listeners to track buttons
            const playBtn = trackCard.querySelector('.play-track');
            const favoriteBtn = trackCard.querySelector('.add-to-favorites');
            const shareBtn = trackCard.querySelector('.share-track');
            
            playBtn.addEventListener('click', () => playTrack(track));
            favoriteBtn.addEventListener('click', (e) => toggleFavorite(e, track));
            shareBtn.addEventListener('click', () => shareTrack(track));
        });
    }

    // Function to play a track
    function playTrack(track) {
        // In a real app, this would play the track
        console.log('Playing track:', track.title);
        
        // Show notification
        showNotification(`Playing: ${track.title} by ${track.artist}`);
        
        // If we had actual preview URLs, we would play them here
        if (track.preview) {
            const audio = new Audio(track.preview);
            audio.play();
        }
    }

    // Function to play all tracks
    function playAllTracks() {
        if (currentPlaylist.tracks.length > 0) {
            // In a real app, this would play all tracks in sequence
            showNotification(`Playing your ${moodConfigs[currentPlaylist.mood].title} playlist`);
            
            // Play the first track for demonstration
            playTrack(currentPlaylist.tracks[0]);
        }
    }

    // Function to toggle favorite status
    function toggleFavorite(event, track) {
        const heartIcon = event.currentTarget.querySelector('i');
        
        if (heartIcon.classList.contains('far')) {
            // Add to favorites
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            heartIcon.style.color = '#e84393';
            showNotification(`Added "${track.title}" to favorites`);
        } else {
            // Remove from favorites
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            heartIcon.style.color = '';
            showNotification(`Removed "${track.title}" from favorites`);
        }
    }

    // Function to share a track
    function shareTrack(track) {
        // Generate a share URL
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=track&id=${track.id}&mood=${currentPlaylist.mood}`;
        
        // In a real app, this would open a share dialog
        showNotification(`Share link for "${track.title}" copied to clipboard`);
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    // Function to save playlist
    function savePlaylist() {
        // In a real app, this would save the playlist to user's account
        showNotification(`Your ${moodConfigs[currentPlaylist.mood].title} playlist has been saved!`);
        
        // Save to localStorage for demonstration
        const savedPlaylists = JSON.parse(localStorage.getItem('moodTunesPlaylists') || '[]');
        
        const playlistToSave = {
            id: Date.now(),
            mood: currentPlaylist.mood,
            title: `${moodConfigs[currentPlaylist.mood].title} Playlist`,
            tracks: currentPlaylist.tracks,
            createdAt: new Date().toISOString()
        };
        
        savedPlaylists.push(playlistToSave);
        localStorage.setItem('moodTunesPlaylists', JSON.stringify(savedPlaylists));
    }

    // Function to open share modal
    function openShareModal() {
        // Generate a share URL for the playlist
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=playlist&mood=${currentPlaylist.mood}`;
        
        // Set the share link
        shareLink.value = shareUrl;
        
        // Display the modal
        shareModal.style.display = 'flex';
    }

    // Function to close share modal
    function closeShareModal() {
        shareModal.style.display = 'none';
    }

    // Function to copy share link
    function copyShareLink() {
        shareLink.select();
        document.execCommand('copy');
        
        // Show notification
        showNotification('Link copied to clipboard!');
    }

    // Function to save mood to history
    function saveMoodToHistory(mood, text) {
        const moodHistory = JSON.parse(localStorage.getItem('moodTunesHistory') || '[]');
        
        const moodEntry = {
            mood: mood,
            text: text,
            timestamp: new Date().toISOString()
        };
        
        moodHistory.push(moodEntry);
        
        // Keep only the last 10 entries
        if (moodHistory.length > 10) {
            moodHistory.shift();
        }
        
        localStorage.setItem('moodTunesHistory', JSON.stringify(moodHistory));
    }

    // Function to show notification
    function showNotification(message, isError = false) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Check for shared content on page load
    function checkForSharedContent() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareType = urlParams.get('share');
        
        if (shareType === 'playlist') {
            const mood = urlParams.get('mood');
            if (mood && moodConfigs[mood]) {
                // Auto-generate playlist for the shared mood
                moodInput.value = `I'm feeling ${mood}`;
                analyzeMood();
            }
        } else if (shareType === 'track') {
            const trackId = urlParams.get('id');
            const mood = urlParams.get('mood');
            
            if (trackId && mood && moodConfigs[mood]) {
                // Show the specific track
                moodInput.value = `I'm feeling ${mood}`;
                analyzeMood();
                
                // In a real app, we would highlight the specific track
                setTimeout(() => {
                    const trackElement = document.querySelector(`[data-track-id="${trackId}"]`);
                    if (trackElement) {
                        trackElement.scrollIntoView({ behavior: 'smooth' });
                        trackElement.style.boxShadow = '0 0 0 3px var(--primary-color)';
                    }
                }, 2000);
            }
        }
    }

    // Add CSS for notifications
    function addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                background-color: var(--success-color);
                color: white;
                border-radius: 4px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                z-index: 1001;
                transform: translateY(100px);
                opacity: 0;
                transition: transform 0.3s, opacity 0.3s;
            }
            
            .notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .notification.error {
                background-color: var(--error-color);
            }
            
            .notification.success {
                background-color: var(--success-color);
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize
    function init() {
        addNotificationStyles();
        checkForSharedContent();
    }

    // Run initialization
    init();
});