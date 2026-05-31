import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    type Connection,
    type EdgeChange,
    type NodeChange,
    type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './VisEditor.css';
import { Inspector } from './Inspector';
import { BackgroundNode, InputNode, MainRendererNode, OutputNode, OverlayNode } from './VisNode';
import {
    applyFlowEdgeChanges,
    applyFlowNodeChanges,
    connectFlowNodes,
    toFlowEdges,
    toFlowNodes,
    type VisFlowEdge,
    type VisFlowNode,
} from './flowModel';
import type { VisEditorProps } from './types';

// Full-screen visualizer complex editor composed from a graph canvas, preview, and inspector.
const nodeTypes: NodeTypes = {
    inputNode: InputNode,
    backgroundNode: BackgroundNode,
    mainRendererNode: MainRendererNode,
    overlayNode: OverlayNode,
    outputNode: OutputNode,
};

const hasPersistedNodeChange = (changes: NodeChange<VisFlowNode>[]) =>
    changes.some(change => change.type === 'position' || change.type === 'remove');

const hasPersistedEdgeChange = (changes: EdgeChange<VisFlowEdge>[]) =>
    changes.some(change => change.type === 'remove');

export const VisEditor = ({
    complex,
    theme,
    isDaylight,
    onChange,
    onSave,
    onReset,
    onBack,
    preview,
}: VisEditorProps) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(complex.nodes[0]?.id ?? null);
    const nodes = useMemo(() => toFlowNodes(complex), [complex]);
    const edges = useMemo(() => toFlowEdges(complex), [complex]);

    const onNodesChange = useCallback((changes: NodeChange<VisFlowNode>[]) => {
        if (!hasPersistedNodeChange(changes)) {
            return;
        }

        const nextComplex = applyFlowNodeChanges(complex, changes);
        const stillSelected = selectedNodeId ? nextComplex.nodes.some(node => node.id === selectedNodeId) : false;
        if (!stillSelected) {
            setSelectedNodeId(nextComplex.nodes[0]?.id ?? null);
        }
        onChange(nextComplex);
    }, [complex, onChange, selectedNodeId]);

    const onEdgesChange = useCallback((changes: EdgeChange<VisFlowEdge>[]) => {
        if (!hasPersistedEdgeChange(changes)) {
            return;
        }

        onChange(applyFlowEdgeChanges(complex, changes));
    }, [complex, onChange]);

    const onConnect = useCallback((connection: Connection) => {
        onChange(connectFlowNodes(complex, connection));
    }, [complex, onChange]);

    return (
        <ReactFlowProvider>
            <div
                className={`vis-editor ${isDaylight ? 'vis-editor--daylight' : 'vis-editor--night'}`}
                style={{
                    '--vis-editor-bg': theme.backgroundColor,
                    '--vis-editor-primary': theme.primaryColor,
                    '--vis-editor-accent': theme.accentColor,
                    '--vis-editor-secondary': theme.secondaryColor,
                } as CSSProperties}
            >
                <header className="vis-editor__header">
                    <div>
                        <div className="vis-editor__eyebrow">Visualizer Complex</div>
                        <h1>Flow Editor</h1>
                    </div>
                    <div className="vis-editor__actions">
                        {onBack ? <button type="button" onClick={onBack}>Back</button> : null}
                        {onReset ? <button type="button" onClick={onReset}>Reset</button> : null}
                        {onSave ? <button type="button" className="vis-editor__primary-action" onClick={onSave}>Save</button> : null}
                    </div>
                </header>

                <main className="vis-editor__body">
                    <section className="vis-editor__canvas" aria-label="Visualizer complex graph">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                            onPaneClick={() => setSelectedNodeId(null)}
                            fitView
                            fitViewOptions={{ padding: 0.18 }}
                        >
                            <Background />
                            <Controls />
                            <MiniMap pannable zoomable />
                        </ReactFlow>
                    </section>

                    <aside className="vis-editor__side">
                        <section className="vis-editor-preview" aria-label="Preview">
                            <div className="vis-editor-panel-title">Preview</div>
                            <div className="vis-editor-preview__frame">
                                {preview ?? <div className="vis-editor-empty">No preview mounted.</div>}
                            </div>
                        </section>
                        <Inspector
                            complex={complex}
                            selectedNodeId={selectedNodeId}
                            theme={theme}
                            isDaylight={isDaylight}
                            onChange={onChange}
                        />
                    </aside>
                </main>
            </div>
        </ReactFlowProvider>
    );
};

export default VisEditor;
