const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite3', (err) => {        
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the database.');

    // create a table to hold a queue of twitch clip id's to be played
    console.log('Creating queue table if its missing.');

    db.run(`CREATE TABLE IF NOT EXISTS queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE
    )`, (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    // clear out the queue table
    const clearQueue = db.prepare('DELETE FROM queue');
    clearQueue.on('error', (err) => {
        console.error(err.message);
    });

    clearQueue.run();
    clearQueue.finalize();
    console.log('Queue table cleared');

});

function addClip(slug) {        
    console.log(`Inserting clip ${slug} into the queue.`);

    db.run(`INSERT INTO queue (slug) VALUES (?)`, [slug], function(err) {
        if (err) {            
            console.error(err.message);
        }
    });

}

function removeClip(slug) {
    console.log(`Deleting clip ${slug} from the queue.`);

    db.run(`DELETE FROM queue WHERE slug = ?`, [slug], function(err) {
        if (err) {
            console.error(err.message);
        }
    });

}

function getClips(callback) {
    const sql = `SELECT * FROM queue`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        callback(rows);
    });
}


module.exports = db;
module.exports.addClip = addClip;
module.exports.removeClip = removeClip;
module.exports.getClips = getClips;

