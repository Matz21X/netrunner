import React, {useState} from 'react';
import {
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Collapse,
    Typography,
} from '@mui/material';

const ScanForm = () => {
    const [ipAddress, setIpAddress] = useState('');
    const [scanType, setScanType] = useState('');
    const [customCommandOpen, setCustomCommandOpen] = useState(false);
    const [customCommand, setCustomCommand] = useState('');
    const [scanOutput, setScanOutput] = useState('')

    const handleScanTypeChange = (event) => {
        setScanType(event.target.value);
        if (event.target.value !== 'custom') {
            setCustomCommandOpen(false);
        }
    };

    const toggleCustomCommand = () => {
        setCustomCommandOpen((prev) => !prev);
    };

    const onScanClick = () => {
        console.log("Scan clicked");
        if (ipAddress){
            // Öffnet ein Popup-Fenster
            const popup = window.open("", "scanPopup", "width=600,height=400,scrollbars=yes,resizable=yes");

            // Fügt eine vorläufige Nachricht hinzu
            popup.document.write("<h1>Scan running...</h1>");

            // Führt den Scan aus und aktualisiert das Popup mit dem Ergebnis
            handleScan(popup);
        } else {
            alert('Please enter a target IP or range!');
        }

    };


    const handleScan = async (popup) => {


        // Clear previous output
        setScanOutput('');

        try {
            // Verwende fetch für das Streamen von Daten
            const response = await fetch('http://localhost:5000/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ target: ipAddress }),
            });

            if (!response.body) {
                console.error('ReadableStream not supported by this browser.');
                popup.document.write("<p>Scan konnte nicht ausgeführt werden.</p>");
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let result;
            while (!(result = await reader.read()).done) {
                const chunk = decoder.decode(result.value);
                setScanOutput(prevOutput => prevOutput + chunk);

                // Schreibe den Output in das Popup-Fenster
                popup.document.write(`<pre>${chunk}</pre>`);
            }

            // Scan abgeschlossen
            popup.document.write("<p>Scan abgeschlossen!</p>");
        } catch (error) {
            console.error('Error during the scan:', error);
            popup.document.write("<p>Error during the scan.</p>");
        }
    };


    return (
        <div>
            <Box
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    width: 300,
                    p: 2,
                    bgcolor: 'rgb(255,255,255)',
                    border: '2px solid blue',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 2,
                }}
            >
                <Typography variant="h6" sx={{mb: 2}}>
                    Netrunner
                </Typography>
                <TextField
                    label="IP Address"
                    id="standard-basic"
                    onChange={(e) => setIpAddress(e.target.value)}
                    variant="standard"
                    fullWidth
                    sx={{mb: 2}}
                />
                <FormControl fullWidth sx={{mb: 2}}>
                    <InputLabel id="scan-type-label">Scanart</InputLabel>
                    <Select
                        labelId="scan-type-label"
                        id="scan-type"
                        value={scanType}
                        label="Scanart"
                        onChange={handleScanTypeChange}
                    >
                        <MenuItem value="quick">Quick Scan</MenuItem>
                        <MenuItem value="full">Full Scan</MenuItem>
                        <MenuItem value="custom" onClick={toggleCustomCommand}>
                            Custom Scan
                        </MenuItem>
                    </Select>
                </FormControl>

                <Collapse in={customCommandOpen}>
                    <TextField
                        label="Custom Command"
                        variant="outlined"
                        value={customCommand}
                        onChange={(e) => setCustomCommand(e.target.value)}
                        fullWidth
                        sx={{mb: 2}}
                    />
                </Collapse>

                <Box sx={{mt: 2, display: 'flex', justifyContent: 'space-between'}}>
                    <Button variant="contained" color="primary" onClick={onScanClick}>
                        Scan
                    </Button>
                    <Button variant="outlined" color="secondary">
                        Cancel
                    </Button>
                </Box>
            </Box>
        </div>
    );
};

export default ScanForm;
