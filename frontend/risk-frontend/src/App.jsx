import { useState, useEffect } from 'react'
import { fetchGraph, fetchCriticalPath } from './services/api';
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

  const handleRiskPathAnalysis = () => {
    setPathLoading(true);
    setPathError(null);
    setCriticalPath([]);
    setCriticalEdges([]);
    setTotalPathWeight(null);
    fetchCriticalPath()
      .then((data) => {
        console.log("Critical path response:", data);
        const edges = data.path || [];
        // Store the raw edges for edge highlighting
        setCriticalEdges(edges);

        // Extract ordered node IDs from the edge list
        if (edges.length > 0) {
          const nodeIds = [String(edges[0].fromNodeId)];
          edges.forEach((e) => nodeIds.push(String(e.toNodeId)));
          setCriticalPath(nodeIds);

          // Use totalWeight from API directly
          setTotalPathWeight(data.totalWeight ?? edges.reduce((sum, e) => sum + (e.weight || 0), 0));
        }
      })
      .catch((err) => {
        console.error(err);
        setPathError(err.message);
      })
      .finally(() => setPathLoading(false));
  };

  const handleSimulationResult = ({ timeline }) => {
    const nodeIds = new Set(timeline.map((t) => String(t.nodeId)));
    setDisruptedNodes(nodeIds);
    setDisruptionTimeline(timeline);
  };

  const handleClearSimulation = () => {
    setDisruptedNodes(new Set());
    setDisruptionTimeline(null);
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
