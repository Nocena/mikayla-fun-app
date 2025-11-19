import React from 'react';
import { AgentOrchestratorOutput } from '../../types/agent';
import { SparklesIcon } from './icons/SparklesIcon';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentAdvisorPanelProps {
    insights: AgentOrchestratorOutput | null;
    isLoading: boolean;
}

export const AgentAdvisorPanel: React.FC<AgentAdvisorPanelProps> = ({ insights, isLoading }) => {
    // if (!insights && !isLoading) return null; // Removed to show placeholder


    return (
        <div className="h-full bg-surface/95 backdrop-blur-xl border-l border-border-color flex flex-col shadow-2xl z-20 w-full">
            {/* Header */}
            <div className="p-4 border-b border-border-color flex items-center justify-between bg-gradient-to-r from-surface to-surface/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <SparklesIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary text-sm">Agent Advisor</h3>
                        <p className="text-[10px] text-text-secondary">Real-time Intelligence</p>
                    </div>
                </div>
                {isLoading && (
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border-color">
                <AnimatePresence mode="wait">
                    {insights ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* 1. Analysis Badges */}
                            <div className="flex flex-wrap gap-2">
                                <Badge label={insights.analyzer.intent} color="blue" />
                                <Badge label={insights.analyzer.sentiment} color={insights.analyzer.sentiment.includes('positive') ? 'green' : 'yellow'} />
                                <Badge label={`Urgency: ${insights.analyzer.urgency}`} color="purple" />
                            </div>

                            {/* 2. Sales Strategy Card */}
                            <div className="bg-panel rounded-xl p-3 border border-border-color/50 shadow-sm">
                                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                    Sales Strategy
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-text-primary font-medium">{insights.sales.sales_recommendation.replace('_', ' ')}</span>
                                        <span className="text-sm font-bold text-green-400">${insights.sales.pricing_strategy.suggested_price}</span>
                                    </div>
                                    <p className="text-[11px] text-text-secondary italic leading-relaxed border-l-2 border-primary/20 pl-2">
                                        "{insights.sales.reasoning}"
                                    </p>
                                    {insights.sales.upsell_opportunity && (
                                        <div className="mt-2 pt-2 border-t border-border-color/30">
                                            <span className="text-[10px] text-accent font-bold block mb-0.5">UPSELL OPPORTUNITY</span>
                                            <span className="text-xs text-text-primary">{insights.sales.upsell_opportunity.value_prop}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Personality Insight */}
                            <div className="bg-panel rounded-xl p-3 border border-border-color/50 shadow-sm">
                                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                                    Active Persona
                                </h4>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-text-primary">{insights.personality.active_personality}</span>
                                    <span className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-text-secondary">
                                        {(insights.personality.personality_confidence * 100).toFixed(0)}% Conf.
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="bg-surface p-1.5 rounded">
                                        <span className="text-text-secondary block">Flirtiness</span>
                                        <div className="w-full bg-border-color h-1 rounded-full mt-1">
                                            <div className="bg-pink-400 h-1 rounded-full" style={{ width: `${insights.personality.tone_modifiers.flirtiness * 10}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="bg-surface p-1.5 rounded">
                                        <span className="text-text-secondary block">Directness</span>
                                        <div className="w-full bg-border-color h-1 rounded-full mt-1">
                                            <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${insights.personality.tone_modifiers.directness * 10}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Content Match */}
                            {insights.content.recommended_content.length > 0 && (
                                <div className="bg-panel rounded-xl p-3 border border-border-color/50 shadow-sm">
                                    <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                                        Content Match
                                    </h4>
                                    <div className="space-y-2">
                                        {insights.content.recommended_content.map((item, i) => (
                                            <div key={i} className="bg-surface p-2 rounded-lg border border-border-color/30">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-medium text-text-primary">{item.type}</span>
                                                    <span className="text-xs font-bold text-green-400">${item.user_price}</span>
                                                </div>
                                                <p className="text-[10px] text-text-secondary leading-tight">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 opacity-60">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                                <div className="w-16 h-16 bg-surface border border-primary/30 rounded-full flex items-center justify-center relative z-10">
                                    <SparklesIcon className="w-8 h-8 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-text-primary">Deep Analysis Mode</h4>
                                <p className="text-xs text-text-secondary leading-relaxed max-w-[200px] mx-auto">
                                    Mikayla's swarm of 8 specialized agents is ready to analyze this conversation.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-full max-w-[200px]">
                                <div className="bg-surface/50 p-2 rounded border border-border-color/30 text-[10px] text-text-secondary">
                                    🧠 Intent Analysis
                                </div>
                                <div className="bg-surface/50 p-2 rounded border border-border-color/30 text-[10px] text-text-secondary">
                                    💰 Sales Strategy
                                </div>
                                <div className="bg-surface/50 p-2 rounded border border-border-color/30 text-[10px] text-text-secondary">
                                    🎭 Personality
                                </div>
                                <div className="bg-surface/50 p-2 rounded border border-border-color/30 text-[10px] text-text-secondary">
                                    📸 Content Match
                                </div>
                            </div>

                            <p className="text-[10px] text-text-secondary/50 pt-4 border-t border-border-color/30 w-full">
                                Waiting for new message...
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Badge: React.FC<{ label: string; color: 'blue' | 'green' | 'yellow' | 'purple' }> = ({ label, color }) => {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };

    return (
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${colors[color]} uppercase tracking-wide`}>
            {label.replace('_', ' ')}
        </span>
    );
};
