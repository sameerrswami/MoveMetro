/**
 * PathStrategy - Strategy Pattern Interface
 * All path-finding algorithms must implement this interface.
 * Enables extensibility (Dijkstra now, A* later).
 */
class PathStrategy {
    /**
     * Find optimal path between source and destination.
     * @param {Map} adjacencyList - The graph adjacency list
     * @param {string} sourceId - Source stop ID
     * @param {string} destinationId - Destination stop ID
     * @param {object} options - Additional options (mode, transferPenalty, etc.)
     * @returns {{ path: Array, totalTime: number, totalStops: number, totalTransfers: number, segments: Array }}
     */
    findPath(adjacencyList, sourceId, destinationId, options = {}) {
        throw new Error('findPath() must be implemented by subclass');
    }

    getName() {
        throw new Error('getName() must be implemented by subclass');
    }
}

module.exports = PathStrategy;
