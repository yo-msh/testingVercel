const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
app.set("view engine", 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get('/', function (req, res) {
    fs.readdir('./files', function (err, files) {
        if (err) {
            console.error("Error reading files:", err);
            return res.status(500).send("Internal Server Error");
        }
        res.render('index', { files: files });
    });
});

// This will show the data in Read section
app.get('/file/:filename', function (req, res) {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", function (err, filedata) { 
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send("Internal Server Error");
        }
        res.render('show', { filename: req.params.filename, filedata: filedata });
    });
});

// For fetching the data and filename in edit section
app.get('/edit/:filename', function (req, res) {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", function (err, filedata) {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send("Internal Server Error"); 
        }
        res.render('edit', { filename: req.params.filename, filedata: filedata });
    });
});

// For changing the name of task and filename
app.post('/edit', function (req, res) {
    const oldFileName = req.body.previous;
    let newFileName = oldFileName;
    if (req.body.updated) {
        newFileName = req.body.updated.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + '.txt';

        // Rename the file
        fs.rename(`./files/${oldFileName}`, `./files/${newFileName}`, function (err) {
            if (err) {
                console.error("Error renaming file:", err);
                return res.status(500).send("Internal Server Error");
            }
        });
    }

    // Check if new data is provided and update the file content
    if (req.body.updated_data) {
        fs.writeFile(`./files/${newFileName}`, req.body.updated_data, function (err) {
            if (err) {
                console.error("Error updating file content:", err);
                return res.status(500).send("Internal Server Error");
            }
        });
    }

    // Redirect to the home page
    res.redirect('/');
});

// For assigning name of task and task data
app.post('/create', function (req, res) {
    const fileName = req.body.title.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('') + '.txt';

    fs.writeFile(`./files/${fileName}`, req.body.details, function (err) {
        if (err) {
            console.error("Error writing file:", err);
            return res.status(500).send("Internal Server Error");
        }
        res.redirect("/");
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
