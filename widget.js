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
  const isVimeoVideo = isVimeo(src);
  const isNativeVideo = isVideo(src);

  if (src) {
    if (isVimeoVideo) {
      const thumbnail = getVimeoThumbnail(src);
      media = `
        <div class="media-container">
          <video class="popup-video" autoplay loop playsinline muted poster="${thumbnail}" style="width: 100%; object-fit: cover; border-radius: inherit;">
            <source src="https://player.vimeo.com/video/${src.match(/vimeo\.com\/(\d+)/i)[1]}/mp4" type="video/mp4">
          </video>
        </div>`;
    } else if (isNativeVideo) {
      media = `
        <div class="media-container">
          <video class="popup-video" autoplay loop playsinline muted style="width: 100%; object-fit: cover; border-radius: inherit;">
            <source src="${src}" type="${src.endsWith('.mp4') ? 'video/mp4' : 'video/webm'}">
          </video>
        </div>`;
    } else {
      media = `
        <div class="media-container">
          <img src="${src}" class="popup-image" style="width: 100%; object-fit: cover; border-radius: inherit;"/>
        </div>`;
    }
  }

  popup.innerHTML = `
    <div class="popup-content">
      ${media}
      <div class="popup-text">
        <h3>${campaign.title || ''}</h3>
        <p>${campaign.message || ''}</p>
      </div>
      <div class="popup-close">&times;</div>
    </div>
  `;

  document.body.appendChild(popup);

  // Fechar popup
  popup.querySelector('.popup-close').addEventListener('click', () => {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 300);
  });

  setTimeout(() => removePopup(popupId), 15000);
}

// Estilo minimalista inspirado no Widdeo
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.media-container {
  width: 100%;
  height: 180px;
  background: #f5f5f5;
}

.popup-video, .popup-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.popup-text {
  padding: 12px 16px;
  text-align: center;
}

.popup-text h3 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.popup-text p {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.popup-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.popup-close:hover {
  background: rgba(0,0,0,0.7);
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
  
  .popup-content {
    width: 280px;
  }
  
  .media-container {
    height: 160px;
  }
}
`;
document.head.appendChild(style);

function removePopup(id) {
  const popup = document.getElementById(id);
  if (popup) popup.remove();
}
