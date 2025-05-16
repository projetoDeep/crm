// ==UserScript==
// @name         CRM WhatsApp
// @namespace    https://github.com/ProjetoDeep/crm
// @version      1.1.34
// @description  Sistema completo de etiquetas e anotações móveis
// @author       Você
// @match        https://web.whatsapp.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/projetoDeep/crm/refs/heads/main/crm-script.users.js
// @downloadURL  https://raw.githubusercontent.com/projetoDeep/crm/refs/heads/main/crm-script.users.js
// ==/UserScript==

let currentContact = null;
let isDraggingNote = false;
let noteStartX, noteStartY, noteInitialX, noteInitialY;

function addStickyNote(contact) {
    const oldNote = document.querySelector("#wa-helper-note");
    if (oldNote) oldNote.remove();

    const note = document.createElement("div");
    note.id = "wa-helper-note";

    // Restaurar posição salva
    const savedPosition = localStorage.getItem(`wa-note-pos-${contact}`);
    const position = savedPosition ? JSON.parse(savedPosition) : {
        left: 'calc(100% - 220px)',
        top: 'calc(100% - 150px)'
    };

    // Configuração do container principal
    Object.assign(note.style, {
        position: "fixed",
        left: position.left || 'calc(100% - 220px)',
        top: position.top || 'calc(100% - 150px)',
        background: "#fff3cd",
        width: "200px",
        minHeight: "120px",
        zIndex: "999999",
        border: "1px solid #ffeeba",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        cursor: "move",
    });

    // Barra de arrasto
    const dragHandle = document.createElement("div");
    dragHandle.style.cssText = `
        padding: 5px;
        background: #ffeeba;
        cursor: move;
        border-bottom: 1px solid #ffdf7e;
        user-select: none;
    `;
    dragHandle.textContent = "✥ Arraste aqui";

    // Área de texto editável
    const content = document.createElement("div");
    content.contentEditable = true;
    content.style.cssText = `
        flex-grow: 1;
        padding: 10px;
        overflow-y: auto;
        outline: none;
        cursor: text;
        min-height: 80px;
    `;
    const savedText = localStorage.getItem(`wa-note-${contact}`);
content.textContent = savedText || "Clique para editar...";

// Apagar o texto placeholder ao focar, se ainda não editado
content.addEventListener("focus", () => {
    if (content.textContent === "Clique para editar...") {
        content.textContent = "";
    }
});

    // Eventos de arrasto
    dragHandle.addEventListener('mousedown', startNoteDrag);
    content.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    // Salvar conteúdo automaticamente
    content.addEventListener('input', () => {
        localStorage.setItem(`wa-note-${contact}`, content.textContent);
    });

    note.appendChild(dragHandle);
    note.appendChild(content);
    document.body.appendChild(note);

    // Botão de follow-up
const followBtn = document.createElement("button");
followBtn.textContent = "⏰ Alarme ⏰";
followBtn.style.cssText = `
    background: #ffd966;
    border: none;
    padding: 5px;
    cursor: pointer;
    width: 100%;
    border-top: 1px solid #ffdf7e;
`;

followBtn.onclick = () => {
    const delayInput = prompt(`Defina o tempo do alarme para o contato "${contact}": (ex: 10m, 2h, 1d — utilize apenas números inteiros)`);

    function parseTimeToMinutes(str) {
        if (!str) return null;
        const regex = /^(\d+)([dhm])?$/i;
        const match = str.trim().toLowerCase().match(regex);
        if (!match) return null;

        const value = parseInt(match[1], 10);
        const unit = match[2] || 'm'; // padrão minutos

        switch (unit) {
            case 'd': return value * 60 * 24;
            case 'h': return value * 60;
            case 'm': return value;
            default: return null;
        }
    }

    const minutes = parseTimeToMinutes(delayInput);

    if (minutes === null || minutes <= 0) {
        alert("Formato inválido! Use: 10m, 2h, 1d (números inteiros maiores que zero).");
        return;
    }

    const triggerTime = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(`followup-${contact}`, triggerTime);
    alert(`⏰ Alerta de follow-up ativado para ${minutes} minutos.`);
};

// Isso aqui NÃO da pra remover, nao sei o pq mas n da
note.appendChild(followBtn);
}


