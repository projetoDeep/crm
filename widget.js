// WIDGET POPUP COM TEASER 8s E VIDEO CENTRALIZADO
fetch('https://lxbooogilngujgqrtspc.supabase.co/functions/v1/popup-https')
  .then(res => res.status === 204 ? null : res.text())
  .then(text => {
    if (!text) return;
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        data.forEach((campaign, i) => {
          setTimeout(() => showTeaser(campaign, i), i * 10000);
        });
      } else {
        showTeaser(data, 0);
      }
    } catch (e) {
      console.error("Resposta inválida:", text);
    }
  })
  .catch(err => console.error("Erro ao buscar campanha:", err));

function showTeaser(campaign, index) {
  const teaserId = `popup-teaser-${index}`;
  const oldTeaser = document.getElementById(teaserId);
  if (oldTeaser) oldTeaser.remove();

  const teaser = document.createElement('div');
  teaser.id = teaserId;
  teaser.className = 'popup-teaser';
  teaser.innerHTML = `
    <video autoplay muted loop playsinline class="teaser-video">
      <source src="${campaign.image}" type="video/mp4">
    </video>
  `;
  document.body.appendChild(teaser);

  teaser.onclick = () => showFullPopup(campaign, index);
}

function showFullPopup(campaign, index) {
  const fullId = `popup-full-${index}`;
  const existing = document.getElementById(fullId);
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = fullId;
  popup.className = 'fullscreen-popup';
  popup.innerHTML = `
    <div class="video-container">
      <video autoplay muted loop playsinline class="story-video">
        <source src="${campaign.full || campaign.image}" type="video/mp4">
      </video>
      <span class="close-full">×</span>
    </div>
  `;
  document.body.appendChild(popup);

  popup.querySelector('.close-full').onclick = () => popup.remove();
}

const style = document.createElement('style');
style.textContent = `
.popup-teaser {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 10000;
  width: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  cursor: pointer;
}

.teaser-video {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.fullscreen-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.video-container {
  position: relative;
  width: 320px;
  aspect-ratio: 9 / 16;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.story-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.close-full {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
`;
document.head.appendChild(style);
