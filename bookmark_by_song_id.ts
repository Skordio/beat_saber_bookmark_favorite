import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import BeastSaber from 'beastsaber-api';

const bsapi = new BeastSaber();

/**
 * The main function to run the script.
 * It handles user input, reads data, logs in to Beast Saber, and adds bookmarks.
 */
const main = async () => {
    let beatSaberDirectories:string[] = [];

    try {
        for (const dir of fs.readFileSync('./secrets/beat_saber_dir', 'utf8').split('\r\n')) { 
            if (dir !== '') {
                beatSaberDirectories.push(dir);
            }
        }
    } catch (err) {
        console.error('Please provide the path(s) to the Beat Saber directory(s) by setting /secrets/beat_saber_dir file.');
        return;
    }

    // Attempting to read Beast Saber login credentials from files
    let beastSaberUsername;
    let beastSaberPassword;
    try {
        beastSaberUsername = fs.readFileSync('./secrets/beast_saber_username', 'utf8');
        beastSaberPassword = fs.readFileSync('./secrets/beast_saber_password', 'utf8');
    } catch (err) {
        console.error('Please provide the Beast Saber username and password in the /secrets/beast_saber_username and /secrets/beast_saber_password files.');
        return;
    }

    // Logging into Beast Saber and retrieving user's bookmarked maps
    const cookies = await bsapi.login(beastSaberUsername, beastSaberPassword);
    console.log(`User ${beastSaberUsername} is logged in: ${await bsapi.isLoggedIn()}`)

    let songKey = process.argv[2];

    if (!songKey) {
        console.error('Please provide the song key as the first argument.');
        return;
    }

    let map = await bsapi.getMapByKey(songKey)

    bsapi.bookmarkAdd(map!.id);
};

main();