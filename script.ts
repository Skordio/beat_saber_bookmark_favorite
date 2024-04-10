import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import BeastSaber from 'beastsaber-api';

const bsapi = new BeastSaber();

// Function to read the JSON data from the file
const readDataFromFile = (filePath: string) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        console.log(jsonData);
    } catch (err) {
        console.error('Error reading the file:', err);
    }
};

// Determine the user's home directory based on a provided username or the current user
const getHomeDirectory = (username?: string) => {
    if (username) {
        // This is a basic way to construct the path and might need adjustments based on your OS
        return `C:\\Users\\${username}`;
    } else {
        return os.homedir();
    }
};

const main = () => {
    // Process command line arguments
    const usernameFlagIndex = process.argv.indexOf('--username');
    const username = usernameFlagIndex !== -1 ? process.argv[usernameFlagIndex + 1] : undefined;

    const homeDirectory = getHomeDirectory(username);
    const filePath = path.join(homeDirectory, 'AppData\\LocalLow\\Hyperbolic Magnetism\\Beat Saber\\PlayerData.dat');

    readDataFromFile(filePath);
};

main();
