const fs = require('fs');
const path = require('path');

let dbPath = path.resolve(__dirname, 'meowio.db')
console.log(dbPath);

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbPath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);

( async () => 
{

  console.log("Loading cat facts...")
  const data = fs.readFileSync(path.resolve(__dirname, "catfacts.txt"), 'utf8');
  const lines = data.split("\n");

  db.serialize(function() {
    console.log("Creating tables...")
    db.run("CREATE TABLE facts (info TEXT)");
    db.run("CREATE TABLE votes (catId INT, votes INT)");
    db.run("CREATE TABLE cats (img TEXT)");
 
    console.log("Loading facts....");
    // Load facts
    db.run("begin transaction");
    var stmt = db.prepare("INSERT INTO facts VALUES (?)");
    for( var line of lines ) {
      line=line.substring(1, line.length-2);
      stmt.run(line);
    }
    stmt.finalize();
    db.run("commit");
 
    console.log("Reading facts...")
    db.each("SELECT rowid AS id, info FROM facts", function(err, row) {
        console.log(`${row.id} ${row.info}`);
    });
  });

  db.serialize(function()
  {
    console.log("Loading votes...")
    db.run("begin transaction");
    var stmt = db.prepare("INSERT INTO votes VALUES (?,?)");
    let id = 1;
    for( var line of lines )
    {
      stmt.run(id++, 1);
    }
    stmt.finalize();
    db.run("commit");
    console.log("Loaded votes.")
  });
 
  db.close(function()
  {
    console.log("DB created");
  });

})();
