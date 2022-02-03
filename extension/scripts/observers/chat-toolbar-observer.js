import { SendButtonSelector } from '../constants';

export class ChatToolbarObserver {
    constructor() {
        this.mutationObserver = new MutationObserver(sendButtonMutationsHandler);

        function sendButtonMutationsHandler(mutations, observer) {
            for (let mutation of mutations) {
                let nodes = mutation.addedNodes.values();
                for (let node of nodes) {
                    const sendButtonWrapperClassNameStartWith = 'tojvnm2t';
                    if (node.className.startsWith(sendButtonWrapperClassNameStartWith)) {
                        observer.disconnect();
                        let sendButtonElement = node.querySelector(SendButtonSelector);
                        sendButtonElement.click();
                        break;
                    }
                }
            }
        }
    }

    observe(chatToolBarElement) {
        let options = {
            childList: true
        }
    
        this.mutationObserver.observe(chatToolBarElement, options);
    }

    disconnect() {
        this.mutationObserver.disconnect();
    }
}