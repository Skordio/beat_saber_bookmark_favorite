import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import BeastSaber from 'beastsaber-api';

const bsapi = new BeastSaber();

// Function to read the JSON data from the file
const readDataFromFile = async (filePath: string) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
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

const beatSaverMapID = (mapId: string) => {
    return mapId.replace("custom_level_", "");
}

const extractBeastSaberMapKey = (songHashDataKey: string) => {
    let startIndex = songHashDataKey.indexOf("CustomLevels\\");
    startIndex += "CustomLevels\\".length;
    let endIndex = startIndex;
    let char = songHashDataKey.charAt(endIndex);
    while (char !== ' ') {
        endIndex++;
        char = songHashDataKey.charAt(endIndex);
    }
    return songHashDataKey.substring(startIndex, endIndex);

}

const beastSaberMapKey = (songHashData: any, beatSaverMapID: string) => {
    for (const key in songHashData) {
        if (songHashData[key].songHash === beatSaverMapID) {
            return extractBeastSaberMapKey(key);
        }
    }
    return 'Not Found';
}

const main = async () => {
    // Process command line arguments
    const usernameFlagIndex = process.argv.indexOf('--username');
    const username = usernameFlagIndex !== -1 ? process.argv[usernameFlagIndex + 1] : undefined;
    const beatSaberDirectoryFlagIndex = process.argv.indexOf('--beatsaber-dir');
    let beatSaberDirectory = beatSaberDirectoryFlagIndex !== -1 ? process.argv[beatSaberDirectoryFlagIndex + 1] : undefined;
    if (!beatSaberDirectory) {
        try {
            beatSaberDirectory = fs.readFileSync('./secrets/beat_saber_dir', 'utf8');
        } catch (err) { 
            console.error('Please provide the path to the Beat Saber directory using the --beatsaber-dir flag or set beat saber path in /info/beat_saber_dir file.');
            return;
        }
    }

    const homeDirectory = getHomeDirectory(username);
    const playerDataFilePath = path.join(homeDirectory, 'AppData\\LocalLow\\Hyperbolic Magnetism\\Beat Saber\\PlayerData.dat');
    const songHashDataFilePath = path.join(beatSaberDirectory, 'UserData\\SongCore\\SongHashData.dat');

    // console.log(songHashDataFilePath)

    const playerData = await readDataFromFile(playerDataFilePath);
    const songHashData = await readDataFromFile(songHashDataFilePath);

    // console.log(playerData.localPlayers[0].favoritesLevelIds)
    
    for (const levelId of playerData.localPlayers[0].favoritesLevelIds) {
        let bSaberMapKey = beastSaberMapKey(songHashData, beatSaverMapID(levelId));
        if (bSaberMapKey !== 'Not Found') {
            console.log(bSaberMapKey);
            break;
        }
    }
    // let mapId = beatSaverMapID(playerData.localPlayers[0].favoritesLevelIds[0])
    // let bSaberMapKey = beastSaberMapKey(songHashData, mapId);
    
    // console.log(bSaberMapKey);
    // let map = await bsapi.getMapByKey('1dd');
    
    // console.log(map);
};

main();
