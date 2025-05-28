document.getElementById("summarize").addEventListener("click", () => {
  const result = document.getElementById("result");
  const summaryType = document.getElementById("summary-type").value;
  console.log("summaryType", summaryType);

  result.innerText = "Summarizing...";

  // 1. GEMINI_API_KEY is stored as an environment variable in Netlify & used by a serverless function
  // The API is deployed at: https://gemini-proxy-summarize-ai.netlify.app/.netlify/functions/summarize
  // This API handles the summarization using the Gemini API. We just need to call this API.

  // 2. Ask content.js for the page text
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      result.innerText = "No active tab found.";
      return;
    }

    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "GET_ARTICLE_TEXT" },
      async (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending message:",
            chrome.runtime.lastError.message
          );
          result.innerText =
            "Could not connect to content script. Make sure it's running on this page.";
          return;
        }

        if (!response || !response.text) {
          result.innerText = "Couldn't extract text from the page.";
          return;
        }

        // 3. Send text to Gemini for summarization
        try {
          const summary = await getGeminiSummary(response.text, summaryType);
          // 4. Display the summary in the popup
          result.innerText = summary;
        } catch (error) {
          result.innerText = "Error summarizing text: " + error.message;
        }
      }
    );
  });
});

async function getGeminiSummary(text, summaryType) {
  const max = 20000;
  if (text.length > max) {
    text = text.slice(0, max);
  }

  const proxyResponse = await fetch(
    "https://gemini-proxy-summarize-ai.netlify.app/.netlify/functions/summarize",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        summaryType: summaryType,
      }),
    }
  );

  if (!proxyResponse.ok) {
    const { error } = await response.json();
    throw new Error("Failed to fetch summary: " + response.statusText);
  }
  const data = await proxyResponse.json();
  return data?.summary || "No summary available.";
}

document.getElementById("copy-btn").addEventListener("click", () => {
  const text = document.getElementById("result").innerText;
  if (!text) {
    alert("No text to copy.");
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const btn = document.getElementById("copy-btn");
      const old = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = old;
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text.");
    });
});
