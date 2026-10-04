import {
    AdmonitionDirectiveDescriptor,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
    directivesPlugin,
    frontmatterPlugin,
    GenericJsxEditor,
    headingsPlugin,
    imagePlugin,
    jsxPlugin,
    KitchenSinkToolbar,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
} from '@mdxeditor/editor';
import type { JsxComponentDescriptor } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MarkdownContent from '@/components/markdown-content';

const jsxDescriptors: JsxComponentDescriptor[] = [
    {
        name: '*',
        kind: 'flow',
        props: [],
        hasChildren: true,
        Editor: GenericJsxEditor,
    },
];

type Props = {
    id: string;
    markdown: string;
    onChange: (markdown: string) => void;
    readOnly?: boolean;
};

export default function MdxContentEditor({
    id,
    markdown,
    onChange,
    readOnly = false,
}: Props) {
    const [preview, setPreview] = useState(false);

    if (readOnly) {
        return <MarkdownContent markdown={markdown} />;
    }

    return (
        <div className="min-h-72 overflow-x-auto overflow-y-hidden rounded-md border bg-background">
            <div className="flex justify-end gap-2 border-b bg-muted/50 p-2">
                <Button
                    type="button"
                    size="sm"
                    variant={preview ? 'outline' : 'default'}
                    aria-pressed={!preview}
                    onClick={() => setPreview(false)}
                >
                    Modifier
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={preview ? 'default' : 'outline'}
                    aria-pressed={preview}
                    onClick={() => setPreview(true)}
                >
                    Aperçu
                </Button>
            </div>
            <p className="px-3 pt-2 text-xs text-muted-foreground">
                L’aperçu prend en charge l’alignement, la taille, la police
                Space Grotesk, la graisse, les couleurs et l’interligne via
                Markdown ou les attributs style de div, p et span.
            </p>
            {preview ? (
                <div className="min-h-72 p-4">
                    <MarkdownContent markdown={markdown} />
                </div>
            ) : (
                <MDXEditor
                    key={id}
                    markdown={markdown}
                    onChange={onChange}
                    contentEditableClassName="prose prose-sm max-w-none min-h-56 focus:outline-none"
                    plugins={[
                        headingsPlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        thematicBreakPlugin(),
                        markdownShortcutPlugin(),
                        jsxPlugin({ jsxComponentDescriptors: jsxDescriptors }),
                        linkPlugin(),
                        imagePlugin(),
                        tablePlugin(),
                        codeBlockPlugin(),
                        codeMirrorPlugin({ codeBlockLanguages: {} }),
                        frontmatterPlugin(),
                        directivesPlugin({
                            directiveDescriptors: [
                                AdmonitionDirectiveDescriptor,
                            ],
                        }),
                        diffSourcePlugin(),
                        toolbarPlugin({
                            toolbarContents: () => <KitchenSinkToolbar />,
                        }),
                    ]}
                />
            )}
        </div>
    );
}
