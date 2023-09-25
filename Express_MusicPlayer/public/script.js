// Elementi player
const musicPlayer = document.getElementById('music-player');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

// Elementi di ricerca
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');

// Elementi playlist
const playlist = document.querySelector('.playlist');
let tracks = []; // Inizializza l'array tracks
let currentTrack = 0; // Track corrente
let userInteracted = false; // All'avvio, il flag userInteracted è impostato su false

// Elemento di input per il volume
const volumeControl = document.getElementById('volume');

// Riferimenti agli elementi della progress bar
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
let isDragging = false;

// Carica traccia iniziale nel player
loadTrack(currentTrack);

// Carica una traccia nel player
function loadTrack(trackIndex) {
    clearCurrentTrack();
    if (tracks[trackIndex]) {
        tracks[trackIndex].classList.add('playing');
        musicPlayer.src = tracks[trackIndex].getAttribute('data-src');
        musicPlayer.play();
    }
}

// Pulisci traccia corrente
function clearCurrentTrack() {
    const currentPlaying = playlist.querySelector('.playing');
    if (currentPlaying) {
        currentPlaying.classList.remove('playing');
    }
}

// Prev Track
prevBtn.addEventListener('click', () => {
    currentTrack--;
    if (currentTrack < 0) {
        currentTrack = tracks.length - 1;
    }
    loadTrack(currentTrack);
});

// Next Track 
nextBtn.addEventListener('click', () => {
    currentTrack++;
    if (currentTrack > tracks.length - 1) {
        currentTrack = 0;
    }
    loadTrack(currentTrack);
});

// Gestore di eventi al pulsante di riproduzione
playBtn.addEventListener('click', () => {
    if (!userInteracted) {
        userInteracted = true;
        musicPlayer.muted = false;
        loadTrack(currentTrack);
    } else {
        if (musicPlayer.paused) {
            playBtn.classList.remove('fa-play');
            playBtn.classList.add('fa-pause');
            musicPlayer.play();
        } else {
            playBtn.classList.add('fa-play');
            playBtn.classList.remove('fa-pause');
            musicPlayer.pause();
        }
    }
});

// Click su playlist
playlist.addEventListener('click', (e) => {
    const clickedTrack = e.target;
    if (clickedTrack.tagName === 'LI') {
        currentTrack = Array.from(tracks).indexOf(clickedTrack);
        loadTrack(currentTrack);
    }
});

// Imposta il volume iniziale all'avvio
musicPlayer.volume = volumeControl.value;

// Aggiorna il volume quando l'utente cambia il valore dell'input
volumeControl.addEventListener('input', () => {
    musicPlayer.volume = volumeControl.value;
});

// Aggiorna la barra di progresso durante il trascinamento
progressBar.addEventListener('mousedown', () => {
    isDragging = true;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const clickX = e.clientX - progressBar.getBoundingClientRect().left;
        const progressBarWidth = progressBar.offsetWidth;
        const seekTime = (clickX / progressBarWidth) * musicPlayer.duration;
        musicPlayer.currentTime = seekTime;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Aggiorna la barra di progresso in base al tempo della canzone
musicPlayer.addEventListener('timeupdate', () => {
    const currentTime = musicPlayer.currentTime;
    const duration = musicPlayer.duration;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = progressPercent + '%';
});

// Gestione del clic sulla barra di progresso
progressBar.addEventListener('click', (e) => {
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.offsetWidth;
    const seekTime = (clickX / progressBarWidth) * musicPlayer.duration;
    musicPlayer.currentTime = seekTime;
});

// Funzione per caricare dinamicamente la playlist
function loadPlaylist() {
    fetch('/api/songs')
        .then(response => response.json())
        .then(data => {
            const playlistList = document.querySelector('.playlist .list');
            playlistList.innerHTML = ''; // Cancella elementi precedenti nella playlist
            tracks = []; // Pulisci l'array tracks

            data.forEach((song, index) => {
                const listItem = document.createElement('li');
                listItem.setAttribute('data-src', song.path);
                listItem.setAttribute('data-index', index);
                listItem.innerHTML = `
                    <i class="fas fa-music"></i>
                    <span>${song.name}</span>
                `;
                playlistList.appendChild(listItem);
                tracks.push(listItem); 
            });

            playlist.addEventListener('click', (e) => {
                const clickedTrack = e.target.closest('li[data-index]');
                if (clickedTrack) {
                    const trackIndex = parseInt(clickedTrack.getAttribute('data-index'));
                    currentTrack = trackIndex;
                    loadTrack(currentTrack);
                }
            });
        })
        .catch(error => {
            console.error('Errore nel caricamento della playlist:', error);
        });
}

// Al caricamento della pagina, carica dinamicamente la playlist
loadPlaylist();

// Gestore di eventi per la ricerca
searchIcon.addEventListener('click', () => {
    searchSongs();
});

// Gestore di eventi per il tasto "Enter" sulla tastiera
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchSongs();
    }
});

// Funzione per la ricerca delle canzoni
function searchSongs() {
    const searchTerm = searchInput.value.toLowerCase();

    // Nascondi tutte le canzoni nella playlist
    tracks.forEach((track) => {
        track.style.display = 'none';
    });

    // Mostra solo le canzoni che corrispondono alla ricerca
    tracks.forEach((track) => {
        const trackName = track.querySelector('span').textContent.toLowerCase();
        if (trackName.includes(searchTerm)) {
            track.style.display = 'flex';
        }
    });
}
