function simulateDragDrop(sourceNode, destinationNode, files) {
    var EVENT_TYPES = {
        DRAG_END: 'dragend',
        DRAG_START: 'dragstart',
        DROP: 'drop'
    }

    function createCustomEvent(type) {
        var event = new CustomEvent("CustomEvent")
        event.initCustomEvent(type, true, true, null)
        event.dataTransfer = {
            data: {
            },
            setData: function(type, val) {
                this.data[type] = val
            },
            getData: function(type) {
                return this.data[type]
            },
            files: files,
            types: "Files"
        }
        return event
    }

    function dispatchEvent(node, type, event) {
        if (node.dispatchEvent) {
            return node.dispatchEvent(event)
        }
        if (node.fireEvent) {
            return node.fireEvent("on" + type, event)
        }
    }

    var event = createCustomEvent(EVENT_TYPES.DRAG_START)
    dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event)

    var dropEvent = createCustomEvent(EVENT_TYPES.DROP)
    dropEvent.dataTransfer = event.dataTransfer
    dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent)

    var dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END)
    dragEndEvent.dataTransfer = event.dataTransfer
    dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent)
}

function chunk (arr, len) {
    let chunks = [], i = 0, n = arr.length;
  
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

function chatTabContainerMutationHandler(mutations, observer) {
    let stickersTableObserver = new MutationObserver(stickerTableContainerMutationHandler);

    let addedStickersTabBar = document.querySelector('._5r89');
    if (addedStickersTabBar !== null) {
        if (!addedStickersTabBar.getAttribute('data-appended-stickers-tab')) {
            let element = createStickerTabContainerElement(stickerGroups);
            addedStickersTabBar.appendChild(element);
            addedStickersTabBar.setAttribute('data-appended-stickers-tab', true);
            observeDataIdOfStickerTableContainer(stickersTableObserver);
        }
    // sticker tab bar is not found means sticker popup is closed
    } else {
        stickersTableObserver.disconnect();
    }
}

function isStickerTableOfExtensionAdded(mutations) {
    for (let mutation of mutations) {
        let nodes = mutation.addedNodes.values();
        for (let node of nodes) {
            if (node.classList.contains('fbExtension')) {
                return true;
            }
        }
    }

    return false;
}

function stickerTableContainerMutationHandler(mutations, observer) {
    let stickerTableContainerElement = document.querySelector(
        'div[aria-label=Stickers] > div:nth-child(2) > div');
    
    let tablesAddedByExtension = document.querySelectorAll('.fbExtension')
    
    // watch for data-id so there should be only one change at a time
    let mutationRecord = mutations[0];
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
    // #3 normal tab -> extension tab -> initial
    if (!mutationRecord.oldValue && !node.hasAttribute('data-id')) {
        tablesAddedByExtension.forEach(table => stickerTableContainerElement.removeChild(table));
    }
    // normal tab -> normal tab 
    // and normal tab -> extension tab
    // doesn't need to be handled

    // Actually one more state: initial (where mutationRecord.oldValue == null)
    // Initial state happens when if previously user was on sticker search tab then close popup
    // Currently, from initial state -> extension tab will fall to #2 and the latest (only 1) will be kept
    // So this case is already handled.
}

function chatToolBarChangedHandler(mutations, observer) {
    for (let mutation of mutations) {
        let nodes = mutation.addedNodes.values();
        for (let node of nodes) {
            if (node.className === '_6gd _21u1') {
                observer.disconnect();
                let sendButtonElement = node.querySelector('._6gb._6wm4._6987');
                sendButtonElement.click();
                break;
            }
        }
    }
}

function observeChatToolBar(mutationObserver, chatToolBarElement) {
    let options = {
        childList: true
    }

    mutationObserver.observe(chatToolBarElement, options);
}

function onStickerClick(stickerElement) {
    let dropPanelElement = stickerElement.closest('div.uiContextualLayerPositioner._1r_9.uiLayer')
        .previousElementSibling
        .querySelector('._1ia._2sz2');

    fetch(stickerElement.src)
        .then(res => res.arrayBuffer())
        .then(buffer => {
            let chatToolBarElement = dropPanelElement.querySelector('._552n');
            let chatToolBarObserver = new MutationObserver(chatToolBarChangedHandler);
            observeChatToolBar(chatToolBarObserver, chatToolBarElement);

            let file = new File([buffer], 'a.gif', { type: 'image/gif' });
            simulateDragDrop(stickerElement, dropPanelElement, [file]);
        })
}

function initialize() {
    let chatTabContainerObserver = new MutationObserver(chatTabContainerMutationHandler);
    observeForStickerPopup(chatTabContainerObserver);
}

function observeDataIdOfStickerTableContainer(mutationObserver) {
    let options = {
        attributeFilter: ['data-id'],
        attribute: true,
        attributeOldValue: true
    };

    // Observe the div that contains the sticker table div
    let tableContainerElement = document.querySelector(
        'div[aria-label=Stickers] > div:nth-child(2) > div');
    
    mutationObserver.observe(tableContainerElement, options);
}

function observeForStickerPopup(mutationObserver) {
    let options = {
        childList: true, 
        subtree: true 
    };
    
    // Only watch chat tabs container to avoid too many mutations being detected
    let chatTabContainer = document.querySelector('._59v1');
    if (chatTabContainer) {
        mutationObserver.observe(chatTabContainer, options);
    } else {
        // Is on messenger page
        // TODO on messenger page
    }
}

initialize();