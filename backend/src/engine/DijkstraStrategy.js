const PathStrategy = require('./PathStrategy');

/**
 * MinHeap implementation for Dijkstra's priority queue.
 * Provides O(log n) insert and extract-min operations.
 */
class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(item) {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return min;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _bubbleUp(idx) {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.heap[parent].cost <= this.heap[idx].cost) {
                // Lexicographic tie-breaking for deterministic output
                if (
                    this.heap[parent].cost === this.heap[idx].cost &&
                    this.heap[parent].stopId > this.heap[idx].stopId
                ) {
                    [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
                    idx = parent;
                } else {
                    break;
                }
            } else {
                [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
                idx = parent;
            }
        }
    }

    _sinkDown(idx) {
        const length = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;

            if (left < length) {
                if (
                    this.heap[left].cost < this.heap[smallest].cost ||
                    (this.heap[left].cost === this.heap[smallest].cost &&
                        this.heap[left].stopId < this.heap[smallest].stopId)
                ) {
                    smallest = left;
                }
            }
            if (right < length) {
                if (
                    this.heap[right].cost < this.heap[smallest].cost ||
                    (this.heap[right].cost === this.heap[smallest].cost &&
                        this.heap[right].stopId < this.heap[smallest].stopId)
                ) {
                    smallest = right;
                }
            }

            if (smallest !== idx) {
                [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

/**
 * DijkstraStrategy - Implements Dijkstra's shortest path algorithm.
 * Supports multiple optimization modes:
 * - SHORTEST_TIME: Minimize total travel time
 * - MINIMUM_STOPS: Minimize number of stops
 * - MINIMUM_TRANSFERS: Minimize number of line transfers
 * - OPTIMAL: Weighted mix of time + transfer penalty
 *
 * Time Complexity: O((V + E) log V)
 * Space Complexity: O(V + E)
 */
class DijkstraStrategy extends PathStrategy {
    getName() {
        return 'dijkstra';
    }

    findPath(adjacencyList, sourceId, destinationId, options = {}) {
        const mode = options.mode || 'OPTIMAL';
        const transferPenalty = options.transferPenalty || 5;

        if (!adjacencyList.has(sourceId) || !adjacencyList.has(destinationId)) {
            return null;
        }

        // dist[stopId] = { cost, stops, transfers, prevStop, prevRouteId, routeId }
        const dist = new Map();
        const visited = new Set();
        const pq = new MinHeap();

        // Initialize source
        dist.set(sourceId, {
            cost: 0,
            stops: 0,
            transfers: 0,
            travelTime: 0,
            prevStop: null,
            prevRouteId: null,
            routeId: null,
        });

        pq.push({ stopId: sourceId, cost: 0 });

        while (!pq.isEmpty()) {
            const { stopId: current, cost: currentCost } = pq.pop();

            if (visited.has(current)) continue;
            visited.add(current);

            // Found destination
            if (current === destinationId) {
                return this._reconstructPath(dist, sourceId, destinationId);
            }

            const neighbors = adjacencyList.get(current) || [];
            const currentData = dist.get(current);

            for (const edge of neighbors) {
                if (visited.has(edge.to)) continue;

                // Detect transfer: route changes (and we already have a route)
                const isTransfer =
                    currentData.routeId !== null && edge.routeId !== currentData.routeId;
                const newTransfers = currentData.transfers + (isTransfer ? 1 : 0);
                const newTravelTime = currentData.travelTime + edge.travelTime;
                const newStops = currentData.stops + 1;

                // Compute cost based on mode
                let newCost;
                switch (mode) {
                    case 'SHORTEST_TIME':
                        newCost = newTravelTime;
                        break;
                    case 'MINIMUM_STOPS':
                        newCost = newStops;
                        break;
                    case 'MINIMUM_TRANSFERS':
                        newCost = newTransfers * 1000 + newTravelTime;
                        break;
                    case 'OPTIMAL':
                    default:
                        newCost = newTravelTime + transferPenalty * newTransfers;
                        break;
                }

                const existingDist = dist.get(edge.to);
                if (!existingDist || newCost < existingDist.cost) {
                    dist.set(edge.to, {
                        cost: newCost,
                        stops: newStops,
                        transfers: newTransfers,
                        travelTime: newTravelTime,
                        prevStop: current,
                        prevRouteId: currentData.routeId,
                        routeId: edge.routeId,
                    });
                    pq.push({ stopId: edge.to, cost: newCost });
                }
            }
        }

        // No path found
        return null;
    }

    _reconstructPath(dist, sourceId, destinationId) {
        const path = [];
        let current = destinationId;

        while (current !== null) {
            const data = dist.get(current);
            path.unshift({
                stopId: current,
                routeId: data.routeId,
            });
            current = data.prevStop;
        }

        const destData = dist.get(destinationId);

        // Build segments (group by route for clear interchange marking)
        const segments = [];
        let currentSegment = null;

        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            if (!currentSegment || (node.routeId && node.routeId !== currentSegment.routeId)) {
                if (currentSegment) {
                    segments.push(currentSegment);
                }
                currentSegment = {
                    routeId: node.routeId,
                    stops: [node.stopId],
                    isInterchange: segments.length > 0,
                };
            } else {
                currentSegment.stops.push(node.stopId);
            }
        }
        if (currentSegment) segments.push(currentSegment);

        return {
            path: path.map((p) => p.stopId),
            totalTime: destData.travelTime,
            totalStops: destData.stops,
            totalTransfers: destData.transfers,
            totalCost: destData.cost,
            segments,
        };
    }
}

module.exports = DijkstraStrategy;
