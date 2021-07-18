import { htmlToElement, getElementLeftOffsetFromInlineStyle, scrollStickersTabBar } from './utils'

export function insertNavigationButtons(stickersTabBar) {
    // Construct custom navigation button
    let navigationButtonParentElement = stickersTabBar.closest('._5r85');
    let fbAddStickerButton = navigationButtonParentElement.querySelector('._5r86');
    
    let previousButtonElement = createPreviousTabsButtonElement(stickersTabBar)
    navigationButtonParentElement.prepend(previousButtonElement);
    let nextButtonElement = createNextTabsButtonElement(stickersTabBar);
    navigationButtonParentElement.insertBefore(nextButtonElement, fbAddStickerButton.nextElementSibling);
}

export function setDisplayNavigationButtons(stickersTabBar) {
    let navigationButtonParentElement = stickersTabBar.closest('._5r85');
    let previousButtonElement = navigationButtonParentElement.querySelector('._37wu.previous-stickers');
    let nextButtonElement = navigationButtonParentElement.querySelector('._37wv.next-stickers');

    let leftOffset = getElementLeftOffsetFromInlineStyle(stickersTabBar);
    setDisplayPreviousButton(previousButtonElement, leftOffset);
    setDisplayNextButton(nextButtonElement, leftOffset, stickersTabBar.offsetWidth);
}

function setDisplayPreviousButton(button, leftOffset) {
    if (button) {
        // reached start, should not show previous button
        if (leftOffset === 0) {
            button.setAttribute('style', 'display:none')
        } else {
            button.removeAttribute('style');
        }
    }
}

function setDisplayNextButton(button, leftOffset, stickersTabBarWidth) {
    if (button) {
        // reached end, should not show next button 
        // remaining width is less than 210, should not show next button
        if (Math.abs(leftOffset) + 210 === stickersTabBarWidth) {
            button.setAttribute('style', 'display:none');
        } else {
            button.removeAttribute('style');
        }
    }
}

function createPreviousTabsButtonElement(stickersTabBar) {
    // [Global]
    let element = htmlToElement(Mustache.render(previousTabsButtonTemplate, {
        extensionUrl: extensionUrl
    }));
    element.classList.add('previous-stickers');

    element.onclick = function() {
        let currentLeftOffset = getElementLeftOffsetFromInlineStyle(stickersTabBar);

        let remaining = Math.abs(currentLeftOffset);
        let leftOffset = remaining < 210 ? 0 : currentLeftOffset + 210;
        scrollStickersTabBar(stickersTabBar, leftOffset);
    }

    return element;
}

function createNextTabsButtonElement(stickersTabBar) {
    // [Global]
    let element = htmlToElement(Mustache.render(nextTabsButtonTemplate, {
        extensionUrl: extensionUrl
    }));
    element.classList.add('next-stickers');

    element.onclick = function() {
        let currentLeftOffset = getElementLeftOffsetFromInlineStyle(stickersTabBar);

        let barWidth = stickersTabBar.offsetWidth;
        let remainingWidth = barWidth - Math.abs(currentLeftOffset) - 210;
        let leftOffset = remainingWidth < 210 
            ? currentLeftOffset - remainingWidth 
            : currentLeftOffset - 210;
        scrollStickersTabBar(stickersTabBar, leftOffset);
    }

    return element;
}