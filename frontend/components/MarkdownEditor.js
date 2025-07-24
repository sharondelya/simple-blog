import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownEditor = ({ value, onChange, placeholder }) => {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="border border-gray-300 rounded-md">
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

      <div className="min-h-96">
        {isPreview ? (
          <div className="p-4 prose max-w-none">
            <ReactMarkdown>{value || 'Nothing to preview'}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-96 p-4 border-none resize-none focus:outline-none"
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;