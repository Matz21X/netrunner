const express = require('express');
const { spawn, exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const os = require('os');
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



// Funktion, um die lokale IP-Adresse und Subnetzmaske zu ermitteln
function getLocalIPAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                return {
                    ip: address.address,
                    subnetMask: address.netmask
                };
            }
        }
    }
    return null;
}

// Funktion, um die Netzadresse zu berechnen
function calculateNetworkAddress(ip, subnetMask) {
    const ipParts = ip.split('.').map(Number);
    const maskParts = subnetMask.split('.').map(Number);

    const networkParts = ipParts.map((part, i) => part & maskParts[i]);
    return networkParts.join('.');
}

// Funktion, um die Subnetzmaske in CIDR-Notation zu konvertieren
function subnetMaskToCIDR(mask) {
    return mask.split('.')
        .map(Number)
        .map(n => n.toString(2).padStart(8, '0'))
        .join('')
        .split('1').length - 1;
}

// Route, um IP-Adresse und Netzadresse in CIDR zurückzugeben
app.get('/ip', (req, res) => {
    const ipInfo = getLocalIPAddress();
    if (ipInfo) {
        const networkAddress = calculateNetworkAddress(ipInfo.ip, ipInfo.subnetMask);
        const cidr = subnetMaskToCIDR(ipInfo.subnetMask);

        // Rückgabe der IP-Adresse und Netzadresse
        res.json({
            ip: ipInfo.ip,
            network: `${networkAddress}/${cidr}`
        });
    } else {
        res.status(500).send('Konnte keine lokale IP-Adresse ermitteln.');
    }
});

// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
