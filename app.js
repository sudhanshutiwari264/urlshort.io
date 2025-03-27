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
            // First try to fetch from Spotify API
            try {
                const spotifyTracks = await fetchFromSpotify(randomGenre);
                if (spotifyTracks && spotifyTracks.length > 0) {
                    return spotifyTracks;
                }
            } catch (spotifyError) {
                console.warn('Spotify API error, falling back to Jamendo:', spotifyError);
            }

            // Then try Jamendo API
            try {
                const jamendoTracks = await fetchFromJamendo(randomGenre);
                if (jamendoTracks && jamendoTracks.length > 0) {
                    return jamendoTracks;
                }
            } catch (jamendoError) {
                console.warn('Jamendo API error, falling back to mock data:', jamendoError);
            }

            // If both APIs fail, use mock data
            return generateMockTracks(currentPlaylist.mood);

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Function to fetch tracks from Spotify
    async function fetchFromSpotify(genre) {
        // Spotify API credentials - in a real app, these would be secured on a server
        // For demo purposes only - you should NEVER expose these in client-side code
        const clientId = '1a2b3c4d5e6f7g8h9i0j';  // Replace with your actual client ID
        const clientSecret = '1a2b3c4d5e6f7g8h9i0j'; // Replace with your actual client secret

        try {
            // Get access token
            const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: 'grant_type=client_credentials'
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to get Spotify access token');
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Search for tracks by genre
            const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=genre:${genre}&type=track&limit=8`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });

            if (!searchResponse.ok) {
                throw new Error('Failed to search Spotify tracks');
            }

            const searchData = await searchResponse.json();

            // Format the response
            return searchData.tracks.items.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                cover: track.album.images[0].url,
                preview: track.preview_url
            }));

        } catch (error) {
            console.error('Spotify API error:', error);
            throw error;
        }
    }

    // Function to fetch tracks from Jamendo
    async function fetchFromJamendo(genre) {
        // Jamendo API client ID - in a real app, this would be secured
        const clientId = 'your_jamendo_client_id'; // Replace with your actual client ID

        try {
            const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=8&tags=${genre}`);

            if (!response.ok) {
                throw new Error('Failed to fetch from Jamendo API');
            }

            const data = await response.json();

            // Format the response
            return data.results.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artist_name,
                album: track.album_name,
                cover: track.album_image,
                preview: track.audio
            }));

        } catch (error) {
            console.error('Jamendo API error:', error);
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

        // Royalty-free music samples from Pixabay for demo purposes
        // These are mapped to different moods
        const moodPreviews = {
            happy: [
                'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3',
                'https://cdn.pixabay.com/download/audio/2022/03/19/audio_c8e2e367a7.mp3',
                'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b34eaf9.mp3',
                'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
                'https://cdn.pixabay.com/download/audio/2022/11/22/audio_de7d47feb0.mp3'
            ],
            excited: [
                'https://cdn.pixabay.com/download/audio/2022/03/10/audio_1a609013c8.mp3',
                'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe58f49.mp3',
                'https://cdn.pixabay.com/download/audio/2022/10/30/audio_f1fa483f9b.mp3',
                'https://cdn.pixabay.com/download/audio/2022/09/02/audio_69db1d6e01.mp3',
                'https://cdn.pixabay.com/download/audio/2022/01/20/audio_bae2b7b68d.mp3'
            ],
            relaxed: [
                'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e9124485.mp3',
                'https://cdn.pixabay.com/download/audio/2021/11/13/audio_cb4f1212a9.mp3',
                'https://cdn.pixabay.com/download/audio/2022/04/27/audio_c52cf6f4c5.mp3',
                'https://cdn.pixabay.com/download/audio/2022/01/18/audio_e92fe2aa6c.mp3',
                'https://cdn.pixabay.com/download/audio/2022/01/25/audio_9cc82a4773.mp3'
            ],
            sad: [
                'https://cdn.pixabay.com/download/audio/2022/01/27/audio_d0c19a4f4d.mp3',
                'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f1.mp3',
                'https://cdn.pixabay.com/download/audio/2022/02/07/audio_d0c3b3e428.mp3',
                'https://cdn.pixabay.com/download/audio/2022/02/11/audio_8fad8a8e1e.mp3',
                'https://cdn.pixabay.com/download/audio/2022/02/28/audio_c9b7d810d5.mp3'
            ],
            angry: [
                'https://cdn.pixabay.com/download/audio/2022/10/16/audio_f52af083e2.mp3',
                'https://cdn.pixabay.com/download/audio/2022/09/18/audio_a4d4a8be7f.mp3',
                'https://cdn.pixabay.com/download/audio/2022/08/23/audio_3b6a08e578.mp3',
                'https://cdn.pixabay.com/download/audio/2022/07/04/audio_ae1d2b08c7.mp3',
                'https://cdn.pixabay.com/download/audio/2022/05/13/audio_a8a0b1b7f4.mp3'
            ],
            tired: [
                'https://cdn.pixabay.com/download/audio/2022/01/21/audio_31743c6c02.mp3',
                'https://cdn.pixabay.com/download/audio/2021/11/01/audio_cb4c8bcf7f.mp3',
                'https://cdn.pixabay.com/download/audio/2022/01/20/audio_1d2f9a3d4e.mp3',
                'https://cdn.pixabay.com/download/audio/2022/02/11/audio_c6b0d2f1e5.mp3',
                'https://cdn.pixabay.com/download/audio/2022/02/07/audio_d0c3b3e428.mp3'
            ],
            focused: [
                'https://cdn.pixabay.com/download/audio/2021/11/25/audio_5c6b20d881.mp3',
                'https://cdn.pixabay.com/download/audio/2022/01/13/audio_3b6c767d23.mp3',
                'https://cdn.pixabay.com/download/audio/2022/03/07/audio_40a06cc3c7.mp3',
                'https://cdn.pixabay.com/download/audio/2022/04/04/audio_0428e7e8e8.mp3',
                'https://cdn.pixabay.com/download/audio/2022/04/08/audio_8f2c346ba4.mp3'
            ],
            romantic: [
                'https://cdn.pixabay.com/download/audio/2022/01/18/audio_e92fe2aa6c.mp3',
                'https://cdn.pixabay.com/download/audio/2022/02/11/audio_8fad8a8e1e.mp3',
                'https://cdn.pixabay.com/download/audio/2022/03/19/audio_c8e2e367a7.mp3',
                'https://cdn.pixabay.com/download/audio/2022/01/27/audio_d0c19a4f4d.mp3',
                'https://cdn.pixabay.com/download/audio/2022/01/25/audio_9cc82a4773.mp3'
            ]
        };

        // Generate 8 mock tracks
        for (let i = 0; i < 8; i++) {
            const artistIndex = i % 5;
            const songIndex = i % 5;

            // Get a preview URL for this mood
            const previewUrl = moodPreviews[mood][i % 5];

            tracks.push({
                id: `mock-${mood}-${i}`,
                title: mockSongs[mood][songIndex],
                artist: mockArtists[mood][artistIndex],
                album: `${mockArtists[mood][artistIndex]} - Greatest Hits`,
                cover: `https://picsum.photos/seed/${mood}${i}/300/300`,
                preview: previewUrl // Actual preview URL from Pixabay (royalty-free)
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

    // Audio player instance
    let currentAudio = null;
    let currentlyPlayingId = null;

    // Function to play a track
    function playTrack(track) {
        console.log('Playing track:', track.title);

        // If there's already a track playing, stop it
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;

            // If the same track was clicked, just pause it and update UI
            if (currentlyPlayingId === track.id) {
                updatePlayButtonUI(track.id, false);
                currentlyPlayingId = null;
                showNotification(`Paused: ${track.title}`);
                return;
            }

            // Update previous track's button
            if (currentlyPlayingId) {
                updatePlayButtonUI(currentlyPlayingId, false);
            }
        }

        // If the track has a preview URL
        if (track.preview) {
            // Create new audio instance
            currentAudio = new Audio(track.preview);
            currentlyPlayingId = track.id;

            // Update UI
            updatePlayButtonUI(track.id, true);

            // Play the track
            currentAudio.play()
                .then(() => {
                    showNotification(`Playing: ${track.title} by ${track.artist}`);
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    showNotification(`Couldn't play track: ${error.message}`, true);
                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(track.id, false);
                });

            // When track ends
            currentAudio.addEventListener('ended', () => {
                currentAudio = null;
                currentlyPlayingId = null;
                updatePlayButtonUI(track.id, false);
            });
        } else {
            // If no preview URL is available
            showNotification(`No preview available for "${track.title}"`, true);

            // For demo purposes, let's try to use a mock audio file
            const mockAudioUrl = getMockAudioUrl(track.id);
            if (mockAudioUrl) {
                currentAudio = new Audio(mockAudioUrl);
                currentlyPlayingId = track.id;

                // Update UI
                updatePlayButtonUI(track.id, true);

                // Play the mock audio
                currentAudio.play()
                    .then(() => {
                        showNotification(`Playing demo: ${track.title} by ${track.artist}`);
                    })
                    .catch(error => {
                        console.error('Error playing mock audio:', error);
                        currentAudio = null;
                        currentlyPlayingId = null;
                        updatePlayButtonUI(track.id, false);
                    });

                // When track ends
                currentAudio.addEventListener('ended', () => {
                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(track.id, false);
                });
            }
        }
    }

    // Function to update play button UI
    function updatePlayButtonUI(trackId, isPlaying) {
        const trackCard = document.querySelector(`[data-track-id="${trackId}"]`);
        if (trackCard) {
            const playButton = trackCard.querySelector('.play-track');
            const icon = playButton.querySelector('i');

            if (isPlaying) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                trackCard.classList.add('playing');
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                trackCard.classList.remove('playing');
            }
        }
    }

    // Function to get mock audio URL for demo purposes
    function getMockAudioUrl(trackId) {
        // These are royalty-free music samples for demo purposes
        const mockAudios = [
            'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', // Upbeat
            'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e9124485.mp3', // Relaxed
            'https://cdn.pixabay.com/download/audio/2022/01/27/audio_d0c19a4f4d.mp3', // Sad
            'https://cdn.pixabay.com/download/audio/2022/03/10/audio_1a609013c8.mp3', // Energetic
            'https://cdn.pixabay.com/download/audio/2021/11/25/audio_5c6b20d881.mp3'  // Focused
        ];

        // Use the track ID to deterministically select a mock audio
        const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return mockAudios[hash % mockAudios.length];
    }

    // Track queue for "Play All" functionality
    let trackQueue = [];
    let isPlayingAll = false;

    // Function to play all tracks
    function playAllTracks() {
        if (currentPlaylist.tracks.length === 0) {
            showNotification('No tracks to play', true);
            return;
        }

        // If already playing all, stop
        if (isPlayingAll) {
            stopPlayingAll();
            return;
        }

        // Set up the queue
        trackQueue = [...currentPlaylist.tracks];
        isPlayingAll = true;

        // Update Play All button
        updatePlayAllButtonUI(true);

        // Show notification
        showNotification(`Playing your ${moodConfigs[currentPlaylist.mood].title} playlist`);

        // Start playing the first track
        playNextInQueue();
    }

    // Function to play next track in queue
    function playNextInQueue() {
        if (trackQueue.length === 0) {
            // Queue is empty, we're done
            isPlayingAll = false;
            updatePlayAllButtonUI(false);
            return;
        }

        // Get the next track
        const nextTrack = trackQueue.shift();

        // If there's already a track playing, stop it
        if (currentAudio) {
            currentAudio.pause();

            // Update previous track's button
            if (currentlyPlayingId) {
                updatePlayButtonUI(currentlyPlayingId, false);
            }
        }

        // Function to set up the next track
        const setupNextTrack = () => {
            // If we're still in "play all" mode
            if (isPlayingAll) {
                // Wait a bit before playing the next track
                setTimeout(playNextInQueue, 1000);
            }
        };

        // If the track has a preview URL
        if (nextTrack.preview) {
            // Create new audio instance
            currentAudio = new Audio(nextTrack.preview);
            currentlyPlayingId = nextTrack.id;

            // Update UI
            updatePlayButtonUI(nextTrack.id, true);

            // Play the track
            currentAudio.play()
                .then(() => {
                    showNotification(`Now playing: ${nextTrack.title} by ${nextTrack.artist}`);
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(nextTrack.id, false);
                    setupNextTrack(); // Try the next track
                });

            // When track ends
            currentAudio.addEventListener('ended', () => {
                currentAudio = null;
                currentlyPlayingId = null;
                updatePlayButtonUI(nextTrack.id, false);
                setupNextTrack();
            });
        } else {
            // If no preview URL is available, try mock audio
            const mockAudioUrl = getMockAudioUrl(nextTrack.id);
            if (mockAudioUrl) {
                currentAudio = new Audio(mockAudioUrl);
                currentlyPlayingId = nextTrack.id;

                // Update UI
                updatePlayButtonUI(nextTrack.id, true);

                // Play the mock audio
                currentAudio.play()
                    .then(() => {
                        showNotification(`Playing demo: ${nextTrack.title} by ${nextTrack.artist}`);
                    })
                    .catch(error => {
                        console.error('Error playing mock audio:', error);
                        currentAudio = null;
                        currentlyPlayingId = null;
                        updatePlayButtonUI(nextTrack.id, false);
                        setupNextTrack(); // Try the next track
                    });

                // When track ends
                currentAudio.addEventListener('ended', () => {
                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(nextTrack.id, false);
                    setupNextTrack();
                });
            } else {
                // No audio available, skip to next
                setupNextTrack();
            }
        }
    }

    // Function to stop playing all tracks
    function stopPlayingAll() {
        isPlayingAll = false;
        trackQueue = [];

        // Stop current audio
        if (currentAudio) {
            currentAudio.pause();

            // Update previous track's button
            if (currentlyPlayingId) {
                updatePlayButtonUI(currentlyPlayingId, false);
            }

            currentAudio = null;
            currentlyPlayingId = null;
        }

        // Update Play All button
        updatePlayAllButtonUI(false);

        showNotification('Playlist stopped');
    }

    // Function to update Play All button UI
    function updatePlayAllButtonUI(isPlaying) {
        const playAllButton = document.getElementById('play-all');
        const icon = playAllButton.querySelector('i');

        if (isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-stop');
            playAllButton.textContent = ' Stop Playlist';
            playAllButton.prepend(icon);
        } else {
            icon.classList.remove('fa-stop');
            icon.classList.add('fa-play');
            playAllButton.textContent = ' Play All';
            playAllButton.prepend(icon);
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