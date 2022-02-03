import { SendButtonSelector } from './constants';
import { ChatToolbarObserver } from './observers/chat-toolbar-observer'
import { simulateDragDrop } from './utils'

export function onStickerClick(stickerElement) {
    let dropPanelElement = determineDropPanel();
    
    loadStickerAndDropToPanel(stickerElement, dropPanelElement);
}

function loadStickerAndDropToPanel(stickerElement, dropPanelElement) {
    // Should only upload sticker if chat box is empty (no message, no files)
    if (canSendSticker(dropPanelElement)) {
        fetch(stickerElement.src)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                // Upload sticker gif takes a short time, during that time the send button isn't available
                let chatToolBarElement = dropPanelElement.querySelector('.j83agx80.aovydwv3.pybr56ya.f10w8fjw');
                let lookingForSendButtonObserver = new ChatToolbarObserver();
                lookingForSendButtonObserver.observe(chatToolBarElement);

                let file = new File([buffer], 'a.gif', { type: 'image/gif' });
                simulateDragDrop(stickerElement, dropPanelElement, [file]);
            });
    }
}

function determineDropPanel() {
    // [Global]
    let openStickersButton = currentOpenStickersButton;
    return openStickersButton.closest('.buofh1pr.l9j0dhe7.j83agx80.cbu4d94t');
}

function canSendSticker(dropPanelElement) {
    // Chat box already has something to send, should not upload extension's sticker
    let sendButton = dropPanelElement.querySelector(SendButtonSelector);
    return sendButton === null;
}