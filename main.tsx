
import { MilkdownProvider } from '@milkdown/react';
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MilkdownEditor } from './components/Editor'; // Asegúrate de que este es el componente correcto

const root$ = document.getElementById('app');
if (!root$) throw new Error('No root element found');

const handleEditorChange = (newMarkdown: string) => {
    console.log("Markdown actualizado:\n", newMarkdown);

};

const root = createRoot(root$);

root.render(
    <StrictMode>
        <MilkdownProvider>
            <ProsemirrorAdapterProvider>
                <MilkdownEditor markdown={"R/Exams"} onChange={handleEditorChange} />
            </ProsemirrorAdapterProvider>
        </MilkdownProvider>
    </StrictMode>
);







