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

  try {
    await chrome.storage.local.set({ selectedText });

    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 420,
      height: 600
    });
  } catch (err) {
    console.error("❌ Error opening popup:", err);
  }
});
