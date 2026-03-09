const express = require('express');
const cors = require('cors'); 
const { google } = require('googleapis');
const path = require('path');
const app = express();

app.use(cors()); 
app.use(express.json());

// This tells the server to look INSIDE your subfolder for CSS and JS files
app.use(express.static(path.join(__dirname, 'integ_prog_2526')));

const spreadsheetId = '1bnPLt_4a4A9-GzO4MA8iREd_ay3UdLIBkr4a8wPwOXE';

// Ensure 'credentials.json' is in your MAIN project folder
const KEY_PATH = path.join(__dirname, 'credentials.json'); 

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// This points the "Home" page directly to your index file inside the subfolder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'integ_prog_2526', 'index.html'));
});

app.post('/export-tasks', async (req, res) => {
    try {
        const sheets = google.sheets({ version: 'v4', auth });
        
        const values = [
            ['Task ID', 'Task Name', 'Status'],
            ['1', 'Test Task', 'Pending']
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A1', 
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        res.status(200).send('Success');
    } catch (error) {
        console.error('Detailed Server Error:', error);
        res.status(500).send(error.message);
    }
});

app.listen(3000, () => {
    console.log('Server is live! Open: http://localhost:3000');
});