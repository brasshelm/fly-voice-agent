// LeadSaveAI Voice Agent Demo Page
// Click-to-reveal phone number with liquid fill animation

// Toast Configuration
const TOAST_ICONS = {
  success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`
};

const TOAST_TITLES = {
  success: 'Success'
};

// Toast System
function showToast(message, type = 'success', duration = 4000) {
  const container = document.getElementById('toastContainer');

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    ${TOAST_ICONS[type]}
    <div class="toast-content">
      <div class="toast-title">${TOAST_TITLES[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  // Hover-to-pause functionality
  let timeoutId;
  let startTime = Date.now();
  let remainingTime = duration;
  const progressBar = toast.querySelector('.toast-progress');

  // Initial auto-dismiss timeout
  timeoutId = setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, duration);

  // Pause on hover
  toast.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
    remainingTime -= (Date.now() - startTime);
    if (progressBar) {
      progressBar.style.animationPlayState = 'paused';
    }
  });

  // Resume on mouse leave
  toast.addEventListener('mouseleave', () => {
    startTime = Date.now();
    timeoutId = setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, remainingTime);
    if (progressBar) {
      progressBar.style.animationPlayState = 'running';
    }
  });
}

class PhoneReveal {
  constructor() {
    this.button = document.getElementById('revealPhoneBtn');
    this.phoneDisplay = document.getElementById('phoneRevealed');
    this.phoneNumber = '+1 (775) 376-7929';
    this.revealed = false;

    this.init();
  }

  init() {
    this.button.addEventListener('click', () => {
      if (this.revealed) {
        this.copyToClipboard();
      } else {
        this.revealPhone();
      }
    });
  }

  revealPhone() {
    // Disable button
    this.button.disabled = true;
    this.button.classList.add('loading');

    // Change text
    const textSpan = this.button.querySelector('.btn-text');
    textSpan.textContent = 'Revealing...';

    // Add liquid wave animation
    const wave = this.createWaveSVG();
    const bubbles = this.createBubbleSVG();
    this.button.appendChild(wave);
    this.button.appendChild(bubbles);

    // Wait for animation to complete (3 seconds)
    setTimeout(() => {
      this.displayPhone();
    }, 3000);
  }

  createWaveSVG() {
    const wave = document.createElement('div');
    wave.className = 'liquid-wave';
    wave.innerHTML = `
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(139, 92, 246, 0.6);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(159, 122, 234, 0.8);stop-opacity:1" />
          </linearGradient>
        </defs>
        <path fill="url(#waveGradient)" d="M0,50 C150,60 250,40 400,50 C550,60 650,40 800,50 C950,60 1050,40 1200,50 L1200,100 L0,100 Z">
          <animate attributeName="d" dur="2s" repeatCount="indefinite"
            values="M0,50 C150,60 250,40 400,50 C550,60 650,40 800,50 C950,60 1050,40 1200,50 L1200,100 L0,100 Z;
                    M0,50 C150,40 250,60 400,50 C550,40 650,60 800,50 C950,40 1050,60 1200,50 L1200,100 L0,100 Z;
                    M0,50 C150,60 250,40 400,50 C550,60 650,40 800,50 C950,60 1050,40 1200,50 L1200,100 L0,100 Z"/>
        </path>
      </svg>
    `;
    return wave;
  }

  createBubbleSVG() {
    const maskContainer = document.createElement('div');
    maskContainer.className = 'bubble-mask-container';
    maskContainer.innerHTML = `
      <svg class="bubble-stream" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="4" fill="rgba(255,255,255,0.6)" />
        <circle cx="120" cy="80" r="3" fill="rgba(255,255,255,0.6)" />
        <circle cx="200" cy="60" r="5" fill="rgba(255,255,255,0.6)" />
        <circle cx="280" cy="90" r="4" fill="rgba(255,255,255,0.6)" />
        <circle cx="350" cy="70" r="3" fill="rgba(255,255,255,0.6)" />
        <circle cx="420" cy="50" r="5" fill="rgba(255,255,255,0.6)" />
        <circle cx="80" cy="140" r="3" fill="rgba(255,255,255,0.6)" />
        <circle cx="150" cy="160" r="4" fill="rgba(255,255,255,0.6)" />
        <circle cx="230" cy="150" r="5" fill="rgba(255,255,255,0.6)" />
        <circle cx="300" cy="170" r="3" fill="rgba(255,255,255,0.6)" />
        <circle cx="380" cy="140" r="4" fill="rgba(255,255,255,0.6)" />
        <circle cx="450" cy="160" r="5" fill="rgba(255,255,255,0.6)" />
        <circle cx="60" cy="220" r="5" fill="rgba(255,255,255,0.6)" />
        <circle cx="140" cy="240" r="3" fill="rgba(255,255,255,0.6)" />
        <circle cx="210" cy="230" r="4" fill="rgba(255,255,255,0.6)" />
        <circle cx="290" cy="250" r="5" fill="rgba(255,255,255,0.6)" />
        <circle cx="360" cy="220" r="3" fill="rgba(255,255,255,0.6)" />
        <circle cx="440" cy="240" r="4" fill="rgba(255,255,255,0.6)" />
      </svg>
    `;
    return maskContainer;
  }

  displayPhone() {
    // Mark animations as completed
    const wave = this.button.querySelector('.liquid-wave');
    const bubbles = this.button.querySelector('.bubble-mask-container');
    if (wave) wave.classList.add('completed');
    if (bubbles) bubbles.classList.add('completed');

    // Update button state
    this.button.classList.remove('loading');
    this.button.classList.add('revealed');

    // Update button text to show phone number
    const textSpan = this.button.querySelector('.btn-text');
    textSpan.textContent = this.phoneNumber;

    // Mark as revealed
    this.revealed = true;

    // Re-enable button for click-to-copy
    this.button.disabled = false;

    // Show instruction underneath
    this.phoneDisplay.textContent = 'Click to copy number to clipboard';
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.phoneNumber);

      // Show success toast
      showToast('Phone number copied to clipboard!', 'success');

      // Update instruction
      this.phoneDisplay.textContent = 'Number copied! Call now to try the demo.';

    } catch (error) {
      console.error('Failed to copy:', error);

      // Show error message (fallback)
      this.phoneDisplay.textContent = 'Failed to copy. Please dial manually: ' + this.phoneNumber;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PhoneReveal();
});
