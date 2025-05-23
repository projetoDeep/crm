fetch('https://lxbooogilngujgqrtspc.supabase.co/functions/v1/popup-https') 
  .then(res => res.status === 204 ? null : res.text())
  .then(text => {
    if (!text) return;
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        showPopup(data[0], 0, data); // Mostra o primeiro popup apenas
      } else if (data) {
        showPopup(data, 0, [data]);
      }
    } catch (e) {
      console.error("Resposta inválida:", text);
    }
  })
  .catch(err => console.error("Erro ao buscar campanha:", err));

function showPopup(campaign, index, allCampaigns) {
  const popupId = `promo-popup`;
  const oldPopup = document.getElementById(popupId);
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement('div');
  popup.id = popupId;
  popup.className = 'promo-popup';

  // Texto animado que aparece antes de entrar no círculo
  const animatedText = `
    <div class="animated-text-container">
      <span class="animated-text">Clique e veja mais</span>
    </div>
  `;

  const thumbVideo = `
    <div class="media-container-round" id="video-thumb-container-${index}">
      <video autoplay muted loop playsinline class="popup-media">
        <source src="${campaign.image}" type="video/mp4">
      </video>
    </div>
    <span class="popup-close-left" onclick="removePopup('${popupId}')">×</span>`;

  popup.innerHTML = `
    ${animatedText}
    <div class="popup-content video-content">${thumbVideo}</div>
  `;

  document.body.appendChild(popup);

  // Animação do texto que entra e depois vai para o círculo
  setTimeout(() => {
    const textElement = popup.querySelector('.animated-text-container');
    if (textElement) {
      textElement.style.opacity = '0';
      setTimeout(() => {
        textElement.remove();
      }, 500);
    }
  }, 3000);

  const thumbContainer = document.getElementById(`video-thumb-container-${index}`);
  thumbContainer.onclick = (e) => {
    if (e.target.classList.contains('popup-close')) return;

    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';

    const progressBars = allCampaigns.map((_, i) =>
      `<div class="progress-bar"><div class="progress-fill ${i === index ? 'active' : ''}"></div></div>`
    ).join('');

    // Adicionando os novos botões de interação
    const interactionButtons = `
      <div class="interaction-buttons">
        <div class="interaction-button heart-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="interaction-button bag-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
          </svg>
        </div>
        <div class="interaction-button comment-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
          </svg>
        </div>
        <div class="interaction-button share-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
        </div>
        <div class="interaction-button mute-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </div>
      </div>
    `;

    overlay.innerHTML = `
      <div class="blur-background"></div>
      <div class="video-status-container">
        <div class="progress-bars">${progressBars}</div>
        <div class="video-full">
          <video autoplay class="popup-video-full">
            <source src="${campaign.full || campaign.image}" type="video/mp4">
          </video>
          <span class="popup-close-full" onclick="this.closest('.video-overlay').remove()">×</span>
          <div class="video-nav-buttons">
            <button class="nav-button prev-button" ${index === 0 ? 'disabled' : ''}>‹</button>
            <button class="nav-button next-button" ${index === allCampaigns.length - 1 ? 'disabled' : ''}>›</button>
          </div>
          ${campaign.url ? `<a href="${campaign.url}" target="_self" class="view-product-button" rel="noopener noreferrer">Ver Produto</a>` : ''}
          ${interactionButtons}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const videoElement = overlay.querySelector('.popup-video-full');
    const prevButton = overlay.querySelector('.prev-button');
    const nextButton = overlay.querySelector('.next-button');
    const heartButton = overlay.querySelector('.heart-button');
    const muteButton = overlay.querySelector('.mute-button');

    // Adicionando funcionalidade aos botões de interação
    if (heartButton) {
      heartButton.addEventListener('click', function() {
        this.classList.toggle('active');
      });
    }

    if (muteButton) {
      let isMuted = true;
      muteButton.addEventListener('click', function() {
        isMuted = !isMuted;
        videoElement.muted = isMuted;
        this.classList.toggle('active');
      });
    }

    let timeoutProgress;

    const startProgressAnimation = (duration) => {
      const activeBar = overlay.querySelector('.progress-fill.active');
      if (activeBar) {
        activeBar.style.animation = `progressAnimation ${duration}s linear forwards`;
      }
    };

    const clearProgressAnimation = () => {
      const bars = overlay.querySelectorAll('.progress-fill');
      bars.forEach(bar => bar.style.animation = 'none');
    };

    const navigateToVideo = (newIndex) => {
      if (newIndex >= 0 && newIndex < allCampaigns.length) {
        const newCampaign = allCampaigns[newIndex];
        videoElement.querySelector('source').src = newCampaign.full || newCampaign.image;
        videoElement.load();
        videoElement.play();

        clearProgressAnimation();
        overlay.querySelectorAll('.progress-fill').forEach((bar, i) => {
          bar.classList.toggle('active', i === newIndex);
        });
        startProgressAnimation(15); // tempo de video definido aqui em segundos (15)

        prevButton.disabled = newIndex === 0;
        nextButton.disabled = newIndex === allCampaigns.length - 1;

        index = newIndex;

        const videoFull = overlay.querySelector('.video-full');
        const oldBtn = videoFull.querySelector('.view-product-button');
        if (oldBtn) oldBtn.remove();

        if (newCampaign.url) {
          const newBtn = document.createElement('a');
          newBtn.href = newCampaign.url;
          newBtn.target = '_self';
          newBtn.rel = 'noopener noreferrer';
          newBtn.className = 'view-product-button';
          newBtn.textContent = 'Ver Produto';
          videoFull.appendChild(newBtn);
        }

        if (timeoutProgress) clearTimeout(timeoutProgress);
        timeoutProgress = setTimeout(() => {
          if (index < allCampaigns.length - 1) navigateToVideo(index + 1);
          else overlay.remove();
        }, 15000);
      }
    };

    startProgressAnimation(15);
    timeoutProgress = setTimeout(() => {
      if (index < allCampaigns.length - 1) navigateToVideo(index + 1);
      else overlay.remove();
    }, 15000);

    prevButton.addEventListener('click', () => navigateToVideo(index - 1));
    nextButton.addEventListener('click', () => navigateToVideo(index + 1));

    let touchStartX = 0;
    let touchEndX = 0;

    overlay.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);

    overlay.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, false);

    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) navigateToVideo(index + 1);
      else if (touchEndX > touchStartX + 50) navigateToVideo(index - 1);
    };
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

// CSS
const style = document.createElement('style');
style.textContent = `
.promo-popup { 
  position: fixed; 
  left: 30px; 
  top: 50%; 
  transform: translateY(-50%); 
  z-index: 10000; 
  opacity: 1; 
  animation: fadeInUp 0.5s ease forwards, floatAnimation 3s ease-in-out infinite; 
  display: flex; 
  align-items: center; 
  transition: opacity 0.3s ease; 
  flex-direction: column;
}

.popup-content { 
  position: relative; 
  background: transparent; 
  border-radius: 16px; 
  overflow: visible; 
}

.animated-text-container {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.9);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation: textSlideIn 1s ease forwards, textSlideOut 1s ease 2s forwards;
  white-space: nowrap;
}

.animated-text {
  font-family: 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
}

@keyframes textSlideIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes textSlideOut {
  from { opacity: 1; transform: translateX(-50%) translateY(0); }
  to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}

.media-container-round { 
  position: relative; 
  width: 100px; 
  height: 100px; 
  background: black; 
  border-radius: 50%; 
  overflow: hidden; 
  cursor: pointer; 
  border: 4px solid #FF3E80;
  box-shadow: 0 0 15px #FF3E80AA, 0 4px 20px rgba(255, 62, 128, 0.4); 
  animation: neonPulse 2s infinite alternate; 
  transition: all 0.3s ease; 
}

.media-container-round:hover { 
  transform: scale(1.1); 
  box-shadow: 0 0 25px #FF3E80CC, 0 6px 30px rgba(255, 62, 128, 0.6);
}

.popup-close-left { 
  position: absolute; 
  left: -10px; 
  top: 10px; 
  background: rgba(255,255,255,0.9); 
  color: #000; 
  border-radius: 50%; 
  width: 24px; 
  height: 24px; 
  font-size: 16px; 
  font-weight: bold; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  z-index: 10; 
  margin-right: 8px; 
  transition: all 0.2s ease; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.popup-close-left:hover { 
  background: #fff; 
  transform: scale(1.1); 
}

@keyframes neonPulse { 
  from { box-shadow: 0 0 10px #FF3E80AA, 0 4px 20px rgba(255, 62, 128, 0.4); } 
  to { box-shadow: 0 0 20px #FF3E80CC, 0 6px 30px rgba(255, 62, 128, 0.6); } 
}

@keyframes floatAnimation {
  0%, 100% { transform: translateY(-50%) translateY(0); }
  50% { transform: translateY(-50%) translateY(-10px); }
}

.popup-media { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  border-radius: 50%; 
}

.video-overlay { 
  position: fixed; 
  inset: 0; 
  z-index: 10001; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}

.blur-background { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.7); 
  backdrop-filter: blur(10px); 
  z-index: -1; 
}

.video-status-container { 
  width: 100%; 
  max-width: 360px; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  padding: 0 16px; 
}

.progress-bars { 
  display: flex; 
  height: 4px; 
  gap: 4px; 
}

.progress-bar { 
  flex: 1; 
  height: 100%; 
  background: rgba(255,255,255,0.3); 
  border-radius: 2px; 
  overflow: hidden; 
}

.progress-fill { 
  height: 100%; 
  width: 0; 
  background: rgba(255,255,255,0.9); 
  border-radius: 2px; 
}

@keyframes progressAnimation { 
  from { width: 0%; } 
  to { width: 100%; } 
}

.video-full { 
  position: relative; 
  width: 100%; 
  max-width: 360px; 
  aspect-ratio: 9 / 16; 
  border-radius: 12px; 
  overflow: hidden; 
  background: black; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
}

.popup-video-full { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

.popup-close-full { 
  position: absolute; 
  top: 16px; 
  right: 16px; 
  background: rgba(255,255,255,0.9); 
  color: #000; 
  border-radius: 50%; 
  width: 32px; 
  height: 32px; 
  font-size: 20px; 
  font-weight: bold; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  z-index: 10; 
  transition: all 0.2s ease; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.popup-close-full:hover { 
  background: #fff; 
  transform: scale(1.1); 
}

.video-nav-buttons { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  top: 0; 
  left: 0; 
  pointer-events: none; 
}

.nav-button { 
  position: absolute; 
  top: 50%; 
  transform: translateY(-50%); 
  background: rgba(255,255,255,0.2); 
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 40px; 
  height: 40px; 
  font-size: 24px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  pointer-events: all; 
  transition: all 0.2s ease; 
  backdrop-filter: blur(5px); 
}

.nav-button:hover { 
  background: rgba(255,255,255,0.3); 
  transform: translateY(-50%) scale(1.1); 
}

.nav-button:disabled { 
  opacity: 0.3; 
  pointer-events: none; 
}

.prev-button { 
  left: 10px; 
}

.next-button { 
  right: 10px; 
}

@keyframes fadeInUp { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

.view-product-button { 
  position: absolute; 
  bottom: 16px; 
  left: 50%; 
  transform: translateX(-50%); 
  background-color: #FF3E80; 
  color: white; 
  padding: 12px 24px; 
  border: none; 
  border-radius: 40px; 
  font-weight: 600; 
  font-size: 16px; 
  box-shadow: 0 4px 12px rgba(255, 62, 128, 0.4), 0 0 15px #FF3E80AA; 
  text-decoration: none; 
  user-select: none; 
  transition: all 0.3s ease; 
  z-index: 5; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-family: 'Segoe UI', Roboto, sans-serif;
}

.view-product-button:hover { 
  background-color: #FF2A6D; 
  box-shadow: 0 6px 16px rgba(255, 42, 109, 0.6), 0 0 20px #FF2A6DCC; 
  transform: translateX(-50%) scale(1.05); 
  text-decoration: none; 
}

.interaction-buttons {
  position: absolute;
  right: 16px;
  bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.interaction-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.interaction-button:hover {
  transform: scale(1.1);
  background: rgba(255,255,255,0.3);
}

.interaction-button svg {
  fill: white;
  width: 24px;
  height: 24px;
}

.interaction-button.active svg {
  fill: #FF3E80;
}

.interaction-button.heart-button.active svg {
  fill: #FF3E80;
  animation: heartBeat 0.5s;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
  75% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
`;
document.head.appendChild(style);
