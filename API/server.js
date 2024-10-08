const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for requests from the frontend
app.use(cors());
app.use(express.json());

app.post('/scan', (req, res) => {
    const target = req.body.target;  // Get target from the POST request body
    console.log("POST")
    if (!target) {
        return res.status(400).json({ error: 'No target specified' });
    }

    // Run the nmap command
    const nmap = spawn('nmap', ['-v', target]);

    // Stream live output to the frontend
    nmap.stdout.on('data', (data) => {
        console.log(`Nmap output: ${data}`);
        res.write(data);  // Send live output to the frontend
    });

    nmap.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.write(data);  // Send any error output
    });

    nmap.on('close', (code) => {
        console.log(`Nmap process exited with code ${code}`);
        res.end();  // Close the response when the process finishes
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
