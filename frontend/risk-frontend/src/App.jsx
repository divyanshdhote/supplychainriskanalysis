import { useState, useEffect, useRef } from 'react'
import { fetchGraph, fetchCriticalPath, explainWithAi } from './services/api';
import GraphView from "./components/GraphView";
import DisruptionSimulator from "./components/DisruptionSimulator";
import './App.css'

/**
 * The /graph/adjacency response IS the adjacency list (root object).
 * Parse it into flat edge + node lists.
 */
function parseEdges(adjacencyList) {
  const edges = [];
  Object.values(adjacencyList).forEach((edgeArr) => {
    edgeArr.forEach((edge) => {
      edges.push({
        id:                    edge.id.toString(),
        source:                edge.fromNode.id.toString(),
        target:                edge.toNode.id.toString(),
        leadTimeDays:          edge.leadTimeDays,
        disruptionProbability: edge.disruptionProbability,
        impactSeverity:        edge.impactSeverity,
      });
    });
  });
  return edges;
}

function App() {
  const [graph, setGraph]         = useState(null);
  const [error, setError]         = useState(null);
  const [criticalPath, setCriticalPath] = useState([]);
  const [criticalEdges, setCriticalEdges] = useState([]);
  const [totalPathWeight, setTotalPathWeight] = useState(null);
  const [pathLoading, setPathLoading]   = useState(false);
  const [pathError, setPathError]       = useState(null);
  const [disruptedNodes, setDisruptedNodes] = useState(new Set());
  const [disruptionTimeline, setDisruptionTimeline] = useState(null);

  // ── AI Narrative state ────────────────────────────────────────────────────
  const [aiNarrative, setAiNarrative]   = useState(null);
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiError, setAiError]           = useState(null);
  const [aiType, setAiType]             = useState(null); // "critical-path" | "simulation"
  // Cache the last algorithm result so the Explain button can use it
  const lastCriticalPathData = useRef(null);
  const lastSimulationData   = useRef(null);

  const handleRiskPathAnalysis = () => {
    setPathLoading(true);
    setPathError(null);
    setCriticalPath([]);
    setCriticalEdges([]);
    setTotalPathWeight(null);
    setAiNarrative(null);
    setAiError(null);
    fetchCriticalPath()
      .then((data) => {
        console.log("Critical path response:", data);
        const edges = data.path || [];
        setCriticalEdges(edges);

        if (edges.length > 0) {
          const nodeIds = [String(edges[0].fromNodeId)];
          edges.forEach((e) => nodeIds.push(String(e.toNodeId)));
          setCriticalPath(nodeIds);
          setTotalPathWeight(data.totalWeight ?? edges.reduce((sum, e) => sum + (e.weight || 0), 0));
        }
        // Cache for AI explain
        lastCriticalPathData.current = data;
      })
      .catch((err) => {
        console.error(err);
        setPathError(err.message);
      })
      .finally(() => setPathLoading(false));
  };

  const handleExplainWithAi = (type) => {
    const data = type === "critical-path"
      ? lastCriticalPathData.current
      : lastSimulationData.current;

    if (!data) return;

    setAiLoading(true);
    setAiError(null);
    setAiNarrative(null);
    setAiType(type);

    explainWithAi(type, data)
      .then((narrative) => setAiNarrative(narrative))
      .catch((err) => { console.error(err); setAiError(err.message); })
      .finally(() => setAiLoading(false));
  };

  const handleSimulationResult = ({ timeline }) => {
    const nodeIds = new Set(timeline.map((t) => String(t.nodeId)));
    setDisruptedNodes(nodeIds);
    setDisruptionTimeline(timeline);
    // Cache for AI explain
    lastSimulationData.current = { timeline };
    setAiNarrative(null);
    setAiError(null);
  };

  const handleClearSimulation = () => {
    setDisruptedNodes(new Set());
    setDisruptionTimeline(null);
    lastSimulationData.current = null;
    setAiNarrative(null);
    setAiError(null);
  };

  useEffect(() => {
    fetchGraph()
      .then((graphData) => {
        console.log("Graph (adjacency) data:", graphData);

        // graphData IS the adjacency list — parse edges directly
        const edges = parseEdges(graphData);

        // Extract unique nodes from embedded fromNode / toNode objects
        const nodeMap = new Map();
        Object.values(graphData).forEach((edgeArr) => {
          edgeArr.forEach(({ fromNode, toNode }) => {
            if (!nodeMap.has(fromNode.id)) nodeMap.set(fromNode.id, fromNode);
            if (!nodeMap.has(toNode.id))   nodeMap.set(toNode.id,   toNode);
          });
        });

        const nodes = Array.from(nodeMap.values()).map((n) => ({
          ...n,
          id: n.id.toString(),
        }));

        console.log(`${nodes.length} nodes, ${edges.length} edges`);
        setGraph({ nodes, edges });
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  if (error) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: '#f87171', fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 13, background: '#0a0e1a',
    }}>
      Error: {error}
    </div>
  );

  if (!graph) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: '#38bdf8', fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 13, background: '#0a0e1a', letterSpacing: '0.08em',
    }}>
      LOADING GRAPH...
    </div>
  );

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-logo">
          SCRM<span className="logo-slash">//</span>Analyzer
          <span className="logo-sub">Supply Chain Risk Intelligence</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {pathError && (
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              color: "#f87171", letterSpacing: "0.05em",
            }}>
              ⚠ {pathError}
            </span>
          )}
          {criticalPath.length > 0 && (
            <>
              {totalPathWeight !== null && (
                <div
                  id="total-path-weight-badge"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.06em",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    color: "#f87171", borderRadius: 6,
                    padding: "6px 14px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span style={{ color: "#ef4444" }}>⚖</span>
                  TOTAL WEIGHT: {Number.isInteger(totalPathWeight) ? totalPathWeight : totalPathWeight.toFixed(2)}
                </div>
              )}
              <button
                id="clear-path-btn"
                onClick={() => { setCriticalPath([]); setCriticalEdges([]); setTotalPathWeight(null); }}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                  background: "transparent", border: "1px solid #3a5080",
                  color: "#64748b", borderRadius: 6, padding: "6px 14px",
                  cursor: "pointer", letterSpacing: "0.08em",
                }}
              >
                CLEAR PATH
              </button>
            </>
          )}
          <button
            id="risk-path-analysis-btn"
            onClick={handleRiskPathAnalysis}
            disabled={pathLoading}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              fontWeight: 700, letterSpacing: "0.1em",
              background: pathLoading
                ? "#1a2235"
                : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
              border: "1px solid #ef4444",
              color: pathLoading ? "#64748b" : "#fff",
              borderRadius: 6, padding: "7px 18px",
              cursor: pathLoading ? "not-allowed" : "pointer",
              boxShadow: pathLoading ? "none" : "0 0 16px rgba(239,68,68,0.35)",
              transition: "all 0.2s ease",
            }}
          >
            {pathLoading ? "ANALYZING..." : "⚡ RISK PATH ANALYSIS"}
          </button>
          <div className="live-badge">
            <div className="live-dot" />
            LIVE
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <GraphView
          nodes={graph.nodes}
          edges={graph.edges}
          criticalPath={criticalPath}
          criticalEdges={criticalEdges}
          disruptedNodes={disruptedNodes}
        />

        {/* ── AI Explain Buttons ──────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 10, padding: "10px 20px 0",
          flexWrap: "wrap",
        }}>
          {lastCriticalPathData.current && (
            <button
              id="ai-explain-critical-path-btn"
              onClick={() => handleExplainWithAi("critical-path")}
              disabled={aiLoading}
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                fontWeight: 700, letterSpacing: "0.08em",
                background: aiLoading && aiType === "critical-path"
                  ? "#1a2235"
                  : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                border: "1px solid #6366f1",
                color: aiLoading && aiType === "critical-path" ? "#64748b" : "#fff",
                borderRadius: 6, padding: "7px 16px",
                cursor: aiLoading ? "not-allowed" : "pointer",
                boxShadow: aiLoading ? "none" : "0 0 14px rgba(99,102,241,0.35)",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              ✨ {aiLoading && aiType === "critical-path" ? "GEMINI THINKING..." : "EXPLAIN PATH WITH AI"}
            </button>
          )}
          {lastSimulationData.current && (
            <button
              id="ai-explain-simulation-btn"
              onClick={() => handleExplainWithAi("simulation")}
              disabled={aiLoading}
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                fontWeight: 700, letterSpacing: "0.08em",
                background: aiLoading && aiType === "simulation"
                  ? "#1a2235"
                  : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                border: "1px solid #8b5cf6",
                color: aiLoading && aiType === "simulation" ? "#64748b" : "#fff",
                borderRadius: 6, padding: "7px 16px",
                cursor: aiLoading ? "not-allowed" : "pointer",
                boxShadow: aiLoading ? "none" : "0 0 14px rgba(139,92,246,0.35)",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              ✨ {aiLoading && aiType === "simulation" ? "GEMINI THINKING..." : "EXPLAIN SIMULATION WITH AI"}
            </button>
          )}
        </div>

        {/* ── AI Narrative Panel ──────────────────────────────────────── */}
        {(aiLoading || aiNarrative || aiError) && (
          <div
            id="ai-narrative-panel"
            style={{
              margin: "12px 20px 0",
              background: "rgba(99, 102, 241, 0.06)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: 10,
              padding: "18px 22px",
              backdropFilter: "blur(12px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glowing top border accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)",
              borderRadius: "10px 10px 0 0",
            }} />

            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, fontWeight: 700,
                color: "#a5b4fc", letterSpacing: "0.12em",
              }}>
                GEMINI AI • {aiType === "critical-path" ? "CRITICAL PATH ANALYSIS" : "DISRUPTION SIMULATION"}
              </span>
              <button
                id="ai-dismiss-btn"
                onClick={() => { setAiNarrative(null); setAiError(null); }}
                style={{
                  marginLeft: "auto", background: "transparent",
                  border: "none", color: "#475569", cursor: "pointer",
                  fontSize: 16, lineHeight: 1, padding: 0,
                }}
                title="Dismiss"
              >✕</button>
            </div>

            {aiLoading && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                color: "#a5b4fc", fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="3" fill="none" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
                Analysing with Gemini...
              </div>
            )}
            {aiError && (
              <p style={{
                color: "#f87171", fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12, margin: 0,
              }}>
                ⚠ {aiError}
              </p>
            )}
            {aiNarrative && (
              <p style={{
                color: "#cbd5e1", fontFamily: "'Inter', 'IBM Plex Mono', monospace",
                fontSize: 13.5, lineHeight: 1.75, margin: 0,
                whiteSpace: "pre-wrap",
              }}>
                {aiNarrative}
              </p>
            )}
          </div>
        )}

        <DisruptionSimulator
          nodes={graph.nodes}
          onSimulationResult={handleSimulationResult}
          onClearSimulation={handleClearSimulation}
        />
      </main>
    </div>
  );
}

export default App
