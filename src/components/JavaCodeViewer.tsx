import React, { useState } from 'react';
import { JAVA_SOURCE_CODE } from '../data/javaSourceCode';
import { JavaCodeFile } from '../types';
import { FolderCode, FileCode, Copy, Check, Info, Server, Database, ShieldAlert, BookOpen } from 'lucide-react';

export default function JavaCodeViewer() {
  const [selectedFile, setSelectedFile] = useState<JavaCodeFile>(JAVA_SOURCE_CODE[0]);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = Array.from(new Set(JAVA_SOURCE_CODE.map(f => f.category)));

  const filteredFiles = JAVA_SOURCE_CODE.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="java-code-viewer-container" className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden min-h-[700px] flex flex-col lg:flex-row">
      {/* Left Sidebar - File Tree */}
      <div id="java-viewer-sidebar" className="w-full lg:w-80 bg-slate-950 border-r border-slate-800 flex flex-col p-4">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Spring Boot Backend</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Kiến trúc Spring Boot 3, Java 21, Security JWT, JPA & MySQL chuẩn Senior 10 năm kinh nghiệm.
          </p>
          <input
            id="java-file-search"
            type="text"
            placeholder="Tìm kiếm file code..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] lg:max-h-[500px]">
          {categories.map(category => {
            const filesInCategory = filteredFiles.filter(f => f.category === category);
            if (filesInCategory.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold px-2 py-1 select-none">
                  <FolderCode className="w-4 h-4 text-emerald-500/80" />
                  <span>{category}</span>
                </div>
                <div className="pl-4 space-y-0.5">
                  {filesInCategory.map(file => {
                    const isSelected = selectedFile.id === file.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center space-x-2 text-left px-2 py-1.5 rounded-md transition text-xs ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 font-medium border-l-2 border-emerald-500'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture Badges */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-[10px] text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Security: JWT Stateless Filter</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>DB: MySQL 8.0 (16 tables)</span>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Principles: SOLID, DRY, Clean Code</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Content Viewer */}
      <div id="java-viewer-content" className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Header Section */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] bg-slate-800 text-emerald-400 font-semibold px-2 py-0.5 rounded-full uppercase">
                {selectedFile.category}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {selectedFile.path}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>{selectedFile.name}</span>
            </h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shrink-0 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Đã copy!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao chép Code</span>
              </>
            )}
          </button>
        </div>

        {/* Explanation Card */}
        <div className="m-5 p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start space-x-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-300">
            <strong className="text-slate-200">Giải thích nghiệp vụ:</strong> {selectedFile.explanation}
          </div>
        </div>

        {/* Code Block with line numbers */}
        <div className="flex-1 px-5 pb-5 overflow-auto max-h-[600px] font-mono text-xs text-slate-300 bg-slate-950 border-t border-slate-800/60 p-4 select-text">
          <pre className="whitespace-pre">
            <code>
              {selectedFile.content.split('\n').map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell text-right pr-4 text-slate-600 select-none text-[10px] w-8">
                    {i + 1}
                  </span>
                  <span className="table-cell break-all">
                    {line}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
