const GraphManager = require('../../src/engine/GraphManager');

describe('GraphManager', () => {
    beforeEach(() => {
        GraphManager.resetInstance();
    });

    test('is a singleton', () => {
        const gm1 = GraphManager.getInstance();
        const gm2 = GraphManager.getInstance();
        expect(gm1).toBe(gm2);
    });

    test('starts with empty graph', () => {
        const gm = GraphManager.getInstance();
        expect(gm.getStats().stops).toBe(0);
        expect(gm.getStats().edges).toBe(0);
    });

    test('hasStop returns false for non-existent stop', () => {
        const gm = GraphManager.getInstance();
        expect(gm.hasStop('nonexistent')).toBe(false);
    });

    test('getNeighbors returns empty array for non-existent stop', () => {
        const gm = GraphManager.getInstance();
        expect(gm.getNeighbors('nonexistent')).toEqual([]);
    });

    test('clear resets the graph', () => {
        const gm = GraphManager.getInstance();
        gm.adjacencyList.set('test', []);
        gm.stopCount = 1;
        gm.clear();
        expect(gm.getStats().stops).toBe(0);
        expect(gm.getStats().edges).toBe(0);
    });
});
