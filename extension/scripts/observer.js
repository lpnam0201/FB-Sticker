
function chunk (arr, len) {
    var chunks = [], i = 0, n = arr.length;
  
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
  
    return chunks;
}

function createStickerTabContainerElement(stickerGroups) {
    let html = Mustache.render(stickerTabContainerTemplate);
    let tabContainerElement = htmlToElement(html);

    for (let stickerGroup of stickerGroups) {
        let tabElement = createStickerTabElement(stickerGroup);
        tabContainerElement.appendChild(tabElement);
    }
    
    return tabContainerElement;
}

function createStickerTabElement(stickerGroup) {
    let html = Mustache.render(stickerTabTemplate, {
        stickerGroupId: stickerGroup.groupId,
        stickerGroupName: stickerGroup.groupName,
        stickerGroupImage: stickerGroup.groupThumbnail
    });

    let tabElement = htmlToElement(html);
    tabElement.addEventListener('click', () => {
        let tableElement = createStickersTableElement(stickerGroup);
        let tableContainerElement = document.querySelector(
            'div[aria-label=Stickers] > div:nth-child(2) > div');

        // FB's default container should NEVER be removed (React error)
        // but should be pushed down out of view
        tableContainerElement.prepend(tableElement);
        // For MutationObserver to decide the current tab is extenstion-inserted or normal
        tableContainerElement.setAttribute('data-id', '');
    });

    return tabElement;
}

function createStickersTableElement(stickerGroup) {  
    let table = { rows: [] };
    let chunks = chunk(stickerGroup.stickers, 4);
    for (let chunk of chunks) {
        let row = { cells: []};
        for (let sticker of chunk) {
            let cell = { thumbnail: sticker.thumbnail };
            row.cells.push(cell);
        }
        table.rows.push(row);
    }

    let tableElement = htmlToElement(Mustache.render(stickerTableTemplate, table));

    return tableElement;
}

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function chatTabContainerMutationHandler(mutationList, observer) {

}

function isStickerTableOfExtensionAdded(mutationList) {
    for (let mutation of mutationList) {
        let nodes = mutation.addedNodes.values();
        for (let node of nodes) {
            if (node.classList.contains('fbExtension')) {
                return true;
            }
        }
    }

    return false;
}

function stickerTableContainerMutationHandler(mutationList, observer) {
    let stickerTableContainerElement = document.querySelector(
        'div[aria-label=Stickers] > div:nth-child(2) > div');
    
    let tablesAddedByExtension = document.querySelectorAll('.fbExtension')
    
    // watch for data-id so there should be only one change at a time
    let mutationRecord = mutationList[0];
    let node = mutationRecord.target;

    // #1 extension tab -> normal tab
    if (!mutationRecord.oldValue && node.getAttribute('data-id')) {
        // remove all extension-inserted tables (if any) to make room for normal table
        tablesAddedByExtension.forEach(table => stickerTableContainerElement.removeChild(table));
    } 
    // #2 extension tab -> extension tab
    if (!mutationRecord.oldValue && !node.getAttribute('data-id')) {
        // extension tab -> extension tab
        // results in 2 tables prepended by extension but only the latest one is needed
        [...tablesAddedByExtension].slice(1).forEach(table => stickerTableContainerElement.removeChild(table))
    }
    // normal tab -> normal tab 
    // and normal tab -> extension tab
    // doesn't need to be handled

    // Actually one more state: initial (where mutationRecord.oldValue == null)
    // Initial state happens when if previously user was on sticker search tab then close popup
    // Currently, from initial state -> extension tab will fall to #2 and the latest (only 1) will be kept
    // So this case is already handled.
}

function initialize() {
    let chatTabContainerObserver = new MutationObserver((mutationList, observer) => {
        let stickersTableObserver = new MutationObserver(stickerTableContainerMutationHandler);

        let addedStickersTabBar = document.querySelector('._5r89');
        if (addedStickersTabBar !== null && !addedStickersTabBar.getAttribute('data-appended-stickers-tab')) {
            let element = createStickerTabContainerElement(stickerGroups);
            addedStickersTabBar.appendChild(element);
            addedStickersTabBar.setAttribute('data-appended-stickers-tab', true);
            observeDataIdOfStickerTableContainer(stickersTableObserver);
        }
    });
    
    observeForStickerPopup(chatTabContainerObserver);
}

function observeDataIdOfStickerTableContainer(mutationObserver) {
    let config = {
        attributeFilter: ['data-id'],
        attribute: true,
        attributeOldValue: true
    };

    // Observe the div that contains the sticker table div
    let tableContainerElement = document.querySelector(
        'div[aria-label=Stickers] > div:nth-child(2) > div');
    
    mutationObserver.observe(tableContainerElement, config);
}

function observeForStickerPopup(mutationObserver) {
    let config = {
        attributeFilter: [],
        childList: true, 
        subtree: true 
    };
    
    // Only watch chat tabs container to avoid too many mutation being detected
    let chatTabContainer = document.getElementsByClassName('_59v1')[0];
    if (chatTabContainer) {
        mutationObserver.observe(chatTabContainer, config);
    } else {
        // Is on messenger page
        // TODO on messenger page
    }
}

initialize();