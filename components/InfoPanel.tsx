import React from 'react';
import { HighLowData, FundingRate, ChartMode } from '../types.ts';
import { Zap, Activity, AlertTriangle, Info } from 'lucide-react';

interface InfoPanelProps {
  highLowBtc: HighLowData[];
  highLowGold: HighLowData[];
  funding: FundingRate[];
  chartMode: ChartMode;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ highLowBtc, highLowGold, funding, chartMode }) => {
  // Logic: Show Gold stats ONLY if Gold mode is explicitly selected.
  // Show BTC stats for 'btc' mode OR 'combined' mode.
  const isGoldMode = chartMode === 'gold';
  
  const displayHighLow = isGoldMode ? highLowGold : highLowBtc;
  const title = isGoldMode ? 'Gold Volatility Profile' : 'Bitcoin Volatility Profile';
  const iconColor = isGoldMode ? 'text-[#ffd700]' : 'text-[#4ecdc4]';
  const rangeColor = isGoldMode ? 'text-[#ffd700]' : 'text-white';

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* High/Low Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex-grow flex flex-col shadow-lg backdrop-blur-sm min-h-[300px]">
        <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-3">
          <div className="flex items-center gap-2 text-slate-200">
            <Activity size={18} className={iconColor} />
            <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded border ${isGoldMode ? 'border-[#ffd700]/30 text-[#ffd700] bg-[#ffd700]/10' : 'border-[#4ecdc4]/30 text-[#4ecdc4] bg-[#4ecdc4]/10'}`}>
            {isGoldMode ? 'XAU/USD' : 'BTC/USDT'}
          </span>
        </div>
        
        <div className="space-y-1 flex-grow">
          <div className="grid grid-cols-4 text-[11px] text-slate-500 pb-2 font-semibold uppercase tracking-wide">
            <div>Time</div>
            <div className="text-right">High</div>
            <div className="text-right">Low</div>
            <div className="text-right">Range</div>
          </div>
          
          {displayHighLow.length > 0 ? displayHighLow.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 text-sm items-center hover:bg-slate-700/30 p-2 rounded transition-colors border-b border-slate-800/30 last:border-0">
              <div className="text-slate-300 font-medium">{item.timeframe}</div>
              <div className="text-right font-mono text-green-400/90 text-xs">
                ${item.high.toLocaleString()}
              </div>
              <div className="text-right font-mono text-red-400/90 text-xs">
                ${item.low.toLocaleString()}
              </div>
              <div className={`text-right font-mono font-bold ${rangeColor} text-xs`}>
                {item.rangePercent.toFixed(2)}%
              </div>
            </div>
          )) : (
             <div className="text-center py-8 text-slate-500 text-xs">Loading Volatility Data...</div>
          )}
        </div>
        
        <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-500 bg-slate-900/30 p-2 rounded">
           <Info size={12} className="mt-0.5 shrink-0" />
           <p>Volatility data automatically switches based on your selected chart (Overlay/BTC/Gold).</p>
        </div>
      </div>

      {/* Funding & Gaps */}
      <div className="flex flex-col gap-4">
        
        {/* Funding Rates */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 shadow-lg backdrop-blur-sm">
           <div className="flex items-center gap-2 mb-3 text-slate-300">
            <Zap size={18} className="text-yellow-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Funding Rates</h3>
          </div>
          
          <div className="space-y-2">
            {funding.map((f, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                <span className="text-xs font-medium text-slate-400 uppercase">{f.exchange}</span>
                <span className={`font-mono font-bold text-sm ${f.rate > 0.01 ? 'text-red-400' : 'text-green-400'}`}>
                  {(f.rate * 100).toFixed(4)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Correlations */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 shadow-lg backdrop-blur-sm">
           <div className="flex items-center gap-2 mb-3 text-slate-300">
            <AlertTriangle size={18} className="text-orange-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Correlations (30D)</h3>
          </div>
          
          <div className="space-y-2 text-sm">
             <div className="bg-slate-900/40 p-2.5 rounded border border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400 text-xs font-medium">BTC / Gold</span>
                <span className="font-mono font-bold text-[#4ecdc4] text-sm">+0.75</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded border border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400 text-xs font-medium">BTC / DXY</span>
                <span className="font-mono font-bold text-red-400 text-sm">-0.85</span>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfoPanel;