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
                    setGlobalData(tabId, stickerGroupsStr);
                }
                
                reader.readAsText(file);
            })
        })
    })
}

function setGlobalData(tabId, stickerGroupsStr) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            var injectedCode = \`var stickerGroups = JSON.parse('${stickerGroupsStr}');\`
            script.textContent = injectedCode;    
            document.head.appendChild(script);
            `,
    }, () => {
        injectMustache(tabId);
    });
}

function injectMustache(tabId) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/mustache.js');
            document.head.appendChild(script);
            `,
    }, () => { 
        injectObserver(tabId); 
    });
}

function injectObserver(tabId) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('scripts/observer.js');
            document.head.appendChild(script);
            `,
    });
}
