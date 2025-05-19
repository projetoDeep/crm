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
  return `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=0&muted=1&autopause=0&background=0`;
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
      const embed = convertToEmbedUrl(src);
      media = `
        <div class="popup-media-wrapper video-container">
          <iframe src="${embed}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen class="popup-iframe"></iframe>
        </div>`;
    } else if (isVimeo(src)) {
      const embedUrl = getVimeoEmbedUrl(src);
      if (embedUrl) {
        media = `
          <div class="popup-media-wrapper vimeo-container">
            <iframe src="${embedUrl}" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen 
                    class="popup-iframe vimeo-iframe"></iframe>
          </div>`;
      }
    } else if (isVideo(src)) {
      media = `
        <div class="popup-media-wrapper video-container">
          <video autoplay muted playsinline loop class="popup-video">
            <source src="${src}" type="${getVideoType(src)}">
            Seu navegador não suporta vídeo.
          </video>
        </div>`;
    } else {
      media = `
        <div class="popup-media-wrapper image-container">
          <img src="${src}" alt="Promoção" class="popup-img" onerror="this.style.display='none'"/>
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

// Estilos CSS atualizados para popup de vídeo maior
const style = document.createElement('style');
style.textContent = `
.promo-popup {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  padding: 15px;
  font-family: 'Arial', sans-serif;
  z-index: 10000;
  transition: all 0.3s ease;
  opacity: 1;
  overflow: hidden;
}

/* Popup padrão (para imagens) */
.promo-popup:not(.video-popup) {
  width: 320px;
  max-width: 90vw;
}

/* Popup para vídeos */
.promo-popup.video-popup,
.promo-popup .video-content {
  width: 500px;
  max-width: 90vw;
}

.popup-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.popup-media-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

/* Container para vídeos */
.video-container {
  aspect-ratio: 16/9;
}

/* Container para imagens */
.image-container {
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.popup-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.popup-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.popup-iframe-wrapper, .vimeo-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.popup-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.popup-text {
  padding: 0 8px;
}

.popup-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.popup-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #666;
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.popup-close:hover {
  background: rgba(0,0,0,0.8);
  transform: scale(1.1);
}

/* Efeito de hover no popup */
.promo-popup:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.25);
}

/* Responsividade */
@media (max-width: 600px) {
  .promo-popup {
    left: 50% !important;
    transform: translateX(-50%);
    bottom: 15px;
  }
  
  .promo-popup.video-popup,
  .promo-popup .video-content {
    width: 90vw;
  }
  
  .popup-text h3 {
    font-size: 16px;
  }
  
  .popup-body {
    font-size: 13px;
  }
}

/* Animação de entrada */
@keyframes popupFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.promo-popup {
  animation: popupFadeIn 0.4s ease forwards;
}
`;
document.head.appendChild(style);

// Detecta automaticamente se é um vídeo e aplica a classe video-popup
function checkVideoContent() {
  document.querySelectorAll('.promo-popup').forEach(popup => {
    const hasVideo = popup.querySelector('video, .video-container, .vimeo-container');
    if (hasVideo) {
      popup.classList.add('video-popup');
    }
  });
}

// Verifica periodicamente o conteúdo do popup
setInterval(checkVideoContent, 100);
