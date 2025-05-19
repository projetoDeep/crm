fetch('https://lxbooogilngujgqrtspc.supabase.co/functions/v1/popup-https')
  .then(res => res.status === 204 ? null : res.text())
  .then(text => {
    if (!text) return;
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        data.forEach((campaign, i) => {
          setTimeout(() => showPopup(campaign, i), i * 10000);
        });
      } else {
        showPopup(data, 0);
      }
    } catch (e) {
      console.error("Resposta inválida:", text);
    }
  })
  .catch(err => console.error("Erro ao buscar campanha:", err));

function showPopup(campaign, index) {
  const popupId = `promo-popup-${index}`;
  const oldPopup = document.getElementById(popupId);
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement('div');
  popup.id = popupId;
  popup.className = 'promo-popup';

  const thumbVideo = `
    <div class="media-container" id="video-thumb-container-${index}">
      <video autoplay muted loop playsinline class="popup-media" id="thumb-video-${index}">
        <source src="${campaign.image}" type="video/mp4">
      </video>
      <span class="popup-close" onclick="removePopup('${popupId}')">×</span>
    </div>`;

  popup.innerHTML = `
    <div class="popup-content video-content">${thumbVideo}</div>
  `;

  document.body.appendChild(popup);

  // Ao clicar no vídeo, abrir modal com o vídeo completo
  const thumbContainer = document.getElementById(`video-thumb-container-${index}`);
  thumbContainer.onclick = (e) => {
    if (e.target.classList.contains('popup-close')) return;

    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';

    overlay.innerHTML = `
      <div class="video-full">
        <video autoplay muted loop playsinline class="popup-video-full">
          <source src="${campaign.full || campaign.image}" type="video/mp4">
        </video>
        <span class="popup-close-full" onclick="this.parentElement.parentElement.remove()">×</span>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  setTimeout(() => removePopup(popupId), 15000); // Tempo de exibição do popup
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
}

.popup-content {
  position: relative;
  background: transparent;
  border-radius: 16px;
  overflow: hidden;
}

.media-container {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  background: black;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #00793f;
  box-shadow: 0 0 8px #00793f, 0 0 12px #00793f88;
  animation: neonPulse 2s infinite alternate;
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
  border-radius: inherit;
}

.video-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-full {
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 9 / 16;
  border-radius: 20px;
  overflow: hidden;
  background: black;
}

.popup-video-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.popup-close, .popup-close-full {
  position: absolute;
  top: 8px;
  right: 8px;
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
}

.popup-close:hover, .popup-close-full:hover {
  background: #fff;
  transform: scale(1.1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);
