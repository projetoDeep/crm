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
  return url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isMilwaukeeMp4(url) {
  return url && /widen\.net\/s\/.*\.mp4/i.test(url);
}

function convertToEmbedUrl(url) {
  if (!url) return '';
  const cleanUrl = url.split('?')[0];
  return cleanUrl.replace("/s/", "/view/video/");
}

function isVimeo(url) {
  return url && /vimeo\.com\/(\d+)/i.test(url);
}

function getVimeoEmbedUrl(url) {
  const match = url.match(/vimeo\.com\/(\d+)/i);
  if (!match) return null;
  
  const videoId = match[1];
  return `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1&autopause=0&background=1`;
}

function getVideoType(url) {
  if (!url) return 'video/mp4';
  if (url.includes('.mp4')) return 'video/mp4';
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

  let media = '';
  const src = campaign.image;
  const isVideoContent = isVideo(src) || isVimeo(src) || isMilwaukeeMp4(src);

  if (src) {
    if (isMilwaukeeMp4(src)) {
      media = `
        <div class="media-container video-wrapper">
          <video autoplay muted loop playsinline class="popup-media">
            <source src="${src}" type="video/mp4">
          </video>
        </div>`;
    } else if (isVimeo(src)) {
      const embedUrl = getVimeoEmbedUrl(src);
      if (embedUrl) {
        media = `
          <div class="media-container vimeo-wrapper">
            <iframe src="${embedUrl}" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen 
                    class="popup-media"></iframe>
          </div>`;
      }
    } else if (isVideo(src)) {
      media = `
        <div class="media-container video-wrapper">
          <video autoplay muted loop playsinline class="popup-media">
            <source src="${src}" type="${getVideoType(src)}">
          </video>
        </div>`;
    } else {
      media = `
        <div class="media-container image-wrapper">
          <img src="${src}" alt="Promoção" class="popup-media" onerror="this.style.display='none'"/>
        </div>`;
    }
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

  // Configurar eventos de clique
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
  if (/^https?:\/\//i.test(url)) return url;
  return 'https://' + url;
}

// Estilos CSS atualizados - Design quadrado elegante
const style = document.createElement('style');
style.textContent = `
.promo-popup {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 10000;
  transition: all 0.3s ease;
  opacity: 1;
  max-width: 90vw;
}

.popup-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  overflow: hidden;
  width: 300px;
}

.popup-content.video-content {
  width: 350px;
}

.popup-border {
  padding: 8px;
  background: linear-gradient(145deg, #f5f5f5, #e0e0e0);
  border-radius: 8px 8px 0 0;
}

.media-container {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.1);
}

.video-content .media-container {
  height: 250px;
}

.popup-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vimeo-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.popup-text {
  padding: 15px;
  text-align: center;
}

.popup-text h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.popup-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #666;
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.popup-close:hover {
  background: #fff;
  transform: scale(1.1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.promo-popup {
  animation: fadeInUp 0.3s ease forwards;
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
  
  .media-container {
    height: 180px;
  }
  
  .video-content .media-container {
    height: 200px;
  }
}
`;
document.head.appendChild(style);
