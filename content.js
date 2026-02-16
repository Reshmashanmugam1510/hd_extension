/* let typingTimer;
const DELAY = 900;

document.addEventListener("input", (event) => {
  const element = event.target;

  // Detect message input boxes
  const isMessageBox =
    element.tagName === "TEXTAREA" ||
    element.tagName === "INPUT" ||
    element.getAttribute("contenteditable") === "true";

  if (!isMessageBox) return;

  const text = element.innerText || element.value;
  if (!text || text.length < 3) return;

  clearTimeout(typingTimer);

  typingTimer = setTimeout(async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const result = await response.json();

      // 🚫 BLOCK sexual harassment
      if (result.sexual_harassment) {
        element.style.border = "3px solid red";
        element.style.backgroundColor = "#ffe6e6";
        element.setAttribute("data-blocked", "true");

        console.warn("🚫 Sexual harassment detected");

        // Clear message (block send)
        element.innerText = "";
        element.value = "";

      }

      // ⚠️ WARN for abusive language
      else if (result.severity === "High") {
        element.style.border = "3px solid orange";
        element.style.backgroundColor = "#fff4e5";
        element.removeAttribute("data-blocked");

        console.warn("⚠️ Harassment warning");
      }

      // ✅ Normal message
      else {
        element.style.border = "2px solid #2ecc71";
        element.style.backgroundColor = "";
        element.removeAttribute("data-blocked");
      }

    } catch (err) {
      console.error("Harassment Detection API error:", err);
    }
  }, DELAY);
}); */

/* chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeText",
    title: "Analyze selected text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeText") {
    chrome.tabs.sendMessage(tab.id, {
      action: "ANALYZE_TEXT",
      text: info.selectionText
    });
  }
});
chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === "ANALYZE_TEXT") {
    const text = request.text;

    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const result = await response.json();

    alert(
      `Severity: ${result.severity}\nConfidence: ${result.confidence}%`
    );
  }
});
*/
