import { katexOptionsCtx } from "@milkdown/plugin-math";
import { useInstance } from "@milkdown/react";
import { useNodeViewContext } from "@prosemirror-adapter/react";
import katex from "katex";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import BootstrapToolbar from "./MathToolBar";
import './Styles/InlineMath.css';
import { useOnChange } from "./Editor";
import { FaPencilAlt } from "react-icons/fa";

export const MathInLine: FC = () => {
    const { node, setAttrs } = useNodeViewContext();
    const codePanel = useRef<HTMLDivElement>(null);
    const codePanelInline = useRef<HTMLDivElement>(null);
    const codeInput = useRef<HTMLTextAreaElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const [loading, getEditor] = useInstance();
    const [modalVisible, setModalVisible] = useState(false);
    const onChange = useOnChange();

    const stripDelimiters = (formula: string): string => formula.replace(/^\$|\$$/g, '');

    const [formulaSource, setFormulaSource] = useState(() => {
        const initialValue = node.content.size > 0 ? node.content.child(0).text || "" : "";
        return stripDelimiters(initialValue.trim());
    });

    const [originalFormula, setOriginalFormula] = useState(formulaSource);

    const renderPreview = (formula: string) => {
        if (codePanel.current && !loading) {
            try {
                katex.render(formula, codePanel.current, getEditor().ctx.get(katexOptionsCtx.key));
            } catch (error) {
                console.error("Error rendering KaTeX:", error);
            }
        }
    };

    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newFormula = event.target.value;
        setFormulaSource(newFormula);
        setAttrs({ value: newFormula });
        renderPreview(newFormula);
    };

    const addFormula = (newFormula: string) => {
        if (!codeInput.current) return;
        const textarea = codeInput.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const updatedFormula = start !== end
            ? formulaSource.substring(0, start) + newFormula + formulaSource.substring(end)
            : formulaSource + newFormula;

        setFormulaSource(updatedFormula);
        setAttrs({ value: updatedFormula });
        renderPreview(updatedFormula);
    };

    useEffect(() => {
        if (node.content.size > 0 && node.content.child(0).text) {
            const content = node.content.child(0).text || "";
            const cleanContent = stripDelimiters(content);
            if (cleanContent !== formulaSource) {
                setFormulaSource(cleanContent);
                setAttrs({ value: cleanContent });
            }
        }
    }, [node]);

    useEffect(() => {
        const renderFormula = () => {
            if (codePanelInline.current) {
                try {
                    katex.render(formulaSource, codePanelInline.current, getEditor().ctx.get(katexOptionsCtx.key));
                } catch (error) {
                    console.error("Error rendering inline KaTeX:", error);
                }
            }
        };

        renderFormula();
    }, [formulaSource, getEditor, loading]);

    useEffect(() => {
        if (modalVisible && formulaSource) {
            // Render the initial preview when modal opens
            renderPreview(formulaSource);
        }
    }, [modalVisible]);

    useEffect(() => {
        setModalVisible(true);
    }, []);

    const handleCancel = () => {
        setFormulaSource(originalFormula);
        setAttrs({ value: originalFormula });
        setModalVisible(false);
    };

    const handleConfirm = () => {
        const formulaWithDelimiters = `$${formulaSource}$`;
        console.log('Formula confirmada:', formulaWithDelimiters);

        onChange(formulaWithDelimiters);
        setOriginalFormula(formulaSource);
        setModalVisible(false);
    };

    return (
        <div ref={editorRef} style={{ display: "inline-block" }}>
            <div
                className="inline-math"
                ref={codePanelInline}
                tabIndex={-1}
                role="button"
                aria-label="Edit math formula"
                onClick={() => setModalVisible(true)}
            >
                <div className="pencil-icon">
                    <FaPencilAlt style={{ color: "white" }} />
                </div>
            </div>

            {modalVisible && (
                <>
                    <div className="math-modal-overlay" onClick={() => setModalVisible(false)} />
                    <div
                        className="math-modal"
                        role="dialog"
                        aria-label="Math formula editor"
                    >
                        <div className="math-editor-container">
                            <BootstrapToolbar addFormula={addFormula} />
                            <textarea
                                className="math-textarea"
                                ref={codeInput}
                                value={formulaSource}
                                onChange={handleTextareaChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                autoFocus
                                aria-label="Math formula input"
                                placeholder="Enter your LaTeX formula here"
                            />
                            <div className="preview-container">
                                <div className="preview-label">Preview:</div>
                                <div className="preview-content" ref={codePanel} />
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button className="button button-cancel" onClick={handleCancel}>Cancelar</button>
                            <button className="button button-confirm" onClick={handleConfirm}>Aceptar</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};