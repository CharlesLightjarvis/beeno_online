import type { CSSProperties } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const safeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        div: [...(defaultSchema.attributes?.div ?? []), 'style'],
        p: [...(defaultSchema.attributes?.p ?? []), 'style'],
        span: [...(defaultSchema.attributes?.span ?? []), 'style'],
    },
};

const textAlignment = new Set(['left', 'center', 'right', 'justify']);
const fontWeights = new Set([
    'normal',
    'bold',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
]);
const textDecorations = new Set(['none', 'underline', 'line-through']);
const namedColors = new Set([
    'black',
    'white',
    'red',
    'blue',
    'green',
    'gray',
    'grey',
    'orange',
    'purple',
    'navy',
]);

function safeColor(value: string): string | undefined {
    const color = value.trim().toLowerCase();

    if (
        /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color) ||
        namedColors.has(color) ||
        /^rgb\(\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*\)$/i.test(
            color,
        )
    ) {
        return color;
    }

    return undefined;
}

function safeFontFamily(value: string): string | undefined {
    const normalized = value
        .toLowerCase()
        .replace(/["']/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (
        normalized === 'space grotesk' ||
        normalized === 'space grotesk, sans-serif'
    ) {
        return 'Space Grotesk, sans-serif';
    }

    if (
        ['sans-serif', 'serif', 'arial', 'arial, sans-serif'].includes(
            normalized,
        )
    ) {
        return normalized;
    }

    return undefined;
}

function safeFontSize(value: string): string | undefined {
    const match = value.trim().match(/^(\d{1,3}(?:\.\d+)?)(px|rem|em|%)$/i);

    if (!match) {
        return undefined;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const maximum = unit === 'px' ? 96 : unit === '%' ? 600 : 6;

    return amount > 0 && amount <= maximum ? `${amount}${unit}` : undefined;
}

function safeInlineStyle(value: unknown): CSSProperties | undefined {
    const declarations =
        typeof value === 'string'
            ? value.split(';').flatMap((declaration) => {
                  const separator = declaration.indexOf(':');

                  return separator < 1
                      ? []
                      : [
                            [
                                declaration.slice(0, separator),
                                declaration.slice(separator + 1),
                            ],
                        ];
              })
            : typeof value === 'object' && value !== null
              ? Object.entries(value).map(([property, styleValue]) => [
                    property.replace(
                        /[A-Z]/g,
                        (letter) => `-${letter.toLowerCase()}`,
                    ),
                    String(styleValue),
                ])
              : [];

    if (declarations.length === 0) {
        return undefined;
    }

    const style: CSSProperties = {};

    for (const [rawProperty, rawStyleValue] of declarations) {
        const property = rawProperty.trim().toLowerCase();
        const rawValue = rawStyleValue.trim();

        switch (property) {
            case 'text-align':
                if (textAlignment.has(rawValue.toLowerCase())) {
                    style.textAlign =
                        rawValue.toLowerCase() as CSSProperties['textAlign'];
                }
                break;
            case 'font-size': {
                const fontSize = safeFontSize(rawValue);
                if (fontSize) style.fontSize = fontSize;
                break;
            }
            case 'font-family': {
                const fontFamily = safeFontFamily(rawValue);
                if (fontFamily) style.fontFamily = fontFamily;
                break;
            }
            case 'font-weight':
                if (fontWeights.has(rawValue.toLowerCase())) {
                    style.fontWeight =
                        rawValue.toLowerCase() as CSSProperties['fontWeight'];
                }
                break;
            case 'color': {
                const color = safeColor(rawValue);
                if (color) style.color = color;
                break;
            }
            case 'background-color': {
                const color = safeColor(rawValue);
                if (color) style.backgroundColor = color;
                break;
            }
            case 'line-height': {
                const lineHeight = Number(rawValue);
                if (
                    Number.isFinite(lineHeight) &&
                    lineHeight >= 1 &&
                    lineHeight <= 2.5
                ) {
                    style.lineHeight = lineHeight;
                }
                break;
            }
            case 'text-decoration':
                if (textDecorations.has(rawValue.toLowerCase())) {
                    style.textDecoration = rawValue.toLowerCase();
                }
                break;
        }
    }

    return Object.keys(style).length > 0 ? style : undefined;
}

function SafeDiv({
    node: _node,
    style,
    ...props
}: React.ComponentProps<'div'> & { node?: unknown }) {
    return <div {...props} style={safeInlineStyle(style)} />;
}

function SafeParagraph({
    node: _node,
    style,
    ...props
}: React.ComponentProps<'p'> & { node?: unknown }) {
    return <p {...props} style={safeInlineStyle(style)} />;
}

function SafeSpan({
    node: _node,
    style,
    ...props
}: React.ComponentProps<'span'> & { node?: unknown }) {
    return <span {...props} style={safeInlineStyle(style)} />;
}

const components: Components = {
    div: SafeDiv,
    p: SafeParagraph,
    span: SafeSpan,
};

export default function MarkdownContent({
    markdown,
    className = '',
}: {
    markdown: string;
    className?: string;
}) {
    return (
        <div className={`prose prose-sm max-w-none break-words ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, safeSchema]]}
                components={components}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
}
