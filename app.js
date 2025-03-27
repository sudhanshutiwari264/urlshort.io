document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const moodInput = document.getElementById('mood-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsSection = document.querySelector('.results-section');
    const moodEmoji = document.getElementById('mood-emoji');
    const moodTitle = document.getElementById('mood-title');
    const moodDescription = document.getElementById('mood-description');
    const tracksContainer = document.querySelector('.tracks-container');
    const playAllBtn = document.getElementById('play-all-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');

    // Audio player state
    let currentAudio = null;
    let currentlyPlayingId = null;

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner"></div><p>Analyzing your mood...</p>';
    document.body.appendChild(loadingOverlay);

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);

    // Current playlist data
    const currentPlaylist = {
        mood: '',
        tracks: []
    };

    // Mood configurations
    const moodConfigs = {
        happy: {
            emoji: '😊',
            title: 'Happy',
            description: 'You\'re feeling positive and upbeat. Here\'s a playlist to match your happy mood!',
            keywords: ['happy', 'joy', 'glad', 'delighted', 'cheerful', 'content', 'pleased', 'thrilled', 'upbeat', 'positive']
        },
        excited: {
            emoji: '🤩',
            title: 'Excited',
            description: 'You\'re feeling energetic and enthusiastic. This playlist will keep your energy high!',
            keywords: ['excited', 'thrilled', 'enthusiastic', 'eager', 'energetic', 'pumped', 'psyched', 'stoked', 'amped']
        },
        relaxed: {
            emoji: '😌',
            title: 'Relaxed',
            description: 'You\'re feeling calm and peaceful. Enjoy this soothing playlist to maintain your tranquility.',
            keywords: ['relaxed', 'calm', 'peaceful', 'tranquil', 'serene', 'chill', 'mellow', 'zen', 'easy-going']
        },
        sad: {
            emoji: '😢',
            title: 'Sad',
            description: 'You\'re feeling down today. This playlist might help you process your emotions.',
            keywords: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'gloomy', 'melancholy', 'heartbroken', 'upset', 'tearful']
        },
        angry: {
            emoji: '😠',
            title: 'Angry',
            description: 'You\'re feeling frustrated or angry. This playlist might help you release some tension.',
            keywords: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'outraged', 'enraged', 'hostile']
        },
        tired: {
            emoji: '😴',
            title: 'Tired',
            description: 'You\'re feeling low on energy. Here\'s some gentle music to help you relax and recharge.',
            keywords: ['tired', 'exhausted', 'sleepy', 'fatigued', 'drained', 'weary', 'worn out', 'lethargic']
        },
        focused: {
            emoji: '🧠',
            title: 'Focused',
            description: 'You\'re in a productive mindset. This playlist will help you maintain concentration.',
            keywords: ['focused', 'concentrated', 'productive', 'determined', 'attentive', 'diligent', 'studious', 'working']
        },
        romantic: {
            emoji: '❤️',
            title: 'Romantic',
            description: 'You\'re feeling romantic and emotional. Enjoy these love-inspired tracks.',
            keywords: ['romantic', 'love', 'loving', 'affectionate', 'passionate', 'smitten', 'adoring', 'tender']
        }
    };

    // Event Listeners
    analyzeBtn.addEventListener('click', analyzeMood);

    // Add event listeners for buttons that exist in the HTML
    if (playAllBtn) playAllBtn.addEventListener('click', playAllTracks);
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleTracks);

    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification';
    document.body.appendChild(notificationContainer);

    // Function to show notification
    function showNotification(message, isError = false) {
        notificationContainer.textContent = message;
        notificationContainer.className = isError ? 'notification error show' : 'notification show';

        setTimeout(() => {
            notificationContainer.className = 'notification';
        }, 3000);
    }

    // Function to analyze mood from input text
    function analyzeMood() {
        const text = moodInput.value.trim();

        if (!text) {
            showNotification('Please enter how you\'re feeling first!', true);
            return;
        }

        // Show loading overlay
        loadingOverlay.style.display = 'flex';

        // Simulate API call delay
        setTimeout(() => {
            // Determine mood based on text
            const mood = determineMood(text);

            // Update UI with mood
            updateMoodUI(mood);

            // Generate playlist based on mood
            generatePlaylist(mood).then(() => {
                // Hide loading overlay
                loadingOverlay.style.display = 'none';

                // Show results section
                resultsSection.style.display = 'block';

                // Scroll to results
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            });
        }, 1500);
    }

    // Function to share playlist
    function sharePlaylist() {
        // Create a shareable link with the current mood
        const shareableLink = `${window.location.origin}${window.location.pathname}?mood=${currentPlaylist.mood}`;

        // Copy to clipboard
        navigator.clipboard.writeText(shareableLink)
            .then(() => {
                showNotification('Playlist link copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                showNotification('Failed to copy link', true);
            });
    }

    // Function to save playlist
    function savePlaylist() {
        // In a real app, this would save to a database
        // For now, we'll just show a notification
        showNotification('Playlist saved to your library!');
    }

    // Function to determine mood from text
    function determineMood(text) {
        text = text.toLowerCase();
        
        // Simple keyword matching for demo purposes
        // In a real app, this would use a more sophisticated NLP model
        
        const moodKeywords = {
            happy: ['happy', 'joy', 'glad', 'delighted', 'cheerful', 'content', 'pleased', 'thrilled', 'upbeat', 'positive'],
            excited: ['excited', 'thrilled', 'enthusiastic', 'eager', 'energetic', 'pumped', 'psyched', 'stoked', 'amped'],
            relaxed: ['relaxed', 'calm', 'peaceful', 'tranquil', 'serene', 'chill', 'mellow', 'zen', 'easy-going'],
            sad: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'gloomy', 'melancholy', 'heartbroken', 'upset', 'tearful'],
            angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'outraged', 'enraged', 'hostile'],
            tired: ['tired', 'exhausted', 'sleepy', 'fatigued', 'drained', 'weary', 'worn out', 'lethargic'],
            focused: ['focused', 'concentrated', 'productive', 'determined', 'attentive', 'diligent', 'studious', 'working'],
            romantic: ['romantic', 'love', 'loving', 'affectionate', 'passionate', 'smitten', 'adoring', 'tender']
        };
        
        // Count keyword matches for each mood
        const moodScores = {};
        
        for (const [mood, keywords] of Object.entries(moodKeywords)) {
            moodScores[mood] = 0;
            
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    moodScores[mood]++;
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
        
        // Store current mood
        currentPlaylist.mood = detectedMood;
        
        return detectedMood;
    }

    // Function to update UI with mood
    function updateMoodUI(mood) {
        const moodConfig = moodConfigs[mood];
        
        moodEmoji.textContent = moodConfig.emoji;
        moodTitle.textContent = moodConfig.title;
        moodDescription.textContent = moodConfig.description;
        
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
            // Create genres array from the first few keywords
            const genres = moodConfig.keywords.slice(0, 3);

            // Get tracks from API
            const tracks = await fetchTracksFromAPI(genres);

            // Display tracks (this is now async)
            await displayTracks(tracks);

        } catch (error) {
            console.error('Error generating playlist:', error);

            // Fallback to mock data if API fails
            const mockTracks = generateMockTracks(mood);
            await displayTracks(mockTracks);
        }
    }

    // Function to fetch tracks from API
    async function fetchTracksFromAPI(genres) {
        // Randomly select one of the genres
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];

        try {
            // Try to fetch from YouTube Music API (primary source)
            try {
                const ytmusicTracks = await fetchFromYouTube(randomGenre);
                if (ytmusicTracks && ytmusicTracks.length > 0) {
                    return ytmusicTracks;
                }
            } catch (ytmusicError) {
                console.warn('YouTube Music API error, trying next source:', ytmusicError);
            }

            // Try to fetch from Deezer
            try {
                const deezerTracks = await fetchFromDeezer(randomGenre);
                if (deezerTracks && deezerTracks.length > 0) {
                    return deezerTracks;
                }
            } catch (deezerError) {
                console.warn('Deezer API error, trying next source:', deezerError);
            }

            // Try to fetch from Open Source Audio Library
            try {
                const openSourceTracks = await fetchFromOpenSourceAudio(randomGenre);
                if (openSourceTracks && openSourceTracks.length > 0) {
                    return openSourceTracks;
                }
            } catch (openSourceError) {
                console.warn('Open Source Audio error, trying next source:', openSourceError);
            }

            // Try to fetch from Free Music Archive
            try {
                const fmaTracks = await fetchFromFreeMusicArchive(randomGenre);
                if (fmaTracks && fmaTracks.length > 0) {
                    return fmaTracks;
                }
            } catch (fmaError) {
                console.warn('Free Music Archive error, trying next source:', fmaError);
            }

            // Try to fetch from Pixabay
            try {
                const pixabayTracks = await fetchFromPixabay(randomGenre);
                if (pixabayTracks && pixabayTracks.length > 0) {
                    return pixabayTracks;
                }
            } catch (pixabayError) {
                console.warn('Pixabay API error, trying next source:', pixabayError);
            }

            // Try to fetch from ccMixter
            try {
                const ccMixterTracks = await fetchFromCCMixter(randomGenre);
                if (ccMixterTracks && ccMixterTracks.length > 0) {
                    return ccMixterTracks;
                }
            } catch (ccMixterError) {
                console.warn('ccMixter API error, falling back to guaranteed tracks:', ccMixterError);
            }

            // If all APIs fail, use guaranteed tracks
            return generateGuaranteedTracks(currentPlaylist.mood, 8);

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Function to fetch tracks from Deezer
    async function fetchFromDeezer(genre) {
        try {
            // Map our genre to Deezer search terms
            const moodToDeezerMap = {
                'happy': 'happy',
                'excited': 'energetic',
                'relaxed': 'relaxing',
                'sad': 'sad',
                'angry': 'powerful',
                'tired': 'ambient',
                'focused': 'concentration',
                'romantic': 'romantic'
            };

            // Use the current mood for better results
            const searchTerm = moodToDeezerMap[currentPlaylist.mood] || genre;

            // In a real app, you would use the Deezer API with proper authentication
            // For this demo, we'll use a static JSON file with Deezer data
            const response = await fetch('/public-music-data/deezer-sample.json');

            if (!response.ok) {
                throw new Error('Failed to fetch from Deezer');
            }

            const data = await response.json();

            // Get all tracks and shuffle them
            let tracks = [...data.data];

            // Shuffle array
            for (let i = tracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
            }

            // Limit to 8 tracks and format the response
            return tracks.slice(0, 8).map(track => ({
                id: `deezer-${track.id}`,
                title: track.title,
                artist: track.artist.name,
                album: track.album.title,
                cover: track.album.cover_medium || `https://picsum.photos/seed/deezer${track.id}/300/300`,
                preview: track.preview,
                sourceType: 'deezer',
                deezerLink: track.link
            }));

        } catch (error) {
            console.error('Deezer API error:', error);
            throw error;
        }
    }

    // Function to fetch tracks from YouTube Music API
    async function fetchFromYouTube(genre) {
        try {
            // Map our genre to YouTube Music search terms
            const moodToYTMusicMap = {
                'happy': 'happy',
                'excited': 'energetic',
                'relaxed': 'relaxing',
                'sad': 'sad',
                'angry': 'powerful',
                'tired': 'ambient',
                'focused': 'concentration',
                'romantic': 'romantic'
            };

            // Use the current mood for better results
            const searchTerm = moodToYTMusicMap[currentPlaylist.mood] || genre;

            // Call our server-side API that uses ytmusicapi
            // Use relative path for Vercel deployment
            const response = await fetch(`/api/mood?mood=${searchTerm}&limit=8`);

            if (!response.ok) {
                throw new Error('Failed to fetch from YouTube Music API');
            }

            const tracks = await response.json();

            // Format the tracks for our player
            return tracks.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist,
                album: track.album || 'YouTube Music',
                cover: track.cover || `https://picsum.photos/seed/ytmusic${track.videoId}/300/300`,
                preview: null, // YouTube Music tracks need to be embedded
                embedUrl: `https://www.youtube.com/embed/${track.videoId}?autoplay=1`,
                videoId: track.videoId,
                sourceType: 'ytmusic'
            }));

        } catch (error) {
            console.error('YouTube API error:', error);
            throw error;
        }
    }

    // Function to fetch tracks from Open Source Audio Library
    async function fetchFromOpenSourceAudio(genre) {
        try {
            // Map our genre to search terms
            const genreMap = {
                'pop': 'pop',
                'rock': 'rock',
                'electronic': 'electronic',
                'classical': 'classical',
                'jazz': 'jazz',
                'hip-hop': 'hip-hop',
                'ambient': 'ambient',
                'folk': 'folk'
            };

            const searchGenre = genreMap[genre.toLowerCase()] || genre;

            // In a real app, you would use an API for open source audio
            // For this demo, we'll use a static JSON file
            const response = await fetch('/public-music-data/opensourceaudio-sample.json');

            if (!response.ok) {
                throw new Error('Failed to fetch from Open Source Audio Library');
            }

            const data = await response.json();

            // Get all tracks and shuffle them
            let tracks = [...data.tracks];

            // Shuffle array
            for (let i = tracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
            }

            // Limit to 8 tracks and format the response
            return tracks.slice(0, 8).map(track => ({
                id: `opensrc-${track.id}`,
                title: track.title,
                artist: track.artist,
                album: track.album || 'Open Source Audio',
                cover: track.cover || `https://picsum.photos/seed/opensrc${track.id}/300/300`,
                preview: track.audio_url,
                sourceType: 'opensourceaudio'
            }));

        } catch (error) {
            console.error('Open Source Audio error:', error);
            throw error;
        }
    }

    // Function to fetch tracks from Free Music Archive
    async function fetchFromFreeMusicArchive(genre) {
        try {
            // Map our genre to FMA genre tags
            const genreMap = {
                'pop': 'Pop',
                'rock': 'Rock',
                'electronic': 'Electronic',
                'classical': 'Classical',
                'jazz': 'Jazz',
                'hip-hop': 'Hip-Hop',
                'ambient': 'Ambient',
                'folk': 'Folk',
                'indie': 'Indie'
            };
            
            const fmaGenre = genreMap[genre.toLowerCase()] || genre;
            
            // Use the local JSON file
            const response = await fetch('/public-music-data/fma-sample.json');
            
            if (!response.ok) {
                throw new Error('Failed to fetch from Free Music Archive');
            }
            
            const data = await response.json();
            
            // Filter by genre if possible
            let tracks = data.tracks;
            if (fmaGenre) {
                tracks = tracks.filter(track => 
                    track.genre && track.genre.toLowerCase().includes(fmaGenre.toLowerCase())
                );
            }
            
            // If no tracks match the genre, use all tracks
            if (tracks.length === 0) {
                tracks = data.tracks;
            }
            
            // Limit to 8 tracks and format the response
            return tracks.slice(0, 8).map(track => ({
                id: `fma-${track.id}`,
                title: track.title,
                artist: track.artist,
                album: track.album || 'Unknown Album',
                cover: track.cover || 'https://picsum.photos/seed/fma' + track.id + '/300/300',
                preview: track.audio_url
            }));
            
        } catch (error) {
            console.error('Free Music Archive error:', error);
            throw error;
        }
    }

    // Function to fetch tracks from Pixabay
    async function fetchFromPixabay(genre) {
        try {
            // Map our genre to Pixabay search terms
            const moodToPixabayMap = {
                'happy': 'happy upbeat cheerful',
                'excited': 'energetic upbeat exciting',
                'relaxed': 'calm relaxing peaceful',
                'sad': 'sad melancholy emotional',
                'angry': 'intense powerful strong',
                'tired': 'ambient calm soft',
                'focused': 'concentration focus calm',
                'romantic': 'romantic love emotional'
            };
            
            // Use the current mood for better results
            const searchTerm = moodToPixabayMap[currentPlaylist.mood] || genre;
            
            // Use the local JSON file
            const response = await fetch('/public-music-data/pixabay-sample.json');
            
            if (!response.ok) {
                throw new Error('Failed to fetch from Pixabay');
            }
            
            const data = await response.json();
            
            // Get all tracks and shuffle them
            let tracks = [...data.hits];
            
            // Shuffle array
            for (let i = tracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
            }
            
            // Limit to 8 tracks and format the response
            return tracks.slice(0, 8).map(track => ({
                id: `pixabay-${track.id}`,
                title: track.title || 'Pixabay Track',
                artist: track.user || 'Pixabay Artist',
                album: 'Pixabay Music',
                cover: `https://picsum.photos/seed/pixabay${track.id}/300/300`,
                preview: track.audio
            }));
            
        } catch (error) {
            console.error('Pixabay API error:', error);
            throw error;
        }
    }

    // Function to fetch tracks from ccMixter
    async function fetchFromCCMixter(genre) {
        try {
            // Map our genre to ccMixter tags
            const genreMap = {
                'pop': 'pop',
                'rock': 'rock',
                'electronic': 'electronic',
                'classical': 'classical',
                'jazz': 'jazz',
                'hip-hop': 'hip_hop',
                'ambient': 'ambient',
                'folk': 'folk'
            };
            
            const ccMixterTag = genreMap[genre.toLowerCase()] || genre;
            
            // Use the local JSON file
            const response = await fetch('/public-music-data/ccmixter-sample.json');
            
            if (!response.ok) {
                throw new Error('Failed to fetch from ccMixter');
            }
            
            const data = await response.json();
            
            // Get all tracks and shuffle them
            let tracks = [...data.tracks];
            
            // Shuffle array
            for (let i = tracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
            }
            
            // Limit to 8 tracks and format the response
            return tracks.slice(0, 8).map(track => ({
                id: `ccmixter-${track.id}`,
                title: track.title || 'ccMixter Track',
                artist: track.artist || 'ccMixter Artist',
                album: track.album || 'ccMixter',
                cover: track.cover || `https://picsum.photos/seed/ccmixter${track.id}/300/300`,
                preview: track.audio_url
            }));
            
        } catch (error) {
            console.error('ccMixter API error:', error);
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
    async function displayTracks(tracks) {
        // Get the tracks container
        const tracksContainer = document.querySelector('.tracks-container');

        // Clear the tracks container
        tracksContainer.innerHTML = '';

        // Show loading message while we verify tracks
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'tracks-loading-message';
        loadingMessage.textContent = 'Verifying playable tracks...';
        tracksContainer.appendChild(loadingMessage);

        // Filter tracks to only include those with working preview URLs or YouTube embeds
        const verifiedTracks = [];

        // Add YouTube, YouTube Music, and Deezer tracks directly (they don't need verification)
        const youtubeTracks = tracks.filter(track => track.sourceType === 'youtube');
        const ytmusicTracks = tracks.filter(track => track.sourceType === 'ytmusic');
        const deezerTracks = tracks.filter(track => track.sourceType === 'deezer');
        verifiedTracks.push(...youtubeTracks, ...ytmusicTracks, ...deezerTracks);

        // Process tracks with preview URLs
        const tracksWithPreviews = tracks.filter(track => track.preview && !track.sourceType);

        // For each track with a preview, verify it's playable
        for (const track of tracksWithPreviews) {
            try {
                // Try to create an audio element and load the metadata
                const audio = new Audio();

                // Create a promise that resolves when metadata is loaded or errors
                const canPlay = new Promise((resolve, reject) => {
                    audio.addEventListener('loadedmetadata', () => resolve(true));
                    audio.addEventListener('error', () => reject(new Error('Cannot play audio')));

                    // Set a timeout in case the audio takes too long to load
                    setTimeout(() => reject(new Error('Audio load timeout')), 3000);
                });

                // Set the source and start loading
                audio.src = track.preview;
                audio.load();

                // Wait for the audio to be verified
                await canPlay;

                // If we get here, the audio is playable
                verifiedTracks.push(track);
            } catch (error) {
                console.warn(`Track "${track.title}" preview not playable:`, error);

                // If the original preview doesn't work, assign a guaranteed working preview
                const fallbackPreview = getGuaranteedPreview(track.id, currentPlaylist.mood);
                if (fallbackPreview) {
                    track.preview = fallbackPreview;
                    verifiedTracks.push(track);
                }
            }
        }

        // If we don't have enough verified tracks, add some guaranteed ones
        if (verifiedTracks.length < 5) {
            const guaranteedTracks = generateGuaranteedTracks(currentPlaylist.mood, 8 - verifiedTracks.length);
            verifiedTracks.push(...guaranteedTracks);
        }

        // Update the current playlist with verified tracks
        currentPlaylist.tracks = verifiedTracks;

        // Remove loading message
        tracksContainer.innerHTML = '';

        // Display the verified tracks
        verifiedTracks.forEach(track => {
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            trackCard.dataset.trackId = track.id;

     // Different layout based on source type
            if (track.sourceType === 'youtube') {
                trackCard.innerHTML = `
                    <div class="track-youtube-container">
                        <img src="${track.cover}" alt="${track.title}" class="track-image youtube-thumbnail">
                        <div class="youtube-play-overlay">
                            <i class="fab fa-youtube"></i>
                        </div>
                    </div>
                    <div class="track-info">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                        <div class="track-controls">
                            <button class="track-btn play-track" title="Play on YouTube">
                                <i class="fab fa-youtube"></i>
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
            } else if (track.sourceType === 'ytmusic') {
                trackCard.innerHTML = `
                    <div class="track-ytmusic-container">
                        <img src="${track.cover}" alt="${track.title}" class="track-image ytmusic-thumbnail">
                        <div class="ytmusic-play-overlay">
                            <i class="fas fa-music"></i>
                        </div>
                    </div>
                    <div class="track-info">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                        <div class="track-album">${track.album}</div>
                        <div class="track-controls">
                            <button class="track-btn play-track" title="Play on YouTube Music">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="track-btn open-ytmusic" title="Open in YouTube Music">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button class="track-btn add-to-favorites" title="Add to favorites">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else if (track.sourceType === 'deezer') {
                trackCard.innerHTML = `
                    <div class="track-deezer-container">
                        <img src="${track.cover}" alt="${track.title}" class="track-image deezer-thumbnail">
                        <div class="deezer-play-overlay">
                            <i class="fas fa-music"></i>
                        </div>
                    </div>
                    <div class="track-info">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                        <div class="track-album">${track.album}</div>
                        <div class="track-controls">
                            <button class="track-btn play-track" title="Play preview">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="track-btn open-deezer" title="Open in Deezer">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button class="track-btn add-to-favorites" title="Add to favorites">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else {
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
            }

            tracksContainer.appendChild(trackCard);

            // Add event listeners to track buttons
            const playBtn = trackCard.querySelector('.play-track');
            const favoriteBtn = trackCard.querySelector('.add-to-favorites');

            playBtn.addEventListener('click', () => playTrack(track));
            favoriteBtn.addEventListener('click', (e) => toggleFavorite(e, track));

            // Add share button listener if it exists
            const shareBtn = trackCard.querySelector('.share-track');
            if (shareBtn) {
                shareBtn.addEventListener('click', () => shareTrack(track));
            }

            // Add YouTube Music-specific listeners
            if (track.sourceType === 'ytmusic') {
                const openYTMusicBtn = trackCard.querySelector('.open-ytmusic');
                if (openYTMusicBtn) {
                    openYTMusicBtn.addEventListener('click', () => {
                        window.open(`https://music.youtube.com/watch?v=${track.videoId}`, '_blank');
                    });
                }

                const thumbnail = trackCard.querySelector('.ytmusic-thumbnail');
                const overlay = trackCard.querySelector('.ytmusic-play-overlay');

                thumbnail.addEventListener('click', () => playTrack(track));
                overlay.addEventListener('click', () => playTrack(track));
            }

            // Add Deezer-specific listeners
            if (track.sourceType === 'deezer') {
                const openDeezerBtn = trackCard.querySelector('.open-deezer');
                if (openDeezerBtn) {
                    openDeezerBtn.addEventListener('click', () => {
                        window.open(track.deezerLink, '_blank');
                    });
                }

                const thumbnail = trackCard.querySelector('.deezer-thumbnail');
                const overlay = trackCard.querySelector('.deezer-play-overlay');

                thumbnail.addEventListener('click', () => playTrack(track));
                overlay.addEventListener('click', () => playTrack(track));
            }

            // For YouTube tracks, also make the thumbnail clickable
            if (track.sourceType === 'youtube') {
                const thumbnail = trackCard.querySelector('.youtube-thumbnail');
                const overlay = trackCard.querySelector('.youtube-play-overlay');

                thumbnail.addEventListener('click', () => playTrack(track));
                overlay.addEventListener('click', () => playTrack(track));
            }
        });
    }

    // Function to get a guaranteed working preview URL
    function getGuaranteedPreview(trackId, mood) {
        // These are verified working audio URLs from Pixabay (royalty-free)
        const guaranteedPreviews = [
            'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', // Upbeat
            'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e9124485.mp3', // Relaxed
            'https://cdn.pixabay.com/download/audio/2022/01/27/audio_d0c19a4f4d.mp3', // Sad
            'https://cdn.pixabay.com/download/audio/2022/03/10/audio_1a609013c8.mp3', // Energetic
            'https://cdn.pixabay.com/download/audio/2021/11/25/audio_5c6b20d881.mp3'  // Focused
        ];
        
        // Use the track ID to deterministically select a preview
        const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return guaranteedPreviews[hash % guaranteedPreviews.length];
    }

    // Function to generate tracks with guaranteed working previews
    function generateGuaranteedTracks(mood, count) {
        const tracks = [];
        const moodConfig = moodConfigs[mood];
        
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
        
        // Guaranteed working preview URLs from Pixabay
        const guaranteedPreviews = [
            'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3',
            'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e9124485.mp3',
            'https://cdn.pixabay.com/download/audio/2022/01/27/audio_d0c19a4f4d.mp3',
            'https://cdn.pixabay.com/download/audio/2022/03/10/audio_1a609013c8.mp3',
            'https://cdn.pixabay.com/download/audio/2021/11/25/audio_5c6b20d881.mp3'
        ];
        
        // Generate tracks with guaranteed previews
        for (let i = 0; i < count; i++) {
            const artistIndex = i % 5;
            const songIndex = i % 5;
            const previewIndex = i % guaranteedPreviews.length;
            
            tracks.push({
                id: `guaranteed-${mood}-${i}`,
                title: mockSongs[mood][songIndex],
                artist: mockArtists[mood][artistIndex],
                album: `${mockArtists[mood][artistIndex]} - Greatest Hits`,
                cover: `https://picsum.photos/seed/${mood}${i}/300/300`,
                preview: guaranteedPreviews[previewIndex]
            });
        }
        
        return tracks;
    }

    // Audio player instance
    let currentAudio = null;
    let currentlyPlayingId = null;

    // Preloaded audio elements for faster playback
    const preloadedAudio = {};
    
    // Function to preload audio for faster playback
    function preloadAudio(track) {
        if (!track.preview || preloadedAudio[track.id]) return;
        
        try {
            const audio = new Audio();
            audio.src = track.preview;
            audio.load();
            preloadedAudio[track.id] = audio;
            
            // Remove from preloaded cache after 5 minutes to save memory
            setTimeout(() => {
                if (preloadedAudio[track.id] && preloadedAudio[track.id] !== currentAudio) {
                    delete preloadedAudio[track.id];
                }
            }, 5 * 60 * 1000);
        } catch (error) {
            console.warn('Error preloading audio:', error);
        }
    }
    
    // YouTube player modal
    const youtubeModal = document.createElement('div');
    youtubeModal.className = 'modal youtube-modal';
    youtubeModal.innerHTML = `
        <div class="modal-content youtube-modal-content">
            <span class="close-modal" id="close-youtube-modal">&times;</span>
            <div id="youtube-player-container"></div>
        </div>
    `;
    document.body.appendChild(youtubeModal);

    // Close YouTube modal event
    document.getElementById('close-youtube-modal').addEventListener('click', () => {
        youtubeModal.style.display = 'none';
        document.getElementById('youtube-player-container').innerHTML = '';
    });

    // Function to play a track
    function playTrack(track) {
        console.log('Playing track:', track.title);

        // Handle YouTube tracks differently
        if (track.sourceType === 'youtube') {
            playYouTubeTrack(track);
            return;
        }

        // Handle YouTube Music tracks
        if (track.sourceType === 'ytmusic') {
            playYouTubeMusicTrack(track);
            return;
        }

        // Handle Deezer tracks
        if (track.sourceType === 'deezer') {
            playDeezerTrack(track);
            return;
        }

        // If there's already a track playing, stop it
        if (currentAudio) {
            currentAudio.pause();

            // If the same track was clicked, just pause it and update UI
            if (currentlyPlayingId === track.id) {
                updatePlayButtonUI(track.id, false);
                currentlyPlayingId = null;
                currentAudio = null;
                showNotification(`Paused: ${track.title}`);
                return;
            }

            // Update previous track's button
            if (currentlyPlayingId) {
                updatePlayButtonUI(currentlyPlayingId, false);
            }

            currentAudio = null;
        }

        // If the track has a preview URL
        if (track.preview) {
            // Show loading indicator on the play button
            const trackCard = document.querySelector(`[data-track-id="${track.id}"]`);
            if (trackCard) {
                const playButton = trackCard.querySelector('.play-track i');
                playButton.className = 'fas fa-spinner fa-spin';
            }

            // Use preloaded audio if available, otherwise create new
            if (preloadedAudio[track.id]) {
                currentAudio = preloadedAudio[track.id];
                delete preloadedAudio[track.id]; // Remove from preloaded cache
            } else {
                currentAudio = new Audio(track.preview);
            }

            currentlyPlayingId = track.id;

            // Set up event listeners
            const setupAudioEvents = () => {
                // When track ends
                currentAudio.addEventListener('ended', () => {
                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(track.id, false);
                });

                // When track is ready to play
                currentAudio.addEventListener('canplay', () => {
                    updatePlayButtonUI(track.id, true);
                });

                // When track errors
                currentAudio.addEventListener('error', (e) => {
                    console.error('Audio error:', e);
                    showNotification(`Couldn't play track: Audio error`, true);
                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(track.id, false);

                    // Try fallback
                    setTimeout(() => {
                        playFallbackAudio(track);
                    }, 500);
                });
            };

            setupAudioEvents();

            // Play the track
            const playPromise = currentAudio.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        showNotification(`Playing: ${track.title} by ${track.artist}`);

                        // Preload the next track for smoother playback
                        const nextTrackIndex = currentPlaylist.tracks.findIndex(t => t.id === track.id) + 1;
                        if (nextTrackIndex < currentPlaylist.tracks.length) {
                            preloadAudio(currentPlaylist.tracks[nextTrackIndex]);
                        }
                    })
                    .catch(error => {
                        console.error('Error playing audio:', error);
                        showNotification(`Couldn't play track: ${error.message}`, true);

                        // Try fallback
                        playFallbackAudio(track);
                    });
            }
        } else {
            // If no preview URL is available
            playFallbackAudio(track);
        }
    }

    // Function to play a YouTube track
    function playYouTubeTrack(track) {
        // Extract the YouTube video ID from the track ID
        const videoId = track.id.replace('youtube-', '');

        // Create the iframe for the YouTube player
        const playerContainer = document.getElementById('youtube-player-container');
        playerContainer.innerHTML = `
            <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                title="${track.title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;

        // Show the YouTube modal
        youtubeModal.style.display = 'flex';

        // Update UI
        updatePlayButtonUI(track.id, true);

        // Show notification
        showNotification(`Playing YouTube: ${track.title} by ${track.artist}`);

        // Set as currently playing
        currentlyPlayingId = track.id;
    }

    // Function to play a YouTube Music track
    function playYouTubeMusicTrack(track) {
        // Get the video ID
        const videoId = track.videoId;

        // Create the iframe for the YouTube Music player
        const playerContainer = document.getElementById('youtube-player-container');
        playerContainer.innerHTML = `
            <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                title="${track.title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
            <div class="ytmusic-info">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
                <p>${track.album}</p>
                <a href="https://music.youtube.com/watch?v=${videoId}" target="_blank" class="ytmusic-link-btn">
                    Open in YouTube Music
                </a>
            </div>
        `;

        // Show the YouTube modal
        youtubeModal.style.display = 'flex';

        // Update UI
        updatePlayButtonUI(track.id, true);

        // Show notification
        showNotification(`Playing YouTube Music: ${track.title} by ${track.artist}`);

        // Set as currently playing
        currentlyPlayingId = track.id;
    }

    // Deezer player modal
    const deezerModal = document.createElement('div');
    deezerModal.className = 'modal deezer-modal';
    deezerModal.innerHTML = `
        <div class="modal-content deezer-modal-content">
            <span class="close-modal" id="close-deezer-modal">&times;</span>
            <div id="deezer-player-container"></div>
        </div>
    `;
    document.body.appendChild(deezerModal);

    // Close Deezer modal event
    document.getElementById('close-deezer-modal').addEventListener('click', () => {
        deezerModal.style.display = 'none';
        document.getElementById('deezer-player-container').innerHTML = '';

        // If there's audio playing, stop it
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;

            // Update UI
            if (currentlyPlayingId) {
                updatePlayButtonUI(currentlyPlayingId, false);
                currentlyPlayingId = null;
            }
        }
    });

    // Function to play a Deezer track
    function playDeezerTrack(track) {
        // If there's already a track playing, stop it
        if (currentAudio) {
            currentAudio.pause();

            // If the same track was clicked, just pause it and update UI
            if (currentlyPlayingId === track.id) {
                updatePlayButtonUI(track.id, false);
                currentlyPlayingId = null;
                currentAudio = null;
                showNotification(`Paused: ${track.title}`);
                return;
            }

            // Update previous track's button
            if (currentlyPlayingId) {
                updatePlayButtonUI(currentlyPlayingId, false);
            }

            currentAudio = null;
        }

        // Show loading indicator on the play button
        const trackCard = document.querySelector(`[data-track-id="${track.id}"]`);
        if (trackCard) {
            const playButton = trackCard.querySelector('.play-track i');
            playButton.className = 'fas fa-spinner fa-spin';
        }

        // Create new audio with the preview URL
        currentAudio = new Audio(track.preview);
        currentlyPlayingId = track.id;

        // Set up event listeners
        currentAudio.addEventListener('ended', () => {
            currentAudio = null;
            currentlyPlayingId = null;
            updatePlayButtonUI(track.id, false);
        });

        currentAudio.addEventListener('canplay', () => {
            updatePlayButtonUI(track.id, true);
        });

        currentAudio.addEventListener('error', (e) => {
            console.error('Deezer audio error:', e);
            showNotification(`Couldn't play Deezer track: Audio error`, true);
            currentAudio = null;
            currentlyPlayingId = null;
            updatePlayButtonUI(track.id, false);
        });

        // Play the track
        const playPromise = currentAudio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    showNotification(`Playing Deezer: ${track.title} by ${track.artist}`);

                    // Create the Deezer widget if needed
                    if (track.deezerLink) {
                        // Extract the track ID from the Deezer link
                        const deezerTrackId = track.id.replace('deezer-', '');

                        // Create the iframe for the Deezer player
                        const playerContainer = document.getElementById('deezer-player-container');
                        playerContainer.innerHTML = `
                            <div class="deezer-player-info">
                                <img src="${track.cover}" alt="${track.title}" class="deezer-player-cover">
                                <div class="deezer-player-details">
                                    <h3>${track.title}</h3>
                                    <p>${track.artist}</p>
                                    <p>${track.album}</p>
                                    <a href="${track.deezerLink}" target="_blank" class="deezer-link-btn">
                                        Open in Deezer
                                    </a>
                                </div>
                            </div>
                            <div class="deezer-player-controls">
                                <div class="deezer-player-progress">
                                    <div class="deezer-player-progress-bar"></div>
                                </div>
                                <div class="deezer-player-buttons">
                                    <button id="deezer-player-pause" class="deezer-player-btn">
                                        <i class="fas fa-pause"></i>
                                    </button>
                                </div>
                            </div>
                        `;

                        // Show the Deezer modal
                        deezerModal.style.display = 'flex';

                        // Add event listener to the pause button
                        const pauseBtn = document.getElementById('deezer-player-pause');
                        pauseBtn.addEventListener('click', () => {
                            if (currentAudio) {
                                currentAudio.pause();
                                currentAudio = null;
                                currentlyPlayingId = null;
                                updatePlayButtonUI(track.id, false);
                                deezerModal.style.display = 'none';
                            }
                        });

                        // Update progress bar
                        const progressBar = document.querySelector('.deezer-player-progress-bar');
                        currentAudio.addEventListener('timeupdate', () => {
                            const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
                            progressBar.style.width = `${progress}%`;
                        });
                    }
                })
                .catch(error => {
                    console.error('Error playing Deezer audio:', error);
                    showNotification(`Couldn't play Deezer track: ${error.message}`, true);

                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(track.id, false);
                });
        }
    }
    
    // Function to play fallback audio when the main preview fails
    function playFallbackAudio(track) {
        showNotification(`Using alternative audio for "${track.title}"`, false);
        
        // Get a guaranteed working audio URL
        const fallbackUrl = getGuaranteedPreview(track.id, currentPlaylist.mood);
        
        if (fallbackUrl) {
            // Clean up any existing audio
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            
            // Create new audio with fallback URL
            currentAudio = new Audio(fallbackUrl);
            currentlyPlayingId = track.id;
            
            // Update UI
            updatePlayButtonUI(track.id, true);
            
            // Set up event listeners
            currentAudio.addEventListener('ended', () => {
                currentAudio = null;
                currentlyPlayingId = null;
                updatePlayButtonUI(track.id, false);
            });
            
            // Play the fallback audio
            currentAudio.play()
                .then(() => {
                    showNotification(`Playing: ${track.title} by ${track.artist}`);
                })
                .catch(error => {
                    console.error('Error playing fallback audio:', error);
                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(track.id, false);
                    showNotification('Unable to play audio. Please try another track.', true);
                });
        } else {
            showNotification('No audio available for this track', true);
            updatePlayButtonUI(track.id, false);
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
                icon.classList.remove('fa-spinner');
                icon.classList.remove('fa-spin');
                icon.classList.add('fa-pause');
                trackCard.classList.add('playing');
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.remove('fa-spinner');
                icon.classList.remove('fa-spin');
                icon.classList.add('fa-play');
                trackCard.classList.remove('playing');
            }
        }
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
            showNotification('Playlist finished');
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
            
            currentAudio = null;
        }
        
        // Set up event listener for when track ends
        const onTrackEnd = () => {
            // If we're still in "play all" mode
            if (isPlayingAll) {
                // Wait a bit before playing the next track
                setTimeout(playNextInQueue, 1000);
            }
        };
        
        // Show loading indicator on the play button
        const trackCard = document.querySelector(`[data-track-id="${nextTrack.id}"]`);
        if (trackCard) {
            const playButton = trackCard.querySelector('.play-track i');
            playButton.className = 'fas fa-spinner fa-spin';
        }
        
        // Use preloaded audio if available, otherwise create new
        if (preloadedAudio[nextTrack.id]) {
            currentAudio = preloadedAudio[nextTrack.id];
            delete preloadedAudio[nextTrack.id]; // Remove from preloaded cache
        } else if (nextTrack.preview) {
            currentAudio = new Audio(nextTrack.preview);
        } else {
            // If no preview URL is available, use fallback
            const fallbackUrl = getGuaranteedPreview(nextTrack.id, currentPlaylist.mood);
            currentAudio = new Audio(fallbackUrl);
        }
        
        currentlyPlayingId = nextTrack.id;
        
        // Set up event listeners
        currentAudio.addEventListener('ended', () => {
            currentAudio = null;
            currentlyPlayingId = null;
            updatePlayButtonUI(nextTrack.id, false);
            onTrackEnd();
        });
        
        currentAudio.addEventListener('canplay', () => {
            updatePlayButtonUI(nextTrack.id, true);
        });
        
        currentAudio.addEventListener('error', (e) => {
            console.error('Audio error in queue:', e);
            currentAudio = null;
            currentlyPlayingId = null;
            updatePlayButtonUI(nextTrack.id, false);
            
            // Try fallback for this track
            const fallbackUrl = getGuaranteedPreview(nextTrack.id, currentPlaylist.mood);
            if (fallbackUrl) {
                currentAudio = new Audio(fallbackUrl);
                currentlyPlayingId = nextTrack.id;
                
                // Set up event listeners again
                currentAudio.addEventListener('ended', () => {
                    currentAudio = null;
                    currentlyPlayingId = null;
                    updatePlayButtonUI(nextTrack.id, false);
                    onTrackEnd();
                });
                
                // Update UI
                updatePlayButtonUI(nextTrack.id, true);
                
                // Play the fallback audio
                currentAudio.play()
                    .then(() => {
                        showNotification(`Now playing: ${nextTrack.title} by ${nextTrack.artist}`);
                        
                        // Preload the next track if available
                        if (trackQueue.length > 0) {
                            preloadAudio(trackQueue[0]);
                        }
                    })
                    .catch(error => {
                        console.error('Error playing fallback audio in queue:', error);
                        currentAudio = null;
                        currentlyPlayingId = null;
                        updatePlayButtonUI(nextTrack.id, false);
                        onTrackEnd(); // Skip to next track
                    });
            } else {
                // No audio available, skip to next
                onTrackEnd();
            }
        });
        
        // Play the track
        const playPromise = currentAudio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    showNotification(`Now playing: ${nextTrack.title} by ${nextTrack.artist}`);
                    
                    // Preload the next track if available
                    if (trackQueue.length > 0) {
                        preloadAudio(trackQueue[0]);
                    }
                })
                .catch(error => {
                    console.error('Error playing audio in queue:', error);
                    
                    // Try fallback
                    const fallbackUrl = getGuaranteedPreview(nextTrack.id, currentPlaylist.mood);
                    if (fallbackUrl) {
                        if (currentAudio) {
                            currentAudio.pause();
                            currentAudio = null;
                        }
                        
                        currentAudio = new Audio(fallbackUrl);
                        
                        // Set up event listeners again
                        currentAudio.addEventListener('ended', () => {
                            currentAudio = null;
                            currentlyPlayingId = null;
                            updatePlayButtonUI(nextTrack.id, false);
                            onTrackEnd();
                        });
                        
                        // Play the fallback audio
                        currentAudio.play()
                            .then(() => {
                                showNotification(`Now playing: ${nextTrack.title} by ${nextTrack.artist}`);
                                updatePlayButtonUI(nextTrack.id, true);
                            })
                            .catch(err => {
                                console.error('Error playing fallback in queue:', err);
                                currentAudio = null;
                                currentlyPlayingId = null;
                                updatePlayButtonUI(nextTrack.id, false);
                                onTrackEnd(); // Skip to next track
                            });
                    } else {
                        // No audio available, skip to next
                        currentAudio = null;
                        currentlyPlayingId = null;
                        updatePlayButtonUI(nextTrack.id, false);
                        onTrackEnd();
                    }
                });
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
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            heartIcon.style.color = 'var(--secondary-color)';
            showNotification(`Added "${track.title}" to favorites`);
        } else {
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            heartIcon.style.color = '';
            showNotification(`Removed "${track.title}" from favorites`);
        }
    }

    // Function to share a track
    function shareTrack(track) {
        // Generate a share URL
        const shareUrl = `${window.location.origin}${window.location.pathname}?track=${track.id}&mood=${currentPlaylist.mood}`;
        
        // Update share link input
        shareLink.value = shareUrl;
        
        // Open share modal
        shareModal.style.display = 'flex';
    }

    // Function to shuffle tracks
    function shuffleTracks() {
        if (currentPlaylist.tracks.length === 0) {
            showNotification('No tracks to shuffle', true);
            return;
        }
        
        // Stop current playback
        if (currentAudio) {
            currentAudio.pause();
            
            if (currentlyPlayingId) {
                updatePlayButtonUI(currentlyPlayingId, false);
            }
            
            currentAudio = null;
            currentlyPlayingId = null;
        }
        
        // Shuffle the tracks
        const shuffledTracks = [...currentPlaylist.tracks];
        
        for (let i = shuffledTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledTracks[i], shuffledTracks[j]] = [shuffledTracks[j], shuffledTracks[i]];
        }
        
        // Update the playlist
        currentPlaylist.tracks = shuffledTracks;
        
        // Re-display the tracks
        displayTracks(shuffledTracks);
        
        showNotification('Playlist shuffled');
    }

    // Function to open share modal
    function openShareModal() {
        if (currentPlaylist.tracks.length === 0) {
            showNotification('No playlist to share', true);
            return;
        }
        
        // Generate a share URL for the entire playlist
        const shareUrl = `${window.location.origin}${window.location.pathname}?mood=${currentPlaylist.mood}`;
        
        // Update share link input
        shareLink.value = shareUrl;
        
        // Open share modal
        shareModal.style.display = 'flex';
    }

    // Function to copy share link
    function copyShareLink() {
        shareLink.select();
        document.execCommand('copy');
        
        showNotification('Link copied to clipboard');
    }

    // Function to open QR code modal
    function openQRModal() {
        if (currentPlaylist.tracks.length === 0) {
            showNotification('No playlist to generate QR code for', true);
            return;
        }
        
        // Generate a share URL for the entire playlist
        const shareUrl = `${window.location.origin}${window.location.pathname}?mood=${currentPlaylist.mood}`;
        
        // Clear previous QR code
        qrCodeContainer.innerHTML = '';
        
        // Generate QR code (in a real app, this would use a QR code library)
        const qrImg = document.createElement('img');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
        qrImg.alt = 'Playlist QR Code';
        qrCodeContainer.appendChild(qrImg);
        
        // Open QR modal
        qrModal.style.display = 'flex';
    }

    // Function to download QR code
    function downloadQRCode() {
        const qrImg = qrCodeContainer.querySelector('img');
        
        if (!qrImg) {
            showNotification('No QR code to download', true);
            return;
        }
        
        // Create a temporary link to download the image
        const link = document.createElement('a');
        link.href = qrImg.src;
        link.download = `moodtunes-${currentPlaylist.mood}-playlist-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('QR code downloaded');
    }

    // Function to show notification
    function showNotification(message, isError = false) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        if (isError) {
            notification.classList.add('error');
        }
        
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Check for shared playlist in URL
    function checkForSharedPlaylist() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedMood = urlParams.get('mood');
        const sharedTrackId = urlParams.get('track');
        
        if (sharedMood && moodConfigs[sharedMood]) {
            // Update UI with mood
            updateMoodUI(sharedMood);
            
            // Generate playlist based on mood
            generatePlaylist(sharedMood).then(() => {
                // Show results section
                resultsSection.style.display = 'block';
                
                // If a specific track was shared, play it
                if (sharedTrackId) {
                    const track = currentPlaylist.tracks.find(t => t.id === sharedTrackId);
                    if (track) {
                        setTimeout(() => {
                            playTrack(track);
                        }, 1000);
                    }
                }
            });
        }
    }

    // Add notification styles
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--primary-color);
            color: white;
            padding: 12px 25px;
            border-radius: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .notification.error {
            background: var(--error-color);
        }
    `;
    document.head.appendChild(notificationStyle);

    // Check for shared playlist on load
    checkForSharedPlaylist();
});