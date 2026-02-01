import React from 'react';
import { Button } from './Button';
import { 
  Cpu, Play, Skull, Trophy, Wallet, ArrowRight, Github, Twitter, Disc, Loader2,
  Zap, GitCommit, Grid, Shield, Rocket, Ghost, CheckCircle, Brain, Lock
} from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  onClick: () => void;
  isWalletConnected: boolean;
  status: 'LIVE' | 'COMING SOON';
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, accentColor, borderColor, onClick, isWalletConnected, status }) => (
  <button 
    onClick={onClick}
    disabled={status === 'COMING SOON'}
    className={`
      group relative flex flex-col items-start text-left p-6 gap-4
      bg-[#0a0a0a] border border-white/10
      hover:border-white/30 transition-all duration-300
      w-full rounded-xl overflow-hidden
      ${status === 'COMING SOON' ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}
    `}
  >
    {/* Status Badge */}
    <div className={`
      absolute top-4 right-4 text-[10px] tracking-widest font-mono uppercase px-2 py-1 rounded-full border
      ${status === 'LIVE' 
        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}
    `}>
      {status}
    </div>

    {/* Icon */}
    <div className={`
      p-3 rounded-lg bg-white/5 border border-white/10 
      ${accentColor} transition-transform duration-500 group-hover:scale-110
    `}>
      {icon}
    </div>

    {/* Content */}
    <div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>

    {/* Action */}
    <div className={`mt-auto pt-4 flex items-center gap-2 text-xs font-mono uppercase tracking-widest ${accentColor} opacity-80 group-hover:opacity-100`}>
      {status === 'LIVE' ? (
        <>
          {isWalletConnected ? 'INITIATE RUN' : 'CONNECT SYSTEM'} 
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
        </>
      ) : (
        'LOCKED'
      )}
    </div>
  </button>
);

interface SectionProps {
  onPlayRunner: () => void;
  onPlaySnake: () => void;
  onPlayBlockBreaker: () => void;
  onPlaySpaceInvaders: () => void;
  onPlayVirusWhack: () => void;
  onPlayCyberFlap: () => void;
  isWalletConnected: boolean;
}

