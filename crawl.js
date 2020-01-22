const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');

function getStickerImageUrls(pageHtml) {
    let $ = cheerio.load(pageHtml);
    let dataPreview_liTags = $('.FnStickerPreviewItem')
    let dataPreviews = dataPreview_liTags.toArray().map(
        li => JSON.parse($(li).attr('data-preview')));
    dataPreviews.forEach(item => {
        console.log(item.animationUrl);
    });
}

function readMainPageUrls() {
    fs.readFile("urls.txt", 'utf-8', (error, data) => {
        let urls = data.split('\r\n');

        urls.forEach(url => {
            getMainPageHtml(url);
        });
    });
}

function getMainPageHtml(url) {
    https.get(`https://${url}`, res => {
        let data = '';
        res.on('data', chunk => {
            data += chunk;
        })

        res.on('end', () => {
            getStickerImageUrls(data);
        })
    });
}

readMainPageUrls();