import { katexOptionsCtx } from "@milkdown/plugin-math";
import { useInstance } from "@milkdown/react";
import { useNodeViewContext } from "@prosemirror-adapter/react";
import * as Tabs from "@radix-ui/react-tabs";
import katex from "katex";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import BootstrapToolbar from "./MathToolBar";
import './Styles/InlineMath.css';

export const MathInLine: FC = () => {
    const { node, setAttrs } = useNodeViewContext();
    const codePanel = useRef<HTMLDivElement>(null);
    const codePanelInline = useRef<HTMLDivElement>(null);
    const codeInput = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("source");
    const [loading, getEditor] = useInstance();
    const [modalVisible, setModalVisible] = useState(false);

    const [formulaSource, setFormulaSource] = useState(() => {
        if (node.content.size > 0) {
            return node.content.child(0).text || "";
        }
        return "";
    });

    const addFormula = (newFormula: string) => {
        if (!codeInput.current) return;

        const textarea = codeInput.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const combinationsToCheck = ['{x}', '{a}', '{\\alpha}', 'x', 'a', '\\alpha'];

        let updatedFormula = formulaSource;
        if (updatedFormula.trim() !== "") {
            updatedFormula += "\n";
        }

        if (start !== end) {
            const selectedText = updatedFormula.substring(start, end);
            updatedFormula = updatedFormula.substring(0, start) + newFormula + updatedFormula.substring(end);
            for (const combination of combinationsToCheck) {
                if (newFormula.includes(combination)) {
                    updatedFormula = updatedFormula.replace(combination, `{${selectedText}}`);
                    break;
                }
            }
        } else {
            updatedFormula += newFormula;
        }

        setFormulaSource(updatedFormula);
        setAttrs({ value: updatedFormula });

        // Imprimir en consola el contenido actualizado
        //console.log(`Markdown:\n$${updatedFormula}$\n$$\n${updatedFormula}\n$$`);
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            if (codePanel.current && !loading && value === "preview") {
                try {
                    katex.render(formulaSource, codePanel.current, getEditor().ctx.get(katexOptionsCtx.key));
                } catch (error) {
                    console.error("Error rendering KaTeX:", error);
                }
            }
            if (codePanelInline.current) {
                try {
                    katex.render(formulaSource, codePanelInline.current, getEditor().ctx.get(katexOptionsCtx.key));
                } catch (error) {
                    console.error("Error rendering KaTeX inline:", error);
                }
            }
        });
    }, [formulaSource, getEditor, loading, value, modalVisible]);

    let html = (
        <div className="py-3 text-center inline-math" ref={codePanelInline} onClick={() => setModalVisible(true)} />
    );

    if (modalVisible) {
        html = (
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    zIndex: "999",
                }}
            >
                <button
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        fontSize: "60px",
                        padding: "0",
                        userSelect: "none",
                    }}
                    onClick={() => setModalVisible(false)}
                >
                    &times;
                </button>
                <Tabs.Root contentEditable={false} value={value} onValueChange={(value) => setValue(value)}>
                    <Tabs.List className="border-b border-gray-200 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <div className="-mb-px flex flex-wrap">
                            <Tabs.Trigger
                                value="preview"
                                className={[ "inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300", value === "preview" ? "text-nord9" : ""].join(" ")}
                                onClick={() => {
                                    setAttrs({ value: codeInput.current?.value || "" });
                                    setValue("preview");
                                }}
                            >
                                Preview
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="source"
                                className={[ "inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300", value === "source" ? "text-nord9" : ""].join(" ")}
                                onClick={() => {
                                    setAttrs({ value: codeInput.current?.value || "" });
                                    setValue("source");
                                }}
                            >
                                Source
                            </Tabs.Trigger>
                        </div>
                    </Tabs.List>
                    <Tabs.Content value="preview">
                        <div className="text-center py-2" ref={codePanel} />
                    </Tabs.Content>
                    <Tabs.Content value="source">
                        <BootstrapToolbar addFormula={addFormula} />
                        <textarea
                            className="math-area inline h-24 w-full bg-slate-800 font-mono text-gray-50"
                            ref={codeInput}
                            value={formulaSource}
                            onChange={e => {
                                setFormulaSource(e.target.value);
                                setAttrs({ value: e.target.value });
                            }}
                        />
                    </Tabs.Content>
                </Tabs.Root>
            </div>
        );
    }

    return html;
};


