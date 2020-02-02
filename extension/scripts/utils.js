export function simulateDragDrop(sourceNode, destinationNode, files) {
    var EVENT_TYPES = {
        DRAG_END: 'dragend',
        DRAG_START: 'dragstart',
        DROP: 'drop'
    }

    function createCustomEvent(type) {
        var event = new CustomEvent("CustomEvent")
        event.initCustomEvent(type, true, true, null)
        event.dataTransfer = {
            data: {
            },
            setData: function(type, val) {
                this.data[type] = val
            },
            getData: function(type) {
                return this.data[type]
            },
            files: files,
            types: "Files"
        }
        return event
    }

    function dispatchEvent(node, type, event) {
        if (node.dispatchEvent) {
            return node.dispatchEvent(event)
        }
        if (node.fireEvent) {
            return node.fireEvent("on" + type, event)
        }
    }

    var event = createCustomEvent(EVENT_TYPES.DRAG_START)
    dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event)

    var dropEvent = createCustomEvent(EVENT_TYPES.DROP)
    dropEvent.dataTransfer = event.dataTransfer
    dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent)

    var dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END)
    dragEndEvent.dataTransfer = event.dataTransfer
    dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent)
}

export function chunk (arr, len) {
    let chunks = [], i = 0, n = arr.length;
  
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
  
    return chunks;
}

export function getElementLeftOffsetFromInlineStyle(element) {
    let leftPx = element.style.left || '0px';
    return pxToNumber(leftPx);
}

function pxToNumber(px) {
    return parseInt(px.replace('px', ''));
}

export function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

export function scrollStickersTabBar(stickersTabBar, leftOffset) {
    stickersTabBar.setAttribute('style', `left: ${leftOffset}px;`)
}