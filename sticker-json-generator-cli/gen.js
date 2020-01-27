const fs = require('fs');

const args = process.argv;
let stickersDir = args[0];

fs.readdir(stickersDir, (err, dirs) => {
    let stickerGroups = [];
    let id = 0;
    let promises = [];
    
    for (let dir of dirs) {
        promises.push(readDirPromise(`${stickersDir}/${dir}`)
            .then(stickers => {
                id++;
                let stickerGroup = buildStickerGroup(stickers, dir, id);
                stickerGroups.push(stickerGroup);
                console.log(`Found ${stickers.length} stickers in ${__dirname}/${dir}`)
            }));
    }
    
    Promise.all(promises)
        .then(() => {
            fs.writeFile('stickers.json', JSON.stringify(stickerGroups), () => {
                console.log('Done');
            });
        })
});

function buildStickerGroup(stickers, dir, id) {
    let stickerGroup = {
        groupId: id,
        groupName: dir,
        groupThumbnail: 'groupThumbnail.png',
        stickers: []
    }
    
    for (let sticker of stickers) {
        // skip thumbnail png
        if (sticker.indexOf('.gif') !== -1) {
            stickerGroup.stickers.push({
                id: sticker.replace('.gif', ''),
                thumbnail: sticker
            })
        }
    }

    return stickerGroup;
}

function readDirPromise(dir) {
    console.log(dir);
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            } else { 
                resolve(files);
            }
        })
    })
}