import * as React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {useEffect, useRef, useState} from "react";
import {Box, Paper, Typography} from '@mui/material';
import Data from "./data.json";


const Main = () => {


    const [tapNode, setTapNode] = useState(null);
    const [nodeData, setNodeData] = useState(null);
    const fgRef = useRef();

    const handleNodeClick = (node) => {
        if (node) {
            setTapNode(node);
            setNodeData({
                id: node.id,
                type: node.type,
                details: `More information about ${node.id}`, // Example extra info
            });
        } else {
            setTapNode(null);
        }
    };

    useEffect(() => {
        const fg = fgRef.current;

        // Adjust the force simulation
        fg.d3Force('charge').strength(-150); // Increase negative value for more repulsion
        fg.d3Force('link').distance(100); // Increase distance between linked nodes
    }, []);

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
                    nodeRelSize={40}
                    nodeColor={() => "#66b3ff"}
                    linkCanvasObjectMode={() => 'replace'} // Custom link drawing mode
                    linkCanvasObject={drawLinkWithOffset}  // Use custom function to draw links with offset
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = `${node.id} (${node.type})`;
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
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        width: 300,
                        zIndex: 20,
                        opacity: 1,
                        elevation: 20,
                        backgroundColor: 'rgba(0,0,0,1)', // Semi-transparent background
                    }}
                >
                    <Paper elevation={24} sx={{
                        padding: 2,
                        backgroundColor: '#2b6b6bö'
                    }}>
                        <Typography variant="h6">Node Information</Typography>
                        <Typography variant="body2">
                            <strong>ID:</strong> {nodeData?.id}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Type:</strong> {nodeData?.type}
                        </Typography>
                        <Typography variant="body2">
                            {nodeData?.details}
                        </Typography>
                    </Paper>
                </Box>


        </div>


    );
}

export default Main;