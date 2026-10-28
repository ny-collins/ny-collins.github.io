/**
 * Dear Darling — Procedural Audio Engine
 * Uses the Web Audio API to create serene ocean waves and gentle music-box chimes
 * Zero external audio files required — reliable, lightweight, and offline-ready.
 */

let audioCtx = null;
let oceanGainNode = null;
let oceanNoiseNode = null;
let isPlayingOcean = false;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

/**
 * Procedurally generate gentle rolling ocean waves
 */
function createOceanWaves() {
  if (!audioCtx) return;

  const bufferSize = audioCtx.sampleRate * 4;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  // Generate pink/brown noise
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99 * b0 + white * 0.05;
    b1 = 0.95 * b1 + white * 0.1;
    b2 = 0.85 * b2 + white * 0.25;
    output[i] = (b0 + b1 + b2) * 0.18;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  // Filter with gentle resonance to simulate water swell
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(320, audioCtx.currentTime);

  // LFO (Low-Frequency Oscillator) to modulate waves (in & out every 6 seconds)
  const lfo = audioCtx.createOscillator();
  lfo.frequency.setValueAtTime(0.16, audioCtx.currentTime); // ~6s wave cycle

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.setValueAtTime(220, audioCtx.currentTime);

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  // Volume envelope
  oceanGainNode = audioCtx.createGain();
  oceanGainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);

  whiteNoise.connect(filter);
  filter.connect(oceanGainNode);
  oceanGainNode.connect(audioCtx.destination);

  whiteNoise.start(0);
  lfo.start(0);

  oceanNoiseNode = whiteNoise;
}

export const SoundEngine = {
  toggleOcean() {
    initAudioContext();
    if (!audioCtx) return false;

    if (isPlayingOcean) {
      this.stopOcean();
      return false;
    } else {
      this.startOcean();
      return true;
    }
  },

  startOcean() {
    initAudioContext();
    if (!audioCtx) return;

    if (!oceanGainNode) {
      createOceanWaves();
    }

    if (oceanGainNode) {
      oceanGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      oceanGainNode.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 2.5);
      isPlayingOcean = true;
    }
  },

  stopOcean() {
    if (audioCtx && oceanGainNode) {
      oceanGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      oceanGainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
      isPlayingOcean = false;
    }
  },

  isOceanPlaying() {
    return isPlayingOcean;
  },

  /**
   * Play a delicate, magical music-box chime chord when an envelope is opened
   */
  playChime() {
    initAudioContext();
    if (!audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Warm Major)
    const now = audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.5);
    });
  },

  /**
   * Soft warm heart chime for hugs
   */
  playWarmHug() {
    initAudioContext();
    if (!audioCtx) return;

    const freqs = [440, 554.37, 659.25]; // A4, C#5, E5
    const now = audioCtx.currentTime;

    freqs.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 2.0);
    });
  }
};
