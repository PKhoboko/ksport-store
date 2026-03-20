import { Shoe } from '@/lib/store';

/**
 * Groups shoes by base model name.
 * - "AirMax_Black" → base = "AirMax"
 * - "AirMax" (no underscore) → base = "AirMax"
 * Both will be grouped together under "AirMax".
 */
export function groupShoesByModel(shoes: Shoe[]): Record<string, Shoe[]> {
    return shoes.reduce<Record<string, Shoe[]>>((acc, shoe) => {
        const baseModel = shoe.name.split('_')[0].trim();
        if (!acc[baseModel]) acc[baseModel] = [];
        acc[baseModel].push(shoe);
        return acc;
    }, {});
}