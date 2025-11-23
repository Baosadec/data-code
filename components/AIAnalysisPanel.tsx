import React, { useState } from 'react';
import { 
  Bot, 
  RefreshCw, 
  Crosshair, 
  BrainCircuit, 
  Terminal, 
  ShieldAlert,
  Cpu 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { HighLowData } from '../types';

interface AIAnalysisPanelProps {
  btcPrice: number;
  btcChange: number;
  goldPrice: number;
  goldChange: number;
  fundingRate: number;
  volatility: HighLowData[];
}

const runDeepLearningAnalysis = async (marketData: any) => {
  // Safely access API Key from window.process
  const apiKey = (window as any).process?.env?.API_KEY;
  
  if (!apiKey) {
    console.error("API Key missing.");
    return null;
  }

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
    return "⚠️ Neural Network Connection Failed. Check API Quota.";
  }
};

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  btcPrice, btcChange, goldPrice, goldChange, fundingRate, volatility
}) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const hasApiKey = !!((window as any).process?.env?.API_KEY);

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
      
      if (result === null) {
        setAnalysis("⚠️ API KEY MISSING.\nPlease check process.env.API_KEY in index.html");
      } else {
        setAnalysis(result || "AI Model returned no signal.");
      }
    } catch (e) {
      setAnalysis("Connection to Deep Learning Engine failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-indigo-500/30 p-1 relative overflow-hidden shadow-2xl group h-full min-h-[350px] flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-0 group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-0"></div>
      
      <div className="bg-slate-950/80 backdrop-blur-md rounded-lg p-5 h-full relative z-10 flex flex-col flex-grow">
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
            {!hasApiKey && (
               <div className="hidden sm:flex text-xs text-red-400 items-center gap-1 mr-2 bg-red-900/20 px-2 py-1 rounded border border-red-900/50">
                 <ShieldAlert size={12} /> No API Key
               </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !hasApiKey}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${
                (isAnalyzing || !hasApiKey)
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] active:scale-95'
              }`}
            >
              {isAnalyzing ? <><RefreshCw size={14} className="animate-spin" /> Computing...</> : <><Crosshair size={14} /> Scan Market</>}
            </button>
          </div>
        </div>

        <div className="flex-grow font-mono text-sm leading-relaxed text-slate-300 relative overflow-hidden flex flex-col">
          {analysis ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full overflow-y-auto custom-scrollbar pr-2">
               <div className="prose prose-invert prose-p:my-1 prose-headings:my-2 prose-strong:text-indigo-400 prose-strong:font-black max-w-none text-sm whitespace-pre-line border-l-2 border-indigo-500/30 pl-4">
                  {analysis}
               </div>
            </div>
          ) : (
            <div className="h-full flex-grow flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-lg bg-slate-900/30 min-h-[200px]">
              <Cpu size={40} className="mb-3 opacity-20" />
              <p className="text-xs font-medium uppercase tracking-widest opacity-60">Ready to Initialize Neural Network</p>
              {!hasApiKey && (
                <p className="text-[10px] text-red-400 mt-2 opacity-80">API Key Required to enable AI features</p>
              )}
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

export default AIAnalysisPanel;