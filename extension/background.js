chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (isFbUrl(tab.url) && changeInfo.status === 'complete') {
        loadStickerData(tabId);
    }
})

function isFbUrl(url) {
    return url.indexOf('https://www.facebook.com/') !== -1;
}

function findStickerDirectory(entries) {
    for (let entry of entries) {
        if (entry.isDirectory && entry.name === 'stickers') {
            return entry;
        }
    }
}

function readEntriesAsync(stickerGroupReader) {
    return new Promise((resolve, reject) => {
        stickerGroupReader.readEntries(entries => {
            resolve(entries);
        }, error => reject(error));
    });
}

async function buildStickerGroupAsync(stickerGroupEntry, groupId) {
    let stickerGroupReader = stickerGroupEntry.createReader();
    let stickerGroup = {
        groupId: groupId.toString(),
        groupName: stickerGroupEntry.name,
        stickers: []
    }

    let read = async function() {
        let entries = await readEntriesAsync(stickerGroupReader);
        // Recursively call read() until all entries is read
        if (entries.length > 0) {
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
            await read();
        }
    }

    await read();
    return stickerGroup;
}

async function buildStickerGroups(stickerGroupEntries) {
    let stickerGroups = [];
    let groupId = 1;

    for (let stickerGroupEntry of stickerGroupEntries) {
        let stickerGroup = await buildStickerGroupAsync(stickerGroupEntry, groupId++);
        stickerGroups.push(stickerGroup);
    }

    return stickerGroups;
}

function loadStickerData(tabId) {
    chrome.runtime.getPackageDirectoryEntry(directoryEntry => {
        let rootReader = directoryEntry.createReader();
        rootReader.readEntries(entries => {
            let stickersDirectoryEntry = findStickerDirectory(entries);
            let stickersReader = stickersDirectoryEntry.createReader();
            stickersReader.readEntries(entries => {
                entries = entries.filter(entry => entry.isDirectory);
                buildStickerGroups(entries)
                    .then(stickerGroups => {
                        let stickerGroupsStr = JSON.stringify(stickerGroups);
                        setGlobalData(tabId, stickerGroupsStr, () =>
                            injectTemplates(tabId, () =>
                            injectMustache(tabId, () =>
                            injectSmoothScrollbar(tabId, () =>
                            injectCss(tabId, () =>
                            injectMain(tabId, () => {}))))));
                    });
            });
        })
    })
}

function setGlobalData(tabId, stickerGroupsStr, cb) {
    stickerGroupsStr = convertThumbnailPath(stickerGroupsStr);
    var extensionUrl = chrome.extension.getURL('');
    extensionUrl = extensionUrl.slice(0, extensionUrl.length - 1);
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            var injectedCode = \`
                var stickerGroups = JSON.parse('${stickerGroupsStr}');
                var extensionUrl = '${extensionUrl}';
                var currentOpenStickersButton = null;
                \`;
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
            script.src = chrome.runtime.getURL('lib/custom-mustache.js');
            document.head.appendChild(script);
            `
    }, cb);
}

function injectSmoothScrollbar(tabId, cb) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/smooth-scrollbar.js');
            document.head.appendChild(script);
            `
    }, cb);
}

function injectCss(tabId, cb) {
    chrome.tabs.insertCSS(tabId, { file: 'css/scrollbar-custom.css' }, () => 
    chrome.tabs.insertCSS(tabId, { file: 'css/stickers-tab-bar.css' }, () => 
    chrome.tabs.insertCSS(tabId, { file: 'css/fb-sticker-tab.css' }, () => 
    chrome.tabs.insertCSS(tabId, { file: 'css/sticker-image.css' }, cb))));
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
    'previousTabsButton',
    'stickerTabContainerTopPopup'
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

function injectMain(tabId, cb) {
    chrome.tabs.executeScript(tabId, {
        code: `
            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('main.js');
            document.head.appendChild(script);
            `
    }, cb);
}
