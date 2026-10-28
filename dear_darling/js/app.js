/**
 * Dear Darling — Main Application Controller
 * Dedicated to Faith 💖
 */

import { LETTERS_DATA } from "./data.js";
import { StorageManager } from "./storage.js";
import { SoundEngine } from "./audio.js";
import { AmbientBackground } from "./particles.js";
import { LetterModal } from "./modal.js";

class DearDarlingApp {
  constructor() {
    this.currentFilter = "all";
    this.particles = new AmbientBackground("particlesCanvas");
    this.modal = new LetterModal(this.particles);

    this.gridElement = document.getElementById("vaultGrid");
    this.filterChips = document.querySelectorAll(".filter-chip");
    this.progressCounter = document.getElementById("progressCounter");
    this.progressBarFill = document.getElementById("progressBarFill");
    this.progressSubtext = document.getElementById("progressSubtext");
    this.audioToggleBtn = document.getElementById("audioToggleBtn");
    this.easterEggBtn = document.getElementById("easterEggBtn");

    this.init();
  }

  init() {
    this.renderGrid();
    this.updateProgress();
    this.bindEvents();
  }

  bindEvents() {
    // Filter chip clicks
    this.filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        this.filterChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        this.currentFilter = chip.dataset.category || "all";
        this.renderGrid();
      });
    });

    // Top bar ocean sound toggle
    if (this.audioToggleBtn) {
      this.audioToggleBtn.addEventListener("click", () => {
        const isPlaying = SoundEngine.toggleOcean();
        this.audioToggleBtn.classList.toggle("playing", isPlaying);
        this.audioToggleBtn.innerHTML = isPlaying
          ? `<span class="icon">🌊</span> Soundscape On`
          : `<span class="icon">🎵</span> Ocean Soundscape`;
      });
    }

    // Easter egg button in footer
    if (this.easterEggBtn) {
      this.easterEggBtn.addEventListener("click", () => {
        const rect = this.easterEggBtn.getBoundingClientRect();
        this.particles.triggerHeartBurst(rect.left + rect.width / 2, rect.top);
        SoundEngine.playWarmHug();
        alert("✨ Faith, you are extraordinary in ways you probably don't even realize. Never forget that!");
      });
    }

    // Listen for custom events to refresh stats
    document.addEventListener("letter-opened", (e) => {
      this.updateProgress();
      this.updateCardState(e.detail.id);
    });

    document.addEventListener("favorite-updated", (e) => {
      this.updateCardState(e.detail.id);
    });
  }

  updateProgress() {
    const openedSet = StorageManager.getOpenedLetters();
    const count = openedSet.size;
    const total = LETTERS_DATA.length;
    const pct = Math.round((count / total) * 100);

    if (this.progressCounter) {
      this.progressCounter.textContent = `${count} of ${total} Keepsakes Unlocked`;
    }

    if (this.progressBarFill) {
      this.progressBarFill.style.width = `${pct}%`;
    }

    if (this.progressSubtext) {
      if (count === 0) {
        this.progressSubtext.textContent = "Take your time. Pick the letter that speaks to you right now ✨";
      } else if (count === total) {
        this.progressSubtext.textContent = "You've unlocked every letter! You can revisit them anytime 💖";
      } else {
        this.progressSubtext.textContent = `${total - count} more ${total - count === 1 ? "letter" : "letters"} waiting whenever you need them.`;
      }
    }
  }

  updateCardState(letterId) {
    const card = document.querySelector(`.envelope-card[data-id="${letterId}"]`);
    if (!card) return;

    const isOpened = StorageManager.getOpenedLetters().has(letterId);
    const isFav = StorageManager.isFavorite(letterId);

    if (isOpened) {
      card.classList.add("is-opened");
      const statusPill = card.querySelector(".status-pill");
      if (statusPill) {
        statusPill.className = "status-pill opened";
        statusPill.innerHTML = '<span class="status-indicator-dot"></span> Opened 💌';
      }
    }

    const favBtn = card.querySelector(".fav-btn");
    if (favBtn) {
      favBtn.classList.toggle("is-favorite", isFav);
      favBtn.setAttribute("aria-label", isFav ? "Remove favorite" : "Save to favorites");
    }
  }

  renderGrid() {
    if (!this.gridElement) return;

    const openedSet = StorageManager.getOpenedLetters();

    const filtered = LETTERS_DATA.filter((letter) => {
      if (this.currentFilter === "all") return true;
      if (this.currentFilter === "favorites") return StorageManager.isFavorite(letter.id);
      return letter.category === this.currentFilter;
    });

    if (filtered.length === 0) {
      this.gridElement.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 0.5rem;">
            No keepsakes match this filter yet.
          </p>
          <p style="font-size: 0.9rem;">
            ${this.currentFilter === "favorites" ? "You haven't bookmarked any favorites yet! Tap the heart on any card to save it." : "Try selecting 'All Keepsakes' above."}
          </p>
        </div>
      `;
      return;
    }

    this.gridElement.innerHTML = filtered
      .map((letter, index) => {
        const isOpened = openedSet.has(letter.id);
        const isFav = StorageManager.isFavorite(letter.id);

        let sealClass = "wax-seal-rose";
        if (letter.sealColor === "ocean") sealClass = "wax-seal-ocean";
        if (letter.sealColor === "gold") sealClass = "wax-seal-gold";

        let catClass = `category-${letter.category}`;

        return `
          <article 
            class="envelope-card ${isOpened ? 'is-opened' : ''}" 
            data-id="${letter.id}" 
            style="--card-index: ${index};"
            tabindex="0" 
            role="button" 
            aria-label="Open letter: ${letter.title}"
          >
            <div class="envelope-header">
              <span class="category-tag ${catClass}">
                ${letter.categoryLabel}
              </span>
              <button 
                type="button" 
                class="fav-btn ${isFav ? 'is-favorite' : ''}" 
                data-fav-id="${letter.id}" 
                aria-label="${isFav ? 'Remove favorite' : 'Save to favorites'}"
              >
                ${isFav ? '💖' : '🤍'}
              </button>
            </div>

            <div class="wax-seal-wrapper">
              <div class="wax-seal ${sealClass}">
                <span>${letter.sealIcon}</span>
              </div>
            </div>

            <div class="envelope-body">
              <h3 class="envelope-title">${letter.title}</h3>
              <p class="envelope-subtitle">${letter.subtitle}</p>
            </div>

            <div class="envelope-footer">
              <div class="status-pill ${isOpened ? 'opened' : 'unopened'}">
                <span class="status-indicator-dot"></span>
                ${isOpened ? 'Opened 💌' : 'Ready to open ✨'}
              </div>
              <button type="button" class="open-card-btn" tabindex="-1">
                Read Letter &rarr;
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    // Bind card click & keyboard events
    const cards = this.gridElement.querySelectorAll(".envelope-card");
    cards.forEach((card) => {
      const id = card.dataset.id;
      const letter = LETTERS_DATA.find((l) => l.id === id);
      if (!letter) return;

      const openAction = (e) => {
        // Prevent opening if the user clicked the favorite heart button
        if (e.target.closest(".fav-btn")) return;
        const rect = card.getBoundingClientRect();
        this.modal.open(letter, rect.left + rect.width / 2, rect.top + rect.height / 2);
      };

      card.addEventListener("click", openAction);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openAction(e);
        }
      });

      // Favorite button listener
      const favBtn = card.querySelector(".fav-btn");
      if (favBtn) {
        favBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const nextState = StorageManager.toggleFavorite(id);
          favBtn.classList.toggle("is-favorite", nextState);
          favBtn.innerHTML = nextState ? "💖" : "🤍";

          if (nextState) {
            const r = favBtn.getBoundingClientRect();
            this.particles.triggerHeartBurst(r.left + r.width / 2, r.top);
          }
          SoundEngine.playChime();
        });
      }
    });
  }
}

// Bootstrap application once DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DearDarlingApp();
});
