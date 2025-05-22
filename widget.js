
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

  // Clicar no vídeo ativa o modo "status"
  const thumbContainer = document.getElementById(`video-thumb-container-${index}`);
  thumbContainer.onclick = (e) => {
    if (e.target.classList.contains('popup-close')) return;

    const overlay = document.createElement('div');
    overlay.className = 'video-overlay blur-mode';

    overlay.innerHTML = `
      <div class="video-full scale-in">
        <video autoplay muted loop playsinline class="popup-video-full">
          <source src="${campaign.full || campaign.image}" type="video/mp4">
        </video>
        <span class="popup-close-full" onclick="document.body.classList.remove('blurred'); this.closest('.video-overlay').remove()">×</span>
      </div>
    `;
    
    document.body.classList.add('blurred');
    document.body.appendChild(overlay);
  };

  setTimeout(() => removePopup(popupId), 15000); // Tempo de exibição
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
/* POPUP BOLINHA */
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

/* OVERLAY ESTILO STATUS */
.video-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.video-full {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 9 / 16;
  border-radius: 20px;
  overflow: hidden;
  background: black;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transform: scale(0.95);
  transition: transform 0.3s ease;
}

.video-full.scale-in {
  transform: scale(1);
}

.popup-video-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.popup-close-full {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255,255,255,0.9);
  color: #000;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.popup-close-full:hover {
  background: #fff;
  transform: scale(1.1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Desfoque no fundo */
body.blurred > *:not(.video-overlay):not(script):not(style) {
  filter: blur(5px) brightness(0.8);
  pointer-events: none;
}
`;
document.head.appendChild(style);
