import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const [isPreview, setIsPreview] = useState(false);

  // Custom toolbar configuration with all the features you requested
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'align',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  // Convert HTML to plain text for preview
  const getPlainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <div className="border border-gray-300 rounded-md w-full overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`px-4 py-2 text-sm font-medium ${
            !isPreview
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`px-4 py-2 text-sm font-medium ${
            isPreview
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preview
        </button>
      </div>

      <div className="min-h-96 w-full">
        {isPreview ? (
          <div className="p-4 prose max-w-none min-h-96 w-full overflow-hidden">
            <div
              className="break-words"
              dangerouslySetInnerHTML={{
                __html: value || '<p class="text-gray-500">Nothing to preview</p>'
              }}
            />
          </div>
        ) : (
          <div className="rich-text-editor w-full">
            <ReactQuill
              theme="snow"
              value={value || ''}
              onChange={onChange}
              placeholder={placeholder}
              modules={modules}
              formats={formats}
              style={{
                height: '350px',
                marginBottom: '42px', // Account for toolbar height
                width: '100%'
              }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .rich-text-editor {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        
        .rich-text-editor .ql-editor {
          min-height: 300px;
          font-size: 16px;
          line-height: 1.6;
          width: 100%;
          max-width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
          white-space: pre-wrap;
        }
        
        .rich-text-editor .ql-container {
          width: 100%;
          max-width: 100%;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .rich-text-editor .ql-container {
          border: none;
          font-family: inherit;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        /* Custom toolbar styling */
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
        
        .rich-text-editor .ql-toolbar button {
          padding: 5px;
          margin: 2px;
        }
        
        .rich-text-editor .ql-toolbar button:hover {
          background-color: #f3f4f6;
        }
        
        .rich-text-editor .ql-toolbar button.ql-active {
          background-color: #dbeafe;
          color: #2563eb;
        }
        
        /* Color picker styling */
        .rich-text-editor .ql-color-picker .ql-picker-label {
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        
        /* Font size dropdown */
        .rich-text-editor .ql-size .ql-picker-label {
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 2px 8px;
        }
        
        /* Header dropdown */
        .rich-text-editor .ql-header .ql-picker-label {
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 2px 8px;
        }
        
        /* Alignment buttons */
        .rich-text-editor .ql-align .ql-picker-item {
          text-align: center;
        }
        
        /* List buttons */
        .rich-text-editor .ql-list {
          margin-right: 5px;
        }
        
        /* Link and image buttons */
        .rich-text-editor .ql-link,
        .rich-text-editor .ql-image {
          margin-right: 5px;
        }
        
        /* Clean button */
        .rich-text-editor .ql-clean {
          margin-left: 10px;
          color: #dc2626;
        }
        
        .rich-text-editor .ql-clean:hover {
          background-color: #fef2f2;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;