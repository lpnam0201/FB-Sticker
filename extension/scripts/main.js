import { OpenStickersMenuButtonObserver } from './observers/open-stickers-menu-button-observer'
import { StickersTabBarObserver } from './observers/stickers-tab-bar-observer'
import { StickersPopupObserver } from './observers/stickers-popup-observer'

function initialize() {
    let stickersTabBarObserver = new StickersTabBarObserver();
    stickersTabBarObserver.observe();

    let openStickersMenuButtonObserver = new OpenStickersMenuButtonObserver();
    openStickersMenuButtonObserver.observe();

    // Temporary disable sticker bar on top of popup
    // let stickersPopupObserver = new StickersPopupObserver();
    // stickersPopupObserver.observe();
}

initialize();