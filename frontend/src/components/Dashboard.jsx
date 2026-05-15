import React, { useEffect, useState } from 'react';

export default function Dashboard({ result }) {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    if (result) {
      // Small animation for score
      let start = 0;
      const end = result.match_score;
      const duration = 1000;
      const increment = end / (duration / 20);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          setDisplayedScore(end);
        } else {
          setDisplayedScore(Math.floor(start));
        }
      }, 20);
      
      return () => clearInterval(timer);
    }
  }, [result]);

  if (!result) return null;

  const scoreColor = displayedScore >= 70 ? 'text-matrix' : 'text-neonred';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-matrix pt-8">
      <div className="flex flex-col items-center justify-center border border-matrix p-6 bg-matrix/5">
        <h2 className="text-xl mb-4 font-bold tracking-widest uppercase">[ Match Score ]</h2>
        <div className={`text-7xl font-bold ${scoreColor} drop-shadow-md`}>
          {displayedScore}%
        </div>
      </div>
      <div className="border border-matrix p-6">
        <h2 className="text-xl mb-4 font-bold uppercase">[ The Cheat Sheet ]</h2>
        <ul className="list-none space-y-4">
          {result.cheat_sheet.map((item, i) => (
            <li key={i} className="flex gap-3 items-start animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
              <span className="text-neonred font-bold animate-pulse mt-0.5">&gt;</span> 
              <span className="opacity-90">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
