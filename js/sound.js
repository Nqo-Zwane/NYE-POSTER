// Sound manager class for portfolio interactions
class SoundManager {
  constructor() {
    this.exploreSound = new Audio(
      'https://nye-bucket.s3.amazonaws.com/sound/mixkit-select-click-1109.wav'
    );
    this.exploreSound.volume = 0.5;
    this.exploreSound.preload = 'auto';
  }

  playExploreSound() {
    this.exploreSound.currentTime = 0;
    this.exploreSound
      .play()
      .catch((e) => console.warn('Audio play failed:', e));
  }
}

// Make available globally
window.SoundManager = SoundManager;
