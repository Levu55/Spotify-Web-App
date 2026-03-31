const songs = [
    {
        name: "Kali Kali Zulfhon",
        artist: "Nusrat Fateh Ali Khan",
        cover: "kali.jfif",
        file: "nusrat.mp3",
        title: "Kali Kali Zulfhon"
    },
    {
        name: "Afreen Afreen",
        artist: "Rahat Fateh Ali Khan",
        cover: "afreen.jpg",
        file: "Afreen.weba",
        title: "Afreen Afreen"
    },
    {
        name: "Fida-e-Haideri",
        artist: "Sadiq Hussain",
        cover: "fida.img",
        file: "fida-e -haideri.weba",
        title: "Fida-e-Haideri"
    },
    {
        name: "Tajdar-e-Haram",
        artist: "Atif Aslam",
        cover: "taj.jpg",
        file: "taj dare haram.weba",
        title: "Tajdar-e-Haram"
    },
    
];

const fallbackImage = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

const songsContainer = document.getElementById("songs-container");
const audioElement = document.getElementById("audio-element");

const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerCover = document.getElementById("player-cover");

const playPauseBtn = document.getElementById("play-pause-btn");
const playIcon = document.getElementById("play-icon");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const volumeSlider = document.getElementById("volume-slider");

let currentSongIndex = -1;
let isPlaying = false;

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function updateSliderBackground(slider, val, max, activeColor = "var(--text-base)", inactiveColor = "#4d4d4d") {
    const percent = max > 0 ? (val / max) * 100 : 0;
    slider.style.background = `linear-gradient(to right, ${activeColor} ${percent}%, ${inactiveColor} ${percent}%)`;
}

function renderSongs() {
    songsContainer.innerHTML = '';

    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.setAttribute('data-index', index);

        const imgSrc = song.cover ? song.cover : fallbackImage;

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imgSrc}" alt="${song.name}" onerror="this.src='${fallbackImage}'">
                <button class="card-play-btn" aria-label="Play ${song.name}">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <h3>${song.name}</h3>
            <p>${song.artist}</p>
        `;

        card.addEventListener('click', (e) => {
            handleSongSelection(index);
        });

        const innerPlayBtn = card.querySelector('.card-play-btn');
        innerPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleSongSelection(index);
        });

        songsContainer.appendChild(card);
    });
}

function handleSongSelection(index) {
    if (currentSongIndex === index) {
        togglePlayPause();
    } else {
        loadSong(index);
        playAudio();
    }
}

function loadSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentSongIndex = index;
    const song = songs[index];

    audioElement.src = song.file;

    playerTitle.textContent = song.name;
    playerArtist.textContent = song.artist;

    playerCover.src = song.cover || fallbackImage;
    playerCover.onerror = () => { playerCover.src = fallbackImage; };

    document.querySelectorAll('.music-card').forEach((card, i) => {
        const icon = card.querySelector('.card-play-btn i');
        if (i === index) {
            card.classList.add('playing');
            icon.className = 'fas fa-pause';
        } else {
            card.classList.remove('playing');
            icon.className = 'fas fa-play';
        }
    });

    progressBar.value = 0;
    updateSliderBackground(progressBar, 0, 100);
    currentTimeEl.textContent = "0:00";
}

function playAudio() {
    if (currentSongIndex === -1 && songs.length > 0) {
        loadSong(0);
    }

    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            updatePlayIcons(true);
        }).catch(err => {
            console.error("Audio playback error (could be file missing or autoplay policy):", err);
            isPlaying = true;
            updatePlayIcons(true);
        });
    }
}

function pauseAudio() {
    audioElement.pause();
    isPlaying = false;
    updatePlayIcons(false);
}

function togglePlayPause() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function updatePlayIcons(playing) {
    playIcon.className = playing ? 'fas fa-pause' : 'fas fa-play';

    if (currentSongIndex !== -1) {
        const activeCard = document.querySelector(`.music-card[data-index="${currentSongIndex}"]`);
        if (activeCard) {
            const icon = activeCard.querySelector('.card-play-btn i');
            icon.className = playing ? 'fas fa-pause' : 'fas fa-play';
        }
    }
}

function playNext() {
    if (songs.length === 0) return;
    let newIndex = currentSongIndex + 1;
    if (newIndex >= songs.length) {
        newIndex = 0;
    }
    loadSong(newIndex);
    playAudio();
}

function playPrev() {
    if (songs.length === 0) return;
    let newIndex = currentSongIndex - 1;
    if (audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
        return;
    }

    if (newIndex < 0) {
        newIndex = songs.length - 1;
    }
    loadSong(newIndex);
    playAudio();
}

playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

audioElement.addEventListener('timeupdate', () => {
    if (audioElement.duration && !isNaN(audioElement.duration)) {
        progressBar.value = audioElement.currentTime;
        progressBar.max = audioElement.duration;

        updateSliderBackground(progressBar, audioElement.currentTime, audioElement.duration);
        currentTimeEl.textContent = formatTime(audioElement.currentTime);
    }
});

audioElement.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioElement.duration);
    progressBar.max = audioElement.duration;
});

audioElement.addEventListener('ended', playNext);

progressBar.addEventListener('input', (e) => {
    if (audioElement.duration) {
        audioElement.currentTime = e.target.value;
        updateSliderBackground(progressBar, e.target.value, audioElement.duration);
    }
});

progressBar.addEventListener('mouseover', () => {
    if (audioElement.duration) {
        updateSliderBackground(progressBar, progressBar.value, audioElement.duration, "var(--accent)");
    }
});

progressBar.addEventListener('mouseout', () => {
    if (audioElement.duration) {
        updateSliderBackground(progressBar, progressBar.value, audioElement.duration);
    }
});

volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value;
    audioElement.volume = vol / 100;
    updateSliderBackground(volumeSlider, vol, 100);
});

updateSliderBackground(volumeSlider, 100, 100);

renderSongs();

// Search functionality
const searchNav = document.getElementById('search-nav');
const searchContainer = document.querySelector('.search-container');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
let homeNav = document.querySelector('.sidebar-nav .nav-item.active'); // initially Home

function toggleSearch() {
    const isVisible = searchContainer.classList.contains('visible');

    if (isVisible) {
        // Hide
        searchContainer.classList.remove('visible');
        searchInput.value = '';
        searchInput.blur();
        homeNav.classList.add('active');
        searchNav.classList.remove('active');
    } else {
        // Show
        searchContainer.classList.add('visible');
        searchNav.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        searchNav.classList.add('active');
        homeNav.classList.remove('active');
        searchInput.focus();
    }
}

function clearSearch() {
    searchInput.value = '';
    searchInput.focus();
}

document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target) && !searchNav.contains(e.target) && searchContainer.classList.contains('visible')) {
        toggleSearch();
    }
});

// Event listeners
searchNav.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSearch();
});

searchClear.addEventListener('click', clearSearch);

// ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchContainer.classList.contains('visible')) {
        searchInput.value = '';
        searchContainer.classList.remove('visible');
        searchNav.classList.remove('active');
        homeNav.classList.add('active');
        searchInput.blur();
    }
});
