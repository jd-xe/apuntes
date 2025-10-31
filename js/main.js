// Música de fondo
const btn = document.getElementById('music-btn');
const audio = document.getElementById('bgMusic');

if (btn && audio) {
    btn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            btn.innerText = '⏸️ Pausar';
        } else {
            audio.pause();
            btn.innerText = '🎵 Música';
        }
    });
}
