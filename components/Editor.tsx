import { FC, useRef } from "react";
import { Milkdown, useEditor } from "@milkdown/react";
import { Editor } from "@milkdown/core";
import { usePluginViewFactory, useNodeViewFactory } from '@prosemirror-adapter/react';
import { gfm } from "@milkdown/preset-gfm";
import { commonmark } from "@milkdown/preset-commonmark";
import { nord } from "@milkdown/theme-nord";
import { math, mathBlockSchema, mathInlineSchema} from "@milkdown/plugin-math";
import { block } from "@milkdown/plugin-block";
import { cursor } from "@milkdown/plugin-cursor";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { defaultValueCtx, rootCtx, inputRulesCtx } from '@milkdown/core'; // Importa correctamente inputRules
import throttle from "lodash/throttle";
import { MathBlock } from "./MathBlock";
import { BlockView } from "./Block";
import { MathInLine } from "./MathInLine";
import { $view } from "@milkdown/utils";
import { InputRule } from "prosemirror-inputrules";

const preventTitleInputRule = () => new InputRule(
    /^#\s+(.*)$/, // Detecta el patrón "#"
    (state, match, start, end) => {
        const text = match[1] || ""; // Si no hay texto, asignar una cadena vacía

        // Aquí simplemente reemplazamos el '#' con el texto como un nodo normal
        const tr = state.tr.replaceWith(start, end, state.schema.text(`# ${text}`)); // Mantén el #, pero trata el resto como texto normal
        return tr;
    }
);
import  { createContext, useContext } from 'react';
import {MathInLine2} from "./MathInLine2";

export const OnChangeContext = createContext<(formula: string) => void>(() => {});

// Custom hook para usar el contexto
export const useOnChange = () => useContext(OnChangeContext);

export interface MilkdownProps {
    markdown: string;
    onChange: (newMarkdown: string) => void;
}

export const MilkdownEditor: FC<MilkdownProps> = ({ markdown, onChange }) => {
    const pluginViewFactory = usePluginViewFactory();
    const nodeViewFactory = useNodeViewFactory();
    const editorRef = useRef<Editor | null>(null);

    useEditor((root) => {
        const editor = Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, markdown);




                ctx.get(listenerCtx).markdownUpdated(throttle((ctx, updatedMarkdown, prevMarkdown) => {
                        console.log("Markdown actualizado 2:", updatedMarkdown);  // Agregar verificación del valor
                        onChange(updatedMarkdown);

                        const f2 = prevMarkdown.replace(/\s+/g,'');
                        const f = updatedMarkdown.replace(/\s+/g,'');
                        if(f.substring(f.length - 4) == "$$$$") {
                            if (f2.substring(f.length - 4) != "$$$$" && f.substring(f.length - 4) == "$$$$") {
                                    const p = document.createElement("p");
                                    p.appendChild(document.createElement("br"));
                                    document.getElementsByClassName("editor")[0].appendChild(p); // Usa el editorRoot directamente, ya es un Node.
                            }
                        }
                    }, 200)
                );

                const customInputRules: InputRule[] = [
                    preventTitleInputRule()
                ];

                ctx.set(inputRulesCtx, customInputRules);
                ctx.set(block.key, [
                    pluginViewFactory({ component: BlockView }),
                ]);
            })
            .config(nord)
            .use(gfm)
            .use(commonmark)
            .use([
                $view(mathBlockSchema.node, () =>
                    nodeViewFactory({
                        component: MathBlock,
                        stopEvent: () => true,
                    })
                ),
                math,
                $view(mathInlineSchema.node, () =>
                    nodeViewFactory({
                        component: MathInLine,
                        stopEvent: () => true,
                    })
                ),
            ].flat())
            .use(block)
            .use(cursor)
            .use(listener);
            //.use(transactionFilterPlugin); // Agregar el plugin personalizado
        editorRef.current = editor;
        return editor;
    }, [markdown]);  // Aseguramos que 'markdown' y 'onChange' sean dependencias

    return (
            <div className=" h-full">
                <Milkdown />
            </div>
    );
};