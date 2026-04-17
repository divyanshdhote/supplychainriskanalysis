import { Handle, Position } from "reactflow";
import { getTypeColor } from "./GraphView";

/**
 * Props via `data`:
 *  - label               : string  node display name
 *  - nodeType            : string  e.g. "SUPPLIER", "ASSEMBLY"
 *  - tier                : number
 *  - onPath              : boolean — is this node on the critical risk path?
 *  - dimmed              : boolean — should this node be faded out?
 *  - inventoryBufferDays : number
 *  - operatingStatus     : string
 *  - nodeId              : string
 */
const CustomNode = ({ data }) => {
    const { label, nodeType = "", onPath = false, onDisruption = false, dimmed = false } = data;

    const typeColor = getTypeColor(nodeType);

    // When on the critical path: override with red styling
    // When disrupted: override with amber styling
    const borderColor = onPath ? "#ef4444" : onDisruption ? "#fbbf24" : typeColor;
    const bgColor     = onPath ? "#ef444418" : onDisruption ? "#fbbf2418" : `${typeColor}18`;
    const boxShadow   = onPath
        ? "0 0 24px #ef444488, 0 0 8px #ef444466, 0 0 40px #ef444433"
        : onDisruption
            ? "0 0 24px #fbbf2488, 0 0 8px #fbbf2466, 0 0 40px #fbbf2433"
            : `0 0 18px ${typeColor}44, 0 0 6px ${typeColor}22`;

    // Short readable type label shown inside the circle
    const typeShort = nodeType.charAt(0) + nodeType.slice(1).toLowerCase();

    return (
        <div style={{
            position: "relative",
            width: 80, height: 80,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: dimmed ? 0.25 : 1,
            transition: "opacity 0.3s ease",
        }}>
            {/* Pulse ring — visible for critical path or disrupted nodes */}
            {(onPath || onDisruption) && (
                <div style={{
                    position: "absolute",
                    width: 96, height: 96,
                    borderRadius: "50%",
                    border: `1.5px solid ${onPath ? "#ef444466" : "#fbbf2466"}`,
                    animation: onPath ? "criticalPulse 1.8s ease-in-out infinite" : "disruptionPulse 2s ease-in-out infinite",
                    pointerEvents: "none",
                }} />
            )}

            {/* Main circle */}
            <div style={{
                width: 80, height: 80,
                borderRadius: "50%",
                border: `${(onPath || onDisruption) ? 2.5 : 1.5}px solid ${borderColor}`,
                background: bgColor,
                boxShadow,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 3, cursor: "pointer",
                transition: "border 0.3s, box-shadow 0.3s",
            }}>
                {/* Node name */}
                <div style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 10, fontWeight: (onPath || onDisruption) ? 600 : 400,
                    color: onPath ? "#fca5a5" : onDisruption ? "#fde68a" : "#e2e8f0",
                    textAlign: "center",
                    lineHeight: 1.2, padding: "0 6px",
                    maxWidth: 68, wordBreak: "break-word",
                }}>
                    {label}
                </div>

                {/* Type sublabel */}
                <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 8,
                    color: onPath ? "#ef4444" : onDisruption ? "#fbbf24" : typeColor,
                    opacity: 0.85,
                    letterSpacing: "0.04em",
                }}>
                    {typeShort}
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Left}
                style={{ background: borderColor, border: "none", width: 6, height: 6 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: borderColor, border: "none", width: 6, height: 6 }}
            />
        </div>
    );
};

export default CustomNode;