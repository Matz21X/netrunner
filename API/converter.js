const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();

fs.readFile('C:\\Users\\matth\\Documents\\GIT\\netrunner\\scan.xml', (err, data) => {
    if (err) throw err;

    parser.parseString(data, (err, result) => {
        if (err) throw err;

        const hosts = result.nmaprun.host || [];
        const nodes = [];
        const links = [];

        hosts.forEach((host, index) => {
            // Nur Hosts mit dem Status "up" verarbeiten
            const status = host.status[0].$.state;
            if (status === 'up') {
                const ipv4 = host.address.find(addr => addr.$.addrtype === 'ipv4').$.addr;
                const mac = host.address.find(addr => addr.$.addrtype === 'mac')?.$.addr;
                const openPorts = host.ports?.[0]?.port?.map(port => port.$.portid).join(', ') || 'None';

                // Node hinzufügen
                nodes.push({
                    id: ipv4,
                    type: 'PC',  // Beispiel: kannst du je nach Info anpassen
                    info: `MAC: ${mac || 'Unknown'}, Open Ports: ${openPorts}`
                });

                // Beispiel einer Link-Verknüpfung zu einem Router (muss an deine Netzwerktopologie angepasst werden)
                if (index > 0) {
                    links.push({
                        source: hosts[0].address[0].$.addr,  // Beispiel: Der erste Host als Router
                        target: ipv4
                    });
                }
            }
        });

        // JSON Struktur für react-force-graph
        const networkGraph = {
            nodes,
            links
        };

        // Ausgabe des JSON
        fs.writeFile('data.json', JSON.stringify(networkGraph, null, 2), err => {
            if (err) throw err;
            console.log('Network graph JSON created');
        });
    });
});
