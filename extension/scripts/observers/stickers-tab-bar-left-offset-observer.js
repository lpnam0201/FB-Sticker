import { setDisplayNavigationButtons } from '../navigation-buttons'

export class StickersTabBarLeftOffsetObserver {
    constructor() {
        this.mutationObserver = new MutationObserver(stickersTabBarLeftOffsetMutationsHandler);

        function stickersTabBarLeftOffsetMutationsHandler(mutations, observer) {
            // watch for style so there should be only one change at a time
            let mutationRecord = mutations[0];
            let stickersTabBar = mutationRecord.target;
        
            setDisplayNavigationButtons(stickersTabBar);
        }
    }

    observe(stickersTabBar) {
        let options = {
            attributeFilter: ['style'],
            attributes: true
        }
    
        this.mutationObserver.observe(stickersTabBar, options);
    }

    disconnect() {
        this.mutationObserver.disconnect();
    }
}