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

  let media = '';
  const src = campaign.image;

  if (src) {
    if (isMilwaukeeMp4(src)) {
      const embed = convertToEmbedUrl(src);
      media = `
        <div class="popup-iframe-wrapper">
          <iframe src="${embed}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen class="popup-iframe"></iframe>
        </div>`;
    } else if (isVimeo(src)) {
      const embedUrl = getVimeoEmbedUrl(src);
      if (embedUrl) {
        media = `
          <div class="popup-iframe-wrapper vimeo-container">
            <iframe src="${embedUrl}" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen 
                    class="popup-iframe vimeo-iframe"></iframe>
          </div>`;
      }
    } else if (isVideo(src)) {
      media = `
        <div class="popup-video-wrapper">
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
    <div class="popup-content">
      ${media}
      <div class="popup-text">
        <h3>${campaign.title || ''}</h3>
        <div class="popup-body">${campaign.message || ''}</div>
      </div>
      <span class="popup-close" title="Fechar">×</span>
    </div>
  `;

  popup.style.cursor = 'pointer';
  document.body.appendChild(popup);

  // Disparar o play manualmente se for Vimeo
  if (isVimeo(src)) {
    const iframe = popup.querySelector('.vimeo-iframe');
    if (iframe) {
      // Espera o iframe carregar antes de tentar comunicar
      iframe.onload = function() {
        try {
          const player = new Vimeo.Player(iframe);
          player.play().catch(e => console.log('Vimeo autoplay blocked:', e));
        } catch (e) {
          console.error('Vimeo Player API error:', e);
        }
      };
    }
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

// Carrega a API do Vimeo dinamicamente
function loadVimeoAPI() {
  const script = document.createElement('script');
  script.src = 'https://player.vimeo.com/api/player.js';
  document.body.appendChild(script);
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  loadVimeoAPI();
});

// Estilos CSS atualizados
const style = document.createElement('style');
style.textContent = `
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
  transition: opacity 0.3s;
  opacity: 1;
}

.popup-content {
  position: relative;
}

.popup-img, .popup-video-wrapper, .popup-iframe-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.popup-video {
  width: 100%;
  max-height: 180px;
  display: block;
  background: black;
}

.popup-iframe-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}

.popup-iframe-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.vimeo-container {
  background: transparent;
}

.popup-close {
  position: absolute;
  top: 5px;
  right: 8px;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
}

@media (max-width: 480px) {
  .promo-popup {
    left: 10px;
    right: 10px;
    width: auto;
    bottom: 10px;
  }
}
`;
document.head.appendChild(style);
