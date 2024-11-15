import { MilkdownProvider } from '@milkdown/react';
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MilkdownEditor } from './components/Editor';

const root$ = document.getElementById('app');
if (!root$) throw new Error('No root element found');

const handleEditorChange = (newMarkdown: string) => {
    console.log("Markdown actualizado:\n", newMarkdown);

    const markdownPreview = document.getElementById("markdown-preview");
    if (markdownPreview) {
        // Establecer el contenido como texto plano
        markdownPreview.textContent = newMarkdown; // Muestra el texto como está, incluyendo '$' para las fórmulas
    }
};

const root = createRoot(root$);

root.render(
    <StrictMode>
        <MilkdownProvider>
            <ProsemirrorAdapterProvider>
                <div style={{display: 'flex', width: '100%'}}>
                    {/* Columna de la izquierda (editor) */}
                    <div style={{flex: '0 0 65%', padding: '10px'}}>
                        <MilkdownEditor markdown={"R/Exams"} onChange={handleEditorChange}/>
                    </div>

                    {/* Columna de la derecha (markdown) */}
                    <div style={{flex: '0 0 35%', padding: '10px', borderLeft: '2px solid #ddd'}}>
                        <h3>Markdown</h3>
                        {/* Aquí insertamos el contenido de markdown actualizado */}
                        <pre id="markdown-preview" style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}></pre>
                    </div>
                </div>
            </ProsemirrorAdapterProvider>
        </MilkdownProvider>
    </StrictMode>
);








