/**
 * Web Audio API synthesizer for the enchanted meadow.
 * Generates an ethereal, romantic music-box/celesta soundscape and blooming chimes.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private timer: number | null = null;
  private isInitialized: boolean = false;

  private init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  public async enableSound(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isMuted = false;
    this.startAmbientLullaby();
    this.playBloomChime(0);
    return true;
  }

  public disableSound(): void {
    this.isMuted = true;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  public toggleSound(): boolean {
    if (this.isMuted) {
      this.enableSound();
      return true;
    } else {
      this.disableSound();
      return false;
    }
  }

  /**
   * Delicate celesta/harp note synthesis
   */
  public playTone(freq: number, duration: number = 2.0, gainAmount: number = 0.12): void {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sine wave with slight harmonic character for music box tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Lowpass filter with soft warm resonance
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + duration);

      // Delicate envelope
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainAmount, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio context might be restricted
    }
  }

  /**
   * Sound played on each stage of bloom
   */
  public playBloomChime(stage: number): void {
    if (this.isMuted || !this.ctx) return;

    // Arpeggiated chime
    const baseFreqs = [
      [329.63, 392.00, 493.88],          // E4, G4, B4
      [392.00, 493.88, 587.33, 659.25],  // G4, B4, D5, E5
      [440.00, 523.25, 659.25, 783.99],  // A4, C5, E5, G5
      [493.88, 587.33, 739.99, 880.00],  // B4, D5, F#5, A5
      [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 (full blossom)
      [659.25, 783.99, 987.77, 1318.51], // E5, G5, B5, E6 (letter reveal)
    ];

    const notes = baseFreqs[Math.min(stage, baseFreqs.length - 1)];
    notes.forEach((freq, i) => {
      window.setTimeout(() => {
        this.playTone(freq, 2.5, 0.14);
      }, i * 110);
    });
  }

  /**
   * Interactive sparkle chime when planting flowers by tapping
   */
  public playSparkle(): void {
    if (this.isMuted || !this.ctx) return;
    const pentatonic = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
    this.playTone(freq, 1.8, 0.1);
  }

  /**
   * Magical shimmering chime when discovering a rare celestial flower
   */
  public playRareDiscovery(): void {
    if (this.isMuted || !this.ctx) return;
    const celestialNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    celestialNotes.forEach((freq, i) => {
      window.setTimeout(() => {
        this.playTone(freq, 2.2, 0.16);
      }, i * 85);
    });
  }

  /**
   * Romantic gentle ambient lullaby loop (music box feel)
   */
  private startAmbientLullaby(): void {
    if (this.timer) return;
    // Poetic peaceful melody notes (E minor / G major peaceful pentatonic)
    const melody = [
      329.63, 392.00, 493.88, 587.33,
      659.25, 587.33, 493.88, 392.00,
      440.00, 523.25, 659.25, 783.99,
      659.25, 523.25, 440.00, 392.00,
    ];
    let noteIdx = 0;

    this.timer = window.setInterval(() => {
      if (this.isMuted) return;
      const freq = melody[noteIdx % melody.length];
      // Random subtle harmonic backing
      if (noteIdx % 4 === 0) {
        this.playTone(freq / 2, 3.5, 0.06); // soft bass root
      }
      this.playTone(freq, 2.8, 0.09);
      noteIdx++;
    }, 700);
  }
}

export const sound = new SoundEngine();
