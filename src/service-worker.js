console.log("Hi, I'm Responsivfy Helper");
let currentUrl = "";

/**
 * @param {number} tabId
 * @param {string} url
 */
async function navigateFramesToUrl(tabId, url) {
  if (currentUrl === url) {
    return;
  }
  currentUrl = url;

  try {
    await chrome.tabs.sendMessage(
      tabId,
      { event: "url_changed", url },
      { frameId: 0 }
    );
  } catch (e) {
    // console.info("cannot send");
  }
}

chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.parentFrameId === 0) {
    // navigated to new url in iframe
    // console.log("navigation completed", details.url, details);

    navigateFramesToUrl(details.tabId, details.url);
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.parentFrameId === 0) {
    // state changed in iframe
    // console.log("state updated", details.url, details);

    if (details.transitionType === "auto_subframe") {
      // navigate to new url
      navigateFramesToUrl(details.tabId, details.url);
    } else if (details.transitionType === "manual_subframe") {
      // pushed state to new url
      navigateFramesToUrl(details.tabId, details.url);
    }
  }
});
