
function buildStickerTabContainerHtml(stickerGroups) {
    let stickerTabsHtml = '';
    for (let stickerGroup of stickerGroups) {
        stickerTabsHtml += buildStickerTabHtml(stickerGroup);
    }

    return Mustache.render(stickerTabContainerTemplate, {
        stickerTabsHtml: stickerTabsHtml
    });
}

function buildStickerTabHtml(stickerGroup) {
    return Mustache.render(stickerTabTemplate, {
        stickerGroupId: stickerGroup.groupId,
        stickerGroupName: stickerGroup.groupName,
        stickerGroupImage: stickerGroup.groupThumbnail
    })
}

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function initialize() {
    let isStickerTabsAppended = false;
    let chatTabObserver = new MutationObserver((mutationList, observer) => {
        let stickersContainerDiv = document.querySelector('div[aria-label=Stickers] > div > div > div > div');
        if (stickersContainerDiv !== null && !isStickerTabsAppended) {
            if (!isStickerTabsAppended) {
                let stickerTabContainerHtml = buildStickerTabContainerHtml(stickerGroups);
                let element = htmlToElement(stickerTabContainerHtml);
                stickersContainerDiv.appendChild(element);
                isStickerTabsAppended = true;
            }
        } 

        if (stickersContainerDiv === null) {
            isStickerTabsAppended = false;
        }
    });
    
    observeForStickerPopup(chatTabObserver);
}

function observeForStickerPopup(mutationObserver) {
    let config = {
        attributeFilter: [],
        childList: true, 
        subtree: true 
    };
    
    // Only watch chat tabs container to avoid too many mutation being detected
    var chatTabContainer = document.getElementsByClassName('_59v1')[0];
    if (chatTabContainer) {
        mutationObserver.observe(chatTabContainer, config);
    } else {
        // Is on messenger page
        // TODO on messenger page
    }
}

initialize();