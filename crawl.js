const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');

function getUrlsToCrawl() {
    fs.readFile("urls.txt", 'utf-8', (error, data) => {
        let urls = data.split('\r\n');

        urls.forEach(url => {

            https.get(`https://${url}`, res => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                })

                res.on('end', () => {
                    let $ = cheerio.load(data);
                    let dataPreview_liTags = $('.FnStickerPreviewItem')
                    let dataPreviews = dataPreview_liTags.toArray().map(
                        li => JSON.parse($(li).attr('data-preview')));
                    dataPreviews.forEach(item => {
                        console.log(item.animationUrl);
                    });
                })
            })
        });
    });
}

getUrlsToCrawl();
let options = {};


// http.get()