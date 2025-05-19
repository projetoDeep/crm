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

// Funções auxiliares
function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isVimeo(url) {
  return /vimeo\.com\/(\d+)/i.test(url);
}

function getVimeoThumbnail(url) {
  const id = url.match(/vimeo\.com\/(\d+)/i)[1];
  return `https://vumbnail.com/${id}_large.jpg`;
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
  const isVimeoVideo = isVimeo(src);
  const isNativeVideo = isVideo(src);

  if (src) {
    if (isVimeoVideo) {
      const thumbnail = getVimeoThumbnail(src);
      media = `
        <div class="media-container vimeo-container">
          <img src="${thumbnail}" class="media-thumbnail" alt="Thumbnail"/>
          <div class="play-button">▶</div>
          <iframe data-src="https://player.vimeo.com/video/${src.match(/vimeo\.com\/(\d+)/i)[1]}?autoplay=1&loop=1&muted=1" 
                  class="vimeo-iframe" 
                  frameborder="0" 
                  allow="autoplay; fullscreen" 
                  allowfullscreen></iframe>
        </div>`;
    } else if (isNativeVideo) {
      media = `
        <div class="media-container video-container">
          <img src="https://via.placeholder.com/300x150?text=Thumbnail" class="media-thumbnail" alt="Thumbnail"/>
          <div class="play-button">▶</div>
          <video class="native-video" loop muted playsinline>
            <source src="${src}" type="${src.endsWith('.mp4') ? 'video/mp4' : 'video/webm'}"/>
          </video>
        </div>`;
    } else {
      media = `
        <div class="media-container image-container">
          <img src="${src}" class="media-image" alt="Promoção"/>
        </div>`;
    }
  }

  popup.innerHTML = `
    <div class="popup-content">
      ${media}
      <div class="popup-text">
        <h3>${campaign.title || ''}</h3>
        <p>${campaign.message || ''}</p>
      </div>
      <div class="popup-close">&times;</div>
    </div>
  `;

  document.body.appendChild(popup);

  // Controle de vídeo
  if (isVimeoVideo || isNativeVideo) {
    const container = popup.querySelector('.media-container');
    const thumbnail = popup.querySelector('.media-thumbnail');
    const playBtn = popup.querySelector('.play-button');
    
    container.addEventListener('click', function() {
      if (isVimeoVideo) {
        const iframe = this.querySelector('.vimeo-iframe');
        iframe.src = iframe.dataset.src;
      } else {
        const video = this.querySelector('.native-video');
        video.play().catch(e => console.log('Autoplay blocked:', e));
      }
      
      thumbnail.style.opacity = '0';
      playBtn.style.display = 'none';
    });
  }

  // Fechar popup
  popup.querySelector('.popup-close').addEventListener('click', () => {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 300);
  });

  setTimeout(() => removePopup(popupId), 15000);
}

// Estilos CSS modernos
const style = document.createElement('style');
style.textContent = `
.promo-popup {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 10000;
  animation: popupEntrance 0.4s ease-out;
  max-width: 90vw;
}

.popup-content {
  width: 320px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.media-container {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f5f5f5;
  overflow: hidden;
  cursor: pointer;
}

.media-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

.media-container:hover .play-button {
  transform: translate(-50%, -50%) scale(1.1);
  background: white;
}

.vimeo-iframe, .native-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.vimeo-iframe[src], .native-video.playing {
  opacity: 1;
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

.popup-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  background: rgba(0,0,0,0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}

.popup-close:hover {
  background: rgba(0,0,0,0.8);
  transform: rotate(90deg);
}

@keyframes popupEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .promo-popup {
    left: 50%;
    transform: translateX(-50%);
    bottom: 20px;
  }
  
  .popup-content {
    width: 90vw;
  }
  
  .media-container {
    height: 160px;
  }
}
`;
document.head.appendChild(style);

function removePopup(id) {
  const popup = document.getElementById(id);
  if (popup) popup.remove();
}
