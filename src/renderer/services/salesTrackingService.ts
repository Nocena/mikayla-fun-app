import { supabase, SalesEvent } from '../lib/supabase';
import { aiMemoryService } from './aiMemoryService';

export const salesTrackingService = {
    /**
     * Record a new sales event
     */
    async recordSale(
        socialAccountId: string,
        amount: number,
        eventType: SalesEvent['event_type'],
        userId?: string,
        relatedMessageId?: string
    ) {
        const sale: Partial<SalesEvent> = {
            social_account_id: socialAccountId,
            amount,
            event_type: eventType,
            user_id: userId,
            related_message_id: relatedMessageId,
            currency: 'USD'
        };

        const { data, error } = await supabase
            .from('sales_events')
            .insert(sale)
            .select()
            .single();

        if (error) {
            console.error('Error recording sale:', error);
            throw error;
        }

        // If this sale is linked to a message, mark the memory as a conversion
        if (relatedMessageId) {
            await aiMemoryService.markAsSale(relatedMessageId);
        }

        return data;
    },

    /**
     * Get total sales for a period
     */
    async getSalesStats(socialAccountId: string, startDate: Date, endDate: Date) {
        const { data, error } = await supabase
            .from('sales_events')
            .select('amount, event_type')
            .eq('social_account_id', socialAccountId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (error) throw error;

        return data.reduce((acc, curr) => {
            acc.total += curr.amount;
            acc.byType[curr.event_type] = (acc.byType[curr.event_type] || 0) + curr.amount;
            return acc;
        }, { total: 0, byType: {} as Record<string, number> });
    }
};
