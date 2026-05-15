import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function DropZone({ onAnalyze, logs, setLogs }) {
  const [jdText, setJdText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setResumeFile(acceptedFiles[0]);
      setLogs((prev) => [...prev, { type: 'info', message: `Resume loaded: ${acceptedFiles[0].name}` }]);
    }
  }, [setLogs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });

  const handleInfiltrate = () => {
    if (!jdText) {
      setLogs((prev) => [...prev, { type: 'error', message: 'Missing JD Text' }]);
      return;
    }
    setLogs((prev) => [...prev, { type: 'info', message: 'Extracting PDF metadata...' }]);
    onAnalyze({ resumeFile, jdText });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div 
        className={`border p-6 flex flex-col items-center justify-center cursor-pointer transition ${isDragActive ? 'border-neonred bg-neonred/10' : 'border-matrix hover:bg-matrix/10'}`} 
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p className="animate-pulse text-neonred">Hack the mainframe... drop PDF here</p> :
            <p>{resumeFile ? `[+] ${resumeFile.name}` : `[ Click or Drop Resume PDF Here ]`}</p>
        }
      </div>
      
      <div className="flex flex-col gap-4">
        <textarea 
          className="bg-black border border-matrix text-matrix p-4 w-full h-32 focus:outline-none focus:border-neonred resize-none"
          placeholder="Paste Job Description URL or Text here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
        <button 
          onClick={handleInfiltrate}
          className="bg-matrix text-black py-2 px-6 hover:bg-neonred hover:text-white uppercase font-bold tracking-widest transition"
        >
          [ INFILTRATE ]
        </button>
      </div>
    </div>
  );
}
