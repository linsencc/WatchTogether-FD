const verifyEmail = (input: string) => {
    if (input === '' || input === undefined || input === null) {
        return false;
    }
    // eslint-disable-next-line no-control-regex
    if (input.match(/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi)) {
        return true;
    } else {
        return false;
    }
}


const getCurrentTab = async () => {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}


const getRoomTab = async () => {
    let data = await chrome.storage.local.get('room');
    if (data.room !== undefined) {
        return chrome.tabs.get(data.room.tabId);
    }
    return undefined
}


const checkUrl = async () => {
    let tabData = await getCurrentTab();
    let currentUrl = tabData.url!;

    let contentScripts = chrome.runtime.getManifest()['content_scripts'];
    let matchesUrl = contentScripts![0]['matches']!;

    for (let i = 0; i < matchesUrl.length; i++) {
        if (new RegExp(matchesUrl[i]).test(currentUrl)) {
            return true;
        }
    }
    return false;
}


const toHHMMSS = (val: string) => {
    let sec_num = parseInt(val, 10); // don't forget the second param
    let hours: string | number = Math.floor(sec_num / 3600);
    let minutes: string | number = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: string | number = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
}


const getCurrentTabIdByBackground = async () => {
    return (
        await chrome.runtime.sendMessage({ text: "getCurrentTabId" }).then((response) => {
            return (response.tabId);
        })
    )
}

const getHostname = () => {
    let hostname = chrome.runtime.getManifest()['host_permissions'][0];
    return hostname.substring(0, hostname.length - 1);
}



export { verifyEmail, getCurrentTab, getRoomTab, checkUrl, getHostname, toHHMMSS, getCurrentTabIdByBackground }