
fetch('https://lxbooogilngujgqrtspc.supabase.co/functions/v1/popup-https')
  .then(res => res.status === 204 ? null : res.text())
  .then(text => {
    if (!text) return;
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        data.forEach((campaign, i) => {
          setTimeout(() => showPopup(campaign, i, data), i * 10000);
        });
      } else {
        showPopup(data, 0, [data]);
      }
    } catch (e) {
      console.error("Resposta inválida:", text);
    }
  })
  .catch(err => console.error("Erro ao buscar campanha:", err));

function showPopup(campaign, index, allCampaigns) {
  const popupId = `promo-popup-${index}`;
  const oldPopup = document.getElementById(popupId);
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement('div');
  popup.id = popupId;
  popup.className = 'promo-popup';

  const thumbVideo = `
    <div class="media-container-round" id="video-thumb-container-${index}">
      <video autoplay muted loop playsinline class="popup-media">
        <source src="${campaign.image}" type="video/mp4">
      </video>
    </div>
    <span class="popup-close-left" onclick="removePopup('${popupId}')">×</span>`;

  popup.innerHTML = `
    <div class="popup-content video-content">${thumbVideo}</div>
  `;

  document.body.appendChild(popup);

  const thumbContainer = document.getElementById(`video-thumb-container-${index}`);
  thumbContainer.onclick = (e) => {
    if (e.target.classList.contains('popup-close')) return;

    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';

    const progressBars = allCampaigns.map((_, i) =>
      `<div class="progress-bar"><div class="progress-fill ${i === index ? 'active' : ''}"></div></div>`
    ).join('');

    overlay.innerHTML = `
      <div class="blur-background"></div>
      <div class="video-status-container">
        ${progressBars}
        <div class="video-full">
          <video autoplay loop playsinline class="popup-video-full">
            <source src="${campaign.full || campaign.image}" type="video/mp4">
          </video>
          <span class="popup-close-full" onclick="this.closest('.video-overlay').remove()">×</span>
          <div class="video-nav-buttons">
            <button class="nav-button prev-button" ${index === 0 ? 'disabled' : ''}>‹</button>
            <button class="nav-button next-button" ${index === allCampaigns.length - 1 ? 'disabled' : ''}>›</button>
          </div>
          ${campaign.url ? `<a href="${campaign.url}" target="_blank" class="view-product-button">Ver Produto</a>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const videoElement = overlay.querySelector('.popup-video-full');
    const prevButton = overlay.querySelector('.prev-button');
    const nextButton = overlay.querySelector('.next-button');

    const navigateToVideo = (newIndex) => {
      if (newIndex >= 0 && newIndex < allCampaigns.length) {
        const newCampaign = allCampaigns[newIndex];
        videoElement.querySelector('source').src = newCampaign.full || newCampaign.image;
        videoElement.load();
        videoElement.play();

        overlay.querySelectorAll('.progress-fill').forEach((bar, i) => {
          bar.classList.toggle('active', i === newIndex);
        });

        prevButton.disabled = newIndex === 0;
        nextButton.disabled = newIndex === allCampaigns.length - 1;

        index = newIndex;

        const viewBtn = overlay.querySelector('.view-product-button');
        if (viewBtn) viewBtn.href = newCampaign.url || '#';
      }
    };

    prevButton.addEventListener('click', () => navigateToVideo(index - 1));
    nextButton.addEventListener('click', () => navigateToVideo(index + 1));

    let touchStartX = 0;
    let touchEndX = 0;

    overlay.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);

    overlay.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, false);

    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) navigateToVideo(index + 1);
      else if (touchEndX > touchStartX + 50) navigateToVideo(index - 1);
    };

    const activeBar = overlay.querySelector('.progress-fill.active');
    if (activeBar) activeBar.style.animation = 'progressAnimation 15s linear forwards';

    videoElement.addEventListener('mouseenter', () => {
      overlay.querySelectorAll('.progress-fill').forEach(bar => bar.style.animationPlayState = 'paused');
    });

    videoElement.addEventListener('mouseleave', () => {
      overlay.querySelectorAll('.progress-fill').forEach(bar => {
        if (bar.classList.contains('active')) bar.style.animationPlayState = 'running';
      });
    });

    videoElement.addEventListener('ended', () => {
      if (!videoElement.loop) {
        setTimeout(() => {
          if (index < allCampaigns.length - 1) {
            navigateToVideo(index + 1);
          } else {
            overlay.remove();
          }
        }, 1000);
      }
    });
  };

  setTimeout(() => removePopup(popupId), 15000);
}

function removePopup(id) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 500);
  }
}

// CSS
const style = document.createElement('style');
style.textContent = `
.promo-popup {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 10000;
  opacity: 1;
  animation: fadeInUp 0.3s ease forwards;
  max-width: 160px;
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease;
}

.popup-content {
  position: relative;
  background: transparent;
  border-radius: 16px;
  overflow: visible;
}

.media-container-round {
  position: relative;
  width: 80px;
  height: 80px;
  background: black;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid #00793f;
  box-shadow: 0 0 8px #00793f, 0 0 12px #00793f88;
  animation: neonPulse 2s infinite alternate;
  transition: transform 0.2s ease;
}

.media-container-round:hover {
  transform: scale(1.05);
}

.popup-close-left {
  position: absolute;
  left: -10px;
  top: 10px;
  background: rgba(255,255,255,0.9);
  color: #000;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  margin-right: 8px;
  transition: all 0.2s ease;
}

.popup-close-left:hover {
  background: #fff;
  transform: scale(1.1);
}

@keyframes neonPulse {
  from {
    box-shadow: 0 0 8px #00793f, 0 0 12px #00793f88;
  }
  to {
    box-shadow: 0 0 16px #00793f, 0 0 24px #00793faa;
  }
}

.popup-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
}

.blur-background {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
  z-index: -1;
}

.video-status-container {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.progress-bars {
  display: flex;
  gap: 4px;
  width: 100%;
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 0;
  background: rgba(255,255,255,0.9);
}

.progress-fill.active {
  animation: progressAnimation 15s linear forwards;
}

@keyframes progressAnimation {
  from { width: 0%; }
  to { width: 100%; }
}

.video-full {
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 9 / 16;
  border-radius: 12px;
  overflow: hidden;
  background: black;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.popup-video-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-close-full {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.9);
  color: #000;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.popup-close-full:hover {
  background: #fff;
  transform: scale(1.1);
}

.video-nav-buttons {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.nav-button:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-50%) scale(1.1);
}

.nav-button:disabled {
  opacity: 0.3;
  pointer-events: none;
}

.prev-button {
  left: 10px;
}

.next-button {
  right: 10px;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-product-button {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #28a745;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  text-decoration: none;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: background-color 0.2s ease, transform 0.2s ease;
  z-index: 5;
}

.view-product-button:hover {
  background-color: #218838;
  transform: translateX(-50%) scale(1.05);
}
`;
document.head.appendChild(style);

