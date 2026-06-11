import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';

// ข้อมูลคำที่จะใช้พิมพ์สลับไปมา (อิงตามภาษาปัจจุบัน)
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

      // ความเร็วตอนลบ 30ms, ตอนพิมพ์ 100ms
      setTypingSpeed(isDeleting ? 30 : 100);

      // ถ้าพิมพ์ครบคำแล้ว ให้หยุดรอ 3 วิ แล้วค่อยลบ
      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 3000);
      } 
      // ถ้าลบหมดแล้ว ให้เปลี่ยนคำต่อไป
      else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, state.lang, typingSpeed]);

  return (
    <span className="glow-text italic border-r-2 border-[var(--primary-glow)] pr-1 animate-pulse">
      {text}
    </span>
  );
}
