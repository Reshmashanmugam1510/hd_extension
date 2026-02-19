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

    // Build enhanced message with language and translation
    let message = "";
    
    if (result.sexual_harassment) {
      message += "🚫 SEXUAL HARASSMENT DETECTED\n\n";
    } else if (result.severity === "High") {
      message += "⚠️ ABUSIVE CONTENT DETECTED\n\n";
    }
    
    // Add language info
    if (result.language && result.language !== "Unknown") {
      message += `🌐 Language: ${result.language}\n`;
    }
    
    // Add original text if non-English
    if (result.original_text && result.language && result.language !== "English" && result.language !== "Unknown") {
      message += `📝 Original: ${result.original_text}\n`;
    }
    
    // Add translation/meaning
    if (result.translated_text && result.translated_text !== selectedText && result.language !== "English" && result.language !== "Unknown") {
      message += `💬 Meaning: ${result.translated_text}\n`;
    }
    
    message += `\nSeverity: ${result.severity}`;
    message += `\nConfidence: ${result.confidence || "N/A"}%`;
    
    // Add detected words if any
    if (result.sexual_words && result.sexual_words.length > 0) {
      message += `\n🔴 Sexual Words: ${result.sexual_words.join(", ")}`;
    }
    if (result.abusive_words && result.abusive_words.length > 0) {
      message += `\n🟠 Abusive Words: ${result.abusive_words.join(", ")}`;
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
