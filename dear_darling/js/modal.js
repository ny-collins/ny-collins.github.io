/**
 * Dear Darling — Modal Controller & Interactive Letter Renderer
 * Native <dialog> implementation with modern top-layer entry & exit transitions
 */

import { StorageManager } from "./storage.js";
import { SoundEngine } from "./audio.js";

function supportsTopLayerExit() {
  return window.CSS?.supports?.("overlay", "auto") && window.CSS?.supports?.("transition-behavior", "allow-discrete");
}

export class LetterModal {
  constructor(particles) {
    this.modal = document.getElementById("letterModal");
    this.contentScroll = document.getElementById("letterScrollContainer");
    this.closeBtn = document.getElementById("modalCloseBtn");
    this.particles = particles;
    this.currentLetter = null;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.modal) return;

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    // Light-dismiss: click outside the sheet (on the backdrop) closes the modal
    this.modal.addEventListener("click", (e) => {
      const rect = this.modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog || e.target === this.modal) {
        this.close();
      }
    });

    // Intercept native Esc key to run smooth exit transition
    this.modal.addEventListener("cancel", (e) => {
      e.preventDefault();
      this.close();
    });
  }

  open(letter, originX, originY) {
    this.currentLetter = letter;
    StorageManager.markLetterOpened(letter.id);

    SoundEngine.playChime();
    if (this.particles) {
      this.particles.triggerHeartBurst(originX, originY);
    }

    this.renderLetter(letter);

    if (typeof this.modal.showModal === "function") {
      this.modal.showModal();
    } else {
      this.modal.setAttribute("open", "");
    }

    // Scroll to top of letter
    if (this.contentScroll) {
      this.contentScroll.scrollTop = 0;
    }

    // Dispatch custom event for app.js to update UI counters
    document.dispatchEvent(new CustomEvent("letter-opened", { detail: { id: letter.id } }));
  }

  async close() {
    if (!this.modal.open) return;

    if (!supportsTopLayerExit()) {
      this.modal.setAttribute("data-closing", "");
      const animations = this.modal.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 350))
        ]);
      }
      this.modal.removeAttribute("data-closing");
    }

    this.modal.close();
    this.currentLetter = null;
  }

  renderLetter(letter) {
    if (!this.contentScroll) return;

    const isFav = StorageManager.isFavorite(letter.id);

    // Build letter markup
    let html = `
      <div class="letter-meta-header">
        <div class="postmark-badge">
          <span class="postmark-date">${letter.postmarkDate}</span>
          <span class="postmark-destination">For Faith, with love</span>
        </div>
        <div class="postmark-stamp">
          <div class="stamp-inner">
            <span class="stamp-icon">${letter.sealIcon}</span>
            <span>AIR MAIL</span>
          </div>
        </div>
      </div>

      <div class="letter-salutation">${letter.salutation}</div>
      <h2 class="letter-title">${letter.letterHeading}</h2>

      <div class="letter-body">
        ${letter.paragraphs.map((p) => `<p>${p}</p>`).join("")}
        ${letter.quote ? `<blockquote>${letter.quote}</blockquote>` : ""}
      </div>
    `;

    // Render unique interactive feature widget
    html += this.getFeatureMarkup(letter);

    // Render signature & P.S. note
    html += `
      <div class="letter-signature">
        ${letter.signoff}
        <span class="ps-note">${letter.psNote}</span>
      </div>

      <div class="letter-action-bar">
        <button type="button" class="action-btn action-btn-secondary" id="letterFavToggle">
          ${isFav ? "💖 Favorited" : "🤍 Save to Favorites"}
        </button>
        <button type="button" class="action-btn action-btn-primary" id="letterBottomClose">
          Fold & Close Letter
        </button>
      </div>
    `;

    this.contentScroll.innerHTML = html;
    this.attachFeatureBehaviors(letter);

    // Bind action bar buttons
    const favBtn = document.getElementById("letterFavToggle");
    if (favBtn) {
      favBtn.addEventListener("click", () => {
        const nextState = StorageManager.toggleFavorite(letter.id);
        favBtn.innerHTML = nextState ? "💖 Favorited" : "🤍 Save to Favorites";
        if (nextState && this.particles) {
          const rect = favBtn.getBoundingClientRect();
          this.particles.triggerHeartBurst(rect.left + rect.width / 2, rect.top);
        }
        document.dispatchEvent(new CustomEvent("favorite-updated", { detail: { id: letter.id } }));
      });
    }

    const bottomClose = document.getElementById("letterBottomClose");
    if (bottomClose) {
      bottomClose.addEventListener("click", () => this.close());
    }
  }

  getFeatureMarkup(letter) {
    const { featureType, featureData } = letter;

    switch (featureType) {
      case "breathing":
        return `
          <div class="breathing-container" id="breathingWidget">
            <div class="breathing-circle-wrapper">
              <div class="breathing-outer-ring"></div>
              <div class="breathing-inner-circle" id="breathingActionText">Inhale</div>
            </div>
            <div class="breathing-instruction" id="breathingSubInstruction">Slowly breathe in peace...</div>
            <div class="breathing-subtext">Match your breath with the circle. 4s in, 4s hold, 4s out.</div>
          </div>
        `;

      case "flipcards":
        return `
          <div class="flip-cards-grid" id="flipCardsGrid">
            ${featureData.cards.map((card, idx) => `
              <div class="flip-card" data-card-idx="${idx}" tabindex="0" role="button" aria-label="Tap to flip card">
                <div class="flip-card-inner">
                  <div class="flip-card-front">
                    <span class="card-icon">${card.icon}</span>
                    <span class="card-prompt">${card.prompt}</span>
                    <span style="font-size: 0.75rem; margin-top: 6px; opacity: 0.7;">(Tap to flip 🔄)</span>
                  </div>
                  <div class="flip-card-back">
                    <p class="card-punchline">${card.punchline}</p>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `;

      case "strengths":
        return `
          <div class="strengths-container">
            <div class="strengths-header">
              <h4>✨ Tap a Star to Reveal a Reminder:</h4>
            </div>
            <div class="stars-list" id="starsChipList">
              ${featureData.strengths.map((s, idx) => `
                <button type="button" class="star-chip ${idx === 0 ? 'active' : ''}" data-strength-idx="${idx}">
                  ⭐ ${s.title}
                </button>
              `).join("")}
            </div>
            <div class="strength-detail-box" id="strengthDetailDisplay">
              ${featureData.strengths[0].text}
            </div>
          </div>
        `;

      case "audioplayer":
        const currentHugs = StorageManager.getHugCount();
        return `
          <div class="audio-player-card">
            <div class="audio-player-header">
              <div class="audio-avatar">🎙️</div>
              <div class="audio-meta">
                <h4>${featureData.audioTitle}</h4>
                <span>${featureData.audioSubtitle} • ${featureData.audioDuration}</span>
              </div>
            </div>
            <div class="waveform-track" id="audioWaveform">
              ${Array.from({ length: 24 }).map(() => '<div class="waveform-bar"></div>').join("")}
            </div>
            <div class="audio-controls">
              <button type="button" class="audio-play-trigger" id="audioPlayBtn">
                ▶️ Play Ocean Atmosphere
              </button>
              <span style="font-size: 0.75rem; color: var(--text-subtle);">Procedural Soundscape</span>
            </div>

            <div class="warm-hug-section">
              <button type="button" class="hug-btn" id="sendHugBtn">
                🤗 Tap for a Warm Hug
              </button>
              <div class="hug-count-text" id="hugCounterText">
                ${currentHugs > 0 ? `Sent with infinite warmth (${currentHugs} hugs exchanged)` : "Tap whenever you need an embrace 💖"}
              </div>
            </div>
          </div>
        `;

      case "checklist":
        const savedChecked = StorageManager.getChecklistState();
        return `
          <div class="decision-checklist">
            <h4 class="checklist-title">🧭 Grounding Checkpoints:</h4>
            <div class="checklist-items" id="checklistContainer">
              ${featureData.items.map((item, idx) => `
                <div class="check-item">
                  <input type="checkbox" id="chk_${idx}" data-idx="${idx}" ${savedChecked.includes(idx) ? 'checked' : ''} />
                  <label for="chk_${idx}">${item}</label>
                </div>
              `).join("")}
            </div>
          </div>
        `;

      case "nightsky":
        return `
          <div class="stargazing-banner">
            <div class="moon-icon">🌙</div>
            <h4>Goodnight & Sweet Dreams, Faith</h4>
            <p>Close your eyes, breathe gently, and let the quiet night comfort you. Tomorrow is waiting with new grace.</p>
            <button type="button" class="audio-play-trigger" id="bedtimeOceanBtn" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4);">
              🌊 Play Peaceful Ocean Waves
            </button>
          </div>
        `;

      case "voucher":
        const isRedeemed = StorageManager.isVoucherRedeemed();
        return `
          <div class="voucher-card">
            <span class="voucher-ribbon">VIP GOLDEN TICKET</span>
            <h3 class="voucher-title">The "Whatever You Crave" Pass</h3>
            <p class="voucher-perks">${featureData.perks}</p>
            <div class="voucher-stamp-area" id="voucherActionArea">
              ${isRedeemed ? `
                <div class="redeemed-stamp">❤️ CLAIMED & REDEEMED</div>
              ` : `
                <button type="button" class="redeem-voucher-btn" id="claimVoucherBtn">
                  🎁 Claim / Redeem This Treat
                </button>
              `}
            </div>
          </div>
        `;

      case "welcome-info":
      default:
        return `
          <div style="margin: var(--space-lg) 0; padding: var(--space-md); background: linear-gradient(135deg, var(--pink-50), var(--ocean-50)); border-radius: var(--radius-md); text-align: center;">
            <p style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--ocean-deep); margin-bottom: 0.5rem;">
              Take all the time you need. 💖
            </p>
            <p style="font-size: 0.875rem; color: var(--text-muted);">
              You can return to these letters at any time, online or offline.
            </p>
          </div>
        `;
    }
  }

  attachFeatureBehaviors(letter) {
    const { featureType, featureData } = letter;

    if (featureType === "breathing") {
      const actionText = document.getElementById("breathingActionText");
      const subInstruction = document.getElementById("breathingSubInstruction");
      let phase = 0;
      const phases = [
        { main: "Inhale", sub: "Slowly breathe in peace..." },
        { main: "Hold", sub: "Hold gently and be present..." },
        { main: "Exhale", sub: "Release all the tension..." },
        { main: "Rest", sub: "Let your breath settle..." }
      ];

      const intervalId = setInterval(() => {
        if (!this.modal.open) {
          clearInterval(intervalId);
          return;
        }
        phase = (phase + 1) % phases.length;
        if (actionText) actionText.textContent = phases[phase].main;
        if (subInstruction) subInstruction.textContent = phases[phase].sub;
      }, 4000);
    }

    if (featureType === "flipcards") {
      const cards = document.querySelectorAll(".flip-card");
      cards.forEach((card) => {
        const toggle = () => {
          card.classList.toggle("is-flipped");
          SoundEngine.playChime();
        };
        card.addEventListener("click", toggle);
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        });
      });
    }

    if (featureType === "strengths") {
      const chips = document.querySelectorAll(".star-chip");
      const display = document.getElementById("strengthDetailDisplay");
      chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          chips.forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
          const idx = parseInt(chip.dataset.strengthIdx, 10);
          if (display && featureData.strengths[idx]) {
            display.textContent = featureData.strengths[idx].text;
            SoundEngine.playChime();
            if (this.particles) {
              const r = chip.getBoundingClientRect();
              this.particles.triggerHeartBurst(r.left + r.width / 2, r.top);
            }
          }
        });
      });
    }

    if (featureType === "audioplayer") {
      const playBtn = document.getElementById("audioPlayBtn");
      const waveform = document.getElementById("audioWaveform");
      const hugBtn = document.getElementById("sendHugBtn");
      const hugCounter = document.getElementById("hugCounterText");

      if (playBtn) {
        playBtn.addEventListener("click", () => {
          const isPlaying = SoundEngine.toggleOcean();
          playBtn.innerHTML = isPlaying ? "⏸️ Pause Ocean Waves" : "▶️ Play Ocean Atmosphere";
          if (waveform) {
            waveform.classList.toggle("is-playing", isPlaying);
          }
        });
      }

      if (hugBtn) {
        hugBtn.addEventListener("click", () => {
          const count = StorageManager.incrementHugCount();
          SoundEngine.playWarmHug();
          if (this.particles) {
            const rect = hugBtn.getBoundingClientRect();
            this.particles.triggerHeartBurst(rect.left + rect.width / 2, rect.top);
          }
          if (hugCounter) {
            hugCounter.textContent = `Sent with infinite warmth (${count} hugs exchanged 💖)`;
          }
        });
      }
    }

    if (featureType === "checklist") {
      const container = document.getElementById("checklistContainer");
      if (container) {
        container.addEventListener("change", () => {
          const checkboxes = container.querySelectorAll("input[type='checkbox']");
          const checkedIndices = [];
          checkboxes.forEach((cb) => {
            if (cb.checked) {
              checkedIndices.push(parseInt(cb.dataset.idx, 10));
            }
          });
          StorageManager.saveChecklistState(checkedIndices);
          SoundEngine.playChime();
        });
      }
    }

    if (featureType === "nightsky") {
      const bedtimeBtn = document.getElementById("bedtimeOceanBtn");
      if (bedtimeBtn) {
        bedtimeBtn.addEventListener("click", () => {
          const isPlaying = SoundEngine.toggleOcean();
          bedtimeBtn.innerHTML = isPlaying ? "⏸️ Pause Waves" : "🌊 Play Peaceful Ocean Waves";
        });
      }
    }

    if (featureType === "voucher") {
      const claimBtn = document.getElementById("claimVoucherBtn");
      const area = document.getElementById("voucherActionArea");
      if (claimBtn && area) {
        claimBtn.addEventListener("click", () => {
          StorageManager.redeemVoucher();
          SoundEngine.playChime();
          if (this.particles) {
            const rect = claimBtn.getBoundingClientRect();
            this.particles.triggerHeartBurst(rect.left + rect.width / 2, rect.top);
          }
          area.innerHTML = '<div class="redeemed-stamp">❤️ CLAIMED & REDEEMED</div>';
        });
      }
    }
  }
}
