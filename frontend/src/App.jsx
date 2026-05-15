import React, { useState } from 'react';
import DropZone from './components/DropZone';
import Dashboard from './components/Dashboard';
import TerminalLog from './components/TerminalLog';

function App() {
  const [logs, setLogs] = useState([{ type: 'info', message: 'CareerAgent OS Initialized. Awaiting input...' }]);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = async ({ resumeFile, jdText }) => {
    try {
      setLogs(prev => [...prev, { type: 'info', message: 'Connecting to Ghost Network...' }]);
      
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: "Mock text for PDF extraction",
          jd_text: jdText
        })
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();

      setLogs(prev => [...prev, { type: 'success', message: 'Payload received successfully.' }]);
      setLogs(prev => [...prev, { type: 'success', message: 'Ghost Interviewer initialized.' }]);
      setAnalysisResult(data);

    } catch (error) {
      setLogs(prev => [...prev, { type: 'error', message: `Uplink failed: ${error.message}` }]);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto flex flex-col font-mono text-matrix">
      <header className="mb-12 border-b border-matrix pb-4">
        <h1 className="text-5xl font-bold tracking-widest uppercase relative inline-block">
          Career<span className="text-neonred">Agent</span>
          <span className="absolute -inset-1 blur-sm bg-matrix/20 -z-10"></span>
        </h1>
        <p className="text-sm opacity-75 mt-2 animate-pulse">&gt; Covert Operations & Gap Analysis Unit</p>
      </header>

      <main className="flex-1">
        <DropZone onAnalyze={handleAnalyze} logs={logs} setLogs={setLogs} />
        {analysisResult && <Dashboard result={analysisResult} />}
        <TerminalLog logs={logs} />
      </main>
    </div>
  );
}

export default App;
