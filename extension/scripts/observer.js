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

    return tabElement;
}

function attachOnClickSaveStickerGroupIdExtensionTab(stickersTabBar) {
    let extensionTabs = stickersTabBar.querySelectorAll('.fbExtensionTab');
    extensionTabs.forEach(extensionTab => {
        extensionTab.addEventListener('click', () => {
            // To display the same extension tab the next time sticker popup is opened
            let stickerGroupdId = extensionTab.getAttribute('data-id');
            localStorage.setItem('selectedStickerGroupId', stickerGroupdId);
        })
    });
}

function attachOnClickShowStickersTableExtensionTab(stickersTabBar) {
    let extensionTabs = stickersTabBar.querySelectorAll('.fbExtensionTab');
    extensionTabs.forEach(extensionTab => {
        extensionTab.addEventListener('click', () => {
            let groupId = extensionTab.getAttribute('data-id');
            let stickerGroup = stickerGroups.find(sg => sg.groupId === groupId)
    
            let tableElement = createStickersTableElement(stickerGroup);
            let tableContainerElement = stickersTabBar.closest('._5r8e')
                .nextElementSibling
                .querySelector('._5r8l');
    
            // FB's default container should NEVER be removed (React error)
            // but should be pushed down out of view
            // Can't simply prepend <table> because search tab
            // doesn't have table container <div> like sticker tabs
            tableContainerElement.prepend(tableElement);
            
            // To init scroll for the *newly* inserted table
            Scrollbar.initAll();
        })
    })
}

function removeExistingExtensionStickerTable(tableContainerElement) {
    let extensionStickerTables = tableContainerElement.querySelectorAll('.fbExtensionTable');
    extensionStickerTables.forEach(table => tableContainerElement.removeChild(table)); 
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
        stickerTab.addEventListener('click', function() {
            // clear all selected class on all sticker tabs and set select for itself
            stickerTabs.forEach(st => { st.classList.remove('_5r8b') });
            stickerTab.classList.add('_5r8b');
        });
    }
}

function getElementLeftOffsetFromInlineStyle(element) {
    let leftPx = element.style.left || '0px';
    return pxToNumber(leftPx);
}

function pxToNumber(px) {
    return parseInt(px.replace('px', ''));
}

function scrollStickersTabBar(stickersTabBar, leftOffset) {
    stickersTabBar.setAttribute('style', `left: ${leftOffset}px;`)
}

function createPreviousTabsButtonElement(stickersTabBar) {
    let element = htmlToElement(Mustache.render(previousTabsButtonTemplate));
    element.classList.add('previous-stickers');

    element.onclick = function() {
        let currentLeftOffset = getElementLeftOffsetFromInlineStyle(stickersTabBar);

        let remaining = Math.abs(currentLeftOffset);
        let leftOffset = remaining < 210 ? 0 : currentLeftOffset + 210;
        scrollStickersTabBar(stickersTabBar, leftOffset);
    }

    return element;
}

function createNextTabsButtonElement(stickersTabBar) {
    let element = htmlToElement(Mustache.render(nextTabsButtonTemplate));
    element.classList.add('next-stickers');

    element.onclick = function() {
        let currentLeftOffset = getElementLeftOffsetFromInlineStyle(stickersTabBar);

        let barWidth = stickersTabBar.offsetWidth;
        let remainingWidth = barWidth - Math.abs(currentLeftOffset) - 210;
        let leftOffset = remainingWidth < 210 
            ? currentLeftOffset - remainingWidth 
            : currentLeftOffset - 210;
        scrollStickersTabBar(stickersTabBar, leftOffset);
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
        if (Math.abs(leftOffset) + 210 === stickersTabBarWidth) {
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

    let leftOffset = getElementLeftOffsetFromInlineStyle(stickersTabBar);
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

function attachOnClickRemoveLastSelectedStickerGroupIdToFbTabs(stickersTabBar) {
    let fbTabs = stickersTabBar.querySelectorAll('._5r8a:not(.fbExtensionTab)');

    fbTabs.forEach(fbTab => {
        fbTab.addEventListener('click', () => {
            localStorage.removeItem('selectedStickerGroupId');
        });
    });
}

function attachOnClickRemoveExistingExtensionTableToTabs(stickersTabBar) {
    let tabs = stickersTabBar.querySelectorAll('._5r8a');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            let tableContainerElement = stickersTabBar.closest('._5r8e')
                .nextElementSibling
                .querySelector('._5r8l');
            removeExistingExtensionStickerTable(tableContainerElement);
        })
    })
}

