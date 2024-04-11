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

    let beastSaberUsername;
    let beastSaberPassword;

    try {
        beastSaberUsername = fs.readFileSync('./secrets/beast_saber_username', 'utf8');
        beastSaberPassword = fs.readFileSync('./secrets/beast_saber_password', 'utf8');
    } catch (err) {
        console.error('Please provide the Beast Saber username and password in the /info/beast_saber_username and /info/beast_saber_password files.');
        return;
    }

    const cookies = await bsapi.login(beastSaberUsername, beastSaberPassword);
    console.log(`User ${beastSaberUsername} is logged in: ${await bsapi.isLoggedIn()}`)

    const userBookmarks = await bsapi.getBookmarkedBy(beastSaberUsername);
    const userBookmarkIds = userBookmarks.maps.map((map) => map.id);


    const homeDirectory = getHomeDirectory(username);
    const playerDataFilePath = path.join(homeDirectory, 'AppData\\LocalLow\\Hyperbolic Magnetism\\Beat Saber\\PlayerData.dat');
    const songHashDataFilePath = path.join(beatSaberDirectory, 'UserData\\SongCore\\SongHashData.dat');


    const playerData = await readDataFromFile(playerDataFilePath);
    const songHashData = await readDataFromFile(songHashDataFilePath);

    
    for (const levelId of playerData.localPlayers[0].favoritesLevelIds) {
        let bSaberMapKey = beastSaberMapKey(songHashData, beatSaverMapID(levelId));
        if (bSaberMapKey !== 'Not Found') {
            let map = await bsapi.getMapByKey(bSaberMapKey);
            if (map) {
                if (userBookmarkIds.includes(map.id)) {
                    continue;
                }
                let success = await bsapi.bookmarkAdd(map.id);
                if (!success) {
                    console.error(`Failed to add map ${map.title} to Beast Saber bookmarks.`);
                    continue;
                } else {
                    console.log(`Map ${map.title} added to Beast Saber bookmarks.`);
                }
                continue;
            } else {
                console.log(`Map with key ${bSaberMapKey} found on Beast Saber.`);
            }
        }
    }
};

main();
