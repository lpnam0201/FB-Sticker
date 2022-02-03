import { ChatTabContainerSelector } from '../constants';

export class OpenStickersMenuButtonObserver {
    constructor() {
        this.mutationObserver = new MutationObserver(openStickersMenuButtonHandler);

        function openStickersMenuButtonHandler(mutations, observer) {
            let openStickersMenuButtonElements = document
                .querySelector('.rq0escxv.l9j0dhe7.du4w35lb')
                .querySelectorAll(
                    `div[aria-label='Choose a sticker']`);

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

            // [Global]
            currentOpenStickersButton = buttonElement;
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