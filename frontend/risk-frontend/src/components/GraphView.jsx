import { useRef } from "react";
import ReactFlow, {
    Background,
    BackgroundVariant,
    MiniMap,
    MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";

const nodeTypes = { custom: CustomNode };

/**
 * Map node type string → display color.
 * No risk involved — purely by role in the chain.
 */
export const getTypeColor = (type = "") => {
    switch (type.toUpperCase()) {
        case "SUB_SUPPLIER":  return "#f472b6"; // pink
        case "SUPPLIER":      return "#38bdf8"; // sky blue
        case "FACTORY":       return "#818cf8"; // indigo
        case "WAREHOUSE":     return "#a78bfa"; // purple
        case "DISTRIBUTOR":   return "#fb923c"; // orange
        case "RETAILER":      return "#34d399"; // green
        default:              return "#94a3b8"; // slate
    }
};

/** Use the numeric tier field from the API directly. */
const getTier = (n) => {
    if (n.tier !== undefined) return Number(n.tier);
    const typeMap = {
        SUB_SUPPLIER: 5, SUPPLIER: 4, FACTORY: 3, WAREHOUSE: 2, DISTRIBUTOR: 1, RETAILER: 0,
    };
    return typeMap[(n.type || "").toUpperCase()] ?? 0;
};

// ── Layout ──────────────────────────────────────────────────────────────────
const ALL_TIERS = [5, 4, 3, 2, 1, 0];  // render order: SUB_SUPPLIER → RETAILER
// Column X positions (pixels) for each tier
const COL_X = { 5: 60, 4: 240, 3: 420, 2: 600, 1: 780, 0: 960 };
const V_GAP = 120;

const GraphView = ({ nodes: rawNodes, edges: rawEdges, criticalPath = [], criticalEdges: rawCriticalEdges = [], disruptedNodes = new Set() }) => {

    // ── Pre-compute critical path sets ───────────────────────────────────
    const criticalNodeSet = new Set(criticalPath.map(String));

    // Build a set of "source-target" strings from the API's edge objects
    const criticalEdgeSet = new Set();
    (Array.isArray(rawCriticalEdges) ? rawCriticalEdges : []).forEach((e) => {
        criticalEdgeSet.add(`${e.fromNodeId}-${e.toNodeId}`);
    });
    const pathActive = criticalPath.length > 0;
    const disruptionActive = disruptedNodes.size > 0;

    // ── Guard ────────────────────────────────────────────────────────────
    if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges)) {
        return (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "700px", color: "#38bdf8",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
                background: "#0a0e1a", letterSpacing: "0.08em",
            }}>
                LOADING GRAPH...
            </div>
        );
    }

    // ── Normalise nodes — attach tier ───────────────────────────────────
    const nodes = rawNodes.map((n) => ({
        ...n,
        id:   n.id.toString(),
        tier: getTier(n),
    }));

    // ── Group by tier for column layout ─────────────────────────────────
    const byTier = {};
    ALL_TIERS.forEach((t) => (byTier[t] = []));
    nodes.forEach((n) => {
        const t = n.tier;
        byTier[t] = byTier[t] || [];
        byTier[t].push(n);
    });

    // ── Build ReactFlow nodes ────────────────────────────────────────────
    const flowNodes = [];
    ALL_TIERS.forEach((tier) => {
        const list = byTier[tier] || [];
        list.forEach((n, i) => {
            const y = (i - (list.length - 1) / 2) * V_GAP + 300;
            const onPath = criticalNodeSet.has(n.id.toString());
            const onDisruption = disruptedNodes.has(n.id.toString());
            flowNodes.push({
                id:   n.id.toString(),
                type: "custom",
                data: {
                    // Spread ALL backend fields so every property is available
                    ...n,
                    // display overrides
                    label:    n.name,
                    nodeType: n.type ?? "",
                    tier,
                    onPath,
                    onDisruption,
                    dimmed:   (pathActive && !onPath) || (disruptionActive && !onDisruption),
                    nodeId:   n.id.toString(),
                },
                position:  { x: COL_X[tier] ?? 60 + (tier - 1) * 220, y },
                draggable: true,
            });
        });
    });

    // ── Build ReactFlow edges ────────────────────────────────────────
    const flowEdges = rawEdges.map((e, i) => {
        const src = e.source?.toString();
        const tgt = e.target?.toString();
        const onPath = criticalEdgeSet.has(`${src}-${tgt}`);
        const edgeColor = onPath ? "#ef4444" : pathActive ? "#1e2d45" : "#3a5080";
        const opacity   = onPath ? 1 : pathActive ? 0.3 : 0.9;
        return {
            id:     `e-${i}`,
            source: src,
            target: tgt,
            type:   "straight",
            style:  {
                stroke:        edgeColor,
                strokeWidth:   onPath ? 3 : 1.5,
                strokeOpacity: opacity,
            },
            markerEnd: {
                type:   MarkerType.Arrow,
                color:  edgeColor,
                width:  onPath ? 20 : 16,
                height: onPath ? 20 : 16,
            },
        };
    });

    // ── Tooltip (DOM-mutated, no re-renders) ────────────────────────────
    const tooltipRef = useRef(null);

    // Human-readable labels for known backend fields
    const FIELD_LABELS = {
        nodeId:              "ID",
        nodeType:            "Type",
        tier:                "Tier",
        name:                "Name",
        country:             "Country",
        region:              "Region",
        inventoryBufferDays: "Inventory Buffer",
        operatingStatus:     "Status",
        riskScore:           "Risk Score",
        latitude:            "Latitude",
        longitude:           "Longitude",
        capacity:            "Capacity",
        reliability:         "Reliability",
        leadTimeDays:        "Lead Time",
    };

    // Fields to skip in the tooltip (internal / display-only)
    const SKIP_FIELDS = new Set(["label", "onPath", "dimmed", "id", "type"]);

    /** Convert camelCase/snake_case to Title Case as fallback */
    const humanize = (key) =>
        key.replace(/([A-Z])/g, " $1")
           .replace(/_/g, " ")
           .replace(/^./, (c) => c.toUpperCase())
           .trim();

    /** Format a value for display */
    const formatValue = (key, val) => {
        if (val == null || val === "") return "—";
        if (key === "inventoryBufferDays" || key === "leadTimeDays") return `${val} days`;
        if (typeof val === "number") return Number.isInteger(val) ? val : val.toFixed(2);
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
    };

    const showTooltip = (event, node) => {
        const el = tooltipRef.current;
        if (!el) return;
        const d = node.data;
        const color = getTypeColor(d.nodeType);

        // Build rows dynamically from all data keys
        const rows = Object.keys(d)
            .filter((key) => !SKIP_FIELDS.has(key))
            .map((key) => ({
                label: FIELD_LABELS[key] || humanize(key),
                value: formatValue(key, d[key]),
            }));

        el.innerHTML = `
            <div style="font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:600;
                        color:${color};margin-bottom:8px;border-bottom:1px solid #1e2d45;padding-bottom:6px;
                        display:flex;align-items:center;gap:6px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
                ${d.label}
            </div>
            ${rows.map(r => `
                <div style="display:flex;justify-content:space-between;gap:20px;margin-bottom:4px;
                            font-family:'IBM Plex Mono',monospace;font-size:11px;">
                    <span style="color:#64748b">${r.label}</span>
                    <span style="color:#e2e8f0;font-weight:500">${r.value}</span>
                </div>
            `).join("")}
        `;
        el.style.display = "block";
        el.style.left    = (event.clientX + 16) + "px";
        el.style.top     = (event.clientY - 12) + "px";
    };

    const moveTooltip = (event) => {
        const el = tooltipRef.current;
        if (el && el.style.display === "block") {
            el.style.left = (event.clientX + 16) + "px";
            el.style.top  = (event.clientY - 12) + "px";
        }
    };

    const hideTooltip = () => {
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
    };

    const miniMapColor = (node) => getTypeColor(node.data?.nodeType);

    return (
        <div style={{
            position: "relative", width: "100%", height: "700px",
            background: "#0a0e1a", fontFamily: "'IBM Plex Sans', sans-serif",
            overflow: "hidden",
        }}>
            {/* Grid overlay */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage:
                    "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), " +
                    "linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                pointerEvents: "none", zIndex: 0,
            }} />

            {/* 4 column separators for 5 tiers */}
            {[20, 40, 60, 80].map((pct) => (
                <div key={pct} style={{
                    position: "absolute", left: `${pct}%`, top: 0, bottom: 0,
                    borderLeft: "1px dashed #1e2d45",
                    pointerEvents: "none", zIndex: 1,
                }} />
            ))}

            {/* Tier column labels */}
            {[
                { label: "SUB-SUPPLIERS",  left: "10%" },
                { label: "SUPPLIERS",      left: "27%" },
                { label: "FACTORIES",      left: "44%" },
                { label: "WAREHOUSES",     left: "61%" },
                { label: "DISTRIBUTORS",   left: "78%" },
                { label: "RETAIL",         left: "95%" },
            ].map(({ label, left }) => (
                <div key={label} style={{
                    position: "absolute", top: 12, left,
                    transform: "translateX(-50%)",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
                    color: "#4a5568", pointerEvents: "none", zIndex: 5, userSelect: "none",
                }}>
                    {label}
                </div>
            ))}

            {/* Legend — colored by type */}
            <div style={{
                position: "absolute", bottom: 16, left: 12,
                display: "flex", gap: 8, flexWrap: "wrap",
                zIndex: 10, pointerEvents: "none",
            }}>
                {[
                    { color: getTypeColor("SUB_SUPPLIER"),  label: "Sub-Supplier"  },
                    { color: getTypeColor("SUPPLIER"),      label: "Supplier"      },
                    { color: getTypeColor("FACTORY"),       label: "Factory"       },
                    { color: getTypeColor("WAREHOUSE"),     label: "Warehouse"     },
                    { color: getTypeColor("DISTRIBUTOR"),   label: "Distributor"   },
                    { color: getTypeColor("RETAILER"),      label: "Retailer"      },
                ].map(({ color, label }) => (
                    <div key={label} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: "rgba(10,14,26,0.85)", border: "1px solid #1e2d45",
                        borderRadius: 20, padding: "4px 10px",
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#94a3b8",
                    }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                        {label}
                    </div>
                ))}
            </div>

            {/* ReactFlow canvas */}
            <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 2 }}>
                <ReactFlow
                    nodes={flowNodes}
                    edges={flowEdges}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.15 }}
                    minZoom={0.2}
                    maxZoom={3}
                    proOptions={{ hideAttribution: true }}
                    onNodeMouseEnter={(event, node) => showTooltip(event, node)}
                    onNodeMouseMove={(event) => moveTooltip(event)}
                    onNodeMouseLeave={hideTooltip}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={40} size={1} color="#1a2235"
                    />
                    <MiniMap
                        nodeColor={miniMapColor}
                        maskColor="rgba(10,14,26,0.75)"
                        style={{ background: "#111827", border: "1px solid #1e2d45" }}
                    />
                </ReactFlow>
            </div>

            {/* Tooltip */}
            <div ref={tooltipRef} style={{
                display: "none", position: "fixed",
                background: "#111827", border: "1px solid #1e2d45",
                borderRadius: 6, padding: "10px 14px",
                pointerEvents: "none", zIndex: 9999,
                minWidth: 200, boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }} />
        </div>
    );
};

export default GraphView;