function selectTabFromLastTime(stickersTabBar) {
    // TODO: should handle case when selecting fb Tab, then extension tab, then closing.
    // Upon opening sticker popup back, logically extension tab should be scrolled to
    // but FB's last selected is still a fb tab and it supposedly load asynchronously
    // causing the stickersTabBar to scroll back to fb Tab
    // Feature: Selecting previously selected extension tab is suspended

    let stickerGroupId = localStorage.getItem('selectedStickerGroupId');
    if (stickerGroupId) {
        let tabs = stickersTabBar.querySelectorAll('._5r8a');
        let findResult = findNumberOfTabsToSkip(stickerGroupId, tabs);

        if (findResult.tab !== null) {
            scrollToSelectedExtensionTab(findResult.skip, stickersTabBar);
            findResult.tab.click();
        }
    }
}

function findNumberOfTabsToSkip(stickerGroupId, tabs) {
    let skip = 0;
    for (let tab of tabs) {
        let currentStickerGroupId = tab.getAttribute('data-id');
        if (currentStickerGroupId === stickerGroupId) {
            return {
                skip: skip,
                tab: tab
            };
        }
        skip++;
    }

    return {
        skip: -1,
        tab: null
    }
}

function scrollToSelectedExtensionTab(skip, stickersTabBar) {
    // Differ in width: search and recent tab: 41px, sticker tab: 42px
    let leftOffset = - (41 * 2 + 42 * (skip - 2));
    scrollStickersTabBar(stickersTabBar, leftOffset);
}

function setSmoothScrollForStickersTabBar(stickersTabBar) {
    stickersTabBar.classList.add('smooth-scroll');
}
 
function stickersTabBarMutationHandler(mutations, observer) {
    let navigationButtonUpdatedObserver = new MutationObserver(navigationButtonUpdatedMutationsHandler);
    let stickersTabBarLeftOffsetObserver = new MutationObserver(stickersTabBarLeftOffsetMutationsHandler)

    let stickersTabBar = document.querySelector('._5r89');
    if (stickersTabBar !== null) {
        if (!stickersTabBar.getAttribute('data-appended-stickers-tab')) {
            let element = createStickerTabContainerElement(stickerGroups);
            stickersTabBar.appendChild(element);
            stickersTabBar.setAttribute('data-appended-stickers-tab', true);
            setSmoothScrollForStickersTabBar(stickersTabBar);
            observeStickersTabBarLeftOffset(stickersTabBar, stickersTabBarLeftOffsetObserver);
            observeNavigationButtonUpdated(stickersTabBar, navigationButtonUpdatedObserver);
            attachHighlightOnSelectToStickerTabs(stickersTabBar);
            // 'remove' onClick MUST fire before 'show' onClick handler therefore it is attached first
            attachOnClickRemoveExistingExtensionTableToTabs(stickersTabBar);
            attachOnClickRemoveLastSelectedStickerGroupIdToFbTabs(stickersTabBar);
            attachOnClickShowStickersTableExtensionTab(stickersTabBar);
            attachOnClickSaveStickerGroupIdExtensionTab(stickersTabBar);
            insertNavigationButtons(stickersTabBar);
            //selectTabFromLastTime(stickersTabBar);
            // TODO: Feature: add recently used extension stickers to recent

            // When the popup first time loads, sticker tab bar style isn't "changed"
            // so won't be caught by stickersTabBarLeftOffsetObserver
            setDisplayNavigationButtons(stickersTabBar);
        }
    // sticker tab bar is not found means sticker popup is closed
    } else {
        navigationButtonUpdatedObserver.disconnect();
        stickersTabBarLeftOffsetObserver.disconnect();
    }
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