import * as React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {useEffect, useRef, useState} from "react";
import Data from "./data.json";
import ScanForm from "./ScanForm";
import {Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";


const Main = () => {
    // eslint-disable-next-line
    const [tapNode, setTapNode] = useState(null);
    // eslint-disable-next-line
    const [nodeData, setNodeData] = useState(null);
    const fgRef = useRef();


    useEffect(() => {
        const fg = fgRef.current;
        fg.d3Force('charge').strength(-180); // Increase negative value for more repulsion
        fg.d3Force('link').distance(150); // Increase distance between linked nodes
    }, []);

    const handleNodeClick = (node) => {
        if (node) {
            setTapNode(node);
            setNodeData({
                IP: node.id,
                Type: node.type,  // Beispiel: kannst du je nach Info anpassen
                Vendor: node.vendor,
                MAC: node.mac,
                OpenPorts: node.ports,
                Services: node.services,
            });
        } else {
            setTapNode(null);
        }

    };

    const onTestClick = () => {
        console.log(nodeData);
    }

    const drawLinkWithOffset = (link, ctx) => {
        const nodeRadius = 20;  // Define the radius of the node to offset the link
        const startX = link.source.x;
        const startY = link.source.y;
        const endX = link.target.x;
        const endY = link.target.y;

        // Calculate angle between source and target nodes
        const angle = Math.atan2(endY - startY, endX - startX);

        // Calculate new start and end points with an offset (node radius)
        const offsetX = Math.cos(angle) * nodeRadius;
        const offsetY = Math.sin(angle) * nodeRadius;

        const newStartX = startX + offsetX;
        const newStartY = startY + offsetY;
        const newEndX = endX - offsetX;
        const newEndY = endY - offsetY;

        // Draw the link with an offset
        ctx.beginPath();
        ctx.moveTo(newStartX, newStartY);
        ctx.lineTo(newEndX, newEndY);
        ctx.strokeStyle = '#85cf16'; // Set link color
        ctx.stroke();
    };

    return (
        <div style={{position: 'relative', height: '100vh', width: '100%'}}>
            <div>
                <ForceGraph2D
                    ref={fgRef}
                    graphData={Data}
                    backgroundColor="#0f1214"
                    nodeLabel="id"
                    onNodeClick={handleNodeClick}
                    nodeRelSize={20}
                    nodeColor={() => "#66b3ff"}
                    linkCanvasObjectMode={() => 'replace'} // Custom link drawing mode
                    linkCanvasObject={drawLinkWithOffset}  // Use custom function to draw links with offset
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = `${node.id} (${node.vendor})`;
                        const fontSize = 20 / globalScale;
                        ctx.font = `${fontSize}px Monospace`;
                        ctx.fillStyle = 'white';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(label, node.x, node.y);  // Shift label 10px upwards for better visibility
                    }}
                />
            </div>

            {/* Floating semi-transparent UI */}
            <ScanForm/>

            {nodeData ?
                <Box sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    width: 320, // Slightly wider
                    p: 3,
                    bgcolor: 'background.paper', // MUI theme color
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Soft shadow
                    borderRadius: '12px', // Softer corners
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 2,
                }}>
                    <Typography variant="h6" sx={{mb: 2, color: 'text.primary'}}>
                        Netrunner
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onTestClick}
                        sx={{
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        Test
                    </Button>

                    <TableContainer>
                        <Table sx={{minWidth: 300}} size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(nodeData).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell component="th" scope="row">
                                            {key}
                                        </TableCell>
                                        <TableCell>{value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                : null}

        </div>


    );
}

export default Main;