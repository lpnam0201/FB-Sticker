import { ChatToolbarObserver } from './observers/chat-toolbar-observer'
import { simulateDragDrop } from './utils'

export function onStickerClick(stickerElement) {
    let dropPanelElement = stickerElement.closest('div.uiContextualLayerPositioner._1r_9.uiLayer')
        .previousElementSibling
        .querySelector('._1ia._2sz2');

    // Should only upload sticker if chat box is empty (no message, no files)
    if (canSendSticker(dropPanelElement)) {
        fetch(stickerElement.src)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                // Upload sticker gif takes a short time, during that time the send button isn't available
                let chatToolBarElement = dropPanelElement.querySelector('._552n');
                let sendButtonObserver = new ChatToolbarObserver();
                sendButtonObserver.observe(chatToolBarElement);

                let file = new File([buffer], 'a.gif', { type: 'image/gif' });
                simulateDragDrop(stickerElement, dropPanelElement, [file]);
            });
    }
}

function canSendSticker(dropPanelElement) {
    // Chat box already has something to send, should not upload extension's sticker
    let sendButton = dropPanelElement.querySelector('._6gb._6wm4._6987');
    return sendButton === null;
}