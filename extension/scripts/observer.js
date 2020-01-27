



function initialize() {
    let chatTabObserver = new MutationObserver((mutationList, observer) => {
        var stickersContainerDiv = document.querySelector('div[aria-label=Stickers] > div > div > div > div');
        chrome.runtime.getURL('')
    });
    let config = {
        attributeFilter: [],
        childList: true, 
        subtree: true 
    };
    
    var chatTabContainer = document.getElementsByClassName('_59v1')[0];
    if (chatTabContainer) {
        chatTabObserver.observe(chatTabContainer, config);
    } else {
        // Is on messenger page
        // TODO on messenger page
    }
    
}
//initialize();