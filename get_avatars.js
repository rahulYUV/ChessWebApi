const ChessWebAPI = require('chess-web-api');
const chessAPI = new ChessWebAPI();
const fs = require('fs');

const players = [
    'magnuscarlsen',
    'hikaru',
    'fabianocaruana',
    'rpragchess',
    'gukeshdommaraju',
    'samayraina',
    'k1_rahul'
];

async function getAvatars() {
    const avatars = {};
    for (const player of players) {
        try {
            const response = await chessAPI.getPlayer(player);
            avatars[player] = response.body.avatar;
        } catch (error) {
            console.error(`Error fetching ${player}:`, error);
        }
    }
    fs.writeFileSync('avatars.json', JSON.stringify(avatars, null, 2));
}

getAvatars();
