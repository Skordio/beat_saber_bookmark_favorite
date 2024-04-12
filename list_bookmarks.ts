import * as fs from 'fs';


const main = async () => {
    let beastSaberUsername;
    try {
        beastSaberUsername = fs.readFileSync('./secrets/beast_saber_username', 'utf8');
    } catch (err) {
        console.error('Please provide the Beast Saber username in the /secrets/beast_saber_username file.');
        return;
    }

    const open = (await import('open')).default;
    open(`https://bsaber.com/songs/new/?bookmarked_by=${beastSaberUsername}`);


};

main();