document.addEventListener("DOMContentLoaded", async () => {
  const { selectedText } = await chrome.storage.local.get("selectedText");

  if (selectedText) {
    await chrome.storage.local.remove("selectedText");
    runAnalysis(selectedText);
  }
});

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p style='color:#999;'>Analyzing...</p>";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    resultDiv.innerHTML = "<div class='result-card error'>❌ No active tab found</div>";
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: getSelectedText
    },
    async (results) => {
      const selectedText = results[0]?.result;

      if (!selectedText) {
        resultDiv.innerHTML = "<div class='result-card' style='background:#fff3cd;border-left-color:#ffc107;'>⚠️ Please select some text to analyze</div>";
        return;
      }

      runAnalysis(selectedText);
    }
  );
});

async function runAnalysis(selectedText) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p style='color:#999;'>Analyzing...</p>";

  try {
    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText })
    });

    const data = await response.json();
    displayResults(data, selectedText);
  } catch (error) {
    resultDiv.innerHTML = `<div class='result-card error'>❌ Error: ${error.message}</div>`;
  }
}

function getSelectedText() {
  return window.getSelection().toString();
}

function displayResults(data, originalText) {
  const resultDiv = document.getElementById("result");
  const severity = data.severity || "Low";
  const isHarassing = data.sexual_harassment || severity === "High";
  const language = data.language || "English";
  const confidence = data.confidence || 0;
  const detectedType =
    (data.threatening_words && data.threatening_words.length > 0 && "Threatening") ||
    (data.sexual_words && data.sexual_words.length > 0 && "Sexual") ||
    (data.cyberbullying_words && data.cyberbullying_words.length > 0 && "Cyberbullying") ||
    (data.discriminatory_words && data.discriminatory_words.length > 0 && "Discriminatory") ||
    (data.body_shaming_words && data.body_shaming_words.length > 0 && "Body Shaming") ||
    (data.abusive_words && data.abusive_words.length > 0 && "Abusive") ||
    null;
  
  // Determine severity color
  let severityColor = "#ff9800";
  if (severity === "High" || severity === "Critical") {
    severityColor = "#ff5252";
  } else if (severity === "Low" || severity === "Safe") {
    severityColor = "#4caf50";
  }
  
  // Build HTML with dark theme
  let html = `
    <div class="dark-container">
      <div class="site-header">web.whatsapp.com says</div>
      
      <div class="status-banner ${isHarassing ? 'harassment-detected' : 'no-harassment'}">
        <span class="status-text">${isHarassing ? `HARASSMENT DETECTED - ${detectedType || 'Unknown'}` : 'NO HARASSMENT - SAFE'}</span>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Language:</span>
          <span class="info-value">${escapeHtml(language)}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Original:</span>
          <span class="info-value">${escapeHtml(originalText)}</span>
        </div>
        
        <div class="severity-row">
          <span class="severity-label">Severity:</span>
          <span class="severity-value" style="color: ${severityColor}">${severity}</span>
        </div>
        
        <div class="severity-row">
          <span class="severity-label">Confidence:</span>
          <span class="severity-value">${confidence}%</span>
        </div>`;
  
  const categoryRows = [
    { label: "Type - Sexual", words: data.sexual_words },
    { label: "Type - Threatening", words: data.threatening_words },
    { label: "Type - Cyberbullying", words: data.cyberbullying_words },
    { label: "Type - Discriminatory", words: data.discriminatory_words },
    { label: "Type - Body Shaming", words: data.body_shaming_words }
  ];

  categoryRows.forEach((row) => {
    if (row.words && row.words.length > 0) {
      html += `
        <div class="words-row">
          <span class="words-label">${row.label}:</span>
          <span class="words-value">${escapeHtml(row.words.join(", "))}</span>
        </div>`;
    }
  });
  
  html += `
      </div>
    </div>
  `;
  
  resultDiv.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
