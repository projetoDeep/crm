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
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&loop=1&muted=1&autopause=0&background=1` : null;
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
    <video 
      autoplay 
      muted 
      loop 
      playsinline 
      class="popup-media noselect"
      style="width: 100%; user-select: none; object-fit: cover; border-radius: inherit;"
      poster="${campaign.poster || ''}">
      <source src="${src}" type="${getVideoType(src)}">
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
                    class="popup-video"></iframe>
          </div>`;
      }
    } else if (isVideo(src)) {
      media = `
        <div class="media-container video-wrapper">
          <video autoplay muted loop playsinline class="popup-video">
            <source src="${src}" type="${getVideoType(src)}">
          </video>
        </div>`;
    } else {
      media = `
        <div class="media-container image-wrapper">
          <img src="${src}" alt="Promoção" class="popup-image" onerror="this.style.display='none'"/>
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

// CSS isolado e clean
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
  animation: fadeInUp 0.3s ease forwards;
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
  padding: 0;
  background: none;
  border-radius: 8px 8px 0 0;
}

.media-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  background-color: #000;
  position: relative;
}

.popup-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
  background-color: #000;
}

.media-container.video-wrapper {
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background-color: black; /* evita fundo branco se vídeo não preencher */
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
    aspect-ratio: 16 / 9;
  }
}
`;
document.head.appendChild(style);
