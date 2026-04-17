import { useState } from "react";
import { simulateDisruption } from "../services/api";
import { getTypeColor } from "./GraphView";

/**
 * DisruptionSimulator — Dashboard section for triggering and viewing
 * supply-chain disruption propagation simulations.
 *
 * Props:
 *   - nodes: the full list of graph nodes (with id, name, type)
 *   - onSimulationResult: callback({timeline, failedNodeId}) to highlight affected nodes on graph
 *   - onClearSimulation: callback() to clear graph highlights
 */
const DisruptionSimulator = ({ nodes = [], onSimulationResult, onClearSimulation }) => {
    const [timeline, setTimeline] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeNodeId, setActiveNodeId] = useState(null);

    const handleSimulate = async (node) => {
        setLoading(true);
        setError(null);
        setTimeline(null);
        setActiveNodeId(Number(node.id));
        try {
            const data = await simulateDisruption(Number(node.id));
            setTimeline(data.timeline || []);
            onSimulationResult?.({
                timeline: data.timeline || [],
                failedNodeId: Number(node.id),
            });
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setTimeline(null);
        setActiveNodeId(null);
        setError(null);
        onClearSimulation?.();
    };

    // Group nodes by type for the button grid
    const grouped = {};
    nodes.forEach((n) => {
        const type = (n.type || "UNKNOWN").toUpperCase();
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(n);
    });

    const typeOrder = ["SUB_SUPPLIER", "SUPPLIER", "FACTORY", "WAREHOUSE", "DISTRIBUTOR", "RETAILER"];
    const sortedTypes = typeOrder.filter((t) => grouped[t]?.length);
    Object.keys(grouped).forEach((t) => {
        if (!sortedTypes.includes(t)) sortedTypes.push(t);
    });

    const PREDEFINED_EVENTS = [
        { name: "🌀 Cyclone in Australia", match: "Australia", color: "#38bdf8" },
        { name: "🛡️ War in UAE", match: "UAE", color: "#f87171" },
        { name: "🚢 Port Strike in China", match: "China", color: "#fbbf24" },
        { name: "🌍 Earthquake in Taiwan", match: "Taiwan", color: "#fb923c" },
        { name: "🔥 Factory Fire in India", match: "India", color: "#ef4444" },
        { name: "❄️ Winter Storm in USA", match: "USA", color: "#94a3b8" }
    ];

    const realWorldScenarios = PREDEFINED_EVENTS.map(event => {
        const matchingNode = nodes.find(n => n.country && n.country.toLowerCase() === event.match.toLowerCase());
        return matchingNode ? { ...event, node: matchingNode } : null;
    }).filter(Boolean);

    const coveredCountries = PREDEFINED_EVENTS.map(e => e.match.toLowerCase());
    const otherCountries = [...new Set(nodes.map(n => n.country).filter(c => c && !coveredCountries.includes(c.toLowerCase())))];
    
    otherCountries.forEach((country) => {
        const matchingNode = nodes.find(n => n.country === country);
        if (matchingNode && realWorldScenarios.length < 10) {
            realWorldScenarios.push({
                name: `⚠️ Crisis in ${country}`,
                match: country,
                color: "#10b981",
                node: matchingNode
            });
        }
    });

    const maxDay = timeline ? Math.max(...timeline.map((t) => t.failureDay), 1) : 1;

    return (
        <section
            id="disruption-simulator-dashboard"
            style={{
                width: "100%",
                background: "rgba(10, 14, 26, 0.6)",
                borderTop: "1px solid #1e2d45",
                padding: "24px",
                boxSizing: "border-box",
                zIndex: 10,
            }}
        >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                }}>
                    <div>
                        <div style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#fbbf24",
                            letterSpacing: "0.1em",
                            marginBottom: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}>
                            <span style={{ fontSize: 18 }}>💥</span>
                            DISRUPTION SIMULATOR
                        </div>
                        <div style={{
                            fontFamily: "'IBM Plex Sans', sans-serif",
                            fontSize: 12,
                            color: "#94a3b8",
                        }}>
                            Select a node to simulate how failure propagates through your supply chain over time.
                        </div>
                    </div>
                    {timeline && (
                        <button
                            id="clear-simulation-btn-top"
                            onClick={handleClear}
                            style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 11,
                                color: "#64748b",
                                background: "rgba(30, 45, 69, 0.4)",
                                border: "1px solid #1e2d45",
                                borderRadius: 6,
                                padding: "6px 14px",
                                cursor: "pointer",
                                letterSpacing: "0.06em",
                                transition: "all 0.2s ease",
                            }}
                        >
                            RESET SIMULATION
                        </button>
                    )}
                </div>

                {/* Dashboard Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: timeline || loading ? "1fr 400px" : "1fr",
                    gap: "32px",
                    transition: "all 0.3s ease",
                }}>
                    {/* Left side: Node Grid */}
                    <div style={{
                        background: "rgba(10, 14, 26, 0.4)",
                        border: "1px solid #1e2d45",
                        borderRadius: "12px",
                        padding: "20px",
                    }}>
                        {/* Real-World Scenarios */}
                        {realWorldScenarios.length > 0 && (
                            <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px dashed #1e2d45" }}>
                                <div style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#f87171",
                                    letterSpacing: "0.15em",
                                    marginBottom: 10,
                                    textTransform: "uppercase",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}>
                                    <span style={{
                                        width: 6, height: 6,
                                        borderRadius: "50%",
                                        background: "#f87171",
                                        boxShadow: `0 0 8px #f8717166`,
                                    }} />
                                    REAL-WORLD SCENARIOS
                                </div>
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                }}>
                                    {realWorldScenarios.map((scenario, idx) => {
                                        const isActive = activeNodeId === Number(scenario.node.id);
                                        return (
                                            <button
                                                key={`scenario-${idx}`}
                                                id={`scenario-btn-${scenario.node.id}`}
                                                onClick={() => handleSimulate(scenario.node)}
                                                disabled={loading}
                                                style={{
                                                    fontFamily: "'IBM Plex Mono', monospace",
                                                    fontSize: 11,
                                                    fontWeight: isActive ? 700 : 500,
                                                    color: isActive ? "#0a0e1a" : scenario.color,
                                                    background: isActive ? scenario.color : `${scenario.color}08`,
                                                    border: `1px solid ${isActive ? scenario.color : `${scenario.color}30`}`,
                                                    borderRadius: 8,
                                                    padding: "7px 14px",
                                                    cursor: loading ? "not-allowed" : "pointer",
                                                    transition: "all 0.2s ease",
                                                    opacity: loading && !isActive ? 0.4 : 1,
                                                    boxShadow: isActive ? `0 0 12px ${scenario.color}44` : "none",
                                                }}
                                                title={`Affects: ${scenario.node.name}`}
                                            >
                                                {scenario.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {sortedTypes.map((type) => {
                            const color = getTypeColor(type);
                            const typeLabel = type.replace("_", " ");
                            return (
                                <div key={type} style={{ marginBottom: "20px" }}>
                                    <div style={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: color,
                                        letterSpacing: "0.15em",
                                        marginBottom: 10,
                                        textTransform: "uppercase",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}>
                                        <span style={{
                                            width: 6, height: 6,
                                            borderRadius: "50%",
                                            background: color,
                                            boxShadow: `0 0 8px ${color}66`,
                                        }} />
                                        {typeLabel}
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 8,
                                    }}>
                                        {grouped[type].map((node) => {
                                            const isActive = activeNodeId === Number(node.id);
                                            return (
                                                <button
                                                    key={node.id}
                                                    id={`sim-node-btn-${node.id}`}
                                                    onClick={() => handleSimulate(node)}
                                                    disabled={loading}
                                                    style={{
                                                        fontFamily: "'IBM Plex Mono', monospace",
                                                        fontSize: 11,
                                                        fontWeight: isActive ? 700 : 500,
                                                        color: isActive ? "#0a0e1a" : color,
                                                        background: isActive ? color : `${color}08`,
                                                        border: `1px solid ${isActive ? color : `${color}30`}`,
                                                        borderRadius: 8,
                                                        padding: "7px 14px",
                                                        cursor: loading ? "not-allowed" : "pointer",
                                                        transition: "all 0.2s ease",
                                                        opacity: loading && !isActive ? 0.4 : 1,
                                                        boxShadow: isActive ? `0 0 12px ${color}44` : "none",
                                                    }}
                                                >
                                                    {node.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right side: Results (Visible only if simulating or data present) */}
                    {(timeline || loading || error) && (
                        <div style={{
                            background: "rgba(10, 14, 26, 0.4)",
                            border: "1px solid #1e2d45",
                            borderRadius: "12px",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            minHeight: "400px",
                        }}>
                            {loading && (
                                <div style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 12,
                                    color: "#fbbf24",
                                    letterSpacing: "0.08em",
                                    gap: 16,
                                }}>
                                    <div style={{
                                        width: 32, height: 32,
                                        border: "3px solid #fbbf2422",
                                        borderTop: "3px solid #fbbf24",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite",
                                    }} />
                                    CALCULATING PROPAGATION...
                                </div>
                            )}

                            {error && (
                                <div style={{
                                    padding: "16px",
                                    background: "rgba(239, 68, 68, 0.08)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    borderRadius: 8,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 12,
                                    color: "#f87171",
                                }}>
                                    ⚠ {error}
                                </div>
                            )}

                            {timeline && !loading && (
                                <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
                                    <div style={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "#e2e8f0",
                                        letterSpacing: "0.05em",
                                        marginBottom: "16px",
                                        borderBottom: "1px solid #1e2d45",
                                        paddingBottom: "10px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}>
                                        <span>TIMELINE RESULTS</span>
                                        <span style={{ color: "#64748b" }}>{timeline.length} NODES</span>
                                    </div>

                                    <div style={{
                                        display: "flex",
                                        gap: "10px",
                                        marginBottom: "20px",
                                    }}>
                                        <div style={{
                                            flex: 1,
                                            background: "rgba(239, 68, 68, 0.1)",
                                            border: "1px solid rgba(239, 68, 68, 0.2)",
                                            borderRadius: 8,
                                            padding: "12px",
                                        }}>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: "#f87171", fontFamily: "'IBM Plex Mono', monospace" }}>
                                                {Math.max(...timeline.map(t => t.failureDay))}
                                            </div>
                                            <div style={{ fontSize: 9, color: "#64748b", marginTop: 2, letterSpacing: "0.05em" }}>DAYS TO TOTAL IMPACT</div>
                                        </div>
                                        <div style={{
                                            flex: 1,
                                            background: "rgba(251, 191, 36, 0.1)",
                                            border: "1px solid rgba(251, 191, 36, 0.2)",
                                            borderRadius: 8,
                                            padding: "12px",
                                        }}>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: "#fbbf24", fontFamily: "'IBM Plex Mono', monospace" }}>
                                                {timeline.length}
                                            </div>
                                            <div style={{ fontSize: 9, color: "#64748b", marginTop: 2, letterSpacing: "0.05em" }}>AFFECTED ENTITIES</div>
                                        </div>
                                    </div>

                                    {/* Timeline list */}
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        maxHeight: "350px",
                                        overflowY: "auto",
                                        paddingRight: "8px",
                                    }}>
                                        {timeline.map((entry, i) => {
                                            const progress = maxDay > 0 ? entry.failureDay / maxDay : 0;
                                            const dotColor = `hsl(${45 - progress * 40}, 90%, 60%)`;

                                            return (
                                                <div
                                                    key={entry.nodeId}
                                                    style={{
                                                        display: "flex",
                                                        gap: "12px",
                                                        padding: "10px",
                                                        background: "rgba(30, 45, 69, 0.2)",
                                                        border: "1px solid #1e2d45",
                                                        borderRadius: "8px",
                                                        alignItems: "center",
                                                        animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`,
                                                    }}
                                                >
                                                    <div style={{
                                                        width: "35px",
                                                        fontFamily: "'IBM Plex Mono', monospace",
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: dotColor,
                                                        textAlign: "right",
                                                    }}>
                                                        D{entry.failureDay}
                                                    </div>
                                                    <div style={{
                                                        width: 2,
                                                        height: "20px",
                                                        background: i === 0 ? "#fbbf24" : "#1e2d45",
                                                    }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>
                                                            {entry.nodeName}
                                                        </div>
                                                        <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>
                                                            {i === 0 ? "Initial Disruption" : `Cascading failure reached node`}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DisruptionSimulator;
