const express = require('express');
const { spawn, exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Enable CORS for requests from the frontend
app.use(cors());
app.use(express.json());

app.post('/scan', (req, res) => {
    const target = req.body.target;  // Get target from the POST request body
    const type = req.body.type;
    const typeOptions = type.split(' ');

    if (!target) {
        return res.status(400).json({ error: 'No target specified' });
    }

    // Run the nmap command
    const nmap = spawn('nmap', [...typeOptions, '-oX', 'scan.xml', target]);
    console.log("nmap " + type + " " + target);

    // Stream live output to the frontend
    nmap.stdout.on('data', (data) => {
        //console.log(`Nmap output: ${data}`);
        res.write(data);  // Send live output to the frontend
    });

    nmap.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.write(data);  // Send any error output
    });

    // When the Nmap scan finishes
    nmap.on('close', (code) => {
        console.log(`Nmap process exited with code ${code}`);

        if (code === 0) {
            // Execute the converter script
            exec('node converter.js', (convError, convStdout, convStderr) => {
                if (convError) {
                    console.error(`Converter error: ${convError}`);
                    res.status(500).send('Conversion failed');
                    return;
                }

                console.log(`Conversion completed: ${convStdout}`);

                // After the conversion, copy the data.json to src/components
                const sourceFile = path.join(__dirname, 'data.json');
                const destinationFile = path.join(__dirname, '..', 'src', 'components', 'data.json');

                fs.copyFile(sourceFile, destinationFile, (copyError) => {
                    if (copyError) {
                        console.error(`File copy error: ${copyError}`);
                        res.status(500).send('File copy failed');
                        return;
                    }

                    console.log('data.json successfully copied to src/components');
                    res.end('Scan, conversion, and file copy completed');
                });
            });
        } else {
            res.status(500).send(`Nmap process exited with code ${code}`);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
