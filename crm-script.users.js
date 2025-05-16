// ==UserScript==
// @name         CRM WhatsApp
// @namespace    https://github.com/ProjetoDeep/crm
// @version      1.1.19
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
    content.textContent = localStorage.getItem(`wa-note-${contact}`) || "Clique para editar...";

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
    #wa-helper-note {
        font-family: Arial, sans-serif;
        font-size: 14px;
        transition: box-shadow 0.2s;
    }

    #wa-helper-note:active {
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    #wa-helper-note div[contenteditable]:focus {
        background: #fff;
    }
`;
document.head.appendChild(style);
