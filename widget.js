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
        <div class="media-container">
          <video autoplay muted loop playsinline class="popup-video">
            <source src="${src}" type="video/mp4">
          </video>
        </div>`;
    } else if (isVimeo(src)) {
      const embedUrl = getVimeoEmbedUrl(src);
      if (embedUrl) {
        media = `
          <div class="media-container">
            <iframe src="${embedUrl}" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen 
                    class="popup-iframe"></iframe>
          </div>`;
      }
    } else if (isVideo(src)) {
      media = `
        <div class="media-container">
          <video autoplay muted loop playsinline class="popup-video">
            <source src="${src}" type="${getVideoType(src)}">
          </video>
        </div>`;
    } else {
      media = `
        <div class="media-container">
          <img src="${src}" alt="Promoção" class="popup-image" onerror="this.style.display='none'"/>
        </div>`;
    }
  }

  popup.innerHTML = `
    <div class="popup-content ${isVideoContent ? 'video-content' : ''}">
      ${media}
      <div class="popup-text">
        <h3>${campaign.title || ''}</h3>
        <div class="popup-body">${campaign.message || ''}</div>
      </div>
      <span class="popup-close" title="Fechar">×</span>
    </div>
  `;

  document.body.appendChild(popup);

  // Forçar autoplay em vídeos nativos se necessário
  if (isVideo(src) && !isVimeo(src) && !isMilwaukeeMp4(src)) {
    const video = popup.querySelector('.popup-video');
    video.play().catch(e => {
      // Fallback caso o autoplay seja bloqueado
      video.muted = true;
      video.play();
    });
  }

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

// Estilos CSS atualizados - Design clean e funcional
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
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.12);
  overflow: hidden;
  transition: all 0.3s ease;
}

.popup-content.video-content {
  width: 350px;
}

.media-container {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #f8f8f8;
}

.video-content .media-container {
  height: 250px;
}

.popup-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.popup-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.popup-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  color: #666;
  line-height: 1.4;
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
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
