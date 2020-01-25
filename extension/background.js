chrome.browserAction.onClicked.addListener(() => { 
    chrome.runtime.getPackageDirectoryEntry(root => {
        root.getFile('18526629.gif', {}, fileEntry => {
            fileEntry.file(file => {
                let formData = new FormData();
                formData.append('upload_1031', file);

                let xhr = new XMLHttpRequest();
                xhr.onerror = e => console.log(e);
                xhr.open('POST', '');

                xhr.setRequestHeader('Content-Type', 'multipart/form-data');
                xhr.setRequestHeader('x-msgr-region', 'ASH')
                xhr.send(formData);
            })
        })
    })
});

chrome.webRequest.onBeforeRequest.addListener(detail => {
    if (detail.url === 'https://static.xx.fbcdn.net/rsrc.php/v3/yV/r/BMLgpfAhWGt.js?_nc_x=uK4Q5_mHvx4') {
        return { redirectUrl: chrome.extension.getURL('BMLgpfAhWGt.js') };
    }
}, { urls: ['<all_urls>']}, ['blocking']);