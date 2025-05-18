import { Store } from "../evaluation/store.ts";

/**
 * Determine the test condition order based on command-line arguments or counterbalancing
 */
export function determineConditionOrder(forceConditionOrder: string | undefined, store: Store) {
    let conditionOrder: 'traditional-first' | 'ai-first';

    if (forceConditionOrder) {
        // If explicitly specified, use that order
        const orderValue = forceConditionOrder.split('=')[1].toLowerCase();
        conditionOrder = orderValue === 'traditional-first' ? 'traditional-first' : 'ai-first';
    } else {
        // Implement counterbalancing - get opposite of the last user's condition
        const lastOrder = store.getLastUserConditionOrder();
        
        if (lastOrder === 'traditional-first') {
            conditionOrder = 'ai-first';
        } else if (lastOrder === 'ai-first') {
            conditionOrder = 'traditional-first';
        } else {
            // If no previous order or undefined, randomly select
            conditionOrder = Math.random() < 0.5 ? 'traditional-first' : 'ai-first';
        }
    }

    return conditionOrder;
}