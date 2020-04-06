const path = require('path');

let dbPath = path.resolve(__dirname, 'meowio.db')

var sqlite3 = require('sqlite3').verbose();

class Db
{

    cat(img)
    {
        return new Promise(function(resolve,reject)
        {
            var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);
            db.serialize(function() 
            {
                let stmt = db.prepare("INSERT INTO cats VALUES (?)");
                stmt.run(img);
                stmt.finalize();
            });
            db.close(function()
            {
                resolve('Ok');
            });
        });
    }

    recentCats(n)
    {
        return new Promise(function(resolve,reject)
        {
            let results = [];

            var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);
            db.serialize(function() 
            {
                let query = 
                `SELECT * FROM cats ORDER BY rowid DESC LIMIT ${n}`;
                db.each(query, function(err, row) {
                    results.push( row.img );
                });
            });
            
            db.close(function()
            {
                resolve(results);
            });

        });
    }

    vote(id, upOrDown)
    {
        return new Promise(function(resolve,reject)
        {
            var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);
            db.serialize(function() 
            {
                let stmt = db.prepare("INSERT INTO votes VALUES (?,?)");
                stmt.run(id, upOrDown);
                stmt.finalize();
            });
            db.close(function()
            {
                resolve();
            });
        });
    }

    votes()
    {
        return new Promise(function(resolve,reject)
        {
            let results = [];

            var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);
            db.serialize(function() 
            {
                let query = 
                `SELECT facts.info, SUM(votes.votes) as votes
                FROM facts  
                INNER JOIN votes on votes.catId = facts.rowid
                GROUP BY facts.rowid
                ORDER BY votes DESC
                `;
                db.each(query, function(err, row) {
                    // console.log(`${row.info} ${row.votes}`);
                    results.push( {fact: row.info, votes: row.votes} );
                });
            });
            
            db.close(function()
            {
                resolve(results);
            });

        });
    }
}

module.exports = new Db();