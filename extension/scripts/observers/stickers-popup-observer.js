import { createStickerTabContainerElement } from '../stickers-tab-bar'
import { ChatTabContainerSelector } from '../constants';
import { DataAppendedStickersTabAttribute } from '../constants';

export class StickersPopupObserver {
    constructor() {
        this.mutationObserver = new MutationObserver(stickersPopupHandler);

        function stickersPopupHandler(mutations, observer) {
            let stickerPopupElement = document.querySelector('.l9j0dhe7.ama3r5zh');
            let existingStickerTabContainer = document.querySelector('.sticker-tab-container');

            if (stickerPopupElement 
                && existingStickerTabContainer === null) {
                let parentDivElement = stickerPopupElement.parentElement;

                // [Global]
                let element = createStickerTabContainerElement(stickerGroups, stickerTabContainerTopPopupTemplate);
                parentDivElement.prepend(element);
            }
        }
    }

    observe() {
        let options = {
            childList: true, 
            subtree: true 
        };

        let chatTabContainer = document.querySelector(ChatTabContainerSelector);
        if (chatTabContainer) {
            this.mutationObserver.observe(chatTabContainer, options);
        }
    }
}