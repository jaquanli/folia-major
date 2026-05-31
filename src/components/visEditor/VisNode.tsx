import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FlowNodeData, VisFlowNode } from './flowModel';

// Shared React Flow node view for all visualizer complex roles.
const ROLE_LABELS: Record<string, string> = {
    input: 'Input',
    visualizerBg: 'Background',
    visualizerMain: 'Main',
    visualizerOverlay: 'Overlay',
    output: 'Output',
};

const ROLE_CLASS_NAMES: Record<string, string> = {
    input: 'vis-editor-node--input',
    visualizerBg: 'vis-editor-node--background',
    visualizerMain: 'vis-editor-node--main',
    visualizerOverlay: 'vis-editor-node--overlay',
    output: 'vis-editor-node--output',
};

const acceptsInput = (role: string) => role !== 'input';
const emitsOutput = (role: string) => role !== 'output';

export const VisNode = ({ data, selected }: NodeProps<VisFlowNode>) => {
    const nodeData = data as FlowNodeData;
    const roleClassName = ROLE_CLASS_NAMES[nodeData.role] ?? 'vis-editor-node--input';

    return (
        <div className={`vis-editor-node ${roleClassName} ${selected ? 'vis-editor-node--selected' : ''}`}>
            {acceptsInput(nodeData.role) ? <Handle type="target" position={Position.Left} /> : null}
            <div className="vis-editor-node__meta">{ROLE_LABELS[nodeData.role] ?? nodeData.role}</div>
            <div className="vis-editor-node__label">{nodeData.label}</div>
            <div className="vis-editor-node__kind">{nodeData.kind}</div>
            <div className="vis-editor-node__status">{nodeData.enabled ? 'Enabled' : 'Disabled'}</div>
            {emitsOutput(nodeData.role) ? <Handle type="source" position={Position.Right} /> : null}
        </div>
    );
};

export const InputNode = VisNode;
export const BackgroundNode = VisNode;
export const MainRendererNode = VisNode;
export const OverlayNode = VisNode;
export const OutputNode = VisNode;
