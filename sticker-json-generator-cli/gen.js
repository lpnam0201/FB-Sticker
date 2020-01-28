const fs = require('fs');

const args = process.argv.slice(2);
let sourceDir = args[0];
let destinationDir = args[1];

fs.readdir(sourceDir, (err, dirs) => {
    let stickerGroups = [];
    let id = 0;
    let promises = [];
    
    for (let dir of dirs) {
        promises.push(readDirPromise(`${sourceDir}\\${dir}`)
            .then(files => {
                id++;
                let stickerGroup = buildStickerGroup(files, dir, id);
                stickerGroups.push(stickerGroup);
                console.log(`Found ${files.length} files in ${__dirname}/${dir}`)
            }));
    }
    
    Promise.all(promises)
        .then(() => {
            fs.writeFile(`${destinationDir}/stickers.json`, JSON.stringify(stickerGroups), () => {
                console.log('Done');
            });
        })
});

function findGroupThumbnail(files, groupThumbnailFileName) {
    return files.find(f => f.indexOf(groupThumbnailFileName) !== -1);
}

function buildStickerGroup(files, dir, id) {
    let groupThumbnailFileName = 'groupThumbnail';

    let stickerGroup = {
        groupId: id,
        groupName: dir,
        groupThumbnail: findGroupThumbnail(files, groupThumbnailFileName) || '',
        stickers: []
    }
    
    for (let sticker of files) {
        // skip group thumbnail
        if (sticker.indexOf(groupThumbnailFileName) === -1) {
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