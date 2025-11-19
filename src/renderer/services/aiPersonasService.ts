import { supabase, AIPersona } from '../lib/supabase';

export const aiPersonasService = {
    /**
     * Fetch all active personas
     */
    async getPersonas() {
        const { data, error } = await supabase
            .from('ai_personas')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data as AIPersona[];
    },

    /**
     * Get a specific persona by ID
     */
    async getPersona(id: string) {
        const { data, error } = await supabase
            .from('ai_personas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as AIPersona;
    },

    /**
     * Create a new persona
     */
    async createPersona(persona: Omit<AIPersona, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('ai_personas')
            .insert(persona)
            .select()
            .single();

        if (error) throw error;
        return data as AIPersona;
    },

    /**
     * Update a persona
     */
    async updatePersona(id: string, updates: Partial<AIPersona>) {
        const { data, error } = await supabase
            .from('ai_personas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as AIPersona;
    }
};