function startNoteDrag(e) {
    isDraggingNote = true;
    noteStartX = e.clientX;
    noteStartY = e.clientY;

    const note = document.querySelector("#wa-helper-note");
    noteInitialX = note.offsetLeft;
    noteInitialY = note.offsetTop;

    note.style.cursor = "grabbing";
    note.style.userSelect = "none";
}

function handleNoteDrag(e) {
    if (!isDraggingNote) return;

    const dx = e.clientX - noteStartX;
    const dy = e.clientY - noteStartY;

    const newX = noteInitialX + dx;
    const newY = noteInitialY + dy;

    const note = document.querySelector("#wa-helper-note");
    if (note) {
        note.style.left = `${Math.max(0, Math.min(newX, window.innerWidth - note.offsetWidth))}px`;
        note.style.top = `${Math.max(0, Math.min(newY, window.innerHeight - note.offsetHeight))}px`;
    }
}

function handleNoteDrop() {
    isDraggingNote = false;
    const note = document.querySelector("#wa-helper-note");
    if (note && currentContact) {
        localStorage.setItem(`wa-note-pos-${currentContact}`, JSON.stringify({
            left: note.style.left,
            top: note.style.top
        }));
        note.style.cursor = "move";
        note.style.userSelect = "auto";
    }
}

