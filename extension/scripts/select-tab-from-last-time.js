import scrollStickersTabBar from 'utils';

export function selectTabFromLastTime(stickersTabBar) {
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