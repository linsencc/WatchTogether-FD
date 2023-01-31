const verifyEmail = (input: string) => {
    if (input === '' || input === undefined || input === null) {
        return false;
    }

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


const updateTab = (url: string) => {
    chrome.tabs.update({ url: url });
}


const reloadTab = async (tabId?: number) => {
    if (tabId === undefined) {
        chrome.tabs.reload();
    } else {
        try {
            await chrome.tabs.reload(tabId);
        } catch (error) {
            console.log(error);
        }
    }
}


const checkUrl0 = async () => {
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


const getHostname = () => {
    let hostname = chrome.runtime.getManifest()['host_permissions'][0];
    return hostname.substring(0, hostname.length - 1);
}


export { verifyEmail, getCurrentTab, updateTab, reloadTab, checkUrl0, getHostname }