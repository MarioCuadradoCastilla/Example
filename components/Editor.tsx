// editor.tsx
import {defaultValueCtx, Editor, rootCtx} from '@milkdown/core';
import {FC} from 'react';
import {commonmark} from '@milkdown/preset-commonmark';
import {Milkdown, useEditor} from '@milkdown/react';

import '@milkdown/theme-nord/style.css';
import 'katex/dist/katex.min.css';
import { nord } from '@milkdown/theme-nord';
import { usePluginViewFactory,useNodeViewFactory} from '@prosemirror-adapter/react';
import { block } from '@milkdown/kit/plugin/block';
import { cursor } from '@milkdown/kit/plugin/cursor';
import { BlockView } from './Block'; // Importa Block para el contenido estándar
import { MathBlock } from './MathBlock'; // Importa MathBlock para bloques de matemáticas
import '@milkdown/theme-nord/style.css';

const markdown = `
# R/Exams.
`;

export const MilkdownEditor: FC = () => {
  const pluginViewFactory = usePluginViewFactory();
  const nodeViewFactory = useNodeViewFactory();
  useEditor((root) => {
    return Editor
      .make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, markdown);

        // Configura la vista del bloque estándar (Block)
        ctx.set(block.key, {
          view: pluginViewFactory({
            component: BlockView,
          }),
        });

        // Agrega MathBlock para bloques matemáticos específicos
        ctx.set(block.key, {
          view: pluginViewFactory({
            component: MathBlock,
          }),
        });
      })
      .config(nord)
      .use(commonmark)
      .use(block)
      .use(cursor);
  }, []);

  return <Milkdown/>
};


