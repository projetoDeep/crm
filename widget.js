fetch('https://lxbooogilngujgqrtspc.supabase.co/functions/v1/popup-https')
  .then(res => {
    if (res.status === 204) return null;
    return res.text();
  })
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

// Funções de verificação de mídia
function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isVimeo(url) {
  return /vimeo\.com\/(\d+)/i.test(url);
}

function getVimeoThumbnail(url) {
  const id = url.match(/vimeo\.com\/(\d+)/i)[1];
  return `https://vumbnail.com/${id}_large.jpg`;
}

function showPopup(campaign, index) {
  const popupId = `promo-popup-${index}`;
  const oldPopup = document.getElementById(popupId);
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement('div');
  popup.id = popupId;
  popup.className = 'promo-popup';

  let media = '';
  const src = campaign.image;
  const isVideoContent = isVideo(src) || isVimeo(src);

  if (src) {
    if (isVimeo(src)) {
      const thumbnail = getVimeoThumbnail(src);
      media = `
        <div class="border-handler">
          <div class="inner-shape"></div>
          <div class="inner">
            <video autoplay loop playsinline muted poster="${thumbnail}" class="popup-video">
              <source src="https://player.vimeo.com/video/${src.match(/vimeo\.com\/(\d+)/i)[1]}/mp4" type="video/mp4">
            </video>
          </div>
        </div>`;
    } else if (isVideo(src)) {
      media = `
        <div class="border-handler">
          <div class="inner-shape"></div>
          <div class="inner">
            <video autoplay loop playsinline muted class="popup-video">
              <source src="${src}" type="${src.endsWith('.mp4') ? 'video/mp4' : 'video/webm'}">
            </video>
          </div>
        </div>`;
    } else {
      media = `
        <div class="border-handler">
          <div class="inner-shape"></div>
          <div class="inner">
            <img src="${src}" class="popup-image" alt="Promoção"/>
          </div>
        </div>`;
    }
  }

  popup.innerHTML = `
    <div class="popup-content ${isVideoContent ? 'video-content' : ''}">
      ${media}
      <div class="popup-text">
        <h3>${campaign.title || ''}</h3>
        <p>${campaign.message || ''}</p>
      </div>
      <div class="popup-close">&times;</div>
    </div>
  `;

  document.body.appendChild(popup);

  // Forçar autoplay se necessário
  if (isVideoContent) {
    const video = popup.querySelector('.popup-video');
    if (video) {
      video.play().catch(e => {
        video.muted = true;
        video.play();
      });
    }
  }

  // Fechar popup
  popup.querySelector('.popup-close').addEventListener('click', () => {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 300);
  });

  setTimeout(() => removePopup(popupId), 15000);
}

function removePopup(id) {
  const popup = document.getElementById(id);
  if (popup) popup.remove();
}

// Estilos CSS no estilo Widdeo moderno
const style = document.createElement('style');
style.textContent = `
.promo-popup {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
  max-width: 90vw;
}

.popup-content {
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.popup-content.video-content {
  width: 320px;
}

.border-handler {
  position: relative;
  width: 100%;
  padding: 8px;
  background: linear-gradient(145deg, #f5f5f5, #e0e0e0);
  border-radius: 8px 8px 0 0;
}

.inner-shape {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  pointer-events: none;
}

.inner {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
}

.video-content .inner {
  height: 220px;
}

.popup-video, .popup-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
}

.popup-text {
  padding: 16px;
  text-align: center;
}

.popup-text h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.popup-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.popup-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}

.popup-close:hover {
  background: rgba(0,0,0,0.8);
  transform: scale(1.1);
}

@keyframes fadeIn {
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
  
  .inner {
    height: 180px;
  }
  
  .video-content .inner {
    height: 200px;
  }
}
`;
document.head.appendChild(style);
