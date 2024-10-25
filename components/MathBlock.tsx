import {katexOptionsCtx} from "@milkdown/plugin-math";
import {useInstance} from "@milkdown/react";
//import {useNodeViewContext} from "@prosemirror-adapter/react";
import katex from "katex";
import type {FC} from "react";
import {useEffect, useRef, useState} from "react";
import BootstrapToolbar from "./MathToolBar";
import {defaultValueCtx} from "@milkdown/core";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import './Styles/MathBlock.css';

export const MathBlock: FC = () => {

  //const {setAttrs, selected} = useNodeViewContext();
  const mathPanel = useRef<HTMLDivElement>(null);
  const codeInput = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("source");//get focus on source view on load
  const [loading, getEditor] = useInstance();

  // Gets the default value of the context default Value Ctx
  const defaultValue = getEditor()?.ctx.get(defaultValueCtx);

  //Bridge between parent Mathblock and child Toolbar | Also it add the default formula values set in the Editor.tsx ($$)
  const [formulaSource, setFormulaSource] = useState((defaultValue?.match(/\$\$([\s\S]*?)\$\$/) || [])[1] || "");

  /*
      This function adds a formula to the current formula source with the following features:
      -> If no text is selected, the formula is added to the last position.
      -> If text is selected, the formula overrides the selected text adding it.
  */
  const addFormula = (newFormula: string) => {
    if (!codeInput.current) return;

    const textarea = codeInput.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const combinationsToCheck = ['{x}', '{a}', '{\\alpha}', 'x', 'a', '\\alpha']; // Array of combinations to check in the new formula

    // If there is selected text, we replace it with the new formula as appropriate
    if (start !== end) {

      const selectedText = formulaSource.substring(start, end);
      let updatedFormula = formulaSource.substring(0, start) + newFormula + formulaSource.substring(end);

      // Replace the found combination with the selected text wrapped in braces
      for (const combination of combinationsToCheck) {
        if (newFormula.includes(combination)) {
          updatedFormula = updatedFormula.replace(combination, `{${selectedText}}`);
          break;
        }
      }

      setFormulaSource(updatedFormula); // Set the updated formula
    } else {

      // If no text is selected, the new formula is added to the end of the existing one
      setFormulaSource(formulaSource + newFormula); // Set the updated formula

    }

  };

  useEffect(() => {

    requestAnimationFrame(() => {
      if (!mathPanel.current || value !== "preview" || loading) return;

      try {
        katex.render(
            formulaSource,
            mathPanel.current,
            getEditor().ctx.get(katexOptionsCtx.key)
        );
      } catch {
      }
    });
  }, [formulaSource, getEditor, loading, value]);

  return (
      <div className="math-block pt-3 pb-3">
        <Tabs
            contentEditable="false"
            activeKey={value}
            onSelect={(k) => setValue(k ?? "")}//if k is null, set ""
            className="mb-3 justify-content-center"
        >
          <Tab eventKey="preview" title="Preview" contentEditable="false">
            <div className="text-center" ref={mathPanel}/>
          </Tab>
          <Tab eventKey="source" title="Source"  contentEditable="false">
            <BootstrapToolbar addFormula={addFormula}/>
            <textarea
                className="math-area block h-48 w-full bg-slate-800 font-mono text-gray-50"
                ref={codeInput}
                value={formulaSource}
                onChange={e => setFormulaSource(e.target.value)}
            />
          </Tab>
        </Tabs>
      </div>
  );
};
