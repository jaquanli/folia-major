import React, { useEffect, useMemo, useState } from 'react';
import type { MotionValue } from 'framer-motion';
import type { AudioBands, CappellaEmojiImage, CappellaTuning, CadenzaTuning, FumeTuning, Line, PartitaTuning, Theme, TiltTuning, VisualizerMode } from '../../../types';
import VisEditor from '../../visEditor/VisEditor';
import VisualizerComplexRenderer from '../../visualizer/VisualizerComplexRenderer';
import { VIS_PLAYGROUND_PREVIEW_LINES } from '../../visualizer/PreviewPlaceholder';
import { createDefaultVisualizerComplex, type VisualizerComplexV1 } from '../../visualizer/complex';

// src/components/app/vis-editor/VisEditorView.tsx
// App-level adapter that binds visEditor drafts to the current player preview inputs.
interface VisEditorViewProps {
    complex: VisualizerComplexV1;
    theme: Theme;
    isDaylight: boolean;
    currentTime: MotionValue<number>;
    currentLineIndex: number;
    lines: Line[];
    audioPower: MotionValue<number>;
    audioBands: AudioBands;
    fallbackMode: VisualizerMode;
    songTitle?: string | null;
    coverUrl?: string | null;
    lyricsFontScale?: number;
    cadenzaTuning?: CadenzaTuning;
    partitaTuning?: PartitaTuning;
    fumeTuning?: FumeTuning;
    cappellaTuning?: CappellaTuning;
    tiltTuning?: TiltTuning;
    cappellaCustomEmojiImages?: CappellaEmojiImage[];
    onSaveComplex: (complex: VisualizerComplexV1) => void;
    onResetComplex: () => void;
    onBack: () => void;
}

const VisEditorView: React.FC<VisEditorViewProps> = ({
    complex,
    theme,
    isDaylight,
    currentTime,
    currentLineIndex,
    lines,
    audioPower,
    audioBands,
    fallbackMode,
    songTitle,
    coverUrl,
    lyricsFontScale,
    cadenzaTuning,
    partitaTuning,
    fumeTuning,
    cappellaTuning,
    tiltTuning,
    cappellaCustomEmojiImages,
    onSaveComplex,
    onResetComplex,
    onBack,
}) => {
    const [draftComplex, setDraftComplex] = useState(complex);

    useEffect(() => {
        setDraftComplex(complex);
    }, [complex]);

    const previewLines = lines.length > 0 ? lines : VIS_PLAYGROUND_PREVIEW_LINES;
    const previewLineIndex = lines.length > 0 ? currentLineIndex : 0;
    const preview = useMemo(() => (
        <VisualizerComplexRenderer
            complex={draftComplex}
            fallbackMode={fallbackMode}
            currentTime={currentTime}
            currentLineIndex={previewLineIndex}
            lines={previewLines}
            theme={theme}
            audioPower={audioPower}
            audioBands={audioBands}
            songTitle={songTitle ?? 'visEditor Preview'}
            coverUrl={coverUrl}
            showText
            staticMode={false}
            backgroundOpacity={1}
            transparentBackground={false}
            disableGeometricBackground={false}
            disableVignette={false}
            lyricsFontScale={lyricsFontScale}
            cadenzaTuning={cadenzaTuning}
            partitaTuning={partitaTuning}
            fumeTuning={fumeTuning}
            cappellaTuning={cappellaTuning}
            tiltTuning={tiltTuning}
            cappellaCustomEmojiImages={cappellaCustomEmojiImages}
            isPreviewMode
        />
    ), [
        audioBands,
        audioPower,
        cappellaCustomEmojiImages,
        cappellaTuning,
        cadenzaTuning,
        coverUrl,
        currentTime,
        draftComplex,
        fallbackMode,
        fumeTuning,
        lyricsFontScale,
        partitaTuning,
        previewLineIndex,
        previewLines,
        songTitle,
        theme,
        tiltTuning,
    ]);

    return (
        <VisEditor
            complex={draftComplex}
            theme={theme}
            isDaylight={isDaylight}
            preview={preview}
            onChange={setDraftComplex}
            onSave={() => onSaveComplex(draftComplex)}
            onReset={() => {
                const next = createDefaultVisualizerComplex();
                setDraftComplex(next);
                onResetComplex();
            }}
            onBack={onBack}
        />
    );
};

export default VisEditorView;
