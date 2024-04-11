import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import BeastSaber from 'beastsaber-api';

const bsapi = new BeastSaber();

/**
 * Asynchronously reads JSON data from a specified file path.
 * 
 * @param {string} filePath The path to the file.
 * @returns Parsed JSON data from the file or undefined if an error occurs.
 */
const readDataFromFile = async (filePath: string) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading the file:', err);
    }
};

/**
 * Determines the home directory path based on a provided username or the current user.
 * 
 * @param {string} [username] Optional. The username to construct the path for.
 * @returns The path to the user's home directory.
 */
const getHomeDirectory = (username?: string) => {
    if (username) {
        // Constructs the path using the provided username, mainly for Windows paths.
        return `C:\\Users\\${username}`;
    } else {
        // Defaults to the current user's home directory if no username is provided.
        return os.homedir();
    }
};

/**
 * Formats a Beat Saber map ID by removing a specific prefix.
 * 
 * @param {string} mapId The original map ID.
 * @returns The formatted map ID.
 */
const beatSaverMapID = (mapId: string) => {
    return mapId.replace("custom_level_", "");
}

/**
 * Extracts the Beast Saber map key from a song hash data key.
 * 
 * @param {string} songHashDataKey The song hash data key.
 * @returns The Beast Saber map key.
 */
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

/**
 * Finds the Beast Saber map key corresponding to a given Beat Saber map ID.
 * 
 * @param {any} songHashData The song hash data.
 * @param {string} beatSaverMapID The Beat Saber map ID.
 * @returns The Beast Saber map key or 'Not Found' if not found.
 */
const beastSaberMapKey = (songHashData: any, beatSaverMapID: string) => {
    for (const key in songHashData) {
        if (songHashData[key].songHash === beatSaverMapID) {
            return extractBeastSaberMapKey(key);
        }
    }
    return 'Not Found';
}

/**
 * The main function to run the script.
 * It handles user input, reads data, logs in to Beast Saber, and adds bookmarks.
 */
const main = async () => {
    // Processing command line arguments for username and Beat Saber directory
    const usernameFlagIndex = process.argv.indexOf('--username');
    const username = usernameFlagIndex !== -1 ? process.argv[usernameFlagIndex + 1] : undefined;
    const beatSaberDirectoryFlagIndex = process.argv.indexOf('--beatsaber-dir');
    let beatSaberDirectory = beatSaberDirectoryFlagIndex !== -1 ? process.argv[beatSaberDirectoryFlagIndex + 1] : undefined;

    // Attempting to read the Beat Saber directory from a file if not provided via command line
    if (!beatSaberDirectory) {
        try {
            beatSaberDirectory = fs.readFileSync('./secrets/beat_saber_dir', 'utf8');
        } catch (err) { 
            console.error('Please provide the path to the Beat Saber directory using the --beatsaber-dir flag or set beat saber path in /info/beat_saber_dir file.');
            return;
        }
    }

    // Attempting to read Beast Saber login credentials from files
    let beastSaberUsername;
    let beastSaberPassword;
    try {
        beastSaberUsername = fs.readFileSync('./secrets/beast_saber_username', 'utf8');
        beastSaberPassword = fs.readFileSync('./secrets/beast_saber_password', 'utf8');
    } catch (err) {
        console.error('Please provide the Beast Saber username and password in the /info/beast_saber_username and /info/beast_saber_password files.');
        return;
    }

    // Logging into Beast Saber and retrieving user's bookmarked maps
    const cookies = await bsapi.login(beastSaberUsername, beastSaberPassword);
    console.log(`User ${beastSaberUsername} is logged in: ${await bsapi.isLoggedIn()}`)

    const userBookmarks = await bsapi.getBookmarkedBy(beastSaberUsername);
    const userBookmarkIds = userBookmarks.maps.map((map) => map.id);

    // Constructing file paths and reading player and song hash data
    const homeDirectory = getHomeDirectory(username);
    const playerDataFilePath = path.join(homeDirectory, 'AppData\\LocalLow\\Hyperbolic Magnetism\\Beat Saber\\PlayerData.dat');
    const songHashDataFilePath = path.join(beatSaberDirectory, 'UserData\\SongCore\\SongHashData.dat');


    const playerData = await readDataFromFile(playerDataFilePath);
    const songHashData = await readDataFromFile(songHashDataFilePath);

    // Iterating over the player's favorite levels, bookmarking any not already bookmarked
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