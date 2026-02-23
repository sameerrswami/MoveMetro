const GraphManager = require('./GraphManager');
const DijkstraStrategy = require('./DijkstraStrategy');
const { routeComputationDuration } = require('../utils/metrics');
const logger = require('../utils/logger');

/**
 * PathOptimizer - Facade for path computation.
 * Uses strategy pattern: accepts any PathStrategy implementation.
 * Default: DijkstraStrategy.
 */
class PathOptimizer {
    constructor(strategy = null) {
        this.strategy = strategy || new DijkstraStrategy();
        this.graphManager = GraphManager.getInstance();
    }

    setStrategy(strategy) {
        this.strategy = strategy;
        logger.info(`Path strategy changed to: ${strategy.getName()}`);
    }

    getStrategyName() {
        return this.strategy.getName();
    }

    /**
     * Find optimal path between source and destination.
     * @param {string} sourceId - Source stop ID
     * @param {string} destinationId - Destination stop ID
     * @param {object} options - { mode: 'OPTIMAL' | 'SHORTEST_TIME' | 'MINIMUM_STOPS' | 'MINIMUM_TRANSFERS', transferPenalty: number }
     */
    findOptimalPath(sourceId, destinationId, options = {}) {
        const startTime = Date.now();
        const mode = options.mode || 'OPTIMAL';

        try {
            const adjacencyList = this.graphManager.getAdjacencyList();

            if (adjacencyList.size === 0) {
                logger.warn('Graph is empty. Has it been built?');
                return null;
            }

            const result = this.strategy.findPath(adjacencyList, sourceId, destinationId, options);

            const elapsed = (Date.now() - startTime) / 1000;
            routeComputationDuration.observe({ mode, success: result ? 'true' : 'false' }, elapsed);

            if (result) {
                logger.info(
                    `Path found: ${sourceId} -> ${destinationId} | Mode: ${mode} | Time: ${result.totalTime}min | Stops: ${result.totalStops} | Transfers: ${result.totalTransfers} | Computed in ${elapsed}s`
                );
            } else {
                logger.info(`No path: ${sourceId} -> ${destinationId} | Mode: ${mode} | Computed in ${elapsed}s`);
            }

            return result;
        } catch (error) {
            const elapsed = (Date.now() - startTime) / 1000;
            routeComputationDuration.observe({ mode, success: 'false' }, elapsed);
            logger.error(`Path computation error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = PathOptimizer;
