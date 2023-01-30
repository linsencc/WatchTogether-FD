
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text == "getCurrentTabId") {
        sendResponse({ tabId: sender.tab.id.toString() });
    }
});


