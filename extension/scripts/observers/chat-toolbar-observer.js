export class ChatToolbarObserver {
    constructor() {
        this.mutationObserver = new MutationObserver(sendButtonMutationsHandler);

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