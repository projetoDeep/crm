// ==UserScript==
// @name         CRM WhatsApp
// @namespace    https://github.com/ProjetoDeep/crm
// @version      1.1.15
// @description  Sistema completo de etiquetas e anotações móveis
// @author       Você
// @match        https://web.whatsapp.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ProjetoDeep/crm/main/crm-script.js
// @downloadURL  https://raw.githubusercontent.com/ProjetoDeep/crm/main/crm-script.js
// ==/UserScript==

let currentContact = null;
let isDraggingNote = false;
let noteStartX, noteStartY, noteInitialX, noteInitialY;

// ========== FUNÇÃO PRINCIPAL DE OBSERVAÇÃO DO CHAT ==========
function onChatChange() {
    waitForContactName((contact) => {
        if (currentContact === contact) return;

        currentContact = contact;

        // Atualiza interface
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

// ========== SISTEMA DE ANOTAÇÃO MOVEL ==========
function addStickyNote(contact) {
    const oldNote = document.querySelector("#wa-helper-note");
    if (oldNote) oldNote.remove();

    const note = document.createElement("div");
    note.id = "wa-helper-note";
    note.contentEditable = true;

    // Configuração do conteúdo
    const savedNote = localStorage.getItem(`wa-note-${contact}`);
    const placeholderText = "Sua anotação aqui...";
    note.innerText = savedNote || placeholderText;
    note.style.opacity = savedNote ? "1" : "0.5";

    // Estilos
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    note.style.cssText = `
    position: fixed;
    background: ${isDark ? '#333' : 'yellow'};
    color: ${isDark ? '#fff' : '#000'};
    padding: 10px;
    z-index: 9999;
    max-width: 200px;
    min-width: 150px;       /* <-- para evitar encolher demais */
    min-height: 40px;
    border: 1px solid ${isDark ? '#666' : '#ccc'};
    font-size: 14px;
    cursor: move;
    border-radius: 8px;
    /* user-select: none;  <-- REMOVA esta linha */
`;

// Opcional: para garantir que placeholder não encolha demais
if (!savedNote) {
  note.style.minHeight = "40px";
  note.style.minWidth = "150px";
}

    // Posição salva
    const savedPos = JSON.parse(localStorage.getItem(`wa-note-pos-${contact}`) || '{}');
    note.style.left = savedPos.left || "20px";
    note.style.top = savedPos.top || "60px";

    // Sistema de Arrasto
    note.addEventListener('mousedown', (e) => {
        isDraggingNote = true;
        noteStartX = e.clientX;
        noteStartY = e.clientY;
        noteInitialX = note.offsetLeft;
        noteInitialY = note.offsetTop;
        note.style.transition = 'none';
    });

    document.addEventListener('mousemove', handleNoteDrag);
    document.addEventListener('mouseup', handleNoteDrop);

    // Placeholder e salvamento
    note.addEventListener("focus", () => {
        if (note.innerText === placeholderText) {
            note.innerText = "";
            note.style.opacity = "1";
        }
    });

    note.addEventListener("blur", () => {
        const content = note.innerText.trim();
        if (!content) {
            note.innerText = placeholderText;
            note.style.opacity = "0.5";
        }
        localStorage.setItem(`wa-note-${contact}`, content);
    });

    document.body.appendChild(note);
}

// ========== CONTROLE DE ARRASTO DA NOTA ==========
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
    }
}

// ========== SISTEMA DE ETIQUETAS ==========
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
        `;

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

    // Componentes da etiqueta
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
    if (titleElement?.parentElement) {
        titleElement.parentElement.appendChild(labelDisplay);
    }
}

// ========== SISTEMA DE ETIQUETAS NAS MENSAGENS ==========
function updateMessagesUI() {
    renderLabelsInMessages();
    addLabelButtonToMessages();
}

function renderLabelsInMessages() {
    document.querySelectorAll("div._ak8l").forEach(msg => {
        const key = getMessageKey(msg);
        const label = localStorage.getItem(`label-msg-${key}`);
        addLabelToMessage(msg, label);
    });
}

function addLabelButtonToMessages() {
    document.querySelectorAll("div._ak8l").forEach(msg => {
        if (!msg.querySelector(".my-message-label-button")) {
            const btn = document.createElement("button");
            btn.textContent = "Criar Nota";
            btn.className = "my-message-label-button";
            btn.style.cssText = `
                position: absolute;
                bottom: 5px;
                right: 5px;
                font-size: 10px;
                padding: 2px 6px;
                cursor: pointer;
                border-radius: 3px;
                border: none;
                background-color: #25D366;
                color: white;
                z-index: 10;
            `;

            btn.onclick = () => {
                const key = getMessageKey(msg);
                const currentLabel = localStorage.getItem(`label-msg-${key}`) || "";
                const label = prompt("Etiqueta para esta mensagem:", currentLabel);
                if (label !== null) {
                    const trimmedLabel = label.trim();
                    trimmedLabel ?
                        localStorage.setItem(`label-msg-${key}`, trimmedLabel) :
                        localStorage.removeItem(`label-msg-${key}`);
                    addLabelToMessage(msg, trimmedLabel);
                }
            };

            msg.style.position = "relative";
            msg.appendChild(btn);
        }
    });
}

// ========== FUNÇÕES AUXILIARES ==========
function waitForContactName(callback) {
    const interval = setInterval(() => {
        const contactElement = document.querySelector("div.x78zum5.x1cy8zhl.x1y332i5.xggjnk3.x1yc453h span.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1rg5ohu._ao3e");
        if (contactElement) {
            clearInterval(interval);
            callback(contactElement.innerText.trim());
        }
    }, 500);
}

function getMessageKey(messageDiv) {
    const sender = messageDiv.querySelector("span[title]")?.textContent || "unknown";
    const text = messageDiv.querySelector("span.x1iyjqo2")?.textContent || "";
    const time = messageDiv.querySelector("div._ak8i")?.textContent || "";
    return `${sender}-${time}-${text}`.replace(/\s+/g, "_").substring(0, 50);
}

function addLabelToMessage(messageDiv, label) {
    messageDiv.querySelector(".my-message-label")?.remove();
    if (!label) return;

    const tag = document.createElement("span");
    tag.textContent = label + " ";
    tag.className = "my-message-label";
    tag.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: #9B111E;
        color: white;
        border-radius: 10px;
        padding: 2px 8px;
        font-size: 12px;
        cursor: default;
        display: inline-flex;
        align-items: center;
        z-index: 10;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.style.cssText = `
        background: transparent;
        border: none;
        color: white;
        margin-left: 5px;
        cursor: pointer;
        font-size: 14px;
    `;
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        const key = getMessageKey(messageDiv);
        localStorage.removeItem(`label-msg-${key}`);
        tag.remove();
    };

    tag.appendChild(closeBtn);
    messageDiv.style.position = "relative";
    messageDiv.appendChild(tag);
}

// ========== INICIALIZAÇÃO ==========
window.addEventListener("load", () => {
    const observer = new MutationObserver((mutations) => {
        if (document.querySelector("#app")) {
            observer.disconnect();
            setTimeout(onChatChange, 1000);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
