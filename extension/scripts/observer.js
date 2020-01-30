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

function attachHighlightOnSelectToStickerTabs(stickersTabBar) {
    let stickerTabs = stickersTabBar.querySelectorAll('._5r8a');
    for (let stickerTab of stickerTabs) {
        stickerTab.onclick = function() {
            // clear all selected class on all sticker tabs and set select for itself
            stickerTabs.forEach(st => { st.classList.remove('_5r8b') });
            stickerTab.classList.add('_5r8b');
        }
    }
}

function getElementLeftOffset(element) {
    return pxToNumber(window.getComputedStyle(element).left);
}

function pxToNumber(px) {
    return parseInt(px.replace('px', ''));
}

function createPreviousTabsButtonElement(stickersTabBar) {
    let element = htmlToElement(Mustache.render(previousTabsButtonTemplate));
    element.classList.add('previous-stickers');

    element.onclick = function() {
        let currentLeftOffset = getElementLeftOffset(stickersTabBar);

        // First transition from search tab shifts by 208px because search and recent tabs are 41px
        // while sticker tabs are all 42px
        // Subsequent transitions shift by 210px at a time (5 sticker tabs)
        let shiftBy = Math.abs(currentLeftOffset) === 208 ? 208 : 210;
        stickersTabBar.setAttribute('style', `left: ${currentLeftOffset + shiftBy}px;`)
    }

    return element;
}

function createNextTabsButtonElement(stickersTabBar) {
    let element = htmlToElement(Mustache.render(nextTabsButtonTemplate));
    element.classList.add('next-stickers');

    element.onclick = function() {
        let currentLeftOffset = getElementLeftOffset(stickersTabBar);

        // Final transition to search tab shifts by 208px because search and recent tabs are 41px
        // while sticker tabs are all 42px
        // Subsequent transitions shift by 210px at a time (5 sticker tabs)
        let shiftBy = currentLeftOffset === 0 ? 208 : 210;
        stickersTabBar.setAttribute('style', `left: ${currentLeftOffset - shiftBy}px;`)
    }

    return element;
}

function insertNavigationButtons(stickersTabBar) {
    // Construct custom navigation button
    let navigationButtonParentElement = stickersTabBar.closest('._5r85');
    let fbAddStickerButton = navigationButtonParentElement.querySelector('._5r86');
    
    let previousButtonElement = createPreviousTabsButtonElement(stickersTabBar)
    navigationButtonParentElement.prepend(previousButtonElement);
    let nextButtonElement = createNextTabsButtonElement(stickersTabBar);
    navigationButtonParentElement.insertBefore(nextButtonElement, fbAddStickerButton.nextElementSibling);
}

function navigationButtonUpdatedMutationsHandler(mutations, observer) {
    // This observer is only used to observe one node so it's safe to get its target at [0]
    let node = mutations[0].target;

    // Hide FB's default navigation next, prev buttons
    let fbNavigationButtonElements = node
        .querySelectorAll('._37wv:not(.next-stickers), ._37wu:not(.previous-stickers)');
    fbNavigationButtonElements.forEach(button => { button.setAttribute('style', 'display:none') });
}

function observeNavigationButtonUpdated(stickersTabBar, observer) {
    let options = {
        childList: true
    };

    let navigationButtonParentElement = stickersTabBar.closest('._5r85');
    observer.observe(navigationButtonParentElement, options);
}

function setDisplayPreviousButton(button, leftOffset) {
    if (button) {
        // reached start, should not show previous button
        if (leftOffset === 0) {
            button.setAttribute('style', 'display:none')
        } else {
            button.removeAttribute('style');
        }
    }
}

function setDisplayNextButton(button, leftOffset, stickersTabBarWidth) {
    if (button) {
        // reached end, should not show next button 
        // remaining width is less than 210, should not show next button
        if (stickersTabBarWidth + leftOffset < 210) {
            button.setAttribute('style', 'display:none');
        } else {
            button.removeAttribute('style');
        }
    }
}

function setDisplayNavigationButtons(stickersTabBar) {
    let navigationButtonParentElement = stickersTabBar.closest('._5r85');
    let previousButtonElement = navigationButtonParentElement.querySelector('._37wu.previous-stickers');
    let nextButtonElement = navigationButtonParentElement.querySelector('._37wv.next-stickers');

    let leftOffset = getElementLeftOffset(stickersTabBar);
    setDisplayPreviousButton(previousButtonElement, leftOffset);
    setDisplayNextButton(nextButtonElement, leftOffset, stickersTabBar.offsetWidth);
}

