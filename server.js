const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const readFromFile = util.promisify(fs.readFile);
const noteData = require('./db/db.json')

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// handle requests for html pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

// static middleware
app.use(express.static('public'));

// api get and post requests

app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request recieved for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request recieved to add a note`)

    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };

        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const parsed = JSON.parse(data);
                parsed.push(newNote);
                fs.writeFile('./db/db.json', JSON.stringify(parsed, null, 4), (err) =>
                    err ? console.error(err) : console.info('Data written to db.') 
                );
            }
        })

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.error('Error adding note')
    }
});

// delete method
app.delete('/api/notes/:id', (req, res) => {
    console.info(`${req.method} request recieved for notes`);
    const id = req.params.id

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.err(err);
        } else {
            const parsed = JSON.parse(data);
            for (let i=0; i < noteData.length; i++) {
                if (id === parsed[i].id) {
                    console.info(parsed[i]);
                    parsed.splice(i,1);
                    fs.writeFile('./db/db.json', JSON.stringify(parsed, null, 4), (err) =>
                      err ? console.error(err) : console.info('Item deleted, data written to db.')
                    );
                }
            }
        }
    })
})

app.listen(PORT, () =>
  console.log(`Serving static asset routes at http://localhost:${PORT}`)
);