import { SendButtonSelector } from '../constants';

export class ChatToolbarObserver {
    constructor() {
        this.mutationObserver = new MutationObserver(sendButtonMutationsHandler);

        function sendButtonMutationsHandler(mutations, observer) {
            for (let mutation of mutations) {
                let nodes = mutation.addedNodes.values();
                for (let node of nodes) {
                    const sendButtonWrapperClassName = 'tojvnm2t a6sixzi8 abs2jz4q a8s20v7p t1p8iaqh k5wvi7nf q3lfd5jv pk4s997a bipmatt0 cebpdrjk qowsmv63 owwhemhu dp1hu0rb dhp61c6y iyyx5f41';
                    if (node.className === sendButtonWrapperClassName) {
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