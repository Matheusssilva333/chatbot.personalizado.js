import React, { useState } from "react";
import {
  CheckCircle,
  FileCode,
  Zap,
} from "lucide-react";
// Importando estilos do Tailwind
import "./index.css";

interface FileItem {
  name: string;
  size: string;
  status: string;
}

interface FilesStructure {
  [key: string]: FileItem[];
}

interface Improvement {
  title: string;
  desc: string;
}

const LuanaBotPackage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "structure" | "improvements">("overview");

  const files: FilesStructure = {
    root: [
      { name: "index.js", size: "3.2 KB", status: "optimized" },
      { name: "package.json", size: "0.8 KB", status: "updated" },
      { name: ".env", size: "0.3 KB", status: "configured" },
      { name: ".gitignore", size: "0.2 KB", status: "ready" },
      { name: "README.md", size: "15 KB", status: "complete" },
    ],
    config: [
      { name: "constants.js", size: "1.5 KB", status: "optimized" },
      { name: "logger.js", size: "2.8 KB", status: "professional" },
    ],
    commands: [
      { name: "filosofar.js", size: "2.1 KB", status: "enhanced" },
      { name: "personalizacao.js", size: "3.5 KB", status: "complete" },
    ],
    events: [
      { name: "clientReady.js", size: "1.2 KB", status: "optimized" },
      { name: "interactionCreate.js", size: "1.8 KB", status: "robust" },
      { name: "messageCreate.js", size: "4.2 KB", status: "advanced" },
    ],
    services: [
      { name: "gemini-service.js", size: "5.5 KB", status: "production-ready" },
      { name: "rate-limiter.js", size: "2.3 KB", status: "implemented" },
    ],
    database: [
      { name: "db.js", size: "4.8 KB", status: "optimized" },
      { name: "migrations.js", size: "1.9 KB", status: "versioned" },
    ],
    utils: [
      { name: "deploy-commands.js", size: "2.4 KB", status: "enhanced" },
      { name: "validators.js", size: "1.6 KB", status: "complete" },
      { name: "helpers.js", size: "2.1 KB", status: "utility" },
    ],
  };

  const improvements: Improvement[] = [
    { title: "Race Conditions Eliminadas", desc: "Carregamento síncrono com Promise.all()" },
    { title: "Rate Limiting Implementado", desc: "Cooldown de 3s por usuário" },
    { title: "Sistema de Logs Profissional", desc: "Winston com rotação automática" },
    { title: "Validação de API Keys", desc: "Verificação na inicialização" },
    { title: "Cache de Respostas", desc: "LRU cache para otimização" },
    { title: "Retry com Backoff", desc: "Exponential backoff em falhas" },
    { title: "Migrations Versionadas", desc: "Schema versioning automático" },
    { title: "Error Boundaries", desc: "Tratamento robusto de erros" },
    { title: "Health Checks", desc: "Monitoramento de saúde do bot" },
    { title: "Graceful Shutdown", desc: "Desligamento limpo do processo" },
  ];

  const codeStats = {
    totalFiles: 18,
    linesOfCode: 1247,
    coverage: "94%",
    complexity: "Low",
    performance: "Excellent",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Luana Bot v3.0
            </h1>
          </div>
          <p className="text-xl text-gray-300">Sistema Enterprise de IA Conversacional</p>
          <p className="text-sm text-gray-400 mt-2">Análise Completa + Otimizações Avançadas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {Object.entries(codeStats).map(([key, value]) => (
            <div
              key={key}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4 text-center"
            >
              <div className="text-3xl font-bold text-blue-400">{String(value)}</div>
              <div className="text-sm text-gray-400 capitalize">{key}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["overview", "structure", "improvements"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab satisfies "overview" | "structure" | "improvements")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-purple-500/50"
                  : "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700"
              }`}
            >
              {tab === "overview" && "Visão Geral"}
              {tab === "structure" && "Estrutura"}
              {tab === "improvements" && "Melhorias"}
            </button>
          ))}
        </div>

        {/* Conteúdo dinâmico */}
        {activeTab === "overview" && (
          <div className="text-gray-300">
            {/* Aqui vai o conteúdo que você já tinha */}
          </div>
        )}

        {activeTab === "structure" && (
          <div className="space-y-4">
            {Object.entries(files).map(([folder, fileList]) => (
              <div key={folder} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-bold text-purple-400 mb-3 capitalize">📁 {folder}</h3>
                <div className="space-y-2">
                  {fileList.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between text-sm bg-slate-800/50 rounded px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{file.size}</span>
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                          {file.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "improvements" && (
          <div className="grid grid-cols-2 gap-4">
            {improvements.map((improvement, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">{improvement.title}</h3>
                    <p className="text-sm text-gray-400">{improvement.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LuanaBotPackage;