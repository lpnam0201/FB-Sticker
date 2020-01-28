chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.indexOf('https://www.facebook.com/') !== -1
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
    stickerGroupsStr = convertThumbnailPath(stickerGroupsStr);

    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            var injectedCode = \`var stickerGroups = JSON.parse('${stickerGroupsStr}');\`
            script.textContent = injectedCode;    
            document.head.appendChild(script);
            `
    }, cb);
}

function convertThumbnailPath(stickerGroupsStr) {
    let stickerGroups = JSON.parse(stickerGroupsStr);
    for (let stickerGroup of stickerGroups) {
        stickerGroup.groupThumbnail = chrome.runtime.getURL(
            `images/stickers/${stickerGroup.groupName}/${stickerGroup.groupThumbnail}`);
        for (let sticker of stickerGroup.stickers) {
            sticker.thumbnail = chrome.runtime.getURL(
                `images/stickers/${stickerGroup.groupName}/${sticker.thumbnail}`);
        }
    }
    return JSON.stringify(stickerGroups);
}

function injectMustache(tabId, cb) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/customMustache.js');
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

        let stickerTabTemplate;
        promises.push(fetchTemplate('stickerTab', data => stickerTabTemplate = data));
        let stickerTabContainerTemplate;
        promises.push(fetchTemplate('stickerTabContainer', data => stickerTabContainerTemplate = data));
        let stickerTableTemplate;
        promises.push(fetchTemplate('stickerTable', data => stickerTableTemplate = data));

        Promise.all(promises).then(() => {
            chrome.tabs.executeScript(tabId, {
                code: `
                    var script = document.createElement('script');
                    var injectedCode = \` 
                        var stickerTabTemplate = \\\`${stickerTabTemplate}\\\`;
                        var stickerTabContainerTemplate = \\\`${stickerTabContainerTemplate}\\\`;
                        var stickerTableTemplate = \\\`${stickerTableTemplate}\\\`;
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
            `,
        runAt: 'document_end'
    }, cb);
}
