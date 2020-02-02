import { htmlToElement, chunk } from './utils'
import { onStickerClick } from './sticker';

export function createStickerTabContainerElement(stickerGroups) {
    let html = Mustache.render(stickerTabContainerTemplate);
    let tabContainerElement = htmlToElement(html);

    for (let stickerGroup of stickerGroups) {
        let tabElement = createStickerTabElement(stickerGroup);
        tabContainerElement.appendChild(tabElement);
    }
    
    return tabContainerElement;
}

function createStickerTabElement(stickerGroup) {
    let html = Mustache.render(stickerTabTemplate, {
        stickerGroupId: stickerGroup.groupId,
        stickerGroupName: stickerGroup.groupName,
        stickerGroupImage: stickerGroup.groupThumbnail
    });

    let tabElement = htmlToElement(html);

    return tabElement;
}

export function attachOnClickSaveStickerGroupIdExtensionTab(stickersTabBar) {
    let extensionTabs = stickersTabBar.querySelectorAll('.fbExtensionTab');
    extensionTabs.forEach(extensionTab => {
        extensionTab.addEventListener('click', () => {
            // To display the same extension tab the next time sticker popup is opened
            let stickerGroupdId = extensionTab.getAttribute('data-id');
            localStorage.setItem('selectedStickerGroupId', stickerGroupdId);
        })
    });
}

export function attachOnClickShowStickersTableExtensionTab(stickersTabBar) {
    let extensionTabs = stickersTabBar.querySelectorAll('.fbExtensionTab');
    extensionTabs.forEach(extensionTab => {
        extensionTab.addEventListener('click', () => {
            let groupId = extensionTab.getAttribute('data-id');
            let stickerGroup = stickerGroups.find(sg => sg.groupId === groupId)
    
            let tableElement = createStickersTableElement(stickerGroup);
            let tableContainerElement = stickersTabBar.closest('._5r8e')
                .nextElementSibling
                .querySelector('._5r8l');
    
            // FB's default container should NEVER be removed (React error)
            // but should be pushed down out of view
            // Can't simply prepend <table> because search tab
            // doesn't have table container <div> like sticker tabs
            tableContainerElement.prepend(tableElement);
            attachOnClickUploadToStickerImages(tableElement);
            
            // To init scroll for the *newly* inserted table
            Scrollbar.initAll();
        })
    })
}

function attachOnClickUploadToStickerImages(tableElement) {
    let stickerImages = tableElement.querySelectorAll('.fbExtensionImage');
    stickerImages.forEach(stickerImage => {
        stickerImage.addEventListener('click', () => {
            onStickerClick(stickerImage);
        })
    })
}

export function attachHighlightOnSelectToStickerTabs(stickersTabBar) {
    let stickerTabs = stickersTabBar.querySelectorAll('._5r8a');
    for (let stickerTab of stickerTabs) {
        stickerTab.addEventListener('click', function() {
            // clear all selected class on all sticker tabs and set select for itself
            stickerTabs.forEach(st => { st.classList.remove('_5r8b') });
            stickerTab.classList.add('_5r8b');
        });
    }
}

export function attachOnClickRemoveLastSelectedStickerGroupIdToFbTabs(stickersTabBar) {
    let fbTabs = stickersTabBar.querySelectorAll('._5r8a:not(.fbExtensionTab)');

    fbTabs.forEach(fbTab => {
        fbTab.addEventListener('click', () => {
            localStorage.removeItem('selectedStickerGroupId');
        });
    });
}

export function attachOnClickRemoveExistingExtensionTableToTabs(stickersTabBar) {
    let tabs = stickersTabBar.querySelectorAll('._5r8a');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            let tableContainerElement = stickersTabBar.closest('._5r8e')
                .nextElementSibling
                .querySelector('._5r8l');
            removeExistingExtensionStickerTable(tableContainerElement);
        })
    })
}

export function setSmoothScrollForStickersTabBar(stickersTabBar) {
    stickersTabBar.classList.add('smooth-scroll');
}

function createStickersTableElement(stickerGroup) {  
    let table = { rows: [] };
    let chunks = chunk(stickerGroup.stickers, 4);
    for (let chunk of chunks) {
        let row = { cells: []};
        for (let sticker of chunk) {
            let cell = { thumbnail: sticker.thumbnail };
            row.cells.push(cell);
        }
        table.rows.push(row);
    }

    let tableElement = htmlToElement(Mustache.render(stickerTableTemplate, table));

    return tableElement;
}

function removeExistingExtensionStickerTable(tableContainerElement) {
    let extensionStickerTables = tableContainerElement.querySelectorAll('.fbExtensionTable');
    extensionStickerTables.forEach(table => tableContainerElement.removeChild(table)); 
}