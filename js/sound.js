// Sound manager class for portfolio interactions
class SoundManager {
  constructor() {
    this.exploreSound = new Audio(
      './public/sound/mixkit-select-click-1109.wav'
    );
    this.exploreSound.volume = 0.5;
    this.exploreSound.preload = 'auto';
    this.exploreSound.crossOrigin = 'anonymous';

    // Handle load errors
    this.exploreSound.addEventListener('error', (e) => {
      console.warn('Audio file failed to load:', e);
    });
  }

  playExploreSound() {
    if (this.exploreSound.readyState >= 2) {
      this.exploreSound.currentTime = 0;
      this.exploreSound
        .play()
        .catch((e) => console.warn('Audio play failed:', e));
    }
  }
}

// Export for ES modules
export { SoundManager };
