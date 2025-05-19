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

function isVideo(url) {
  return url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function getVideoType(url) {
  if (!url) return 'video/mp4';
  if (url.includes('.webm')) return 'video/webm';
  if (url.includes('.ogg')) return 'video/ogg';
  return 'video/mp4';
}

function showPopup(campaign, index) {
  const popupId = `promo-popup-${index}`;
  const oldPopup = document.getElementById(popupId);
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement('div');
  popup.id = popupId;
  popup.className = 'promo-popup';

  const src = campaign.image;
  const isVideoContent = isVideo(src);

  let media = '';
  if (isVideoContent) {
    media = `
      <div class="media-container video-wrapper">
        <video 
          autoplay 
          muted 
          loop 
          playsinline 
          poster="${campaign.poster || ''}"
          class="popup-media">
          <source src="${src}" type="${getVideoType(src)}">
        </video>
      </div>`;
  } else if (src) {
    media = `
      <div class="media-container image-wrapper">
        <img src="${src}" alt="Promoção" class="popup-image" onerror="this.style.display='none'"/>
      </div>`;
  }

  popup.innerHTML = `
    <div class="popup-content ${isVideoContent ? 'video-content' : ''}">
      <div class="popup-border">
        ${media}
      </div>
      <div class="popup-text">
        <h3>${campaign.title || ''}</h3>
        <div class="popup-body">${campaign.message || ''}</div>
      </div>
      <span class="popup-close" title="Fechar">×</span>
    </div>
  `;

  document.body.appendChild(popup);

  popup.onclick = (e) => {
    if (e.target.classList.contains('popup-close')) {
      removePopup(popupId);
    } else if (campaign.url) {
      const url = fixUrl(campaign.url);
      window.open(url, '_blank');
      removePopup(popupId);
    }
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

function fixUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url;
}

const style = document.createElement('style');
style.textContent = `
.promo-popup {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  transition: all 0.3s ease;
  opacity: 1;
  width: 320px;
  height: 180px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.4s ease forwards;
}

.popup-content {
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.popup-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.popup-text {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 10px 12px;
  font-size: 13px;
  z-index: 2;
}

.popup-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.8);
  color: #000;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  cursor: pointer;
}


.popup-close:hover {
  background: #fff;
  transform: scale(1.1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .promo-popup {
    left: 50%;
    transform: translateX(-50%);
    bottom: 15px;
  }

  .popup-content, .popup-content.video-content {
    width: 90vw;
  }
}
`;
document.head.appendChild(style);
