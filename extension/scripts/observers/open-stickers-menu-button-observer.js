import { ChatTabContainerSelector } from '../constants';
import { ChatWindowSelector } from '../constants';

export class OpenStickersMenuButtonObserver {
    constructor() {
        this.mutationObserver = new MutationObserver(openStickersMenuButtonHandler);

        function openStickersMenuButtonHandler(mutations, observer) {
            let openStickersMenuButtonElements = document
                .querySelector('.rq0escxv.l9j0dhe7.du4w35lb')
                .querySelectorAll(
                    `${ChatWindowSelector}
                    div[aria-label='Choose a sticker']`);

            for (let buttonElement of openStickersMenuButtonElements) {
                let options = {
                    once: true
                }
                buttonElement.addEventListener('click', onOpensStickersMenuButtonClicked, options);
            }
        }

        function onOpensStickersMenuButtonClicked(event) {
            // In context of event handler, "this" refers to the button 
            let buttonElement = this;
            let chatIndex = calculateChatIndex(buttonElement);

            // [Global]
            currentChatIndex = chatIndex;
        }

        function calculateChatIndex(openStickersMenuButtonElement) {
            let chatWindowElement = openStickersMenuButtonElement.closest(ChatWindowSelector);
            let parent = chatWindowElement.parentNode;

            return [...parent.children].indexOf(chatWindowElement);
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