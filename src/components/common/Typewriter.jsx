import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';

const wordsMap = {
  en: ['global work.', 'community discussions.', 'stock alpha.', 'secure contracts.'],
  th: ['งานระดับโลก', 'พูดคุยในชุมชน', 'วิเคราะห์หุ้น', 'สัญญาที่ปลอดภัย']
};

export default function Typewriter() {
  const { state } = useContext(AppContext);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const words = wordsMap[state.lang] || wordsMap['en'];
    const currentWord = words[loopNum % words.length];

    const handleTyping = () => {
      setText(isDeleting 
        ? currentWord.substring(0, text.length - 1) 
        : currentWord.substring(0, text.length + 1)
      );
      setTypingSpeed(isDeleting ? 30 : 100);

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 3000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, state.lang, typingSpeed]);

  return (
    <span className="glow-text italic type-cursor">
      {text}
    </span>
  );
}
