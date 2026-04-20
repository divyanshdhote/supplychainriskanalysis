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

/**
 * Sends the raw analysis result to the backend, which forwards it to Gemini
 * and returns a plain-English executive risk narrative.
 *
 * @param {"critical-path"|"simulation"} type - which analysis was run
 * @param {object} data - the raw API response object from the algorithm
 * @returns {Promise<string>} the generated narrative text
 */
export const explainWithAi = async (type, data) => {
    const response = await fetch(`${BASE_URL}/analysis/ai-explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: JSON.stringify(data) }),
    });
    if (!response.ok) {
        let errMessage = "AI explanation failed — check your GOOGLE_API_KEY";
        try {
            const errData = await response.json();
            if (errData.message) errMessage = errData.message;
            else if (errData.error) errMessage = errData.error;
        } catch (e) {
            // keep generic error if json parsing fails
        }
        throw new Error(errMessage);
    }
    const json = await response.json();
    return json.narrative;
};