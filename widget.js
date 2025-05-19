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
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function isMilwaukeeUrl(url) {
  return /widen\.net\/s\//i.test(url);
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
    if (isMilwaukeeUrl(src)) {
      // Solução direta - usa o link MP4 diretamente em uma tag <video>
      media = `
        <div class="video-container">
          <video controls autoplay muted playsinline class="popup-video">
            <source src="${src}" type="video/mp4">
            Seu navegador não suporta vídeo.
          </video>
        </div>`;
    } else if (isVideo(src)) {
      media = `
        <video autoplay muted playsinline controls class="popup-video">
          <source src="${src}" type="video/mp4">
          Seu navegador não suporta vídeo.
        </video>`;
    } else {
      media = `<img src="${src}" alt="Promoção" class="popup-img" />`;
    }
  }

  popup.innerHTML = `
    <div class="popup-content">
      ${media}
      <div class="popup-text">
        <h3>${campaign.title}</h3>
        <div class="popup-body">${campaign.message}</div>
      </div>
      <span class="popup-close" title="Fechar">×</span>
    </div>
  `;

  popup.style.cursor = 'pointer';

  popup.onclick = (e) => {
    if (e.target.classList.contains('popup-close')) {
      removePopup(popupId);
    } else if (campaign.url) {
      const url = campaign.url.startsWith('http') ? campaign.url : `https://${campaign.url}`;
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
    setTimeout(() => popup.remove(), 500);
  }
}

// Estilos otimizados
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
}

.popup-content {
  position: relative;
}

.popup-img, .video-container {
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

.popup-close {
  position: absolute;
  top: 5px;
  right: 8px;
  font-size: 18px;
  cursor: pointer;
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
