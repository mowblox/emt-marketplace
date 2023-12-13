import React from 'react'
import truncate from 'truncate-html'
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "@/components/ui/rich-text-editor/styles.css"; // Import local styles

interface RichTextDisplayContainerProps {
    richText: any;
    isExcerpt?: boolean;
  }
  
  export const RichTextDisplayContainer = ({richText, isExcerpt=false}: RichTextDisplayContainerProps) => {
    const truncated = isExcerpt ? truncate(richText, 340) : richText
    return (
      <div className="quill">
        <div className="ql-container ql-snow" style={{background: "none", borderRadius: "0"}}>
          <div className='text-muted w-full text-sm h-auto ql-editor' style={{height:"100%", padding: 0}} dangerouslySetInnerHTML={{__html: truncated}} ></div>
        </div>
      </div>
    )
  }