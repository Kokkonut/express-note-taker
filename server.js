const express = require('express');
const path = require('path');
const fs = require('fs');
// Helper method for generating unique ids
const uuid = require('./helpers/uuid');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET request for notes --------------------------------------------------------------------------
app.get('/api/notes', (req, res) => {
    // Send DB to the client
    res.sendFile(path.join(__dirname, './db/db.json'))
    // Log our request to the terminal
    console.info(`${req.method} request received to get notes`);
});

// POST request to add a review ----------------------------------------------------------------------
app.post('/api/notes', (req, res) => {

    console.info(`${req.method} request received to add a note`);

    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;

    // If all the required properties are present
    if (title && text) {
        // Variable for the object we will save
        const newNote = {
            id: uuid(),
            title,
            text,

        };

        // Obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // Convert string into JSON object
                const parsedNotes = JSON.parse(data);

                // Add a new review
                parsedNotes.push(newNote);

                // Write updated notes back to the file
                fs.writeFile(
                    './db/db.json',
                    JSON.stringify(parsedNotes, null, 4),
                    (writeErr) =>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully added note!')
                );
            }
        });

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting review');
    }
});


// DELETE Request -----------------------------------------------------------------
app.delete('/api/notes/:id', (req, res) => {
    console.info(`${req.method} request received`);
    const id = req.params.id;
    console.info(id);

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedNotes = JSON.parse(data);

            for (let i = 0; i < parsedNotes.length; i++) {
                const currentNote = parsedNotes[i];
                if (currentNote.id === id) {
                    res.json('note has been deleted');
                    parsedNotes.splice(i, 1);
                    fs.writeFile('./db/db.json',
                        JSON.stringify(parsedNotes, null, 4),
                        (writeErr) =>
                            writeErr
                                ? console.error(writeErr)
                                : console.info('Successfully deleted note!'))
                }
            }
        }


    })

});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} ????`)
);
