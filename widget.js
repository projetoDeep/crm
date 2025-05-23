// Cria e insere o estilo CSS com animações e layout
const style = document.createElement('style');
style.textContent = `
/* POSICIONAMENTO E TAMANHO DO BOTÃO */
.promo-popup {
  position: fixed;
  top: 40%;
  left: 20px;
  z-index: 10000;
  opacity: 1;
  animation: fadeInUp 0.3s ease forwards;
  max-width: 200px;
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease;
}

.media-container-round {
  position: relative;
  width: 100px;
  height: 100px;
  background: black;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid #00793f;
  box-shadow: 0 0 8px #00793f, 0 0 12px #00793f88;
  animation: neonPulse 2s infinite alternate;
  transition: transform 0.2s ease;
}

.media-container-round:hover { transform: scale(1.05); }

/* MENSAGEM DE ENTRADA "CLIQUE E VEJA MAIS" */
.promo-popup::after {
  content: "Clique e veja mais";
  position: absolute;
  right: -200px;
  top: 20px;
  background: white;
  color: #333;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: slideFade 3s forwards;
}

@keyframes slideFade {
  0% { opacity: 0; transform: translateX(50px); }
  10% { opacity: 1; transform: translateX(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateX(0); }
}

/* ÍCONES DE INTERAÇÃO DO VÍDEO */
.video-icons {
  position: absolute;
  bottom: 60px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 5;
}

.video-icon-btn {
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.3s ease;
}

.video-icon-btn:hover {
  transform: scale(1.1);
  background: #fff;
}

.video-icon-btn.liked {
  color: red;
}

.video-icon-btn svg {
  pointer-events: none;
}

/* BOTÃO DE VER PRODUTO ESTILIZADO */
.view-product-button {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #28a745;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 6px rgba(40, 167, 69, 0.4), 0 0 10px #28a745;
  text-decoration: none;
  user-select: none;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-product-button:hover {
  background-color: #218838;
  box-shadow: 0 6px 12px rgba(33, 136, 56, 0.6), 0 0 14px #218838;
  transform: translateX(-50%) scale(1.05);
  text-decoration: none;
}`;
document.head.appendChild(style);

// Função para inserir os botões de interação
function insertInteractionIcons(videoFull, videoElement) {
  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'video-icons';

  const buttons = [
    { icon: '❤️', class: 'like' },
    { icon: '🛍️', class: 'shop' },
    { icon: '💬', class: 'comment' },
    { icon: '📤', class: 'share' },
    { icon: videoElement.muted ? '🔇' : '🔊', class: 'mute' }
  ];

  buttons.forEach(({ icon, class: cls }) => {
    const btn = document.createElement('button');
    btn.className = `video-icon-btn ${cls}`;
    btn.innerText = icon;
    iconWrapper.appendChild(btn);

    if (cls === 'like') {
      btn.addEventListener('click', () => {
        btn.classList.toggle('liked');
      });
    } else if (cls === 'mute') {
      btn.addEventListener('click', () => {
        videoElement.muted = !videoElement.muted;
        btn.innerText = videoElement.muted ? '🔇' : '🔊';
      });
    }
  });

  videoFull.appendChild(iconWrapper);
}

// Chamar insertInteractionIcons no seu evento onclick do thumbContainer
// Exemplo de uso (adapte para seu caso):
// thumbContainer.onclick = () => {
//   ...
//   insertInteractionIcons(videoFull, videoElement);
// }
