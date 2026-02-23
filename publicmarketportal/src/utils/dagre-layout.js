import dagre from 'dagre';

const nodeWidth = 280;
const nodeHeight = 160;

/**
 * Lays out nodes and edges using Dagre (hierarchical layout).
 * @param {Array} nodes 
 * @param {Array} edges 
 * @param {string} direction 'TB' (top-to-bottom) or 'LR' (left-to-right)
 * @returns {Object} { nodes, edges, width, height }
 */
export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 80, // Horizontal separation between nodes
        ranksep: 100, // Vertical separation between ranks
        marginx: 50,
        marginy: 50
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches React Flow's or our custom canvas's position handle (top left usually)
        // But our FlowCanvas treats x,y as top-left.
        // Dagre returns center x, y.

        return {
            ...node,
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            // Shift to top-left
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
            // Keep x,y properties for compatibility if needed
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes: layoutedNodes, edges };
};
