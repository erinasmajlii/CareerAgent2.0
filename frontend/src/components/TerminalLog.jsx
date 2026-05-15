import React, { useEffect, useRef } from 'react';

export default function TerminalLog({ logs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full mt-8 p-4 border border-matrix bg-black max-h-48 overflow-y-auto" ref={containerRef}>
      {logs.map((log, i) => (
        <div key={i} className="mb-1">
          {log.type === 'error' ? (
            <span className="text-neonred">{`[ERROR] ${log.message}`}</span>
          ) : log.type === 'success' ? (
            <span className="text-matrix" style={{textShadow: '0 0 5px #00FF41'}}>{`[SUCCESS] ${log.message}`}</span>
          ) : (
            <span className="text-matrix">{`[INFO] ${log.message}`}</span>
          )}
        </div>
      ))}
      <div className="animate-pulse text-matrix">_</div>
    </div>
  );
}
