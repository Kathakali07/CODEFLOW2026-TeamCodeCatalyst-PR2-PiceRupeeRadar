import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TypewriterText({ text, isTyping, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15); // Adjust typing speed here (lower is faster)

    return () => clearInterval(interval);
  }, [text, isTyping]);

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({node, ...props}) => <p style={{ margin: '0 0 8px 0', lineHeight: 1.5 }} {...props} />,
        ul: ({node, ...props}) => <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }} {...props} />,
        li: ({node, ...props}) => <li style={{ marginBottom: '4px' }} {...props} />,
        strong: ({node, ...props}) => <strong style={{ fontWeight: 800, color: '#312e81' }} {...props} />
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
}
