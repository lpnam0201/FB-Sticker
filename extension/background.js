chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url === 'https://www.facebook.com/'
        && changeInfo.status === 'complete') {

        loadStickerData(tabId)
    }
})

function loadStickerData(tabId) {
    chrome.runtime.getPackageDirectoryEntry(root => {
        console.log(root);
        root.getFile('stickers.json', {}, fileEntry => {
            fileEntry.file(file => {
                let reader = new FileReader();
                reader.onloadend = e => {
                    let stickerGroupsStr = e.target.result
                    setGlobalData(tabId, stickerGroupsStr, () =>
                        injectMustache(tabId, () =>
                            injectObserver(tabId, () => {}))
                        );
                }
                
                reader.readAsText(file);
            })
        })
    })
}

function setGlobalData(tabId, stickerGroupsStr, cb) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            var injectedCode = \`var stickerGroups = JSON.parse('${stickerGroupsStr}');\`
            script.textContent = injectedCode;    
            document.head.appendChild(script);
            `,
    }, cb);
}

function injectMustache(tabId, cb) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/mustache.js');
            document.head.appendChild(script);
            `,
    }, cb);
}

function injectObserver(tabId, cb) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('scripts/observer.js');
            document.head.appendChild(script);
            `,
    }, cb);
}
