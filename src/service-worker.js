console.log("Hi, I'm Responsivfy Helper");
let currentUrl = "";

function getWindowName() {
  // console.log("getWindowName", window.name);
  return window.name;
}

async function getFrameName(tabId, frameId) {
  try {
    const a = await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      func: getWindowName,
    });
    // console.log("script injected on target frames", a[0].result);
    return a[0].result;
  } catch (e) {
    // console.error("script NOT injected on target frames", tabId, frameId, e);
  }
}

/**
 * @param {number} tabId
 * @param {string} url
 */
async function navigateFramesToUrl(tabId, fromFrameId, url) {
  if (currentUrl === url) {
    return;
  }
  currentUrl = url;

  const frameName = await getFrameName(tabId, fromFrameId);

  try {
    await chrome.tabs.sendMessage(
      tabId,
      { event: "url_changed", url, sourceFrame: frameName },
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

    navigateFramesToUrl(details.tabId, details.frameId, details.url);
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.parentFrameId === 0) {
    // state changed in iframe
    // console.log("state updated", details.url, details);

    if (details.transitionType === "auto_subframe") {
      // navigate to new url
      navigateFramesToUrl(details.tabId, details.frameId, details.url);
    } else if (details.transitionType === "manual_subframe") {
      // pushed state to new url
      navigateFramesToUrl(details.tabId, details.frameId, details.url);
    }
  }
});

chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request?.command === "get_settings") {
    return sendResponse({
      version: chrome.runtime.getManifest().version,
      enabled: true,
    });
  }
});