function createLabelButton() {
    const header = document.querySelector("header");
    if (!header) return null;

    let button = header.querySelector(".my-label-button");
    if (!button) {
        button = document.createElement("button");
        button.className = "my-label-button";
        button.innerText = "Etiquetas";
        button.style.cssText = `
            margin-left: 10px;
            padding: 5px 10px;
            border-radius: 5px;
            background: #25D366;
            color: white;
            border: none;
            cursor: pointer;
            position: absolute;
            top: 10px;  /* posição inicial, ajusta se quiser */
            left: 10px; /* posição inicial, ajusta se quiser */
            z-index: 9999;

        `;

        let isDragging = false;
        let preventClick = false;
        let offsetX = 0;
        let offsetY = 0;
        let startX = 0;
        let startY = 0;

        button.addEventListener('mousedown', (event) => {
            event.preventDefault();

            const rect = button.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;

            startX = event.clientX;
            startY = event.clientY;
            isDragging = false;
            preventClick = false;

            function onMouseMove(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                    isDragging = true;
                    preventClick = true;
                }

                if (isDragging) {
                    button.style.left = (e.clientX - offsetX) + 'px';
                    button.style.top = (e.clientY - offsetY) + 'px';

                    startX = e.clientX;
                    startY = e.clientY;
                }
            }

            function onMouseUp(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                if (!preventClick) {
                    button.click();
                }
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // Bloquear clique depois do arrasto
        button.addEventListener('click', (e) => {
            if (preventClick) {
                e.stopImmediatePropagation();
                e.preventDefault();
                preventClick = false;
            }
        });

        header.appendChild(button);
    }

    return button;
}


function renderLabel(contact) {
    const header = document.querySelector("header");
    if (!header) return;

    const existing = header.querySelector(".my-contact-label");
    if (existing) existing.remove();

    const label = localStorage.getItem(`label-${contact}`);
    if (!label) return;

    const labelDisplay = document.createElement("div");
    labelDisplay.className = "my-contact-label";
    labelDisplay.style.cssText = `
        margin-top: 5px;
        padding: 4px 8px;
        background: #f0f0f0;
        border-radius: 4px;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    `;

    const labelText = document.createElement("span");
    labelText.innerText = `🔖 ${label}`;

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "×";
    closeBtn.style.cssText = `
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        padding: 0;
    `;
    closeBtn.onclick = () => {
        localStorage.removeItem(`label-${contact}`);
        labelDisplay.remove();
    };

    labelDisplay.appendChild(labelText);
    labelDisplay.appendChild(closeBtn);

    const titleElement = document.querySelector("div.x78zum5.x1cy8zhl.x1y332i5.xggjnk3.x1yc453h span.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1rg5ohu._ao3e");
    if (titleElement && titleElement.parentElement) {
        titleElement.parentElement.appendChild(labelDisplay);
    }
}

function createTag(labelText, onClose) {
    const tag = document.createElement("span");
    tag.textContent = labelText + " ";
    tag.style.cssText = `
        background: #9B111E;
        color: white;
        border-radius: 22px;
        padding: 2px 8px;
        margin-left: 5px;
        font-size: 12px;
        cursor: default;
        user-select: none;
        display: inline-flex;
        align-items: center;
        right: 75px;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.style.cssText = `
        background: transparent;
        border: none;
        color: white;
        font-weight: bold;
        cursor: pointer;
        margin-left: 5px;
        font-size: 14px;
        line-height: 1;
    `;
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        onClose();
    };

    tag.appendChild(closeBtn);
    return tag;
}

function getMessageKey(messageDiv) {
    const sender = messageDiv.querySelector("span[title]")?.textContent || "unknown";
    const text = messageDiv.querySelector("span.x1iyjqo2")?.textContent || "";
    const time = messageDiv.querySelector("div._ak8i")?.textContent || "";
    return `${sender}-${time}-${text}`.replace(/\s+/g, "_").substring(0, 50);
}

function addLabelToMessage(messageDiv, label) {
    const oldTag = messageDiv.querySelector(".my-message-label");
    if (oldTag) oldTag.remove();

    if (!label) return;

    const tag = createTag(label, () => {
        const key = getMessageKey(messageDiv);
        localStorage.removeItem(`label-msg-${key}`);
        tag.remove();
    });

    tag.className = "my-message-label";
    tag.style.cssText = `
        position: absolute;
        top: 1px;
        right: 75px;
        z-index: 10;
    `;

    messageDiv.style.position = "relative";
    messageDiv.appendChild(tag);
}

function renderLabelsInMessages() {
    const messages = document.querySelectorAll("div._ak8l");
    messages.forEach(msg => {
        const key = getMessageKey(msg);
        const label = localStorage.getItem(`label-msg-${key}`);
        addLabelToMessage(msg, label);
    });
}

function addLabelButtonToMessages() {
    const messages = document.querySelectorAll("div._ak8l");
    messages.forEach(msg => {
        if (msg.querySelector(".my-message-label-button")) return;

        const btn = document.createElement("button");
        btn.textContent = "Nota";
        btn.className = "my-message-label-button";
        btn.style.cssText = `
            font-size: 6px;
            padding: 2px 6px;
            margin-top: 4px;
            cursor: pointer;
            border-radius: 22px;
            border: none;
            background-color: #e5804d;
            color: white;
            user-select: none;
            position: absolute;
            bottom: 2px;
            right: 285px;
            z-index: 10;
        `;

        btn.onclick = () => {
            const key = getMessageKey(msg);
            const currentLabel = localStorage.getItem(`label-msg-${key}`) || "";
            const label = prompt("Etiqueta para esta mensagem:", currentLabel);
            if (label !== null) {
                if (label.trim() === "") {
                    localStorage.removeItem(`label-msg-${key}`);
                } else {
                    localStorage.setItem(`label-msg-${key}`, label.trim());
                }
                addLabelToMessage(msg, label.trim());
            }
        };

        msg.style.position = "relative";
        msg.appendChild(btn);
    });
}

function updateMessagesUI() {
    renderLabelsInMessages();
    addLabelButtonToMessages();
}

function waitForContactName(callback) {
    const interval = setInterval(() => {
        const contactElement = document.querySelector("div.x78zum5.x1cy8zhl.x1y332i5.xggjnk3.x1yc453h span.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1rg5ohu._ao3e");
        if (contactElement) {
            clearInterval(interval);
            const contact = contactElement.innerText.trim();
            callback(contact);
        }
    }, 500);
}

function onChatChange() {
    waitForContactName((contact) => {
        if (currentContact === contact) return;

        currentContact = contact;

        const button = createLabelButton();
        if (button) {
            button.onclick = () => {
                const currentLabel = localStorage.getItem(`label-${contact}`) || "";
                const label = prompt(`Etiqueta para ${contact}:`, currentLabel);
                if (label !== null) {
                    localStorage.setItem(`label-${contact}`, label.trim());
                    renderLabel(contact);
                }
            };
        }

        renderLabel(contact);
        addStickyNote(contact);
        updateMessagesUI();
    });
}

// Inicialização
window.addEventListener("load", () => {
    setTimeout(() => {
        const app = document.querySelector("#app");
        if (app) {
            const observer = new MutationObserver(onChatChange);
            observer.observe(app, { childList: true, subtree: true });
            onChatChange();
        }
    }, 5000);
});

document.addEventListener("mousemove", handleNoteDrag);
document.addEventListener("mouseup", handleNoteDrop);

// Estilos adicionais
const style = document.createElement("style");
style.textContent = `
    /* Nota adesiva */
#wa-helper-note {
    font-family: "Segoe UI", Tahoma, sans-serif;
    font-size: 14px;
    transition: box-shadow 0.3s, transform 0.2s;
    color: #333 !important;
    background: #fff9d6 !important;
    border-radius: 10px !important;
    border: 1px solid #ffe08a !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important;
}

#wa-helper-note div[contenteditable] {
    color: #333 !important;
}

[data-dark-mode="1"] #wa-helper-note {
    border: 1px solid #444 !important;
    background: #2c2c2c !important;
    color: #eee !important;
}

