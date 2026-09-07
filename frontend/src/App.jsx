import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, FileCode, CheckCircle, AlertTriangle, Bug, ArrowRight } from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ai-code-debugger-gray.vercel.app/api',
});

function App() {
  const [code, setCode] = useState('# Paste your Python code here\n\ndef calculate_sum(a, b):\n    return a + b\n');
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [fixedCode, setFixedCode] = useState(null);
  const [viewMode, setViewMode] = useState('diff'); // 'diff' or 'code'

  const handleReview = async () => {
    setLoading(true);
    setIssues([]);
    setFixedCode(null);
    try {
      const response = await api.post('/review', { code });
      setIssues(response.data.issues);
    } catch (error) {
      console.error("Error during review:", error);
      alert("Failed to analyze code. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    setLoading(true);
    try {
      const response = await api.post('/fix', { code, issues });
      setFixedCode(response.data.fixed_code);
    } catch (error) {
      console.error("Error during fix:", error);
      alert("Failed to fix code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <Bug className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CodeFix</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleReview}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
          >
            <Play size={16} className="mr-2" />
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 flex flex-col border-r border-slate-200 bg-white">
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center text-sm font-medium text-slate-600">
            <FileCode size={16} className="mr-2" />
            main.py
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="light"
              value={code}
              onChange={(value) => setCode(value)}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col bg-slate-50 overflow-y-auto">
          <div className="px-6 py-8">
            {issues.length === 0 && !loading && !fixedCode && (
              <div className="flex flex-col items-center justify-center text-slate-400 mt-20">
                <AlertTriangle size={48} className="mb-4 opacity-20" />
                <p>Run analysis to detect bugs and quality issues.</p>
              </div>
            )}
            
            {loading && (
              <div className="flex flex-col items-center justify-center text-slate-500 mt-20 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Processing...</p>
              </div>
            )}

            {!loading && issues.length > 0 && !fixedCode && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <AlertTriangle size={20} className="mr-2 text-amber-500" />
                    Found {issues.length} issue(s)
                  </h2>
                  <button 
                    onClick={handleFix}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md transition-colors flex items-center"
                  >
                    Auto-Fix All <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
                
                {issues.map((issue, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-900">{issue.title || issue.message || 'Issue'}</h3>
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded font-medium border border-amber-200">
                        {issue.category || 'Quality'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{issue.explanation || issue.message}</p>
                    <div className="bg-slate-50 p-3 rounded font-mono text-xs text-slate-700 border border-slate-100">
                      Line {issue.line}: {issue.suggested_fix || 'Review manually'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && fixedCode && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <CheckCircle size={20} className="mr-2 text-green-500" />
                    Fix Generated
                  </h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setViewMode(viewMode === 'diff' ? 'code' : 'diff')}
                      className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                    >
                      {viewMode === 'diff' ? 'Show Full Code' : 'Show Diff'}
                    </button>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  {viewMode === 'diff' ? (
                    <div className="text-sm">
                      <ReactDiffViewer 
                        oldValue={code} 
                        newValue={fixedCode} 
                        splitView={false} 
                        hideLineNumbers={false}
                        styles={{
                          variables: {
                            light: {
                              diffViewerBackground: '#fff',
                              addedBackground: '#e6ffed',
                              addedColor: '#24292e',
                              removedBackground: '#ffeef0',
                              removedColor: '#24292e',
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <Editor
                      height="400px"
                      defaultLanguage="python"
                      theme="light"
                      value={fixedCode}
                      options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;