// ==UserScript==
// @name         crm
// @namespace    https://github.com/ProjetoDeep/crm
// @version      1.0.5
// @description  Adiciona etiquetas e anotações ao WhatsApp Web
// @author       Você
// @match        https://web.whatsapp.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/projetoDeep/crm/refs/heads/main/crm-script.users.js
// @downloadURL  https://raw.githubusercontent.com/projetoDeep/crm/refs/heads/main/crm-script.users.js
// ==/UserScript==

let currentContact = null;

function addStickyNote(contact) {
  const oldNote = document.querySelector("#wa-helper-note");
  if (oldNote) oldNote.remove();

  const note = document.createElement("div");
  note.id = "wa-helper-note";
  note.contentEditable = true;
  const savedNote = localStorage.getItem(`wa-note-${contact}`);
const placeholderText = "Sua anotação aqui...";
note.innerText = savedNote || placeholderText;
note.style.opacity = savedNote ? "1" : "0.5";

// Remove o placeholder ao focar
note.addEventListener("focus", () => {
  if (note.innerText === placeholderText) {
    note.innerText = "";
    note.style.opacity = "1";
  }
});

// Restaura o placeholder se vazio ao sair do foco
note.addEventListener("blur", () => {
  const content = note.innerText.trim();
  if (!content) {
    note.innerText = placeholderText;
    note.style.opacity = "0.5";
  }
  localStorage.setItem(`wa-note-${contact}`, content);
});

  note.style.cssText = `
    position: fixed;
    bottom: 65px;
    right: 60px;
    background: yellow;
    padding: 10px;
    z-index: 9999;
    max-width: 200px;
    border: 1px solid #ccc;
    font-size: 14px;
  `;
  document.body.appendChild(note);

  note.addEventListener("input", () => {
    localStorage.setItem(`wa-note-${contact}`, note.innerText);
  });
}

function createLabelButton() {
  const header = document.querySelector("header");
  if (!header) return null;

  let button = header.querySelector(".my-label-button");
  if (!button) {
    button = document.createElement("button");
    button.className = "my-label-button";
    button.innerText = "Etiquetas";
    button.style.marginLeft = "10px";
    button.style.padding = "5px 10px";
    button.style.borderRadius = "5px";
    button.style.background = "#25D366";
    button.style.color = "white";
    button.style.border = "none";
    button.style.cursor = "pointer";

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

  // Texto da etiqueta
  const labelText = document.createElement("span");
  labelText.innerText = `🔖 ${label}`;

  // Botão fechar
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
  closeBtn.title = "Remover etiqueta";

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


// ---- NOVAS FUNÇÕES PARA ETIQUETAS NAS MENSAGENS ----

// Cria a tag com texto e botão fechar
function createTag(labelText, onClose) {
  const tag = document.createElement("span");
  tag.textContent = labelText + " ";
  tag.style.cssText = `
    background: #9B111E;
    color: white;
    border-radius: 10px;
    padding: 2px 8px;
    margin-left: 5px;
    font-size: 12px;
    cursor: default;
    user-select: none;
    display: inline-flex;
    align-items: center;
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

// Gera uma chave única para mensagem (baseado em remetente+hora+texto)
function getMessageKey(messageDiv) {
  const sender = messageDiv.querySelector("span[title]")?.textContent || "unknown";
  const text = messageDiv.querySelector("span.x1iyjqo2")?.textContent || "";
  const time = messageDiv.querySelector("div._ak8i")?.textContent || "";
  return `${sender}-${time}-${text}`.replace(/\s+/g, "_").substring(0, 50);
}

// Adiciona uma etiqueta na mensagem visualmente
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

  // Coloca a tag dentro do container da mensagem, no topo direito
  tag.style.position = "absolute";
  tag.style.top = "5px";
  tag.style.right = "5px";
  tag.style.zIndex = 10;

  // Para funcionar com position absolute, deixa o container como relative
  messageDiv.style.position = "relative";

  messageDiv.appendChild(tag);
}

// Renderiza etiquetas salvas em todas mensagens carregadas
function renderLabelsInMessages() {
  const messages = document.querySelectorAll("div._ak8l");
  messages.forEach(msg => {
    const key = getMessageKey(msg);
    const label = localStorage.getItem(`label-msg-${key}`);
    addLabelToMessage(msg, label);
  });
}

// Adiciona um botão "Etiqueta" em cada mensagem para abrir prompt
function addLabelButtonToMessages() {
  const messages = document.querySelectorAll("div._ak8l");
  messages.forEach(msg => {
    if (msg.querySelector(".my-message-label-button")) return; // Já tem botão

    const btn = document.createElement("button");
    btn.textContent = "Criar Nota";
    btn.className = "my-message-label-button";
    btn.style.cssText = `
      font-size: 10px;
      padding: 2px 6px;
      margin-top: 4px;
      cursor: pointer;
      border-radius: 3px;
      border: none;
      background-color: #25D366;
      color: white;
      user-select: none;
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

    // Botão fica dentro do container da mensagem, no canto inferior direito
    btn.style.position = "absolute";
    btn.style.bottom = "5px";
    btn.style.right = "5px";
    btn.style.zIndex = 10;

    msg.style.position = "relative"; // para posicionar botão corretamente
    msg.appendChild(btn);
  });
}

// Chamada para atualizar mensagens (renderizar tags e botões)
function updateMessagesUI() {
  renderLabelsInMessages();
  addLabelButtonToMessages();
}

// -------------------------------------------------

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
    if (currentContact === contact) return; // mesmo contato, nada muda

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
    updateMessagesUI(); // Atualiza etiquetas e botões nas mensagens da conversa
  });
}

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

