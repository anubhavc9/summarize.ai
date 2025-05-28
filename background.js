chrome.runtime.onInstalled.addListener(() => {
  // chrome.storage.sync.get(["geminiApiKey"], (result) => {
  //   if (!result.geminiApiKey) {
  //     chrome.tabs.create({ url: "options.html" });
  //   }
  // });
  // No longer needed, as API key is now static and not user-configurable.
});
