import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
    serve = args.some(val => val === '--serve');

// Function to Create the browser window.
function createWindow() {
  let windWidth = 408;
  let windHeight = 430;
  win = new BrowserWindow({
    center: true,
    show: false,
    width: windWidth,
    height: windHeight,
    frame: true,
    fullscreen:false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation:false,
      sandbox:false
    },
    autoHideMenuBar: true,// false
    useContentSize: true    
  });

    win.loadURL(url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
   win.webContents.on('dom-ready', function() {
    win.show();
    win.focus();
  });
 
   win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {         
      win = null;
    });
 
}
try {

  app.on('ready', ()=>{
    createWindow();
    ipcMain.on('get-screen', (event)=>{
     
      event.returnValue = screen.getPrimaryDisplay().size;
    });
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
