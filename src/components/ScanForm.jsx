import React, {useEffect, useState} from 'react';
import Logo from './logo.png'
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
    const [scanType, setScanType] = useState('-T4 -F');
    const [customCommandOpen, setCustomCommandOpen] = useState(false);
    const [customCommand, setCustomCommand] = useState('');
    const [network, setNetwork] = useState('');

    useEffect(() => {
        fetchIPAddress()
    }, []);

    const handleScanTypeChange = (event) => {
        const selectedScanType = event.target.value;
        setScanType(selectedScanType);

        // Öffnet das Custom Command-Feld, wenn 'custom' ausgewählt wird
        if (selectedScanType === 'custom') {
            setCustomCommandOpen(true);
        } else {
            setCustomCommandOpen(false);
        }
    };

    const onScanClick = () => {
        if (ipAddress) {
            const popup = window.open("", "scanPopup", "width=700,height=400,scrollbars=yes,resizable=yes");
            popup.document.write("<h1>Scan running...</h1>");
            popup.document.write(scanType);
            handleScan(popup);
        } else {
            alert('Please enter a target IP or range!');
        }
    };

    async function fetchIPAddress() {
        try {
            const response = await fetch('http://localhost:5000/ip');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setNetwork(data.network);
        } catch (error) {
            console.error('Es gab ein Problem mit dem fetchen der Netzadresse:', error);
        }
    }

    const handleScan = async (popup) => {

        try {
            // Überprüfe, ob ein benutzerdefinierter Befehl ausgewählt wurde
            const commandToUse = scanType === 'custom' ? customCommand : scanType;
            console.log(commandToUse)

            const response = await fetch('http://192.168.132.146:5000/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target: ipAddress,
                    type: commandToUse,
                }),
            });

            if (!response.body) {
                console.error('ReadableStream not supported by this browser.');
                popup.document.write("<p>Scan konnte nicht ausgeführt werden.</p>");
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result;
            let fullOutput = '';

            while (!(result = await reader.read()).done) {
                const chunk = decoder.decode(result.value, {stream: true});
                fullOutput += chunk;

                // Render den Live-Output im Popup
                popup.document.body.innerHTML = `<pre>${fullOutput}</pre>`;

                // Automatisch scrollen
                popup.scrollTo(0, popup.document.body.scrollHeight);
            }

            // Finalen Output rendern und scrollen
            popup.document.body.innerHTML = `<pre>${fullOutput}</pre>`;
            popup.scrollTo(0, popup.document.body.scrollHeight);
        } catch (error) {
            console.error('Error during the scan:', error);
            popup.document.write('<p>Error during the scan.</p>');
        }
    };


    return (
        <div>
            <Box
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    width: 320, // Slightly wider
                    p: 3,
                    bgcolor: 'background.paper', // MUI theme color
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Soft shadow
                    borderRadius: '12px', // Softer corners
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 2,
                }}
            >
                <img width={320} src={Logo}/>

                <br/>

                <Typography variant="body2" sx={{mb: 2, color: 'text.secondary'}}>
                    LocalNET: {network}
                </Typography>

                <TextField
                    label="IP Address / Pool"
                    id="standard-basic"
                    onChange={(e) => setIpAddress(e.target.value)}
                    variant="standard"
                    fullWidth
                    sx={{mb: 3}}
                />
                <FormControl fullWidth sx={{mb: 3}}>
                    <InputLabel id="scan-type-label">Scantype</InputLabel>
                    <Select
                        labelId="scan-type-label"
                        id="scan-type"
                        value={scanType}
                        label="Scanart"
                        onChange={handleScanTypeChange}
                    >
                        <MenuItem value="-T4 -F">Quick Scan</MenuItem>
                        <MenuItem value="-T4 -A -v">Intense scan</MenuItem>
                        <MenuItem value="-sS -sU -T4 -A -v">Intense scan + UDP</MenuItem>
                        <MenuItem value="-p 1-65535 -T4 -A -v">Intense scan, all TCP ports</MenuItem>
                        <MenuItem value="-T4 -A -v -Pn">Intense scan, no ping</MenuItem>
                        <MenuItem value="-sn">Ping scan</MenuItem>
                        <MenuItem value="-sV -T4 -O -F --version-light">Quick scan plus</MenuItem>
                        <MenuItem value="-sn --traceroute">Quick trcrt</MenuItem>
                        <MenuItem value="" disabled={true}>Regular scan</MenuItem>
                        <MenuItem value="-sS">Slow comprehensive scan</MenuItem>
                        <MenuItem value="custom">
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
                        sx={{mb: 3}}
                    />
                </Collapse>

                <Box sx={{mt: 2, display: 'flex', justifyContent: 'space-between'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onScanClick}
                        sx={{
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        Scan
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        sx={{
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'secondary.light',
                                borderColor: 'secondary.dark',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
        </div>
    );
};

export default ScanForm;
