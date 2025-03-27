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
    
    // Free music tracks by mood
    const musicByMood = {
        happy: [
            {
                title: "Happy Day",
                artist: "Free Music Archive",
                url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8e9d46af4.mp3",
                cover: "https://picsum.photos/seed/happy1/300/300"
            },
            {
                title: "Sunny Morning",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_e92fe2aa6c.mp3",
                cover: "https://picsum.photos/seed/happy2/300/300"
            },
            {
                title: "Upbeat Ukulele",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_7b3f3bd5d2.mp3",
                cover: "https://picsum.photos/seed/happy3/300/300"
            },
            {
                title: "Cheerful Day",
                artist: "Free Music",
                url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_13be1dc666.mp3",
                cover: "https://picsum.photos/seed/happy4/300/300"
            }
        ],
        excited: [
            {
                title: "Energy Boost",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/01/20/audio_d0d449a471.mp3",
                cover: "https://picsum.photos/seed/excited1/300/300"
            },
            {
                title: "Powerful Beat",
                artist: "Free Music Archive",
                url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8a7bf7cd8.mp3",
                cover: "https://picsum.photos/seed/excited2/300/300"
            },
            {
                title: "Energetic Rock",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3",
                cover: "https://picsum.photos/seed/excited3/300/300"
            },
            {
                title: "Pump Up",
                artist: "Free Music",
                url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946f463e62.mp3",
                cover: "https://picsum.photos/seed/excited4/300/300"
            }
        ],
        relaxed: [
            {
                title: "Calm Waters",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a3f0d0d0.mp3",
                cover: "https://picsum.photos/seed/relaxed1/300/300"
            },
            {
                title: "Gentle Piano",
                artist: "Free Music Archive",
                url: "https://cdn.pixabay.com/download/audio/2022/01/21/audio_31743c6c02.mp3",
                cover: "https://picsum.photos/seed/relaxed2/300/300"
            },
            {
                title: "Peaceful Ambient",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2021/11/01/audio_cb4c8bcf7f.mp3",
                cover: "https://picsum.photos/seed/relaxed3/300/300"
            },
            {
                title: "Meditation",
                artist: "Free Music",
                url: "https://cdn.pixabay.com/download/audio/2022/01/20/audio_1d2f9a3d4e.mp3",
                cover: "https://picsum.photos/seed/relaxed4/300/300"
            }
        ],
        sad: [
            {
                title: "Melancholy",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_d0c3b3e428.mp3",
                cover: "https://picsum.photos/seed/sad1/300/300"
            },
            {
                title: "Rainy Day",
                artist: "Free Music Archive",
                url: "https://cdn.pixabay.com/download/audio/2022/03/18/audio_c8b0b3e428.mp3",
                cover: "https://picsum.photos/seed/sad2/300/300"
            },
            {
                title: "Emotional Piano",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/04/27/audio_c244aa7cc7.mp3",
                cover: "https://picsum.photos/seed/sad3/300/300"
            },
            {
                title: "Heartbreak",
                artist: "Free Music",
                url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_8c2c346ba4.mp3",
                cover: "https://picsum.photos/seed/sad4/300/300"
            }
        ],
        angry: [
            {
                title: "Intense Rock",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/08/03/audio_884fe92c21.mp3",
                cover: "https://picsum.photos/seed/angry1/300/300"
            },
            {
                title: "Power Metal",
                artist: "Free Music Archive",
                url: "https://cdn.pixabay.com/download/audio/2022/10/17/audio_a7c0086b4b.mp3",
                cover: "https://picsum.photos/seed/angry2/300/300"
            },
            {
                title: "Aggressive Beat",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508f62.mp3",
                cover: "https://picsum.photos/seed/angry3/300/300"
            },
            {
                title: "Fury",
                artist: "Free Music",
                url: "https://cdn.pixabay.com/download/audio/2022/09/06/audio_697a6b0daf.mp3",
                cover: "https://picsum.photos/seed/angry4/300/300"
            }
        ],
        tired: [
            {
                title: "Lullaby",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/01/21/audio_31743c6c02.mp3",
                cover: "https://picsum.photos/seed/tired1/300/300"
            },
            {
                title: "Soft Ambient",
                artist: "Free Music Archive",
                url: "https://cdn.pixabay.com/download/audio/2021/11/01/audio_cb4c8bcf7f.mp3",
                cover: "https://picsum.photos/seed/tired2/300/300"
            },
            {
                title: "Gentle Waves",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/01/20/audio_1d2f9a3d4e.mp3",
                cover: "https://picsum.photos/seed/tired3/300/300"
            },
            {
                title: "Sleep Music",
                artist: "Free Music",
                url: "https://cdn.pixabay.com/download/audio/2022/02/11/audio_c6b0d2f1e5.mp3",
                cover: "https://picsum.photos/seed/tired4/300/300"
            }
        ],
        focused: [
            {
                title: "Concentration",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_5c6b20d881.mp3",
                cover: "https://picsum.photos/seed/focused1/300/300"
            },
            {
                title: "Study Music",
                artist: "Free Music Archive",
                url: "https://cdn.pixabay.com/download/audio/2022/01/13/audio_3b6c767d23.mp3",
                cover: "https://picsum.photos/seed/focused2/300/300"
            },
            {
                title: "Deep Focus",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/03/07/audio_40a06cc3c7.mp3",
                cover: "https://picsum.photos/seed/focused3/300/300"
            },
            {
                title: "Productivity",
                artist: "Free Music",
                url: "https://cdn.pixabay.com/download/audio/2022/04/04/audio_0428e7e8e8.mp3",
                cover: "https://picsum.photos/seed/focused4/300/300"
            }
        ],
        romantic: [
            {
                title: "Love Ballad",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_e92fe2aa6c.mp3",
                cover: "https://picsum.photos/seed/romantic1/300/300"
            },
            {
                title: "Sweet Serenade",
                artist: "Free Music Archive",
                url: "https://cdn.pixabay.com/download/audio/2022/02/11/audio_8fad8a8e1e.mp3",
                cover: "https://picsum.photos/seed/romantic2/300/300"
            },
            {
                title: "Romantic Piano",
                artist: "Pixabay",
                url: "https://cdn.pixabay.com/download/audio/2022/03/19/audio_c8e2e367a7.mp3",
                cover: "https://picsum.photos/seed/romantic3/300/300"
            },
            {
                title: "Love Theme",
                artist: "Free Music",
                url: "https://cdn.pixabay.com/download/audio/2022/01/27/audio_d0c19a4f4d.mp3",
                cover: "https://picsum.photos/seed/romantic4/300/300"
            }
        ]
    };
    
    // Event Listeners
    analyzeBtn.addEventListener('click', analyzeMood);
    if (playAllBtn) playAllBtn.addEventListener('click', playAllTracks);
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleTracks);
    
    // Function to show notification
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = isError ? 'notification error show' : 'notification show';
        
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }
    
    // Function to analyze mood
    function analyzeMood() {
        const text = moodInput.value.trim();
        
        if (!text) {
            showNotification('Please enter how you\'re feeling first!', true);
            return;
        }
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        
        // Simulate processing delay
        setTimeout(() => {
            // Determine mood based on text
            const mood = determineMood(text);
            
            // Update UI with mood
            updateMoodUI(mood);
            
            // Generate playlist based on mood
            generatePlaylist(mood);
            
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            // Show results section
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    }
    
    // Function to determine mood from text
    function determineMood(text) {
        text = text.toLowerCase();
        
        // Count keyword matches for each mood
        const moodScores = {};
        
        for (const mood in moodConfigs) {
            moodScores[mood] = 0;
            
            for (const keyword of moodConfigs[mood].keywords) {
                if (text.includes(keyword)) {
                    moodScores[mood]++;
                }
            }
        }
        
        // Find the mood with the highest score
        let highestScore = 0;
        let detectedMood = 'happy'; // Default mood
        
        for (const mood in moodScores) {
            if (moodScores[mood] > highestScore) {
                highestScore = moodScores[mood];
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
    }
    
    // Function to generate playlist based on mood
    function generatePlaylist(mood) {
        // Get tracks for the mood
        const tracks = musicByMood[mood];
        
        // Store in current playlist
        currentPlaylist.tracks = tracks;
        
        // Display tracks
        displayTracks(tracks);
    }
    
    // Function to display tracks
    function displayTracks(tracks) {
        // Clear tracks container
        tracksContainer.innerHTML = '';
        
        // Create track cards
        tracks.forEach((track, index) => {
            const trackId = `track-${index}`;
            
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            trackCard.dataset.trackId = trackId;
            
            trackCard.innerHTML = `
                <img src="${track.cover}" alt="${track.title}" class="track-image">
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                    <div class="track-controls">
                        <button class="track-btn play-track" title="Play">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            `;
            
            tracksContainer.appendChild(trackCard);
            
            // Add event listener to play button
            const playButton = trackCard.querySelector('.play-track');
            playButton.addEventListener('click', () => {
                playTrack(track, trackId);
            });
        });
    }
    
    // Function to play a track
    function playTrack(track, trackId) {
        // If there's already a track playing, stop it
        if (currentAudio) {
            currentAudio.pause();
            
            // Update previous track's button
            if (currentlyPlayingId) {
                updatePlayButtonUI(currentlyPlayingId, false);
            }
        }
        
        // Create new audio
        currentAudio = new Audio(track.url);
        currentlyPlayingId = trackId;
        
        // Update UI
        updatePlayButtonUI(trackId, true);
        
        // Play the track
        currentAudio.play()
            .then(() => {
                showNotification(`Playing: ${track.title} by ${track.artist}`);
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                showNotification('Unable to play audio. Please try another track.', true);
                currentAudio = null;
                currentlyPlayingId = null;
                updatePlayButtonUI(trackId, false);
            });
        
        // Add ended event listener
        currentAudio.addEventListener('ended', () => {
            currentAudio = null;
            currentlyPlayingId = null;
            updatePlayButtonUI(trackId, false);
        });
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
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        }
    }
    
    // Function to play all tracks
    function playAllTracks() {
        if (currentPlaylist.tracks.length === 0) {
            showNotification('No tracks to play', true);
            return;
        }
        
        // Play the first track
        const firstTrack = currentPlaylist.tracks[0];
        playTrack(firstTrack, 'track-0');
        
        // Set up event listener to play next track when current one ends
        if (currentAudio) {
            currentAudio.addEventListener('ended', playNextTrack);
        }
    }
    
    // Function to play next track
    function playNextTrack() {
        if (!currentlyPlayingId) return;
        
        // Get current track index
        const currentIndex = parseInt(currentlyPlayingId.split('-')[1]);
        const nextIndex = currentIndex + 1;
        
        // Check if there's a next track
        if (nextIndex < currentPlaylist.tracks.length) {
            const nextTrack = currentPlaylist.tracks[nextIndex];
            playTrack(nextTrack, `track-${nextIndex}`);
            
            // Set up event listener for the next track
            if (currentAudio) {
                currentAudio.addEventListener('ended', playNextTrack);
            }
        }
    }
    
    // Function to shuffle tracks
    function shuffleTracks() {
        if (currentPlaylist.tracks.length === 0) {
            showNotification('No tracks to shuffle', true);
            return;
        }
        
        // Create a copy of the tracks array
        const shuffledTracks = [...currentPlaylist.tracks];
        
        // Shuffle the array
        for (let i = shuffledTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledTracks[i], shuffledTracks[j]] = [shuffledTracks[j], shuffledTracks[i]];
        }
        
        // Update current playlist
        currentPlaylist.tracks = shuffledTracks;
        
        // Display shuffled tracks
        displayTracks(shuffledTracks);
        
        showNotification('Playlist shuffled');
    }
});