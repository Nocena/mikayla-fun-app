import React from 'react';
import { AgentOrchestratorOutput } from '../../types/agent';
import { SparklesIcon } from './icons/SparklesIcon';

interface AgentInsightsPanelProps {
    insights: AgentOrchestratorOutput;
}

export const AgentInsightsPanel: React.FC<AgentInsightsPanelProps> = ({ insights }) => {
    const { analyzer, sales, personality, memory, content } = insights;

    return (
        <div className="mt-4 bg-surface/50 rounded-lg border border-border-color overflow-hidden text-xs">
            {/* Header */}
            <div className="bg-surface px-3 py-2 border-b border-border-color flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-accent" />
                    <span className="font-bold text-text-primary">Agent Brain</span>
                </div>
                <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${analyzer.sentiment.includes('positive') || analyzer.sentiment.includes('excited') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {analyzer.sentiment}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                        {analyzer.intent}
                    </span>
                </div>
            </div>

            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sales Strategy */}
                <div className="space-y-2">
                    <h4 className="font-bold text-primary text-[10px] uppercase tracking-wider">Sales Strategy</h4>
                    <div className="bg-panel p-2 rounded border border-border-color space-y-1">
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Approach:</span>
                            <span className="text-text-primary font-medium">{sales.sales_recommendation}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Pricing:</span>
                            <span className="text-green-400 font-bold">${sales.pricing_strategy.suggested_price}</span>
                        </div>
                        {sales.upsell_opportunity && (
                            <div className="mt-1 pt-1 border-t border-border-color/50">
                                <span className="text-accent block mb-0.5">Upsell Opportunity:</span>
                                <span className="text-text-primary">{sales.upsell_opportunity.value_prop}</span>
                            </div>
                        )}
                        <p className="text-text-secondary italic mt-1 border-t border-border-color/50 pt-1">
                            "{sales.reasoning}"
                        </p>
                    </div>
                </div>

                {/* Personality & Memory */}
                <div className="space-y-2">
                    <h4 className="font-bold text-primary text-[10px] uppercase tracking-wider">Personality & Memory</h4>
                    <div className="bg-panel p-2 rounded border border-border-color space-y-1">
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Active Persona:</span>
                            <span className="text-text-primary font-medium">{personality.active_personality}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Confidence:</span>
                            <span className="text-text-primary">{(personality.personality_confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-border-color/50">
                            <span className="text-text-secondary block mb-0.5">User Profile:</span>
                            <div className="grid grid-cols-2 gap-1">
                                <span className="bg-surface px-1 rounded text-text-secondary">Spent: ${memory.user_profile.total_spent}</span>
                                <span className="bg-surface px-1 rounded text-text-secondary">{memory.user_profile.engagement_pattern}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Suggestions */}
            {content.recommended_content.length > 0 && (
                <div className="px-3 pb-3">
                    <h4 className="font-bold text-primary text-[10px] uppercase tracking-wider mb-2">Content Match</h4>
                    <div className="space-y-2">
                        {content.recommended_content.map((item, idx) => (
                            <div key={idx} className="bg-panel p-2 rounded border border-border-color flex justify-between items-center">
                                <div>
                                    <span className="text-text-primary font-medium block">{item.type}</span>
                                    <span className="text-text-secondary text-[10px]">{item.description}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-green-400 font-bold block">${item.user_price}</span>
                                    {item.savings && <span className="text-text-secondary text-[10px] line-through">${item.base_price}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
