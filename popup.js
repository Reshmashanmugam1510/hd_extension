document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: getSelectedText
    },
    async (results) => {
      const selectedText = results[0].result;

      if (!selectedText) {
        document.getElementById("result").innerText = "⚠️ Please select some text";
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText })
      });

      const data = await response.json();
      document.getElementById("result").innerHTML = `
        <b>Severity:</b> ${data.severity}<br>
        <b>Sexual Harassment:</b> ${data.sexual_harassment ? "Yes 🚫" : "No ✅"}
      `;
    }
  );
});

function getSelectedText() {
  return window.getSelection().toString();
}