function stickersTabBarLeftOffsetMutationsHandler(mutations, observer) {
    // watch for style so there should be only one change at a time
    let mutationRecord = mutations[0];
    let stickersTabBar = mutationRecord.target;

    setDisplayNavigationButtons(stickersTabBar);
}

function observeStickersTabBarLeftOffset(stickersTabBar, observer) {
    let options = {
        attributeFilter: ['style'],
        attributes: true
    }

    observer.observe(stickersTabBar, options);
}

function stickersTabBarMutationHandler(mutations, observer) {
    let dataIdOfStickerTableObserver = new MutationObserver(dataIdOfStickerTableContainerMutationHandler);
    let navigationButtonUpdatedObserver = new MutationObserver(navigationButtonUpdatedMutationsHandler);
    let stickersTabBarLeftOffsetObserver = new MutationObserver(stickersTabBarLeftOffsetMutationsHandler)

    let stickersTabBar = document.querySelector('._5r89');
    if (stickersTabBar !== null) {
        if (!stickersTabBar.getAttribute('data-appended-stickers-tab')) {
            let element = createStickerTabContainerElement(stickerGroups);
            stickersTabBar.appendChild(element);
            stickersTabBar.setAttribute('data-appended-stickers-tab', true);
            observeDataIdOfStickerTableContainer(dataIdOfStickerTableObserver);
            observeStickersTabBarLeftOffset(stickersTabBar, stickersTabBarLeftOffsetObserver);
            observeNavigationButtonUpdated(stickersTabBar, navigationButtonUpdatedObserver);
            attachHighlightOnSelectToStickerTabs(stickersTabBar);
            insertNavigationButtons(stickersTabBar);

            // When the popup first time loads, sticker tab bar style isn't "changed"
            // so won't be caught by stickersTabBarLeftOffsetObserver
            setDisplayNavigationButtons(stickersTabBar);
        }
    // sticker tab bar is not found means sticker popup is closed
    } else {
        dataIdOfStickerTableObserver.disconnect();
        navigationButtonUpdatedObserver.disconnect();
        stickersTabBarLeftOffsetObserver.disconnect();
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

function dataIdOfStickerTableContainerMutationHandler(mutations, observer) {
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

function sendButtonMutationsHandler(mutations, observer) {
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

function observeChatToolBar(observer, chatToolBarElement) {
    let options = {
        childList: true
    }

    observer.observe(chatToolBarElement, options);
}

function canSendSticker(dropPanelElement) {
    // Chat box already has something to send, should not upload extension's sticker
    let sendButton = dropPanelElement.querySelector('._6gb._6wm4._6987');
    return sendButton === null;
}

function onStickerClick(stickerElement) {
    let dropPanelElement = stickerElement.closest('div.uiContextualLayerPositioner._1r_9.uiLayer')
        .previousElementSibling
        .querySelector('._1ia._2sz2');

    // Should only upload sticker if chat box is empty (no message, no files)
    if (canSendSticker(dropPanelElement)) {
        fetch(stickerElement.src)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                // Upload sticker gif takes a short time, during that time the send button isn't available
                let chatToolBarElement = dropPanelElement.querySelector('._552n');
                let sendButtonObserver = new MutationObserver(sendButtonMutationsHandler);
                observeChatToolBar(sendButtonObserver, chatToolBarElement);

                let file = new File([buffer], 'a.gif', { type: 'image/gif' });
                simulateDragDrop(stickerElement, dropPanelElement, [file]);
            });
    }
}

function initialize() {
    let stickersTabBarObserver = new MutationObserver(stickersTabBarMutationHandler);
    observeForStickerPopup(stickersTabBarObserver);
}

function observeDataIdOfStickerTableContainer(observer) {
    let options = {
        attributeFilter: ['data-id'],
        attribute: true,
        attributeOldValue: true
    };

    // Observe the div that contains the sticker table div
    let tableContainerElement = document.querySelector(
        'div[aria-label=Stickers] > div:nth-child(2) > div');
    
    observer.observe(tableContainerElement, options);
}

function observeForStickerPopup(observer) {
    let options = {
        childList: true, 
        subtree: true 
    };
    
    // Only watch chat tabs container to avoid too many mutations being detected
    let chatTabContainer = document.querySelector('._59v1');
    if (chatTabContainer) {
        observer.observe(chatTabContainer, options);
    } else {
        // Is on messenger page
        // TODO on messenger page
    }
}

initialize();