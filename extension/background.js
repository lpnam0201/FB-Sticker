chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url === 'https://www.facebook.com/'
        && changeInfo.status === 'complete') {
        loadStickerData(tabId);
    }
})

function loadStickerData(tabId) {
    chrome.runtime.getPackageDirectoryEntry(root => {
        root.getFile('stickers.json', {}, fileEntry => {
            fileEntry.file(file => {
                let reader = new FileReader();
                reader.onloadend = e => {
                    let stickerGroupsStr = e.target.result
                    setGlobalData(tabId, stickerGroupsStr, () =>
                        injectTemplates(tabId, () => 
                            injectMustache(tabId, () =>
                                injectObserver(tabId, () => {}))
                    ))  
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
            `
    }, cb);
}

function injectMustache(tabId, cb) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/mustache.js');
            document.head.appendChild(script);
            `
    }, cb);
}

function fetchTemplate(templateName, cb) {
    return fetch(chrome.runtime.getURL(`templates/${templateName}.html`))
        .then(res => res.text())
        .then(data => cb(data));
}

function injectTemplates(tabId, cb) {
    chrome.runtime.getPackageDirectoryEntry(async root => {
        let promises = [];
        
        let template = {};
        let stickerTabStr;
        promises.push(fetchTemplate('stickerTab', data => stickerTabStr = data));
        let stickerTabGroupStr;
        promises.push(fetchTemplate('stickerTabGroup', data => stickerTabGroupStr = data));
        let stickerTableStr;
        promises.push(fetchTemplate('stickerTable', data => stickerTableStr = data));

        Promise.all(promises).then(() => {
            chrome.tabs.executeScript(tabId, {
                code: `
                    var script = document.createElement('script');
                    var injectedCode = \` 
                        var stickerTabHtml = \\\`${stickerTabStr}\\\`;
                        var stickerTabGroupHtml = \\\`${stickerTabGroupStr}\\\`;
                        var stickerTableHtml = \\\`${stickerTableStr}\\\`;
                    \`
                    script.textContent = injectedCode;
                    document.head.appendChild(script);
                    `
            }, cb);
        })
    })
}

function injectObserver(tabId, cb) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('scripts/observer.js');
            document.head.appendChild(script);
            `
    }, cb);
}
