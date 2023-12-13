"use client";
import React from "react";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "./styles.css"; // Import local styles

const RichTextEditor = ({ value, onChange, placeholder, readOnly }: any) => {
  const propsIfEditable = readOnly ? {modules: {toolbar: false}, readOnly: true}
  : {
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "code-block"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link", "blockquote"],
          ],
        },
        placeholder,
        onChange: (val: any) => onChange(val),
      };

  return <ReactQuill  value={value} {...propsIfEditable} theme="snow" />;
};

export default RichTextEditor;
