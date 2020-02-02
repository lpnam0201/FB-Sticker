import { StickersTabBarObserver } from './observers/stickers-tab-bar-observer'

function initialize() {
    let stickersTabBarObserver = new StickersTabBarObserver();
    stickersTabBarObserver.observe();
}

initialize();