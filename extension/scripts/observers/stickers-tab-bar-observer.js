import { NavigationButtonUpdatedObserver } from './navigation-button-updated-observer'
import { StickersTabBarLeftOffsetObserver } from './stickers-tab-bar-left-offset-observer'
import {
    createStickerTabContainerElement,
    setSmoothScrollForStickersTabBar,
    attachHighlightOnSelectToStickerTabs,
    attachOnClickRemoveExistingExtensionTableToTabs,
    attachOnClickRemoveLastSelectedStickerGroupIdToFbTabs,
    attachOnClickShowStickersTableExtensionTab,
    attachOnClickSaveStickerGroupIdExtensionTab
} from '../stickers-tab-bar'
import { insertNavigationButtons, setDisplayNavigationButtons } from '../navigation-buttons'

export class StickersTabBarObserver {
    constructor() {
        this.mutationObserver = new MutationObserver(stickersTabBarMutationHandler);

        function stickersTabBarMutationHandler(mutations, observer) {
            let stickersTabBarLeftOffsetObserver = new StickersTabBarLeftOffsetObserver();
            let navigationButtonUpdatedObserver = new NavigationButtonUpdatedObserver();
        
            let stickersTabBar = document.querySelector('._5r89');
            if (stickersTabBar !== null) {
                if (!stickersTabBar.getAttribute('data-appended-stickers-tab')) {
                    let element = createStickerTabContainerElement(stickerGroups);
                    stickersTabBar.appendChild(element);
                    stickersTabBar.setAttribute('data-appended-stickers-tab', true);
                    setSmoothScrollForStickersTabBar(stickersTabBar);
                    stickersTabBarLeftOffsetObserver.observe(stickersTabBar);
                    navigationButtonUpdatedObserver.observe(stickersTabBar);
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
    }

    observe() {
        let options = {
            childList: true, 
            subtree: true 
        };
        
        // Only watch chat tabs container to avoid too many mutations being detected
        let chatTabContainer = document.querySelector('._59v1');
        if (chatTabContainer) {
            this.mutationObserver.observe(chatTabContainer, options);
        } else {
            // Is on messenger page
            // TODO on messenger page
        }
    }
}