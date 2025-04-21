function getArticleText() {
  const article = document.querySelector("article");
  if (article) return article.innerText;

  const paragraphs = document.querySelectorAll("p");
  const text = Array.from(paragraphs)
    .map((p) => p?.innerText)
    .join("\n");
  return text;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_ARTICLE_TEXT") {
    const articleText = getArticleText();
    sendResponse({ text: articleText });
  }
  return true;
});
