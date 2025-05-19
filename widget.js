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

function showPopup(campaign, index) {
  const popupId = `promo-popup-${index}`;
  const oldPopup = document.getElementById(popupId);
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement('div');
  popup.id = popupId;

  console.log('campaign.message raw:', campaign.message); // ← para debug

  popup.innerHTML = `
    <div class="popup-content">
      ${campaign.image ? `<img src="${campaign.image}" alt="Promoção" class="popup-img" />` : ''}
      <div class="popup-text">
        <h3>${campaign.title}</h3>
        <div class="popup-body">${campaign.message}</div>
      </div>
      <span class="popup-close" title="Fechar">x</span>
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
      window.location.href = url;
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
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return 'http://' + url;
}

function trackEvent(website, eventType) {
  fetch("http://assistaagoraaqui.shop:3000/events", {
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

// Estilo
const style = document.createElement('style');
style.textContent = `
#promo-popup-0, #promo-popup-1, #promo-popup-2, #promo-popup-3, #promo-popup-4, #promo-popup-5, #promo-popup-6, #promo-popup-7, #promo-popup-8, #promo-popup-9 {
  position: fixed;
  top: 75vh;
  right: auto;
  left: 8%;
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
  margin-top: 10px;
}
.popup-content {
  display: flex;
  align-items: flex-start;
  position: relative;
  gap: 12px;
}
.popup-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.popup-text {
  flex: 1;
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
  #promo-popup-0, #promo-popup-1, #promo-popup-2, #promo-popup-3, #promo-popup-4, #promo-popup-5, #promo-popup-6, #promo-popup-7, #promo-popup-8, #promo-popup-9 {
    top: 15px;
    right: 5%;
    left: 5%;
    width: auto;
    padding: 12px;
  }
  .popup-img {
    width: 50px;
    height: 50px;
  }
  .popup-text h3 {
    font-size: 15px;
  }
  .popup-body {
    font-size: 13px;
  }
}
`;
document.head.appendChild(style);
