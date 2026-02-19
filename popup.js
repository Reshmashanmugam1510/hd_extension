document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p style='color:#999;'>Analyzing...</p>";
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: getSelectedText
    },
    async (results) => {
      const selectedText = results[0].result;

      if (!selectedText) {
        resultDiv.innerHTML = "<div class='result-card' style='background:#fff3cd;border-left-color:#ffc107;'>⚠️ Please select some text to analyze</div>";
        return;
      }

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
  );
});

function getSelectedText() {
  return window.getSelection().toString();
}

function displayResults(data, originalText) {
  const resultDiv = document.getElementById("result");
  const severity = data.severity || "Unknown";
  const isHarassing = data.sexual_harassment || false;
  
  let cardClass = "result-card";
  let severityClass = "";
  
  if (isHarassing) {
    cardClass += " error";
    severityClass = "severity-high";
  } else if (severity === "High") {
    cardClass += " warning";
    severityClass = "severity-high";
  } else if (severity === "Medium") {
    cardClass += " warning";
    severityClass = "severity-medium";
  } else if (severity === "Low") {
    cardClass += " success";
    severityClass = "severity-low";
  } else {
    cardClass += " success";
    severityClass = "severity-safe";
  }
  
  const language = data.language || "Unknown";
  const translation = data.translated_text || originalText;
  const confidence = data.confidence || 0;
  
  let html = `<div class='${cardClass}'>`;
  
  // Language
  if (language && language !== "Unknown") {
    html += `<div class='result-field'>
      <span class='result-label'>🌐 Language:</span>
      <span class='result-value'>${language}</span>
    </div>`;
  }
  
  // Original Text (if in other language)
  if (language && language !== "English" && language !== "Unknown") {
    html += `<div class='result-field'>
      <span class='result-label'>📝 Original:</span>
      <span class='result-value' style='font-size:12px;'>${escapeHtml(originalText)}</span>
    </div>`;
  }
  
  // Translation/Meaning
  if (translation && translation !== originalText && language !== "English") {
    html += `<div class='translation-box'>💬 Meaning: ${escapeHtml(translation)}</div>`;
  }
  
  // Severity
  html += `<div class='result-field'>
    <span class='result-label'>⚠️ Severity:</span>
    <span class='result-value ${severityClass}'>${severity}</span>
  </div>`;
  
  // Confidence
  html += `<div class='result-field'>
    <span class='result-label'>📊 Confidence:</span>
    <span class='result-value'>${confidence}%</span>
  </div>`;
  
  // Harassment Status
  const harassmentStatus = isHarassing ? "🚫 Yes - Detected" : "✅ No - Safe";
  html += `<div class='result-field'>
    <span class='result-label'>Harassment:</span>
    <span class='result-value' style='${isHarassing ? "color:#d32f2f;font-weight:bold" : "color:#388e3c;font-weight:bold"}'>${harassmentStatus}</span>
  </div>`;
  
  // Detected Words
  if (data.sexual_words && data.sexual_words.length > 0) {
    html += `<div class='result-field'>
      <span class='result-label'>🔴 Sexual Words:</span>
      <span class='result-value'>${escapeHtml(data.sexual_words.join(", "))}</span>
    </div>`;
  }
  
  if (data.abusive_words && data.abusive_words.length > 0) {
    html += `<div class='result-field'>
      <span class='result-label'>🟠 Abusive Words:</span>
      <span class='result-value'>${escapeHtml(data.abusive_words.join(", "))}</span>
    </div>`;
  }
  
  html += `</div>`;
  resultDiv.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