[data-dark-mode="1"] #wa-helper-note div[contenteditable] {
    color: #eee !important;
}

    /* Etiquetas de contato */
.my-contact-label {
    color: #222 !important;
    background: #e8e8e8 !important;
    border: 1px solid #ccc;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 13px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

[data-dark-mode="1"] .my-contact-label {
    color: #f0f0f0 !important;
    background: #3a3a3a !important;
    border: 1px solid #666;
}

    /* Etiquetas de mensagem */
.my-message-label {
    background: #9B111E !important;
    color: white !important;
    border-radius: 18px;
    padding: 2px 10px;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.my-message-label button {
    color: white !important;
    margin-left: 6px;
    font-size: 13px;
}
`;

setInterval(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("followup-"));
    const now = Date.now();

    keys.forEach(key => {
        const trigger = parseInt(localStorage.getItem(key));
        if (trigger && now >= trigger) {
            const contact = key.replace("followup-", "");

            // Função simples para abrir chat
            function openChatByName(name) {
                // Tenta encontrar contato pelo título do span na lista lateral
                const contacts = Array.from(document.querySelectorAll("div[role='row'] span[title]"));
                const contactSpan = contacts.find(span => span.textContent.trim() === name);
                if (contactSpan) {
                    // O elemento pai do span é o que deve ser clicado
                    const contactRow = contactSpan.closest("div[role='row']");
                    if (contactRow) {
                        contactRow.click();
                        return true;
                    }
                }
                return false;
            }

            const opened = openChatByName(contact);

            alert(`⏰ Alerta de Alarme: Confira o contato "${contact}"${opened ? "" : " (não foi possível abrir o chat automaticamente)"}`);

            localStorage.removeItem(key);
        }
    });
}, 30 * 1000); // Verifica a cada 30 segundos

document.addEventListener("click", (e) => {
    const note = document.getElementById("wa-helper-note");
    if (!note) return;

    if (!note.contains(e.target)) {
        // Clique fora da nota: deixa ela mais transparente
        note.style.opacity = "0.5";
    } else {
        // Clique dentro da nota: volta ao normal
        note.style.opacity = "1";
    }
});


// --- Engrenagem flutuante e menu arrastável // ---
(function() {
  if (document.querySelector("#crm-gear-container")) return;

  const container = document.createElement("div");
  container.id = "crm-gear-container";
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000000;
    user-select: none;
    cursor: grab;
  `;

  const gear = document.createElement("div");
  gear.id = "crm-gear-icon";
  gear.title = "Abrir menu CRM";
  gear.style.cssText = `
    width: 44px;
    height: 44px;
    background: #25D366;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28px;
    color: white;
    user-select: none;
  `;
  gear.textContent = "⚙️";

  container.appendChild(gear);

  const menu = document.createElement("div");
  menu.id = "crm-extra-functions-menu";
  menu.style.cssText = `
    display: none;
    position: absolute;
    bottom: 60px;
    right: 0;
    background: rgba(37, 211, 102, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(37, 211, 102, 0.35);
    color: inherit;
    padding: 14px 16px;
    font-family: "Segoe UI", Tahoma, sans-serif;
    font-size: 14px;
    width: 280px;
    user-select: auto;
    border: 1px solid rgba(37, 211, 102, 0.5);
  `;

  const title = document.createElement("div");
  title.textContent = "Funções Extras";
  title.style.cssText = `
    font-weight: 700;
    margin-bottom: 10px;
    text-align: center;
    color: inherit;
  `;
  menu.appendChild(title);

  function createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.style.cssText = `
      width: 100%;
      padding: 8px;
      margin-bottom: 8px;
      border: none;
      border-radius: 6px;
      background: rgba(37, 211, 102, 0.85);
      color: white;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.3s ease;
      user-select: none;
    `;
    btn.onmouseenter = () => btn.style.background = "rgba(37, 211, 102, 1)";
    btn.onmouseleave = () => btn.style.background = "rgba(37, 211, 102, 0.85)";
    btn.onclick = onClick;
    return btn;
  }

  // Botão limpar contato
const btnClearContact = createButton(
  "Limpar notas e etiquetas (contato atual)",
  () => {
    const contact = getCurrentContact();
    console.log("Contato atual:", contact);
    if (!contact) {
      alert("Nenhum contato selecionado.");
      return;
    }
    if (confirm(`Confirma limpar notas, etiquetas e alarmes do contato "${contact}"?`)) {
      localStorage.removeItem(`wa-note-${contact}`);
      localStorage.removeItem(`wa-note-pos-${contact}`);
      localStorage.removeItem(`label-${contact}`);
      localStorage.removeItem(`followup-${contact}`);
      alert(`Dados do contato "${contact}" limpos.`);
    }
  }
);

  menu.appendChild(btnClearContact);

  // Botão limpar alarmes vencidos
  const btnClearExpiredAlarms = createButton(
    "Limpar todos alarmes vencidos",
    () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("followup-"));
      const now = Date.now();
      let count = 0;
      keys.forEach(key => {
        const trigger = parseInt(localStorage.getItem(key));
        if (trigger && now >= trigger) {
          localStorage.removeItem(key);
          count++;
        }
      });
      alert(`Foram limpos ${count} alarmes vencidos.`);
    }
  );
  menu.appendChild(btnClearExpiredAlarms);

  // Toggle abrir chat automaticamente
  const toggleAutoOpenChat = document.createElement("label");
  toggleAutoOpenChat.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(37, 211, 102, 0.85);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    font-weight: 600;
    font-size: 13px;
    margin-top: 8px;
  `;
  toggleAutoOpenChat.innerHTML = `Abrir chat automaticamente ao disparar alarme <input type="checkbox" style="transform: scale(1.3); margin-left: 8px;">`;

  const checkbox = toggleAutoOpenChat.querySelector("input");
  checkbox.checked = localStorage.getItem("crm-auto-open-chat") === "true";

  checkbox.addEventListener("change", () => {
    localStorage.setItem("crm-auto-open-chat", checkbox.checked.toString());
  });

  menu.appendChild(toggleAutoOpenChat);

  container.appendChild(menu);
  document.body.appendChild(container);

  gear.addEventListener("click", e => {
    e.stopPropagation();
    menu.style.display = (menu.style.display === "none") ? "block" : "none";
  });

  document.addEventListener("click", () => {
    if (menu.style.display === "block") {
      menu.style.display = "none";
    }
  });

  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  container.addEventListener("mousedown", e => {
    isDragging = true;
    dragOffsetX = e.clientX - container.getBoundingClientRect().left;
    dragOffsetY = e.clientY - container.getBoundingClientRect().top;
    container.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      container.style.cursor = "grab";
    }
  });

  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    let x = e.clientX - dragOffsetX;
    let y = e.clientY - dragOffsetY;
    const maxX = window.innerWidth - container.offsetWidth;
    const maxY = window.innerHeight - container.offsetHeight;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;
    container.style.left = x + "px";
    container.style.top = y + "px";
    container.style.bottom = "auto";
    container.style.right = "auto";
    container.style.position = "fixed";
  });

})();




document.head.appendChild(style);
