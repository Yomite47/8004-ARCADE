import React from 'react';
import { Button } from './Button';
import { Cpu, Play, Skull, Trophy, Wallet, ArrowRight, Github, Twitter, Disc, Loader2 } from 'lucide-react';

interface SectionProps {
  onPlayClick: () => void;
  isWalletConnected: boolean;
}

export const HeroSection: React.FC<SectionProps> = ({ onPlayClick, isWalletConnected }) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 cyber-grid opacity-30 z-0"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#050505] to-transparent z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto mt-16">
        <div className="inline-block px-3 py-1 mb-6 border border-green-500/30 bg-green-900/10 text-green-400 text-xs tracking-[0.2em] uppercase rounded-full animate-pulse">
          System Breach Detected: Block 8004
        </div>
        
        <h1 
          className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6 glitch-text"
          data-text="8004 RUNNER"
        >
          8004 RUNNER
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Survive the <span className="text-white neon-glow">digital desert</span>. 
          Reclaim lost data fragments. <br className="hidden md:block"/>
          Earn your place in the chain.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button 
            onClick={onPlayClick} 
            className="w-full sm:w-auto min-w-[220px] h-14 text-lg border-2 border-white hover:border-transparent"
          >
            {isWalletConnected ? (
                <>ENTER SYSTEM <Play size={20} className="ml-2" /></>
            ) : (
                <>INITIALIZE RUN <Wallet size={20} className="ml-2" /></>
            )}
          </Button>
          
          <a href="#how-to-play" className="text-sm text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">
            Mission Briefing 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
          </a>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-red-500 animate-ping"></div>
      <div className="absolute bottom-1/3 right-20 w-1 h-1 bg-green-500 animate-ping delay-700"></div>
    </section>
  );
};

export const StorySection: React.FC = () => {
  return (
    <section className="relative py-24 px-6 border-y border-white/5 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto text-center">
        <Cpu size={48} className="text-gray-600 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">
          THE WORLD OF 8004
        </h2>
        <div className="prose prose-invert prose-lg mx-auto text-gray-400 leading-8">
          <p>
            After <span className="text-white font-bold">block 8004</span>, the system fractured. 
            Validation protocols failed, and memory fragments began escaping into the endless digital desert.
          </p>
          <p className="mt-6">
            The old shortcuts no longer work. Progress now comes only through action. 
            You are a Runner—an autonomous process sent to traverse the broken data paths.
            Every jump is a verification. Every obstacle overcome restores a piece of what was lost.
          </p>
          <p className="mt-6 text-white italic">
            "High scores are not just numbers. They are proof of existence."
          </p>
        </div>
      </div>
    </section>
  );
};

export const GameplaySection: React.FC = () => {
  const steps = [
    {
      icon: <Wallet size={32} className="text-blue-400" />,
      title: "Connect",
      desc: "Link your wallet to establish a secure identity channel."
    },
    {
      icon: <Play size={32} className="text-green-400" />,
      title: "Run",
      desc: "Navigate the infinite track. Timing is your only weapon."
    },
    {
      icon: <Skull size={32} className="text-red-400" />,
      title: "Survive",
      desc: "Avoid corrupted data blocks. One collision terminates the session."
    },
    {
      icon: <Trophy size={32} className="text-yellow-400" />,
      title: "Mint",
      desc: "Score 200+ to unlock the participation proof NFT."
    }
  ];

  return (
    <section id="how-to-play" className="py-24 px-6 bg-[#050505] relative">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">PROTOCOL SEQUENCE</h2>
          <p className="text-gray-500 uppercase tracking-widest text-sm">How to Play</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="group p-8 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-4xl group-hover:opacity-20 transition-opacity">
                0{idx + 1}
              </div>
              <div className="mb-6 p-4 bg-black/50 w-fit rounded-lg border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface MintingSectionProps {
    onMint: () => void;
    isMinting: boolean;
    canMint: boolean;
    totalMinted?: string;
    maxSupply?: string;
    isWalletConnected: boolean;
    onConnect: () => void;
}

export const MintingSection: React.FC<MintingSectionProps> = ({ 
    onMint, isMinting, canMint, totalMinted, maxSupply, isWalletConnected, onConnect 
}) => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] to-black border-t border-white/5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        
        {/* NFT Visual */}
        <div className="w-full md:w-1/2 aspect-square max-w-md relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-sm blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative h-full w-full bg-black border border-white/20 p-6 flex flex-col justify-between overflow-hidden">
             <div className="absolute inset-0 cyber-grid opacity-20"></div>
             
             <div className="flex justify-between items-start z-10">
               <span className="text-xs text-gray-500 border border-gray-700 px-2 py-1">ERC-721</span>
               <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               </div>
             </div>

             <div className="text-center z-10 my-auto">
               <div className="text-6xl font-bold text-white/10 select-none">8004</div>
             </div>

             <div className="space-y-2 z-10 font-mono text-xs text-gray-400">
               <div className="flex justify-between border-b border-white/10 pb-1">
                 <span>CLASS</span>
                 <span className="text-white">RUNNER_PROOF</span>
               </div>
               <div className="flex justify-between border-b border-white/10 pb-1">
                 <span>SUPPLY</span>
                 <span className="text-white">{totalMinted || '---'} / {maxSupply || '---'}</span>
               </div>
               <div className="flex justify-between">
                 <span>STATUS</span>
                 <span className={canMint ? "text-green-400" : "text-red-400"}>
                    {canMint ? 'UNLOCKED' : 'LOCKED'}
                 </span>
               </div>
             </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            MINT YOUR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">FRAGMENT</span>
          </h2>
          <div className="space-y-6 text-gray-400 text-lg leading-relaxed mb-8">
            <p>
              Each NFT represents a verified piece of block 8004, earned through skill and persistence.
            </p>
            <p>
              <strong className="text-white">No shortcuts. No whitelist.</strong><br/>
              Reach <span className="text-white font-bold border-b border-green-500">200 points</span> in a single run to unlock the minting protocol.
            </p>
            <p className="text-sm border-l-2 border-red-500 pl-4 italic">
              *Limit one artifact per wallet per successful run.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {!isWalletConnected ? (
                <Button onClick={onConnect} className="w-full md:w-auto">
                    <Wallet size={18} /> Connect to Mint
                </Button>
            ) : canMint ? (
                <Button onClick={onMint} isLoading={isMinting} className="w-full md:w-auto">
                    MINT FRAGMENT
                </Button>
            ) : (
                <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-400 text-sm text-center">
                    SCORE 200 REQUIRED TO UNLOCK
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-6 border-t border-white/5 bg-black text-center md:text-left">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tighter">8004 RUNNER</h3>
          <p className="text-xs text-gray-600 mt-2">© 2024 BLOCK 8004 SYSTEMS. ALL RIGHTS RESERVED.</p>
        </div>
        
        <div className="flex gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-white transition-colors">TERMS OF USE</a>
          <a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a>
          <a href="#" className="hover:text-white transition-colors">CONTACT</a>
        </div>

        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all">
            <Twitter size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all">
            <Github size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all">
            <Disc size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};