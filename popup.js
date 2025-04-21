document.getElementById("summarize").addEventListener("click", () => {
  const result = document.getElementById("result");
  result.innerText = "Summarizing...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      result.innerText = "No active tab found.";
      return;
    }

    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "GET_ARTICLE_TEXT" },
      (response) => {
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
          result.innerText = "No content received from content script.";
          return;
        }

        result.innerText = response.text;
      }
    );
  });
});
