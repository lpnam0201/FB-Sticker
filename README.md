# FB-Sticker

This extension allows you to use images from your own computer as Facebook stickers.

# Demo
![alt-text](https://github.com/lpnam0201/FB-Sticker/blob/master/README/whatitdoes.gif)

# Installation
Download the extension from: https://github.com/lpnam0201/FB-Sticker/releases/download/v1.0.1/fb-sticker-1.0.1.zip  
Go to chrome://extensions  
Turn on "Developer mode"  
Click "Load unpacked"  
Choose the `dist` folder (the one with `manifest.json`)  
Reload Facebook page

# Add your own images
Create a new folder (`myImage`, for example) in \dist\stickers  
Put your images in `myImage`  
Go to chrome://extensions  
Reload this extension  
Reload Facebook page  

# Development
Navigate to \FB Sticker\extension  
Execute `npm run build`  
Build result is in \FB Sticker\extension\dist  

# How it works 
The extension uses `MutationObserver` to watch for DOM changes of your chat popup & sticker toolbar.  
It will then constructs its grid of stickers and appends to Facebook's sticker toolbar.  
When you click your custom sticker, it will simulate a drag-and-drop event, then a click event on your chat submit button to upload the image.  
Essentially it acts as if you're dragging an image to your chat window and click submit.  
I also uploaded some tools I used to scrap images, convert them to gif, normalize to square shape and some minor processing to get usable stickers.

# Note:
To add custom images, you need to access the extension folder itself.  
Therefore I don't think it will ever be installable from official Chrome extension store.  
The extension is hack-ish and relies heavily on Facebook's DOM structure & CSS classes.  
It was broken once after Facebook updated their UI (2020 I think?) and I expect it will be broken again in the future. 
In that case please report a bug so I'll have a look.
