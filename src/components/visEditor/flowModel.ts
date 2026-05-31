import type { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import type {
    VisualizerComplexEdge,
    VisualizerComplexNode,
    VisualizerComplexV1,
    VisualizerNodeRole,
} from '../visualizer/complex';

// Converts the persisted complex schema to and from React Flow's transient graph model.
export interface FlowNodeData extends Record<string, unknown> {
    label: string;
    kind: string;
    role: VisualizerNodeRole;
    enabled: boolean;
    opacity?: number;
    mode?: string;
}

export type VisFlowNodeType = 'inputNode' | 'backgroundNode' | 'mainRendererNode' | 'overlayNode' | 'outputNode';
export type VisFlowNode = Node<FlowNodeData, VisFlowNodeType>;
export type VisFlowEdge = Edge;

const NODE_TYPES_BY_ROLE: Record<VisualizerNodeRole, VisFlowNodeType> = {
    input: 'inputNode',
    visualizerBg: 'backgroundNode',
    visualizerMain: 'mainRendererNode',
    visualizerOverlay: 'overlayNode',
    output: 'outputNode',
};

export const toFlowNodes = (complex: VisualizerComplexV1): VisFlowNode[] =>
    complex.nodes.map(node => ({
        id: node.id,
        type: NODE_TYPES_BY_ROLE[node.role],
        position: node.position,
        data: {
            label: node.label,
            kind: node.kind,
            role: node.role,
            enabled: node.enabled,
            opacity: 'config' in node ? node.config.opacity : undefined,
            mode: node.role === 'visualizerMain' ? node.config.mode : undefined,
        },
    }));

export const toFlowEdges = (complex: VisualizerComplexV1): VisFlowEdge[] =>
    complex.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
    }));

const outputListForRole = (nodes: VisualizerComplexNode[], role: VisualizerNodeRole) =>
    nodes.filter(node => node.role === role && node.enabled).map(node => node.id);

export const rebuildOutput = (nodes: VisualizerComplexNode[]) => ({
    bgNodeIds: outputListForRole(nodes, 'visualizerBg'),
    mainNodeIds: outputListForRole(nodes, 'visualizerMain'),
    overlayNodeIds: outputListForRole(nodes, 'visualizerOverlay'),
});

const ensureUniqueEdgeId = (edges: VisualizerComplexEdge[], source: string, target: string) => {
    const baseId = `${source}-${target}`;
    const usedIds = new Set(edges.map(edge => edge.id));
    if (!usedIds.has(baseId)) {
        return baseId;
    }

    let suffix = 2;
    while (usedIds.has(`${baseId}-${suffix}`)) {
        suffix += 1;
    }
    return `${baseId}-${suffix}`;
};

export const applyFlowNodeChanges = (
    complex: VisualizerComplexV1,
    changes: NodeChange<VisFlowNode>[],
) => {
    const flowNodes = applyNodeChanges(changes, toFlowNodes(complex));
    const nodeIds = new Set(flowNodes.map(node => node.id));
    const positionsById = new Map(flowNodes.map(node => [node.id, node.position]));
    const nodes = complex.nodes
        .filter(node => nodeIds.has(node.id))
        .map(node => ({
            ...node,
            position: positionsById.get(node.id) ?? node.position,
        })) as VisualizerComplexNode[];

    return {
        ...complex,
        nodes,
        edges: complex.edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)),
        output: rebuildOutput(nodes),
    };
};

export const applyFlowEdgeChanges = (
    complex: VisualizerComplexV1,
    changes: EdgeChange<VisFlowEdge>[],
) => {
    const flowEdges = applyEdgeChanges(changes, toFlowEdges(complex));
    const nodeIds = new Set(complex.nodes.map(node => node.id));
    const edges = flowEdges
        .filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))
        .map(edge => ({ id: edge.id, source: edge.source, target: edge.target }));

    return {
        ...complex,
        edges,
    };
};

export const connectFlowNodes = (
    complex: VisualizerComplexV1,
    connection: Connection,
) => {
    if (!connection.source || !connection.target || connection.source === connection.target) {
        return complex;
    }

    const hasEdge = complex.edges.some(edge => edge.source === connection.source && edge.target === connection.target);
    if (hasEdge) {
        return complex;
    }

    return {
        ...complex,
        edges: [
            ...complex.edges,
            {
                id: ensureUniqueEdgeId(complex.edges, connection.source, connection.target),
                source: connection.source,
                target: connection.target,
            },
        ],
    };
};
