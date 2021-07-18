import { OpenStickersMenuButtonObserver } from './observers/open-stickers-menu-button-observer'
import { StickersTabBarObserver } from './observers/stickers-tab-bar-observer'

function initialize() {
    let stickersTabBarObserver = new StickersTabBarObserver();
    stickersTabBarObserver.observe();

    let openStickersMenuButtonObserver = new OpenStickersMenuButtonObserver();
    openStickersMenuButtonObserver.observe();
}

initialize();