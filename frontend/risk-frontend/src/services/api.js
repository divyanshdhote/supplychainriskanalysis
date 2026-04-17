const BASE_URL = "/api";

export const fetchGraph = async () => {
    const response = await fetch(`${BASE_URL}/graph/adjacency`);
    if (!response.ok) throw new Error("Failed to fetch graph");
    return response.json();
};

export const fetchNodes = async () => {
    const response = await fetch(`${BASE_URL}/nodes`);
    if (!response.ok) throw new Error("Failed to fetch nodes");
    return response.json();
};

export const fetchCriticalPath = async () => {
    const response = await fetch(`${BASE_URL}/analysis/critical-path`);
    if (!response.ok) throw new Error("Failed to fetch critical path");
    return response.json(); // expects { path: [{fromNodeId, toNodeId, weight, ...}], totalWeight }
};

export const simulateDisruption = async (failedNodeId) => {
    const response = await fetch(`${BASE_URL}/analysis/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ failedNodeId }),
    });
    if (!response.ok) throw new Error("Failed to simulate disruption");
    return response.json(); // expects { timeline: [{nodeId, nodeName, failureDay}, ...] }
};