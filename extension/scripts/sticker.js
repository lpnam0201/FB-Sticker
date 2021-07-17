import { SendButtonSelector } from './constants';
import { ChatToolbarObserver } from './observers/chat-toolbar-observer'
import { simulateDragDrop } from './utils'

export function onStickerClick(stickerElement) {
    let dropPanelElement = stickerElement.closest('div.l9j0dhe7.tkr6xdv7')
        .querySelector('.rq0escxv.buofh1pr.l9j0dhe7.j83agx80.cbu4d94t');
    // Should only upload sticker if chat box is empty (no message, no files)
    if (canSendSticker(dropPanelElement)) {
        fetch(stickerElement.src)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                // Upload sticker gif takes a short time, during that time the send button isn't available
                let chatToolBarElement = dropPanelElement.querySelector('.j83agx80.l9j0dhe7.aovydwv3.ni8dbmo4.stjgntxs.nred35xi.n8tt0mok.hyh9befq');
                let lookingForSendButtonObserver = new ChatToolbarObserver();
                lookingForSendButtonObserver.observe(chatToolBarElement);

                let file = new File([buffer], 'a.gif', { type: 'image/gif' });
                simulateDragDrop(stickerElement, dropPanelElement, [file]);
            });
    }
}

function canSendSticker(dropPanelElement) {
    // Chat box already has something to send, should not upload extension's sticker
    let sendButton = dropPanelElement.querySelector(SendButtonSelector);
    return sendButton === null;
}