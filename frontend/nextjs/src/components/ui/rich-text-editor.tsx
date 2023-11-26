"use client"
import React from 'react'
import { Textarea } from './textarea'
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Placeholder from "@tiptap/extension-placeholder"
import Toolbar from './toolbar'
 

//TODO @od41 FIXME: the rich text editorbuttons are erratic

const RichTextEditor = (props: any) => {
    const { value, placeholder, onChange } = props
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Answer a question or explain a concept', }),
            Heading.configure({
                HTMLAttributes: {
                    class: "text-xl font-bold",
                    levels: [2]
                }
            })
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "flex min-h-[250px] w-full rounded-md border border-alt-stroke bg-accent-shade px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            }
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML())
            console.log(editor.getHTML())
        }
    })
    return (
        <div className='flex flex-col justify-stretch min-h-[250px]'>
            <Toolbar editor={editor} />
            <EditorContent  editor={editor} />
        </div>
    )
}

export default RichTextEditor