export const HeroSection: React.FC<SectionProps> = ({ 
  onPlayRunner, onPlaySnake, onPlayBlockBreaker, onPlaySpaceInvaders, onPlayVirusWhack, onPlayCyberFlap, 
  isWalletConnected 
}) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-bold tracking-tight text-lg">8004 ARCADE</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#games" className="hover:text-white transition-colors">Protocols</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono">
              v1.0.4
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              ERC-8004 · Trustless Game Agents
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Prove Skill. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                Mint Authority.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
              8004 Arcade is a permissionless platform where AI agents evaluate player performance and authorize on-chain token mints.
            </p>

            <div className="flex flex-wrap gap-4">
               <a href="#games" className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                 Start Challenge <ArrowRight size={18} />
               </a>
               <button className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-gray-300">
                 Read Documentation
               </button>
            </div>
          </div>

          {/* Featured Card / "Next Chapter" Style */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={100} />
              </div>
              
              <div className="text-sm text-gray-500 font-mono mb-2">CURRENT SEASON</div>
              <h3 className="text-2xl font-bold text-white mb-4">Genesis Block</h3>
              <p className="text-gray-400 mb-6">
                The first story has been told. Now, a new challenge emerges from the void. 
                Are you ready to prove yourself?
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-300 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  3 Protocols Active
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Minting Live
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid Section */}
        <div id="games" className="mb-32">
          <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Active Protocols</h2>
              <p className="text-gray-400">Select a simulation to begin evaluation.</p>
            </div>
            <div className="hidden md:block text-sm text-gray-500 font-mono">
              SYSTEM_READY
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard 
              title="8004 Arcade"
              description="High-velocity traversal simulation. Avoid digital obstacles and maintain momentum."
              icon={<Zap size={24} />}
              accentColor="text-yellow-400"
              borderColor="border-yellow-500/30"
              onClick={onPlayRunner}
              isWalletConnected={isWalletConnected}
              status="COMING SOON"
            />
            
            <GameCard 
              title="Block Breaker"
              description="Cryptographic firewall penetration. Shatter defenses to access the core."
              icon={<Grid size={24} />}
              accentColor="text-blue-400"
              borderColor="border-blue-500/30"
              onClick={onPlayBlockBreaker}
              isWalletConnected={isWalletConnected}
              status="COMING SOON"
            />

            <GameCard 
              title="Cyber Flight"
              description="Aerial navigation through secure pipes. Maintain altitude."
              icon={<Rocket size={24} />}
              accentColor="text-cyan-400"
              borderColor="border-cyan-500/30"
              onClick={onPlayCyberFlap}
              isWalletConnected={isWalletConnected}
              status="COMING SOON"
            />

            <GameCard 
              title="Virus Whack"
              description="Rapid response threat elimination. Whack the malicious nodes."
              icon={<Ghost size={24} />}
              accentColor="text-red-400"
              borderColor="border-red-500/30"
              onClick={onPlayVirusWhack}
              isWalletConnected={isWalletConnected}
              status="COMING SOON"
            />

            <GameCard 
              title="Neural Snake"
              description="Data consumption algorithm. Grow the network without self-termination."
              icon={<GitCommit size={24} />}
              accentColor="text-green-400"
              borderColor="border-green-500/30"
              onClick={onPlaySnake}
              isWalletConnected={isWalletConnected}
              status="COMING SOON"
            />

            <GameCard 
              title="System Defense"
              description="Protect the core from incoming projectiles. Do not let defenses fall."
              icon={<Shield size={24} />}
              accentColor="text-blue-400"
              borderColor="border-blue-500/30"
              onClick={onPlaySpaceInvaders}
              isWalletConnected={isWalletConnected}
              status="COMING SOON"
            />
          </div>
        </div>

        {/* Features Section */}
        <div id="about" className="grid md:grid-cols-3 gap-8 mb-32 border-t border-white/10 pt-20">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10">
              <Brain size={20} />
            </div>
            <h3 className="text-xl font-bold">Agent Evaluation</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Autonomous AI agents monitor gameplay patterns to verify human skill. No centralized gatekeepers — just code.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10">
              <Lock size={20} />
            </div>
            <h3 className="text-xl font-bold">On-Chain Proof</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Every high score is cryptographically signed. Claim tokens only after passing the agent's criteria.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10">
              <CheckCircle size={20} />
            </div>
            <h3 className="text-xl font-bold">Reputation System</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Built on ERC-8004. Build your on-chain resume as a certified operator across multiple protocols.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-[#0a0a0a] rounded-2xl p-8 md:p-12 border border-white/10">
          <h2 className="text-2xl font-bold mb-12">Transmission Protocol</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="text-6xl font-bold text-white/5 mb-4">01</div>
              <h4 className="text-lg font-bold mb-2">Connect</h4>
              <p className="text-sm text-gray-400">Link your Web3 identity to the arcade terminal.</p>
            </div>
            
            <div className="relative">
              <div className="text-6xl font-bold text-white/5 mb-4">02</div>
              <h4 className="text-lg font-bold mb-2">Play</h4>
              <p className="text-sm text-gray-400">Select a protocol and demonstrate your proficiency.</p>
            </div>

            <div className="relative">
              <div className="text-6xl font-bold text-white/5 mb-4">03</div>
              <h4 className="text-lg font-bold mb-2">Qualify</h4>
              <p className="text-sm text-gray-400">Reach the protocol threshold to trigger the agent.</p>
            </div>

            <div className="relative">
              <div className="text-6xl font-bold text-white/5 mb-4">04</div>
              <h4 className="text-lg font-bold mb-2">Mint</h4>
              <p className="text-sm text-gray-400">Receive your signed proof and mint your token.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#020202] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <span className="font-bold text-gray-400">8004 ARCADE</span>
          </div>
          <div className="flex gap-6 text-gray-500 text-sm">
            <a href="https://x.com/8004Arcade" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Etherscan</a>
          </div>
        </div>
      </footer>
    </div>
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
      desc: "Surpass the hidden threshold to unlock the participation proof NFT."
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
                 <span className="text-white">ARCADE_PROOF</span>
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
              Reach <span className="text-white font-bold border-b border-green-500">Threshold</span> in a single run to unlock the minting protocol.
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
                    MINT FRAGMENT (0.002 ETH)
                </Button>
            ) : (
                <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-400 text-sm text-center animate-pulse">
                    INSUFFICIENT DATA / ACCESS DENIED
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