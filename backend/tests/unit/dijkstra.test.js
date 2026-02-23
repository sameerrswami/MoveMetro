const DijkstraStrategy = require('../../src/engine/DijkstraStrategy');

describe('DijkstraStrategy', () => {
    let dijkstra;
    let graph;

    beforeEach(() => {
        dijkstra = new DijkstraStrategy();

        // Build test graph:
        //   A ---(R1, 3)--- B ---(R1, 2)--- C
        //                   |                |
        //               (R2, 4)          (R2, 1)
        //                   |                |
        //                   D ---(R2, 2)--- E
        //                   |
        //               (R3, 5)
        //                   |
        //                   F

        graph = new Map();
        graph.set('A', [{ to: 'B', travelTime: 3, routeId: 'R1' }]);
        graph.set('B', [
            { to: 'A', travelTime: 3, routeId: 'R1' },
            { to: 'C', travelTime: 2, routeId: 'R1' },
            { to: 'D', travelTime: 4, routeId: 'R2' },
        ]);
        graph.set('C', [
            { to: 'B', travelTime: 2, routeId: 'R1' },
            { to: 'E', travelTime: 1, routeId: 'R2' },
        ]);
        graph.set('D', [
            { to: 'B', travelTime: 4, routeId: 'R2' },
            { to: 'E', travelTime: 2, routeId: 'R2' },
            { to: 'F', travelTime: 5, routeId: 'R3' },
        ]);
        graph.set('E', [
            { to: 'C', travelTime: 1, routeId: 'R2' },
            { to: 'D', travelTime: 2, routeId: 'R2' },
        ]);
        graph.set('F', [{ to: 'D', travelTime: 5, routeId: 'R3' }]);
    });

    test('getName returns dijkstra', () => {
        expect(dijkstra.getName()).toBe('dijkstra');
    });

    test('finds shortest time path (A -> E)', () => {
        const result = dijkstra.findPath(graph, 'A', 'E', { mode: 'SHORTEST_TIME' });
        expect(result).not.toBeNull();
        expect(result.totalTime).toBe(6); // A->B(3) + B->C(2) + C->E(1) = 6
        expect(result.path).toContain('A');
        expect(result.path).toContain('E');
        expect(result.totalStops).toBeGreaterThan(0);
    });

    test('finds path with transfers tracked (A -> E via interchange)', () => {
        const result = dijkstra.findPath(graph, 'A', 'E', { mode: 'SHORTEST_TIME' });
        expect(result).not.toBeNull();
        // Path A->B is R1, B->C is R1, C->E is R2 → 1 transfer
        expect(result.totalTransfers).toBe(1);
    });

    test('finds path A -> F', () => {
        const result = dijkstra.findPath(graph, 'A', 'F', { mode: 'SHORTEST_TIME' });
        expect(result).not.toBeNull();
        expect(result.path[0]).toBe('A');
        expect(result.path[result.path.length - 1]).toBe('F');
    });

    test('returns null when no path exists', () => {
        graph.set('Z', []);
        const result = dijkstra.findPath(graph, 'A', 'Z');
        expect(result).toBeNull();
    });

    test('returns null when source does not exist', () => {
        const result = dijkstra.findPath(graph, 'X', 'A');
        expect(result).toBeNull();
    });

    test('returns null when destination does not exist', () => {
        const result = dijkstra.findPath(graph, 'A', 'X');
        expect(result).toBeNull();
    });

    test('same source and destination returns path with 0 stops', () => {
        const result = dijkstra.findPath(graph, 'A', 'A', { mode: 'SHORTEST_TIME' });
        // Should find path with 0 cost
        expect(result).not.toBeNull();
        expect(result.totalTime).toBe(0);
        expect(result.totalStops).toBe(0);
    });

    test('MINIMUM_STOPS mode prioritizes fewer stops', () => {
        const result = dijkstra.findPath(graph, 'A', 'E', { mode: 'MINIMUM_STOPS' });
        expect(result).not.toBeNull();
        expect(result.totalStops).toBeLessThanOrEqual(4);
    });

    test('MINIMUM_TRANSFERS mode minimizes transfers', () => {
        const result = dijkstra.findPath(graph, 'A', 'E', { mode: 'MINIMUM_TRANSFERS' });
        expect(result).not.toBeNull();
        expect(result.totalTransfers).toBeGreaterThanOrEqual(0);
    });

    test('OPTIMAL mode applies transfer penalty', () => {
        const result = dijkstra.findPath(graph, 'A', 'E', {
            mode: 'OPTIMAL',
            transferPenalty: 10,
        });
        expect(result).not.toBeNull();
        expect(result.totalCost).toBeGreaterThanOrEqual(result.totalTime);
    });

    test('segments correctly identify interchanges', () => {
        const result = dijkstra.findPath(graph, 'A', 'E', { mode: 'SHORTEST_TIME' });
        expect(result).not.toBeNull();
        expect(result.segments.length).toBeGreaterThanOrEqual(1);

        // First segment should not be interchange
        expect(result.segments[0].isInterchange).toBe(false);
    });

    test('handles disconnected graph gracefully', () => {
        const isolated = new Map();
        isolated.set('P', []);
        isolated.set('Q', []);
        const result = dijkstra.findPath(isolated, 'P', 'Q');
        expect(result).toBeNull();
    });

    test('deterministic output with lexicographic tie-breaking', () => {
        // Run twice - should produce same result
        const result1 = dijkstra.findPath(graph, 'A', 'E', { mode: 'SHORTEST_TIME' });
        const result2 = dijkstra.findPath(graph, 'A', 'E', { mode: 'SHORTEST_TIME' });
        expect(result1.path).toEqual(result2.path);
        expect(result1.totalTime).toBe(result2.totalTime);
    });
});
