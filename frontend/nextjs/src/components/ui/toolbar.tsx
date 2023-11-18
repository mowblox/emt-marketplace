import React from 'react'
import { Toggle } from './toggle'
import { Bold, Code, Heading2, Italic, List, ListOrdered, Quote, Strikethrough } from 'lucide-react'
import { type Editor } from '@tiptap/react'

type Props = {
    editor: Editor | null;
}

const Toolbar = ({ editor }: Props) => {
    if (!editor) return null

    return (
        <div className='rounded-md bg-accent-shade px-2 py-0.5 w-full mb-3'>
            <Toggle
                size="sm"
                pressed={editor.isActive("heading")}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className='hover:text-accent-2 hover:bg-transparent'
            >
                <Heading2 className='w-4 h-4' />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className='hover:text-accent-2 hover:bg-transparent'
            >
                <Bold className='w-4 h-4' />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className='hover:text-accent-2 hover:bg-transparent'
            >
                <Italic className='w-4 h-4' />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                className='hover:text-accent-2 hover:bg-transparent'
            >
                <Strikethrough className='w-4 h-4' />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("codeblock")}
                onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                className='hover:text-accent-2 hover:bg-transparent'
            >
                <Code className='w-4 h-4' />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("bulletlist")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                className='hover:text-accent-2 hover:bg-transparent'
            >
                <List className='w-4 h-4' />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("orderedlist")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                className='hover:text-accent-2 hover:bg-transparent'
            >
                <ListOrdered className='w-4 h-4' />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("blockquote")}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                className='hover:text-accent-2 hover:bg-transparent'
            >
                <Quote className='w-4 h-4' />
            </Toggle>

            {/* TODO:
                formatting: paragraph, headings etc
                action: undo, redo
                upload images
                links
            */}
        </div>
    )
}

export default Toolbar