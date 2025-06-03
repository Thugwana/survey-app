const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// SQLite DB setup
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS survey (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    contact TEXT,
    age INTEGER,
    date TEXT,
    favourite_food TEXT,
    eat_out INTEGER,
    watch_movies INTEGER,
    watch_tv INTEGER,
    listen_to_radio INTEGER
  )`);
});

// Submit survey
app.post('/submit', (req, res) => {
  const { name, email, age, date, contact, favouriteFood, ratings } = req.body;
  const favFoodString = favouriteFood.join(',');

  db.run(`INSERT INTO survey (name, email, age, date, contact, favourite_food, eat_out, watch_movies, watch_tv, listen_to_radio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, age, date, contact, favFoodString, ...ratings],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.send({ id: this.lastID });
    });
});

// Get results
app.get('/results', (req, res) => {
  db.all('SELECT * FROM survey', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    
    if (rows.length === 0) return res.json({ message: 'No Surveys Available' });

    const total = rows.length;
    const ages = rows.map(r => r.age);
    const avgAge = (ages.reduce((a,b) => a+b) / total).toFixed(1);
    const oldest = Math.max(...ages);
    const youngest = Math.min(...ages);

    const pizzaLovers = rows.filter(r => r.favourite_food.includes('Pizza')).length;
    const pizzaPercent = ((pizzaLovers / total) * 100).toFixed(1);

    const PastaLovers = rows.filter(r => r.favourite_food.includes('Pasta')).length;
    const PastaPercent = ((PastaLovers / total) * 100).toFixed(1);

    const Pap_WorsLovers = rows.filter(r => r.favourite_food.includes('Pap and Wors')).length;
    const Pap_WorsPercent = ((Pap_WorsLovers / total) * 100).toFixed(1);

    const OtherLovers = rows.filter(r => r.favourite_food.includes('Other')).length;
    const OtherPercent = ((OtherLovers / total) * 100).toFixed(1);

  
    const avgEatOut = (rows.reduce((sum, r) => sum + r.eat_out, 0) / total).toFixed(1);
    const avgWatchTv = (rows.reduce((sum, r) => sum + r.watch_tv, 0) / total).toFixed(1);
    const avgRadio = (rows.reduce((sum, r) => sum + r.listen_to_radio, 0) / total).toFixed(1);
    const avgMovies = (rows.reduce((sum, r) => sum + r.watch_movies, 0) / total).toFixed(1);

    res.json({ total, avgAge, oldest, youngest, pizzaPercent, PastaPercent, Pap_WorsPercent, OtherPercent, avgEatOut, avgWatchTv, avgRadio, avgMovies });
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
