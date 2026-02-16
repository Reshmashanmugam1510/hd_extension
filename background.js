chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeText",
    title: "Analyze harassment",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "analyzeText") return;

  const selectedText = info.selectionText;

  if (!selectedText) {
    console.error("❌ No text selected");
    return;
  }

  if (!tab || !tab.id) {
    console.error("❌ Invalid tab ID");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText })
    });

    const result = await response.json();

    let message = `Severity: ${result.severity}\nConfidence: ${result.confidence || "N/A"}`;

    if (result.sexual_harassment) {
      message = "🚫 SEXUAL HARASSMENT DETECTED\n\n" + message;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (msg) => {
        alert(msg);
      },
      args: [message]
    });

  } catch (err) {
    console.error("❌ Error:", err);
  }
});
