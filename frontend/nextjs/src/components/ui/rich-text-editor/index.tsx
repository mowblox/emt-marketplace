"use client"
import React from 'react'

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import './styles.css'; // Import local styles


const RichTextEditor = ({ value, onChange, placeholder }: any) => {
    return <ReactQuill
        value={value}
        onChange={(val) => onChange(val)}
        placeholder={placeholder}
        modules={{
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image', 'blockquote']
            ]
        }}
        theme="snow"
    />
}

export default RichTextEditor