import * as React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {useEffect, useRef, useState} from "react";
import {Container} from "@mui/material";


const Main = () => {
    const data =
        {
            "nodes": [
                {"id": "1", "type": "Router", "info": "Bruh"},
                {"id": "2", "type": "Switch"},
                {"id": "3", "type": "Server"},
                {"id": "4", "type": "PC"},
                {"id": "5", "type": "PC"},
                {"id": "6", "type": "Access Point"},
                {"id": "7", "type": "PC"},
                {"id": "8", "type": "Printer"}
            ],
            "links": [
                {"source": "1", "target": "2"},
                {"source": "2", "target": "3"},
                {"source": "2", "target": "4"},
                {"source": "2", "target": "5"},
                {"source": "2", "target": "6"},
                {"source": "6", "target": "7"},
                {"source": "2", "target": "8"}
            ]
        }




    const [selectedNode, setSelectedNode] = useState(null);
    const fgRef = useRef();

    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };

    useEffect(() => {
        const fg = fgRef.current;

        // Adjust the force simulation
        fg.d3Force('charge').strength(-400); // Increase negative value for more repulsion
        fg.d3Force('link').distance(400); // Increase distance between linked nodes
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
        ctx.strokeStyle = '#ff6347'; // Set link color
        ctx.stroke();
    };

    return (
            <div>
                <ForceGraph2D
                    ref={fgRef}
                    graphData={data}
                    backgroundColor="#0f1214"
                    nodeLabel="id"
                    onNodeClick={handleNodeClick}
                    nodeRelSize={40}
                    nodeColor={() => "#66b3ff"}
                    linkCanvasObjectMode={() => 'replace'} // Custom link drawing mode
                    linkCanvasObject={drawLinkWithOffset}  // Use custom function to draw links with offset
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = `${node.id} (${node.type})`;
                        const fontSize = 60 / globalScale;
                        ctx.font = `${fontSize}px Monospace`;
                        ctx.fillStyle = 'white';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(label, node.x, node.y);  // Shift label 10px upwards for better visibility
                    }}
                />

                {selectedNode && (
                    <div className="node-info">
                        <h3>Node Information</h3>
                        <p>ID: {selectedNode.id}</p>
                        <p>Type: {selectedNode.type}</p>
                    </div>
                )}
            </div>
    );
}

export default Main;