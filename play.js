 document.addEventListener('click', () => {
    const music = document.getElementById('bgMusic');
    music.muted = false;
  }, { once: true });