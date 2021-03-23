//according to:
//https://electronjs.org/docs/tutorial/first-app


let window;
let isQuiting;
let tray;


const { app, BrowserWindow, Tray, Menu, ipcMain, nativeTheme} = require('electron')
//import * as path from 'path';
var path = require('path');

app.on('before-quit', function () {
  isQuiting = true;
});


function createWindow () {

	tray = new Tray(path.join(__dirname, 'logo_fm.png'));
	
	tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Show App', click: function () {
        win.show();
      }
    },
    {
      label: 'Quit', click: function () {
        isQuiting = true;
        app.quit();
      }
    }
  ]));
	
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      toolbar: false
    }
  })
  
  win.on('close', function (event) {
    if (!isQuiting) {
      event.preventDefault();
      win.hide();
      event.returnValue = false;
    }
  });

  // and load the index.html of the app.
  win.loadFile('index_fm.htm');
  win.setMenuBarVisibility(false);
  
  nativeTheme.themeSource = 'light';
  //win.setAutoHideMenuBar(true);
}

app.on('ready', createWindow) 
