import type { ChangeEvent } from 'react';
import type { VisualizerComplexNode, VisualizerComplexV1 } from '../visualizer/complex';
import type { Theme } from '../../types';

// Right-side inspector for editing the selected persisted complex node.
interface InspectorProps {
    complex: VisualizerComplexV1;
    selectedNodeId: string | null;
    theme: Theme;
    isDaylight: boolean;
    onChange: (complex: VisualizerComplexV1) => void;
}

const hasOpacityConfig = (node: VisualizerComplexNode): node is Extract<VisualizerComplexNode, { config: { opacity?: number } }> =>
    'config' in node && 'opacity' in node.config;

const updateNode = (
    complex: VisualizerComplexV1,
    nodeId: string,
    updater: (node: VisualizerComplexNode) => VisualizerComplexNode,
) => {
    const nodes = complex.nodes.map(node => (node.id === nodeId ? updater(node) : node));
    return {
        ...complex,
        nodes,
        output: {
            bgNodeIds: nodes.filter(node => node.role === 'visualizerBg' && node.enabled).map(node => node.id),
            mainNodeIds: nodes.filter(node => node.role === 'visualizerMain' && node.enabled).map(node => node.id),
            overlayNodeIds: nodes.filter(node => node.role === 'visualizerOverlay' && node.enabled).map(node => node.id),
        },
    };
};

export const Inspector = ({ complex, selectedNodeId, theme, isDaylight, onChange }: InspectorProps) => {
    const selectedNode = complex.nodes.find(node => node.id === selectedNodeId) ?? null;

    if (!selectedNode) {
        return (
            <aside className="vis-editor-inspector" style={{ borderColor: `${theme.accentColor}33` }}>
                <div className="vis-editor-panel-title">Inspector</div>
                <div className="vis-editor-empty">Select a node to edit its graph settings.</div>
            </aside>
        );
    }

    const setNode = (updater: (node: VisualizerComplexNode) => VisualizerComplexNode) => {
        onChange(updateNode(complex, selectedNode.id, updater));
    };

    const onLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
        const label = event.target.value;
        setNode(node => ({ ...node, label }));
    };

    const onEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
        const enabled = event.target.checked;
        setNode(node => ({ ...node, enabled }));
    };

    const onOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
        const opacity = Math.min(1, Math.max(0, Number(event.target.value)));
        setNode(node => {
            switch (node.role) {
                case 'visualizerBg':
                    return { ...node, config: { ...node.config, opacity } };
                case 'visualizerMain':
                    return { ...node, config: { ...node.config, opacity } };
                case 'visualizerOverlay':
                    return { ...node, config: { ...node.config, opacity } };
                default:
                    return node;
            }
        });
    };

    const onModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const mode = event.target.value;
        setNode(node => node.role === 'visualizerMain' ? { ...node, config: { ...node.config, mode } } : node);
    };

    return (
        <aside className="vis-editor-inspector" style={{ borderColor: `${theme.accentColor}33` }}>
            <div className="vis-editor-panel-title">Inspector</div>
            <div className="vis-editor-inspector__id">{selectedNode.id}</div>

            <label className="vis-editor-field">
                <span>Label</span>
                <input value={selectedNode.label} onChange={onLabelChange} />
            </label>

            <label className="vis-editor-check">
                <input type="checkbox" checked={selectedNode.enabled} onChange={onEnabledChange} />
                <span>Enabled</span>
            </label>

            <div className="vis-editor-readonly-grid">
                <span>Role</span>
                <strong>{selectedNode.role}</strong>
                <span>Kind</span>
                <strong>{selectedNode.kind}</strong>
            </div>

            {hasOpacityConfig(selectedNode) ? (
                <label className="vis-editor-field">
                    <span>Opacity {selectedNode.config.opacity?.toFixed(2) ?? '1.00'}</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedNode.config.opacity ?? 1}
                        onChange={onOpacityChange}
                    />
                </label>
            ) : null}

            {selectedNode.role === 'visualizerMain' ? (
                <label className="vis-editor-field">
                    <span>Main renderer mode</span>
                    <input value={selectedNode.config.mode} onChange={onModeChange} />
                </label>
            ) : null}

            <div className="vis-editor-inspector__hint">
                {isDaylight ? 'Daylight preview colors are active.' : 'Dark preview colors are active.'}
            </div>
        </aside>
    );
};
