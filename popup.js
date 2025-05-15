document.getElementById("show-notes").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => alert("Notas do chat (implementação futura)")
      });
    });
  });