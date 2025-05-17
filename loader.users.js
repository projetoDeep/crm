// ==UserScript==
// @name         CRM WhatsApp
// @namespace    https://github.com/ProjetoDeep/crm
// @version      1.1.36
// @description  Sistema completo de etiquetas e anotações móveis
// @author       Você
// @match        https://web.whatsapp.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/projetoDeep/crm/refs/heads/main/loader.users.js
// @downloadURL  https://raw.githubusercontent.com/projetoDeep/crm/refs/heads/main/loader.users.js
// ==/UserScript==

(function() {
    'use strict';

    const SERVER_URL = 'http://assistaagoraaqui.shop:3001';

    function isValidLicenseFormat(key) {
        return /^CRM-[A-F0-9]{16}$/.test(key);
    }

    function showActivationDialog() {
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '0';
        dialog.style.left = '0';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.backgroundColor = 'rgba(0,0,0,0.7)';
        dialog.style.zIndex = '99999';
        dialog.style.display = 'flex';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';

        dialog.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; width: 320px; text-align: center;">
                <h2>Ativação do CRM</h2>
                <p>Insira sua chave de licença:</p>
                <input id="crm-license-input" type="text" placeholder="CRM-XXXXXXXXXXXXXX" style="width: 100%; padding: 8px; font-size: 16px;">
                <button id="crm-activate-btn" style="margin-top: 15px; padding: 10px 20px; font-size: 16px;">Ativar</button>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('crm-activate-btn').onclick = () => {
            const key = document.getElementById('crm-license-input').value.trim();
            if (!isValidLicenseFormat(key)) {
                alert('Formato de licença inválido!');
                return;
            }
            verifyLicense(key, (valid, expires) => {
                if (valid) {
                    GM_setValue('crm_license_key', key);
                    GM_setValue('crm_license_expires', expires);
                    dialog.remove();
                    injectProtectedScript(key);
                } else {
                    alert('Licença inválida ou expirada!');
                }
            });
        };
    }

    function verifyLicense(key, callback) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: `${SERVER_URL}/api/verify-license`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ key }),
            onload: function(response) {
                try {
                    const res = JSON.parse(response.responseText);
                    callback(res.valid, res.expiresAt);
                } catch (e) {
                    console.error("Erro ao interpretar resposta do servidor:", e);
                    callback(false);
                }
            },
            onerror: function() {
                callback(false);
            }
        });
    }

    function injectProtectedScript(key) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `${SERVER_URL}/crm-core.js?key=${encodeURIComponent(key)}&v=${Date.now()}`,
            onload: function(response) {
                if (response.status === 200) {
                    const blob = new Blob([response.responseText], { type: 'application/javascript' });
                    const blobUrl = URL.createObjectURL(blob);
    
                    const script = document.createElement('script');
                    script.src = blobUrl;
                    document.head.appendChild(script);
                } else {
                    alert("Erro ao carregar script protegido.");
                }
            },
            onerror: function() {
                alert("Erro ao conectar ao servidor para carregar script.");
            }

            
        });
    }
    

    // Espera DOM pronto antes de executar
    window.addEventListener('load', () => {
        const LICENSE_KEY = GM_getValue('crm_license_key', null);

        if (!LICENSE_KEY || !isValidLicenseFormat(LICENSE_KEY)) {
            showActivationDialog();
        } else {
            verifyLicense(LICENSE_KEY, (valid, expires) => {
                if (valid) {
                    injectProtectedScript(LICENSE_KEY);
                } else {
                    showActivationDialog();
                }
            });
        }
    });

})();
