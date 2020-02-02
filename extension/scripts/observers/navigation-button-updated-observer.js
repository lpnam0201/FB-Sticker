export class NavigationButtonUpdatedObserver {
    
    constructor() {
        this.mutationObserver = new MutationObserver(navigationButtonUpdatedMutationsHandler);

        function navigationButtonUpdatedMutationsHandler(mutations, observer) {
            // This observer is only used to observe one node so it's safe to get its target at [0]
            let node = mutations[0].target;
        
            // Hide FB's default navigation next, prev buttons
            let fbNavigationButtonElements = node
                .querySelectorAll('._37wv:not(.next-stickers), ._37wu:not(.previous-stickers)');
            fbNavigationButtonElements.forEach(button => { button.setAttribute('style', 'display:none') });
        }
    }

    observe(stickersTabBar) {
        let options = {
            childList: true
        };
    
        let navigationButtonParentElement = stickersTabBar.closest('._5r85');
        this.mutationObserver.observe(navigationButtonParentElement, options);
    }

    disconnect() {
        this.mutationObserver.disconnect();
    }
}