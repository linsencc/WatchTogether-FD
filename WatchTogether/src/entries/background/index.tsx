import { leaveRoomFetch } from "../../api";


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === "getCurrentTabId") {
        sendResponse({ tabId: sender.tab!.id!.toString() });
    }
});


chrome.tabs.onRemoved.addListener(async (tabId: number, removeInfo: object) => {
    let data = await chrome.storage.local.get('room');
    if (data.room !== undefined && Number(data.room.tabId) === Number(tabId)) {
        await leaveRoomFetch(data.room.roomNumber);  // service worker not support axios

        chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('WatchTogether/public/images/live-128.png'),
            title: 'WatchTogether',
            message: '页面关闭，已退出房间',
            priority: 2
        })
    }
});
