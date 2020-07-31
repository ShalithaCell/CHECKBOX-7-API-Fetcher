const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Authenticate } = require('./app');

var Token = "",
    userId = "";


if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  await mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
  // const data = await Authenticate();
  // Token = data.access_token;
};

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


ipcMain.on('product:add', async (event, values) => {
  console.log(values);
})
