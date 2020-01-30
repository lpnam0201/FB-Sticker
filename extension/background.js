chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.indexOf('https://www.facebook.com/') !== -1
        && changeInfo.status === 'complete') {
        loadStickerData(tabId);
    }
})

function findStickerDirectory(entries) {
    for (let entry of entries) {
        if (entry.isDirectory && entry.name === 'stickers') {
            return entry;
        }
    }
}

function createReadStickerGroupPromise(stickerGroupEntry, groupId) {
    return new Promise((resolve, reject) => {
        let stickerGroupReader = stickerGroupEntry.createReader();
        stickerGroupReader.readEntries(entries => {
            let stickerGroup = {
                groupId: groupId,
                groupName: stickerGroupEntry.name,
                stickers: []
            }

            for (let entry of entries) {
                if (entry.name.indexOf('groupThumbnail') !== -1) {
                    stickerGroup.groupThumbnail = entry.name;
                } else {
                    stickerGroup.stickers.push({
                        id: entry.name.replace('.gif', ''),
                        thumbnail: entry.name
                    })
                }
            }

            resolve(stickerGroup);
        }, error => reject(error))
    });
}

function buildStickerGroups(stickerGroupEntries) {
    let promises = [];
    let groupId = 1;

    for (let stickerGroupEntry of stickerGroupEntries) {
        promises.push(createReadStickerGroupPromise(stickerGroupEntry, groupId++));
    }

    return Promise.all(promises);
}

function loadStickerData(tabId) {
    chrome.runtime.getPackageDirectoryEntry(directoryEntry => {
        var rootReader = directoryEntry.createReader();
        rootReader.readEntries(entries => {
            let stickersDirectoryEntry = findStickerDirectory(entries);
            let stickersReader = stickersDirectoryEntry.createReader();
            stickersReader.readEntries(entries => {
                buildStickerGroups(entries)
                    .then(stickerGroups => {
                        let stickerGroupsStr = JSON.stringify(stickerGroups);
                        setGlobalData(tabId, stickerGroupsStr, () =>
                            injectTemplates(tabId, () =>
                                injectMustache(tabId, () =>
                                    injectObserver(tabId, () => {}))))
                    });
            });
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
            `stickers/${stickerGroup.groupName}/${stickerGroup.groupThumbnail}`);
        for (let sticker of stickerGroup.stickers) {
            sticker.thumbnail = chrome.runtime.getURL(
                `stickers/${stickerGroup.groupName}/${sticker.thumbnail}`);
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

// New template should have their name registered here
var templateNames = [
    'stickerTab', 
    'stickerTabContainer',
    'stickerTable',
    'nextTabsButton',
    'previousTabsButton'
];

function injectTemplates(tabId, cb) {
    chrome.runtime.getPackageDirectoryEntry(async root => {
        let promises = [];

        let setTemplateJs = ''
        for (let name of templateNames) {
            promises.push(fetchTemplate(name, content => {
                setTemplateJs += `var ${name}Template = \\\`${content}\\\`;`
            }));
        }

        Promise.all(promises).then(() => {
            chrome.tabs.executeScript(tabId, {
                code: `
                    var script = document.createElement('script');
                    var injectedCode = \`${setTemplateJs}\`
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
