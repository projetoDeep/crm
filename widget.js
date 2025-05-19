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
      media = `<img src="${src}" alt="Promoção" class="popup-img" onerror="this.style.display='none'"/>`;
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

// Estilos CSS atualizados - Popup de imagem mantido como antes, vídeo maior
const style = document.createElement('style');
style.textContent = `
/* Estilo base do popup (como estava antes) */
.promo-popup {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
  padding: 15px;
  font-family: Arial, sans-serif;
  z-index: 10000;
  transition: opacity 0.5s ease;
  opacity: 1;
  max-width: 90vw;
}

/* Container do conteúdo */
.popup-content {
  position: relative;
}

/* Estilo para imagens (como estava antes) */
.popup-img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 10px;
  max-height: 180px;
  object-fit: cover;
}

/* Estilo para vídeos - NOVO (maior e mais destacado) */
.popup-content.video-content {
  width: 500px;
  max-width: 90vw;
}

.popup-media-wrapper.video-container,
.popup-media-wrapper.vimeo-container {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.popup-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.popup-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Texto (mantido como antes) */
.popup-text {
  margin-top: 8px;
}

.popup-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: bold;
}

.popup-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

/* Botão fechar (mantido como antes) */
.popup-close {
  position: absolute;
  top: 5px;
  right: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #888;
  cursor: pointer;
  transition: color 0.2s ease;
  line-height: 1;
  user-select: none;
}

.popup-close:hover {
  color: #000;
}

/* Responsividade */
@media(max-width: 480px) {
  .promo-popup {
    bottom: 10px;
    left: 5%;
    right: 5%;
    width: auto;
    padding: 12px;
  }
  
  .popup-content.video-content {
    width: auto;
  }
  
  .popup-img {
    max-height: 150px;
  }
}
`;
document.head.appendChild(style);
