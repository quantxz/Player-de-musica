const addMusic = document.getElementById("addMusic");

const audio = document.getElementById("audio");

const playButton = document.getElementById("play");

const nextButton = document.getElementById("next");

const previousButton = document.getElementById("previous");

const musicTitle = document.getElementById("musicTitle");

const musicNumber = document.getElementById("musicNumber");

const musicList = document.getElementById("musicList");

const volume = document.getElementById("volume");

const volumeValue = document.getElementById("volumeValue");

const MusicFolderOpen = document.getElementById("MusicFolderOpen");

const progress = document.getElementById("progress");

const currentTime = document.getElementById("currentTime");

const duration = document.getElementById("duration");

function formatTime(seconds) {
    if (isNaN(seconds)) {
        return "0:00";
    }

    const minutos = Math.floor(seconds / 60);
    const segundos = Math.floor(seconds % 60);

    return `${minutos}:${segundos.toString().padStart(2, "0")}`;
}

MusicFolderOpen.addEventListener("click", () => {
    window.electronAPI.openMusicFolder();
});

audio.addEventListener("timeupdate", () => {

    if (!audio.duration) {
        return;
    }

    const porcentagem =
        (audio.currentTime / audio.duration) * 100;

    progress.value = porcentagem;

    currentTime.textContent =
        formatTime(audio.currentTime);
});


audio.addEventListener("loadedmetadata", () => {

    duration.textContent =
        formatTime(audio.duration);

    progress.value = 0;

    currentTime.textContent = "0:00";
});

progress.addEventListener("input", () => {

    if (!audio.duration) {
        return;
    }

    const porcentagem = progress.value / 100;

    audio.currentTime =
        porcentagem * audio.duration;
});

volume.addEventListener("input", () => {

    audio.volume = volume.value * 0.11;

    const porcentagem = Math.round(volume.value * 100);

    volumeValue.textContent = `${porcentagem}%`;

});

let musics = [];

let currentMusic = 0;

loadMusics();

async function loadMusics() {

    musics = await window.electronAPI.loadMusics();

    if (musics.length === 0) {
        return;
    }

    currentMusic = 0;

    renderPlaylist();

    loadMusic();
}

addMusic.addEventListener("click", async () => {

    const arquivos =
        await window.electronAPI.selectMusics();

    if (arquivos.length === 0) {
        return;
    }

    musics.push(...arquivos);

    renderPlaylist();

    if (musics.length === arquivos.length) {

        currentMusic = 0;

        loadMusic();
    }
});

function loadMusic() {

    if (musics.length === 0) {
        return;
    }

    const music = musics[currentMusic];

    audio.src = `file://${music.path.replace(/\\/g, "/")}`;

    musicTitle.textContent = music.name;

    musicNumber.textContent =
        `${currentMusic + 1} / ${musics.length}`;

    renderPlaylist();
}


playButton.addEventListener("click", () => {

    if (musics.length === 0) {
        return;
    }

    if (audio.paused) {

        audio.play();

        playButton.textContent = "⏸️";

    } else {

        audio.pause();

        playButton.textContent = "▶️";

    }

});

nextButton.addEventListener("click", () => {

    if (musics.length === 0) {
        return;
    }

    currentMusic++;

    if (currentMusic >= musics.length) {
        currentMusic = 0;
    }

    loadMusic();

    audio.play();

    playButton.textContent = "⏸️";

});

previousButton.addEventListener("click", () => {

    if (musics.length === 0) {
        return;
    }

    currentMusic--;

    if (currentMusic < 0) {
        currentMusic = musics.length - 1;
    }

    loadMusic();

    audio.play();

    playButton.textContent = "⏸️";

});

audio.addEventListener("ended", () => {

    currentMusic++;

    if (currentMusic >= musics.length) {
        currentMusic = 0;
    }

    loadMusic();

    audio.play();

});

function renderPlaylist() {

    musicList.innerHTML = "";

    musics.forEach((music, index) => {

        const element = document.createElement("div");

        element.classList.add("music");

        if (index === currentMusic) {
            element.classList.add("active");
        }

        element.textContent = music.name;

        element.addEventListener("click", () => {

            currentMusic = index;

            loadMusic();

            audio.play();

            playButton.textContent = "⏸️";

        });

        musicList.appendChild(element);

    });

}