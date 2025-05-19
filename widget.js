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

// Verificadores
function isVideo(url) {
  return url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isMilwaukeeMp4(url) {
  return url && /milwaukeetool\.widen\.net\/s\/[^/]+\/[^/]+/i.test(url);
}

function convertToEmbedUrl(url) {
  if (!url) return '';
  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(/widen\.net\/s\/([^/]+)\/([^/?#]+)/i);
  if (!match) return url;
  const id = match[1];
  const slug = match[2];
  return `https://milwaukeetool.widen.net/view/video/${id}/${slug}.mp4`;
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

  let media = '';
  const src = campaign.image;

  if (src) {
    if (isMilwaukeeMp4(src)) {
      const embed = convertToEmbedUrl(src);
      media = `
        <div class="popup-iframe-wrapper">
          <iframe src="${embed}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen class="popup-iframe"></iframe>
        </div>`;
    } else if (isVideo(src)) {
      media = `
        <div class="popup-video-wrapper">
          <video autoplay muted playsinline controls class="popup-video">
            <source src="${src}" type="${getVideoType(src)}">
            Seu navegador não suporta vídeo.
          </video>
        </div>`;
    } else {
      media = `<img src="${src}" alt="Promoção" class="popup-img" />`;
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

  trackEvent(campaign.url, "view");

  popup.onclick = (e) => {
    if (e.target.classList.contains('popup-close')) {
      trackEvent(campaign.url, "close");
      removePopup(popupId);
    } else if (campaign.url) {
      const url = fixUrl(campaign.url);
      trackEvent(campaign.url, "click");
      window.open(url, '_blank');
      removePopup(popupId);
    }
  };

  document.body.appendChild(popup);
  setTimeout(() => removePopup(popupId), 15000);
}

function removePopup(id) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.style.opacity = '0';
    setTimeout(() => {
      popup.remove();
    }, 500);
  }
}

function fixUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return 'https://' + url;
}

function trackEvent(website, eventType) {
  if (!website) return;
  fetch("https://assistaagoraaqui.shop:3000/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      website,
      event: eventType,
      origin: location.hostname
    })
  }).catch(err => console.error("Erro ao registrar evento:", err));
}

// CSS
const style = document.createElement('style');
style.textContent = `
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
