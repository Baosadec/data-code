import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Clock, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Maximize2, 
  Layers, 
  DollarSign, 
  Bot, 
  Sparkles,
  Cpu,
  Crosshair,
  BrainCircuit,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// Import components with extensions for Babel Standalone
import MarketChart from './components/MarketChart.tsx';
import InfoPanel from './components/InfoPanel.tsx';
import TickerCard from './components/TickerCard.tsx';
import { TimeFrame, ChartMode, ChartDataPoint, FundingRate, HighLowData } from './types.ts';
import { 
  fetchBTCPrice, 
  fetchGoldPrice, 
  fetchFundingRates, 
  fetchHighLow, 
  fetchChartData 
} from './services/marketService.ts';

// -----------------------------------------------------------------------------
// AI ANALYSIS SERVICE (LOCAL)
// -----------------------------------------------------------------------------

const runDeepLearningAnalysis = async (marketData: any) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "⚠️ System Config Error: process.env.API_KEY missing.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const volatilityContext = marketData.volatility 
      ? marketData.volatility.map((v: any) => `${v.timeframe}: ${v.rangePercent.toFixed(2)}%`).join(', ')
      : "N/A";

    const prompt = `
      VAI TRÒ: Bạn là "Alpha-Zero", một AI Trading Quant cấp cao chuyên về Deep Learning & Market Microstructure.
      NHIỆM VỤ: Quét dữ liệu thị trường và xuất ra KẾ HOẠCH GIAO DỊCH XÁC SUẤT CAO (High Win-Rate Setup).

      THÔNG SỐ THỊ TRƯỜNG:
      - BTC Price: $${marketData.btcPrice} (Thay đổi 24h: ${marketData.btcChange}%)
      - Gold Price: $${marketData.goldPrice} (Risk Sentiment: ${marketData.goldChange > 0 ? "Risk-Off" : "Risk-On"})
      - Funding Rate: ${marketData.fundingRate}% (Sentiment Proxy)
      - Volatility Profile: ${volatilityContext}

      YÊU CẦU PHÂN TÍCH DEEP LEARNING:
      1. **Liquidity Sweep**: Xác định các vùng giá có khả năng quét thanh khoản (Stop Hunt) trước khi đảo chiều.
      2. **Funding Arbitrage**: Nếu Funding quá dương (>0.01%), ưu tiên Short Scalp hoặc chờ Long thấp hơn.
      3. **Correlation**: Đánh giá dòng tiền giữa Crypto và Vàng.

      ĐỊNH DẠNG OUTPUT (MARKDOWN):
      
      ## 🧬 QUANT STRATEGY SIGNAL
      
      | Tín Hiệu | Xác Suất | Rủi Ro (R:R) |
      | :---: | :---: | :---: |
      | **[LONG/SHORT]** | **[XX]%** | **1:[X]** |

      ### 🎯 PRECISION SETUP
      * **Entry Zone (Vùng Vào)**: $XXXXX - $XXXXX
      * **Invalidation (SL)**: $XXXXX (Tuyệt đối)
      * **Targets (TP)**: 
         1. $XXXXX (Scalp)
         2. $XXXXX (Swing)

      ### 🧠 NEURAL LOGIC
      > [Phân tích ngắn gọn 1 câu về lý do vào lệnh dựa trên thanh khoản và Funding Rate]

      *Lưu ý: Setup chỉ có hiệu lực trong phiên giao dịch hiện tại.*
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "⚠️ Neural Network Connection Failed.";
  }
};

// -----------------------------------------------------------------------------
// AI ANALYSIS PANEL COMPONENT
// -----------------------------------------------------------------------------

interface AIAnalysisPanelProps {
  btcPrice: number;
  btcChange: number;
  goldPrice: number;
  goldChange: number;
  fundingRate: number;
  volatility: HighLowData[];
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  btcPrice, btcChange, goldPrice, goldChange, fundingRate, volatility
}) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(""); 
    try {
      const result = await runDeepLearningAnalysis({ 
        btcPrice, 
        btcChange, 
        goldPrice, 
        goldChange, 
        fundingRate, 
        volatility
      });
      setAnalysis(result || "AI Model returned no signal.");
    } catch (e) {
      setAnalysis("Connection to Deep Learning Engine failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-indigo-500/30 p-1 relative overflow-hidden shadow-2xl group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-0 group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-0"></div>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
      
      <div className="bg-slate-950/80 backdrop-blur-md rounded-lg p-5 h-full relative z-10 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4 border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2.5 rounded-lg text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] relative overflow-hidden">
              <BrainCircuit size={24} className="relative z-10" />
              <div className="absolute inset-0 bg-indigo-500/20 animate-pulse z-0"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Deep Learning Strategy <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono tracking-wide shadow-sm">QUANT-ENGINE</span>
              </h2>
              <p className="text-xs text-indigo-300/70 font-mono flex items-center gap-1">
                <Terminal size={10} /> Optimized Probability & Liquidity Scans
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!process.env.API_KEY && (
               <div className="text-xs text-red-400 flex items-center gap-1 mr-2 bg-red-900/20 px-2 py-1 rounded">
                 <ShieldAlert size={12} /> Env Key Missing
               </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !process.env.API_KEY}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${
                (isAnalyzing || !process.env.API_KEY)
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] active:scale-95'
              }`}
            >
              {isAnalyzing ? <><RefreshCw size={14} className="animate-spin" /> Computing...</> : <><Crosshair size={14} /> Scan Market</>}
            </button>
          </div>
        </div>

        <div className="flex-grow min-h-[140px] font-mono text-sm leading-relaxed text-slate-300 relative">
          {analysis ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
               <div className="prose prose-invert prose-p:my-1 prose-headings:my-2 prose-strong:text-indigo-400 prose-strong:font-black max-w-none text-sm whitespace-pre-line border-l-2 border-indigo-500/30 pl-4 h-full overflow-auto custom-scrollbar">
                  {analysis}
               </div>
            </div>
          ) : (
            <div className="h-[140px] flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-lg bg-slate-900/30">
              <Cpu size={40} className="mb-3 opacity-20" />
              <p className="text-xs font-medium uppercase tracking-widest opacity-60">Ready to Initialize Neural Network</p>
              <div className="flex gap-1 mt-2">
                 <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                 <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                 <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] p-4 md:p-6 lg:p-8 font-sans selection:bg-[#4ecdc4]/30">
      
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-[#4ecdc4] text-[#1e1e2e] font-black p-2 rounded text-xl shadow-[0_0_15px_rgba(78,205,196,0.5)]">
                TV
            </div>
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Market Intelligence
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                    Cross-Asset Correlation Engine
                </p>
            </div>
        </div>

        <div className="flex items-center gap-4 text-sm bg-slate-800/50 p-2 rounded-full border border-slate-700/50 px-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400">
                <Clock size={14} />
                <span>Cập nhật: <span className="text-white font-mono">{lastUpdated || '...'}</span></span>
            </div>
            <button 
                onClick={loadAllData} 
                className={`p-1.5 rounded-full hover:bg-slate-700 transition-all ${loading ? 'animate-spin text-[#4ecdc4]' : 'text-slate-300'}`}
                title="Refresh Data"
            >
                <RefreshCw size={16} />
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                volatility={highLowBtc}
             />
          </div>
          <div className="lg:col-span-1">
            <InfoPanel 
              highLow={highLowBtc} 
              funding={fundingData} 
            />
          </div>
        </div>
        
        <div className="text-center text-[10px] text-slate-600 mt-8 pb-4">
          <p>QUANT ENGINE ALPHA V1.2 | POWERED BY GEMINI 2.5 FLASH</p>
          <p>Disclaimer: This dashboard is for informational purposes only. Not financial advice.</p>
        </div>
      </div>
    </div>
  );
}

export default App;