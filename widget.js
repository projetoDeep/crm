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
        <div class="popup-iframe-container">
          <iframe src="${embed}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen class="popup-iframe">
          </iframe>
          <div class="iframe-fallback">
            <video controls class="fallback-video">
              <source src="${src}" type="video/mp4">
              Seu navegador não suporta vídeo.
            </video>
          </div>
        </div>`;
    } else if (isVideo(src)) {
      media = `
        <div class="popup-video-container">
          <video autoplay muted playsinline controls class="popup-video">
            <source src="${src}" type="${getVideoType(src)}">
            Seu navegador não suporta vídeo.
          </video>
        </div>`;
    } else {
      media = `<img src="${src}" alt="Promoção" class="popup-img" onerror="this.style.display='none'"/>`;
    }
  }

// Estilos CSS
const style = document.createElement('style');
style.textContent = `
  .popup-iframe-container {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    height: 0;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
  }

  .popup-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .iframe-fallback {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .popup-iframe[src=""] + .iframe-fallback,
  .popup-iframe.error + .iframe-fallback {
    display: block;
  }

  .fallback-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
#promo-popup-0, #promo-popup-1, #promo-popup-2, #promo-popup-3, #promo-popup-4, 
#promo-popup-5, #promo-popup-6, #promo-popup-7, #promo-popup-8, #promo-popup-9 {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
  padding: 15px;
  font-family: Arial, sans-serif;
  color: #333;
  opacity: 1;
  transition: opacity 0.5s ease;
  z-index: 10000;
  max-width: 90vw;
}

.popup-content {
  display: flex;
  align-items: flex-start;
  position: relative;
  gap: 12px;
  flex-direction: column;
}

.popup-img, .popup-video-wrapper, .popup-iframe-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.popup-img {
  height: auto;
  max-height: 180px;
  object-fit: cover;
}

.popup-video-wrapper {
  background: #000;
}

.popup-video {
  width: 100%;
  max-height: 180px;
  display: block;
}

.popup-iframe-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  background: #000;
}

.popup-iframe-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.popup-text {
  flex: 1;
  width: 100%;
}

.popup-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
}

.popup-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

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

@media(max-width: 480px) {
  #promo-popup-0, #promo-popup-1, #promo-popup-2, #promo-popup-3, #promo-popup-4, 
  #promo-popup-5, #promo-popup-6, #promo-popup-7, #promo-popup-8, #promo-popup-9 {
    bottom: 10px;
    left: 5%;
    right: 5%;
    width: auto;
    padding: 12px;
  }
  
  .popup-video, .popup-img {
    max-height: 150px;
  }
}
`;
document.head.appendChild(style);
// Adicione este código para detectar erros no iframe
document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('load', function(e) {
    if (e.target.tagName === 'IFRAME' && e.target.classList.contains('popup-iframe')) {
      // Verifica se o iframe carregou corretamente
      try {
        if (!e.target.contentWindow || e.target.contentWindow.length === 0) {
          e.target.classList.add('error');
        }
      } catch (err) {
        e.target.classList.add('error');
      }
    }
  }, true);

  // Fallback para iframes com erro
  document.body.addEventListener('error', function(e) {
    if (e.target.tagName === 'IFRAME' && e.target.classList.contains('popup-iframe')) {
      e.target.classList.add('error');
    }
  }, true);
});
