const { google } = require('googleapis');
const path = require("path");
const PDFParser = require("pdf2json");
const fs = require("fs");

const keyPath = path.join(__dirname, "../../key.json");

const getCreds = async () => {
    try {
        return await google.auth.getClient({
            keyFile: keyPath,
            scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/analytics']
        });

    } catch (e) {
        console.log("Error while getting the credentials for google apis.");
        return undefined;
    }
};