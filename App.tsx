import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Button } from './components/Button';
import { HeroSection, StorySection, GameplaySection, MintingSection, Footer } from './components/LandingSections';
import { AppStage } from './types';
import { ShieldAlert, CheckCircle2, RefreshCw, Trophy, ArrowLeft, Loader2, Wallet, ArrowRight } from 'lucide-react';
import { connectWallet, mintNFT } from './services/mockWeb3';

export default function App() {
  const [stage, setStage] = useState<AppStage>(AppStage.LANDING);
  const [score, setScore] = useState(0);

  // Local Web3 State
  const [address, setAddress] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  
  // Mock Data
  const totalMinted = "4050";
  const totalCount = "8004";

  // Mint threshold constant
  const MINT_THRESHOLD = 200;

  // Effects to handle stage transitions
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stage]);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch (e) {
      console.error("Connection failed", e);
    }
  };

  const handleDisconnect = () => {
      setAddress(null);
      setStage(AppStage.LANDING);
  };

  const handlePlayClick = async () => {
    if (!address) {
        await handleConnect();
    } else {
        setScore(0);
        setStage(AppStage.GAME);
    }
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setStage(AppStage.GAME_OVER);
  };

  const handleMint = async () => {
    if(!address) return;
    
    setIsMinting(true);
    try {
      const success = await mintNFT(score);
      if (success) {
        setStage(AppStage.MINT_SUCCESS);
      }
    } catch (e) {
      console.error("Minting failed", e);
      alert("Minting failed.");
    } finally {
      setIsMinting(false);
    }
  };

  const goHome = () => {
    setStage(AppStage.LANDING);
    setScore(0);
  };

  const restartGame = () => {
    setScore(0);
    setStage(AppStage.GAME);
  };

  // --- HEADER RENDER LOGIC ---
  const renderHeader = () => (
    <header className={`fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 transition-all duration-300 ${stage === AppStage.LANDING ? 'bg-black/50 backdrop-blur-md border-b border-white/5' : 'pointer-events-none'}`}>
      <div className="flex items-center gap-4">
         {stage !== AppStage.LANDING && (
             <button onClick={goHome} className="pointer-events-auto text-gray-500 hover:text-white transition-colors">
                <ArrowLeft size={24} />
             </button>
         )}
         <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter text-white glitch-text" data-text="8004 RUNNER">8004 RUNNER</h1>
            <p className="text-[10px] text-gray-500 tracking-widest hidden md:block">BLOCK 8004 PROTOCOL</p>
         </div>
      </div>
      
      <div className="flex items-center gap-4 pointer-events-auto">
          {/* Score Display (In Game) */}
          {stage !== AppStage.LANDING && (
             <div className="text-3xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] mr-4">
                {score.toString().padStart(5, '0')}
             </div>
          )}

          {/* Wallet Status */}
          {address ? (
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-sm border border-white/10 group cursor-pointer hover:bg-red-900/20 transition-colors" onClick={handleDisconnect}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:bg-red-500"></div>
                  <span className="text-xs font-mono text-gray-300 hidden md:inline group-hover:hidden">{address.substring(0, 6)}...{address.substring(38)}</span>
                  <span className="text-xs font-mono text-gray-300 md:hidden group-hover:hidden">{address.substring(0, 4)}...</span>
                  <span className="hidden group-hover:inline text-xs font-mono text-red-400">DISCONNECT</span>
              </div>
          ) : (
              stage === AppStage.LANDING && (
                <Button 
                    variant="outline" 
                    onClick={handleConnect} 
                    className="h-9 px-4 text-xs"
                >
                    <Wallet size={14} className="mr-2"/> CONNECT
                </Button>
              )
          )}
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {renderHeader()}

      {/* --- LANDING PAGE --- */}
      {stage === AppStage.LANDING && (
        <div className="animate-fadeIn">
          <HeroSection onPlayClick={handlePlayClick} isWalletConnected={!!address} />
          <StorySection />
          <GameplaySection />
          <MintingSection 
            onMint={handleMint}
            isMinting={isMinting}
            canMint={score >= MINT_THRESHOLD || (stage === AppStage.GAME_OVER && score >= MINT_THRESHOLD)}
            totalMinted={totalMinted}
            maxSupply={totalCount}
            isWalletConnected={!!address}
            onConnect={handleConnect}
          />
          <Footer />
        </div>
      )}

      {/* --- GAME VIEWS WRAPPER --- */}
      {stage !== AppStage.LANDING && (
          <main className="min-h-screen flex flex-col items-center justify-center p-4 relative pt-24">
            
            {/* Background for Game Mode */}
            <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none z-0"></div>
            
            {/* GAME CANVAS */}
            {stage === AppStage.GAME && (
            <div className="w-full max-w-4xl shadow-2xl shadow-black border border-gray-800 bg-black relative group z-10 animate-fadeIn">
                <div className="absolute -top-6 left-0 text-xs text-gray-500 flex gap-4 font-mono">
                    <span>STATUS: <span className="text-green-500">RUNNING</span></span>
                    <span>PHYSICS: <span className="text-green-500">ACTIVE</span></span>
                </div>
                <GameCanvas 
                    onGameOver={handleGameOver} 
                    onScoreUpdate={setScore} 
                />
                <div className="absolute inset-0 pointer-events-none border-[0.5px] border-white/5"></div>
                <div className="absolute bottom-4 left-0 w-full text-center text-gray-600 text-xs opacity-50 uppercase tracking-widest">
                    Tap or Space to Jump
                </div>
            </div>
            )}

            {/* GAME OVER MODAL */}
            {stage === AppStage.GAME_OVER && (
            <div className="z-20 w-full max-w-md animate-fadeIn">
                <div className="flex flex-col items-center justify-center text-center p-8 border border-red-900/30 bg-black/90 backdrop-blur-md shadow-[0_0_50px_rgba(255,0,0,0.1)]">
                    <ShieldAlert size={48} className="text-red-500 mb-4 animate-pulse" />
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tighter">RUN TERMINATED</h2>
                    <p className="text-gray-400 mb-8 font-mono text-sm">System failure. Data stream lost.</p>
                    
                    <div className="w-full bg-gray-900/50 p-6 mb-8 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Final Score</div>
                        <div className="text-5xl font-mono text-white mb-4 glitch-text" data-text={score}>{score}</div>
                        
                        {score >= MINT_THRESHOLD ? (
                            <div className="flex items-center justify-center gap-2 text-green-400 bg-green-900/20 py-2 border border-green-500/30">
                                <CheckCircle2 size={16} />
                                <span className="text-sm font-bold tracking-wider">MINT UNLOCKED</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-red-400 bg-red-900/20 py-2 border border-red-500/30">
                                <span className="text-sm font-bold tracking-wider">REQ: {MINT_THRESHOLD} PTS</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        {score >= MINT_THRESHOLD && (
                            <Button onClick={handleMint} isLoading={isMinting} className="w-full bg-white text-black hover:bg-gray-200">
                                MINT PROOF OF RUN
                            </Button>
                        )}
                        
                        <Button onClick={restartGame} variant="outline" className="w-full border-white/20 hover:bg-white/10">
                            <RefreshCw size={18} /> RETRY SEQUENCE
                        </Button>
                    </div>
                </div>
            </div>
            )}

            {/* MINT SUCCESS MODAL */}
            {stage === AppStage.MINT_SUCCESS && (
            <div className="z-20 w-full max-w-md animate-fadeIn">
                <div className="flex flex-col items-center justify-center text-center p-12 border border-green-500/30 bg-black/90 backdrop-blur-md shadow-[0_0_50px_rgba(0,255,65,0.1)]">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
                        <Trophy size={48} className="text-green-400" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tighter">PROOF ACQUIRED</h2>
                    <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                        You have successfully minted the <span className="text-white">8004 Runner</span> participation token. 
                        The system acknowledges your effort.
                    </p>

                    <div className="w-full p-4 bg-gray-900/50 border border-white/10 mb-8 font-mono text-xs text-left relative">
                         <div className="absolute top-0 right-0 w-2 h-2 bg-green-500"></div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">TX HASH</span>
                            <span className="text-green-400">0x8a...4b21</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">BLOCK</span>
                            <span className="text-gray-300">8004</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">SCORE</span>
                            <span className="text-gray-300">{score}</span>
                        </div>
                    </div>

                    <Button onClick={restartGame} variant="outline" className="w-full mb-4">
                        START NEW RUN
                    </Button>
                    
                    <a href="#" className="text-xs text-gray-600 hover:text-green-400 transition-colors flex items-center justify-center gap-1">
                        View on Opensea (Simulated) <ArrowRight size={10}/>
                    </a>
                </div>
            </div>
            )}
            
          </main>
      )}
    </div>
  );
}