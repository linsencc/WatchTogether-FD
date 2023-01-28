const toHHMMSS = (val) => {
    var sec_num = parseInt(val, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
}


const getCurrentTab = async () => {
    return (
        await chrome.runtime.sendMessage({ text: "getCurrentTabId" })
            .then((response) => {
                return ('response', response);
            })
    )
}


const reloadTab = () => {
    chrome.tabs.reload();
}


const getHostname = () => {
    let hostName = chrome.runtime.getManifest()['host_permissions'][0];
    return hostName;
}


export { toHHMMSS, getCurrentTab, reloadTab, getHostname }
