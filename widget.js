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

  // Criar popup container (pequeno thumbnail)
  const popup = document.createElement('div');
  popup.id = popupId;
  popup.className = 'promo-popup';

  // Video thumbnail curto (8 segundos)
  const videoSrc = campaign.image;
  const videoType = getVideoType(videoSrc);

  // Vídeo thumbnail com autoplay, muted, loop e playsinline (8s)
  const thumbnailVideo = document.createElement('video');
  thumbnailVideo.className = 'popup-thumb-video noselect';
  thumbnailVideo.autoplay = true;
  thumbnailVideo.muted = true;
  thumbnailVideo.loop = true;
  thumbnailVideo.playsInline = true;
  thumbnailVideo.src = videoSrc;
  thumbnailVideo.type = videoType;
  thumbnailVideo.style.objectFit = 'cover';

  popup.appendChild(thumbnailVideo);
  document.body.appendChild(popup);

  // Ao clicar no thumbnail abre o vídeo full screen (modal)
  popup.onclick = (e) => {
    if (e.target !== popup) return; // só dispara ao clicar fora do vídeo no popup
    openFullVideo(campaign);
  };
  thumbnailVideo.onclick = (e) => {
    e.stopPropagation();
    openFullVideo(campaign);
  };

  // Fecha após 15s se não clicarem
  setTimeout(() => removePopup(popupId), 15000);
}

function openFullVideo(campaign) {
  // Verifica se já existe modal aberto
  if (document.getElementById('promo-video-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'promo-video-modal';
  modal.className = 'promo-video-modal';

  // Video full screen
  const videoFull = document.createElement('video');
  videoFull.className = 'promo-full-video noselect';
  videoFull.autoplay = true;
  videoFull.muted = false;
  videoFull.loop = false;
  videoFull.controls = true;
  videoFull.playsInline = true;
  videoFull.src = campaign.image;
  videoFull.type = getVideoType(campaign.image);

  modal.appendChild(videoFull);

  // Botão fechar
  const closeBtn = document.createElement('span');
  closeBtn.className = 'promo-video-close';
  closeBtn.innerText = '×';
  closeBtn.title = 'Fechar';
  closeBtn.onclick = () => {
    videoFull.pause();
    modal.remove();
  };
  modal.appendChild(closeBtn);

  document.body.appendChild(modal);
}

// Remove popup thumbnail
function removePopup(id) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 500);
  }
}

// CSS isolado e clean
const style = document.createElement('style');
style.textContent = `
.promo-popup {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 10000;
  width: 120px;
  height: 213px; /* proporção 9:16 estilo story */
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  overflow: hidden;
  cursor: pointer;
  background-color: #000;
  animation: fadeInUp 0.3s ease forwards;
  user-select: none;
}

.popup-thumb-video {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: inherit;
  object-fit: cover;
  background-color: #000;
}

.promo-video-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.85);
  z-index: 11000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.promo-full-video {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.3);
  background-color: #000;
}

.promo-video-close {
  position: fixed;
  top: 30px;
  right: 30px;
  font-size: 30px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  user-select: none;
  z-index: 12000;
  transition: transform 0.2s ease;
}

.promo-video-close:hover {
  transform: scale(1.2);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .promo-popup {
    width: 90px;
    height: 160px;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
  }
}
`;
document.head.appendChild(style);
