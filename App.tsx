import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Clock, 
} from 'lucide-react';

// Import components
import MarketChart from './components/MarketChart.tsx';
import InfoPanel from './components/InfoPanel.tsx';
import TickerCard from './components/TickerCard.tsx';
import AIAnalysisPanel from './components/AIAnalysisPanel.tsx';
import { TimeFrame, ChartMode, ChartDataPoint, FundingRate, HighLowData } from './types.ts';
import { 
  fetchBTCPrice, 
  fetchGoldPrice, 
  fetchFundingRates, 
  fetchHighLow, 
  fetchChartData 
} from './services/marketService.ts';

// -----------------------------------------------------------------------------
// MAIN APP COMPONENT
// -----------------------------------------------------------------------------

function App() {
  const [btcData, setBtcData] = useState({ price: 0, changePercent: 0 });
  const [goldData, setGoldData] = useState({ price: 0, changePercent: 0 });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [fundingData, setFundingData] = useState<FundingRate[]>([]);
  const [highLowBtc, setHighLowBtc] = useState<HighLowData[]>([]);
  const [highLowGold, setHighLowGold] = useState<HighLowData[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.H1);
  const [chartMode, setChartMode] = useState<ChartMode>('combined');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [btc, gold, funding, hlBtc, hlGold, chart] = await Promise.all([
        fetchBTCPrice(),
        fetchGoldPrice(),
        fetchFundingRates(),
        fetchHighLow('BTCUSDT'),
        fetchHighLow('PAXGUSDT'),
        fetchChartData(timeFrame)
      ]);

      setBtcData(btc);
      setGoldData(gold);
      setFundingData(funding);
      setHighLowBtc(hlBtc);
      setHighLowGold(hlGold);
      setChartData(chart);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [timeFrame]);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAllData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  const handleTimeFrameChange = (newTf: TimeFrame) => {
    if (newTf !== timeFrame) {
      setTimeFrame(newTf);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] pb-8 font-sans selection:bg-[#4ecdc4]/30 w-full overflow-x-hidden">
      
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 p-4 border-b border-slate-800 bg-[#1e1e2e]/90 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#4ecdc4] to-teal-600 text-[#1e1e2e] font-black p-2.5 rounded-lg text-xl shadow-[0_0_15px_rgba(78,205,196,0.3)]">
                TV
            </div>
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                    Market Intelligence
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">V1.2.1</span>
                  <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                      Cross-Asset Quant Engine
                  </p>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4 text-sm mt-4 sm:mt-0">
            <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
                <Clock size={14} />
                <span>Updated: <span className="text-white font-mono">{lastUpdated || '...'}</span></span>
            </div>
            <button 
                onClick={loadAllData} 
                className={`p-2 rounded-full hover:bg-slate-800 bg-slate-900 border border-slate-800 transition-all ${loading ? 'animate-spin text-[#4ecdc4]' : 'text-slate-300 hover:text-white shadow-lg'}`}
                title="Refresh Data"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </div>

      {/* Main Content - Full Width Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 max-w-[1920px] mx-auto">
        
        {/* Tickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <TickerCard 
            symbol="BTC/USDT" 
            name="Bitcoin Spot"
            price={btcData.price}
            changePercent={btcData.changePercent}
            color="teal"
          />
          <TickerCard 
            symbol="XAU/USD" 
            name="Gold (PAXG Real-time)"
            price={goldData.price}
            changePercent={goldData.changePercent}
            color="gold"
          />
        </div>

        {/* Charts & Analysis Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column: Chart & AI (Takes 9/12 columns on large screens) */}
          <div className="xl:col-span-9 flex flex-col gap-6">
            <MarketChart 
              data={chartData} 
              isLoading={loading}
              timeFrame={timeFrame}
              onTimeFrameChange={handleTimeFrameChange}
              chartMode={chartMode}
              onChartModeChange={setChartMode}
            />
             <AIAnalysisPanel 
                btcPrice={btcData.price}
                btcChange={btcData.changePercent}
                goldPrice={goldData.price}
                goldChange={goldData.changePercent}
                fundingRate={fundingData[0]?.rate * 100 || 0}
                volatility={chartMode === 'gold' ? highLowGold : highLowBtc} 
             />
          </div>

          {/* Right Column: Info Panel (Takes 3/12 columns on large screens) */}
          <div className="xl:col-span-3 flex flex-col h-full">
            <InfoPanel 
              highLowBtc={highLowBtc}
              highLowGold={highLowGold}
              chartMode={chartMode}
              funding={fundingData} 
            />
          </div>
        </div>
        
        <div className="text-center text-[10px] text-slate-600 mt-8 pb-4 border-t border-slate-800/50 pt-4">
          <p>QUANT ENGINE ALPHA | POWERED BY GOOGLE GEMINI 2.5</p>
          <p>Disclaimer: This dashboard is for informational purposes only. Not financial advice.</p>
        </div>
      </div>
    </div>
  );
}

export default App;