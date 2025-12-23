import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameController } from './logic/GameController';
import { IoCContainer } from './logic/IoCContainer';
import { registerDefaultServices } from './logic/registerServices';
import { BiomeType, Achievement } from './types';
import { PLANTS_DATA, UPGRADES_DATA, GARDEN_UPGRADES_DATA, ACHIEVEMENTS_DATA } from './data/gameData';
import { PixelButton, PixelCard, PixelModal, PixelToast } from './components/PixelComponents';
import { DollarSign, Zap, Save, RefreshCw, Trash2, ArrowUpCircle, Lock, Menu, BookOpen, Trophy, Sprout, Coins, House, Zap as Bolt, Gem, Hexagon } from 'lucide-react';
import { Plant } from './logic/Plant';
import { PlantSprite } from './components/GameAssets';

// Initialize IoC container & controller outside component to persist across re-renders
const container = new IoCContainer();
registerDefaultServices(container);
const gameController = container.resolve<GameController>('gameController');

export function App() {
  const [loading, setLoading] = useState(true);
  const [gold, setGold] = useState(0);
  const [level, setLevel] = useState(1);
  const [gps, setGps] = useState(0);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [maxGardenSize, setMaxGardenSize] = useState(6);
  const [activeTab, setActiveTab] = useState<'plants' | 'upgrades' | 'garden'>('plants');
  const [biome, setBiome] = useState<BiomeType>(BiomeType.FARM);
  
  // Modals & Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWiki, setShowWiki] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [pendingRetry, setPendingRetry] = useState(false);

  // Track expanded plants for the "unfold" UI
  const [expandedPlantId, setExpandedPlantId] = useState<string | null>(null);
  // Track expanded shop items (hover)
  const [hoveredShopItemId, setHoveredShopItemId] = useState<string | null>(null);

  // Sync state from controller
  const syncState = () => {
    setGold(gameController.gold);
    setLevel(gameController.level);
    setPlants(gameController.getPlants());
    setGps(gameController.getGPS());
    setBiome(gameController.getBiome());
    setMaxGardenSize(gameController.maxGardenSize);
  };

  const handleAchievementUnlock = (ach: Achievement) => {
    setNotifications(prev => [...prev, ach]);
  };

  useEffect(() => {
    // Initialize Game
    gameController.init().then(() => {
      syncState();
      setLoading(false);
    });

    // Setup Listeners
    gameController.setListener(syncState);
    gameController.setAchievementListener(handleAchievementUnlock);

    // Game Loop
    const interval = setInterval(() => {
      gameController.tick(1); 
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Biome Background Styles
  const getBiomeStyle = () => {
    switch (biome) {
      case BiomeType.DESERT:
        return 'bg-[#d2b48c]'; // Sand color
      case BiomeType.JUNGLE:
        return 'bg-[#2d4c1e]'; // Deep jungle green
      case BiomeType.FARM:
      default:
        return 'bg-[#8bac0f]'; // Classic GB Green
    }
  };

  const getBiomePattern = () => {
     if (biome === BiomeType.DESERT) return 'opacity-20 bg-[radial-gradient(#8b4513_1px,transparent_1px)] [background-size:16px_16px]';
     if (biome === BiomeType.JUNGLE) return 'opacity-20 bg-[linear-gradient(45deg,#0f380f_25%,transparent_25%,transparent_75%,#0f380f_75%,#0f380f),linear-gradient(45deg,#0f380f_25%,transparent_25%,transparent_75%,#0f380f_75%,#0f380f)] [background-size:20px_20px] [background-position:0_0,10px_10px]';
     return 'opacity-10 bg-[radial-gradient(#0f380f_1px,transparent_1px)] [background-size:8px_8px]';
  }

  // Icon Mapper
  const getIcon = (name: string) => {
    switch (name) {
      case 'sprout': return <Sprout size={24} />;
      case 'coin': return <Coins size={24} />;
      case 'house': return <House size={24} />;
      case 'cactus': return <Hexagon size={24} />;
      case 'bolt': return <Bolt size={24} />;
      case 'gem': return <Gem size={24} />;
      default: return <Trophy size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-pixel-dark text-pixel-green font-pixel">
        LOADING...
      </div>
    );
  }

  // Retry save on failure
  useEffect(() => {
    if (persistError && !pendingRetry) {
      setPendingRetry(true);
      const retry = setTimeout(async () => {
        const ok = await gameController.saveGame();
        setPendingRetry(false);
        if (ok) {
          setPersistError(null);
        }
      }, 3000);
      return () => clearTimeout(retry);
    }
  }, [persistError, pendingRetry]);

  const formatNumber = (num: number) => Math.floor(num).toLocaleString();

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBiomeStyle()} font-pixel text-pixel-dark relative overflow-x-hidden`}>
      {/* Background Pattern */}
      <div className={`absolute inset-0 pointer-events-none ${getBiomePattern()}`}></div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 bottom-0 w-64 bg-pixel-light border-r-4 border-pixel-dark z-50 p-4 shadow-2xl"
      >
        <h2 className="text-xl font-pixel mb-6 border-b-4 border-pixel-dark pb-2">Advancements</h2>
        <div className="space-y-4 font-pixel">
          <button 
            onClick={() => { setShowWiki(true); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 p-3 bg-white/20 hover:bg-white/40 border-2 border-transparent hover:border-pixel-dark transition-all rounded text-sm uppercase"
          >
            <BookOpen size={20} /> Wiki
          </button>
          <button 
            onClick={() => { setShowAchievements(true); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 p-3 bg-white/20 hover:bg-white/40 border-2 border-transparent hover:border-pixel-dark transition-all rounded text-sm uppercase"
          >
            <Trophy size={20} /> Achievements
          </button>
        </div>
        <div className="absolute bottom-4 left-4 text-[10px] opacity-50 font-mono-pixel">
          GreenOps v0.1.3
        </div>
      </motion.div>

      {/* Achievement / Error Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {persistError && (
            <PixelToast
              key="persist-error"
              message={`Save fehlgeschlagen${pendingRetry ? ' – Retry läuft...' : ''}`}
              onClose={() => setPersistError(null)}
            />
          )}
          {notifications.map((ach) => (
            <PixelToast 
              key={ach.id}
              message={ach.name} 
              icon={getIcon(ach.icon)}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== ach.id))} 
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 container mx-auto p-4 max-w-4xl">
        
        {/* Top Left Menu Button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 bg-pixel-light p-2 border-4 border-pixel-dark shadow-pixel hover:scale-105 active:scale-95 transition-transform"
        >
          <Menu size={24} className="text-pixel-dark" />
        </button>

        {/* Header / HUD */}
        <header className="mb-6 sticky top-4 z-20">
          <PixelCard className="bg-pixel-light/95 backdrop-blur-sm flex flex-col items-center gap-4 border-b-8 border-r-8 p-0 overflow-hidden">
             {/* Banner Title Area */}
             <div className="w-full h-32 md:h-40 bg-pixel-dark relative overflow-hidden border-b-4 border-pixel-dark flex items-center justify-center">
                <div className="z-10 text-center">
                   <h1 className="text-4xl text-pixel-light font-pixel" style={{ textShadow: '4px 4px 0 #0f380f' }}>GreenOps</h1>
                   <div className="text-pixel-sand text-lg font-mono-pixel uppercase tracking-[0.2em] mt-1">Garden Engineering</div>
                </div>
                
                {/* Grid pattern background for retro feel */}
                <div className="absolute inset-0 opacity-20" 
                     style={{ backgroundImage: 'linear-gradient(#306230 1px, transparent 1px), linear-gradient(90deg, #306230 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                <div className="absolute top-2 left-2 bg-pixel-dark/80 text-pixel-green p-2 border border-pixel-green shadow-sm z-20">
                   <span className="text-xs uppercase font-pixel">Lvl {level}</span>
                </div>
                <div className="absolute top-2 right-2 bg-pixel-dark/80 text-pixel-green p-2 border border-pixel-green shadow-sm z-20">
                   <span className="text-xs uppercase font-pixel">{biome}</span>
                </div>
             </div>

             {/* Stats Bar */}
            <div className="w-full flex justify-between px-6 py-4 bg-pixel-light">
              <div>
                <div className="text-[10px] uppercase text-pixel-brown font-pixel mb-1">Treasury</div>
                <div className="flex items-center gap-2 text-xl md:text-2xl text-pixel-dark font-mono-pixel font-bold">
                  <DollarSign size={20} />
                  {formatNumber(gold)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-pixel-brown font-pixel mb-1">Production</div>
                <div className="flex items-center gap-2 text-xl md:text-2xl text-pixel-dark font-mono-pixel font-bold justify-end">
                  <Zap size={20} />
                  {formatNumber(gps)}/s
                </div>
              </div>
            </div>
          </PixelCard>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Game Area (Garden View) */}
          <div className="lg:col-span-2 space-y-6">
            <PixelCard className="min-h-[400px]">
              <div className="flex justify-between items-center mb-4 border-b-4 border-pixel-dark pb-2">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg uppercase font-pixel">My Garden</h2>
                  <span className="text-sm font-mono-pixel text-pixel-brown">({plants.length}/{maxGardenSize})</span>
                </div>
                {plants.length >= maxGardenSize && (
                  <span className="text-[10px] font-pixel text-red-600 bg-red-200 px-2 py-1 border border-red-600">FULL</span>
                )}
              </div>
              
              {plants.length === 0 ? (
                <div className="text-center py-20 opacity-60">
                  <PlantSprite type="crop" level={1} className="w-16 h-16 mx-auto mb-4 grayscale opacity-50" />
                  <p className="font-pixel text-xs">Your garden is empty.</p>
                  <p className="font-mono-pixel text-lg mt-2">Purchase your first crop!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {plants.map((plant) => {
                      const isTree = plant.baseYield > 15;
                      const isExpanded = expandedPlantId === plant.id;
                      const upgradeCost = gameController.getPlantUpgradeCost(plant);
                      const sellValue = gameController.getSellValue(plant);
                      const canAffordUpgrade = gold >= upgradeCost;
                      const type = isTree ? 'tree' : 'crop';

                      return (
                        <motion.div
                          key={plant.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0 }}
                          layout
                          className={`col-span-1 ${isExpanded ? 'col-span-2 sm:col-span-3' : ''}`}
                        >
                           <div 
                              className={`bg-pixel-green/30 border-2 border-pixel-dark p-2 cursor-pointer relative overflow-hidden transition-colors ${isExpanded ? 'bg-pixel-green/60' : 'hover:bg-pixel-green/50'}`}
                              onClick={() => setExpandedPlantId(isExpanded ? null : plant.id)}
                           >
                              <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 flex justify-center items-center w-16 h-16 bg-white/20 border border-pixel-dark/30 shadow-inner">
                                   <PlantSprite type={type} level={plant.level} className="w-12 h-12 drop-shadow-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xs font-pixel truncate">{plant.name}</div>
                                  <div className="text-[10px] font-pixel uppercase text-pixel-dark/70">Lvl {plant.level}</div>
                                  <div className="text-sm font-mono-pixel text-pixel-brown mt-1">
                                    +{formatNumber(plant.calculateYield(gameController.getGlobalMultiplier()))}/s
                                  </div>
                                </div>
                              </div>
                              
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-2 border-t border-pixel-dark/30 pt-2 overflow-hidden"
                                  >
                                    <div className="grid grid-cols-2 gap-2">
                                      <PixelButton 
                                        onClick={(e) => { e?.stopPropagation(); gameController.upgradePlant(plant.id); }}
                                        disabled={!canAffordUpgrade}
                                        className="text-[10px] px-1 py-1 flex flex-col items-center justify-center gap-1"
                                      >
                                        <div className="flex items-center gap-1 font-pixel text-[10px]"><ArrowUpCircle size={10} /> UPGRADE</div>
                                        <span className={`font-mono-pixel text-lg ${canAffordUpgrade ? "text-pixel-dark" : "text-red-700"}`}>${formatNumber(upgradeCost)}</span>
                                      </PixelButton>

                                      <PixelButton 
                                        onClick={(e) => { e?.stopPropagation(); gameController.sellPlant(plant.id); }}
                                        variant="danger"
                                        className="text-[10px] px-1 py-1 flex flex-col items-center justify-center gap-1"
                                      >
                                        <div className="flex items-center gap-1 font-pixel text-[10px]"><Trash2 size={10} /> SELL</div>
                                        <span className="font-mono-pixel text-lg">${formatNumber(sellValue)}</span>
                                      </PixelButton>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                           </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </PixelCard>
          </div>

          {/* Shop & Upgrades Panel */}
          <div className="lg:col-span-1">
             <div className="bg-pixel-dark p-1 rounded-t-lg flex font-pixel">
                <button 
                  onClick={() => setActiveTab('plants')}
                  className={`flex-1 py-2 text-center text-[10px] uppercase font-bold tracking-wider ${activeTab === 'plants' ? 'bg-pixel-light text-pixel-dark' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                  Shop
                </button>
                <button 
                  onClick={() => setActiveTab('upgrades')}
                  className={`flex-1 py-2 text-center text-[10px] uppercase font-bold tracking-wider ${activeTab === 'upgrades' ? 'bg-pixel-light text-pixel-dark' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                  Boost
                </button>
                <button 
                  onClick={() => setActiveTab('garden')}
                  className={`flex-1 py-2 text-center text-[10px] uppercase font-bold tracking-wider ${activeTab === 'garden' ? 'bg-pixel-light text-pixel-dark' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                  Expand
                </button>
             </div>
             
             <PixelCard className="rounded-t-none border-t-0 h-[600px] overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  
                  {activeTab === 'plants' && (
                    <div className="space-y-4">
                      {plants.length >= maxGardenSize && (
                        <div className="bg-red-100 border border-red-500 text-red-800 p-2 text-[10px] font-pixel text-center mb-2">
                          GARDEN IS FULL! EXPAND IT.
                        </div>
                      )}
                      
                      {PLANTS_DATA.map((plantTemplate) => {
                        const existingCount = plants.filter(p => p.plantId === plantTemplate.id).length;
                        const currentCost = Math.floor(plantTemplate.cost * Math.pow(1.2, existingCount));
                        const canAfford = gold >= currentCost;
                        const isUnlocked = level >= plantTemplate.unlockLevel;
                        
                        // Constraints check
                        const isGardenFull = plants.length >= maxGardenSize;
                        const isTypeMaxed = existingCount >= 5;
                        const allowPurchase = canAfford && !isGardenFull && !isTypeMaxed;
                        const isHovered = hoveredShopItemId === plantTemplate.id;

                        if (!isUnlocked) return null;

                        return (
                          <div 
                            key={plantTemplate.id} 
                            className={`border-b-2 border-pixel-dark/20 pb-2 last:border-0 transition-colors duration-200 ${isHovered ? 'bg-pixel-dark/5 p-2 -mx-2 rounded' : ''}`}
                            onMouseEnter={() => setHoveredShopItemId(plantTemplate.id)}
                            onMouseLeave={() => setHoveredShopItemId(null)}
                          >
                               <div className="flex justify-between items-start">
                                  {/* Info Side */}
                                  <div className="flex-1 pr-2">
                                     <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-xs font-pixel">{plantTemplate.name}</h3>
                                        <div className="flex gap-1 items-center">
                                           <span className={`text-[10px] font-pixel px-1 border border-pixel-dark ${isTypeMaxed ? 'bg-red-200 text-red-800' : 'bg-pixel-light'}`}>
                                             {existingCount}/5
                                           </span>
                                        </div>
                                     </div>
                                     
                                     {/* Hover Reveal Area */}
                                     <AnimatePresence>
                                        {isHovered && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="py-2 space-y-1">
                                                 <div className="text-sm text-pixel-dark font-mono-pixel bg-pixel-sand/30 p-1 border-l-2 border-pixel-brown italic">
                                                     "{plantTemplate.lore}"
                                                 </div>
                                                 <p className="text-lg text-pixel-dark leading-none font-mono-pixel">{plantTemplate.description}</p>
                                                 <div className="text-xs font-pixel mt-2">Base Yield: +{plantTemplate.baseYield}/s</div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>

                                     {/* Default condensed view if not hovered */}
                                     {!isHovered && (
                                         <div className="text-lg text-pixel-brown font-mono-pixel truncate">
                                             Yield: {plantTemplate.baseYield}/s | {plantTemplate.type}
                                         </div>
                                     )}
                                  </div>

                                  {/* Fixed Button Side */}
                                  <div className="flex flex-col items-end gap-1">
                                      <PixelButton 
                                          onClick={() => gameController.purchasePlant(plantTemplate.id)}
                                          disabled={!allowPurchase}
                                          className="flex flex-col items-center justify-center p-2 h-full min-w-[80px]"
                                      >
                                          <span className="text-[10px] font-bold font-pixel">
                                              {isTypeMaxed ? 'MAX' : isGardenFull ? 'FULL' : 'BUY'}
                                          </span>
                                          {!isTypeMaxed && !isGardenFull && (
                                              <span className="text-lg font-mono-pixel opacity-80">${formatNumber(currentCost)}</span>
                                          )}
                                      </PixelButton>
                                  </div>
                               </div>
                            </div>
                        );
                      })}
                      
                      {PLANTS_DATA.filter(p => level < p.unlockLevel).length > 0 && (
                        <div className="text-center py-4 text-xs font-pixel opacity-50 border-t-2 border-dashed border-pixel-dark">
                          More plants unlock at higher levels...
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'upgrades' && (
                    <div className="space-y-4">
                      {UPGRADES_DATA.map((upgrade, index) => {
                        const purchased = gameController.purchasedUpgrades.has(upgrade.id);
                        const canAfford = gold >= upgrade.cost;
                        
                        // Check if previous upgrade is purchased (if not first)
                        const prevPurchased = index === 0 || gameController.purchasedUpgrades.has(UPGRADES_DATA[index - 1].id);
                        const isLocked = !purchased && !prevPurchased;
                        
                        return (
                          <div key={upgrade.id} className={`border-b-2 border-pixel-dark/20 pb-4 last:border-0 relative ${purchased ? 'opacity-50 grayscale' : ''} ${isLocked ? 'opacity-70' : ''}`}>
                             <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-xs font-pixel flex items-center gap-1">
                                  {isLocked && <Lock size={12} className="text-pixel-brown" />}
                                  {upgrade.name}
                                </h3>
                                {purchased && <span className="text-[10px] font-pixel font-bold text-green-700">OWNED</span>}
                             </div>
                             
                             {isLocked ? (
                               <div className="bg-pixel-dark/10 p-2 mb-2 text-sm font-mono-pixel italic border-l-2 border-pixel-dark text-center">
                                 Requires previous upgrade
                               </div>
                             ) : (
                               <>
                                <p className="text-lg leading-tight mb-2 text-pixel-dark/90 font-mono-pixel">{upgrade.description}</p>
                                <div className="bg-pixel-sand/30 p-2 mb-2 text-sm font-mono-pixel italic border-l-2 border-pixel-brown">
                                  {upgrade.lore}
                                </div>
                               </>
                             )}
                             
                             <div className="flex justify-between items-center">
                                <div className="text-xs text-pixel-accent font-pixel font-bold">
                                   x{upgrade.multiplier} Global
                                </div>
                                {!purchased && (
                                  <PixelButton 
                                    onClick={() => gameController.purchaseUpgrade(upgrade.id)}
                                    disabled={!canAfford || isLocked}
                                    variant={isLocked ? "primary" : "accent"}
                                    className="py-1 px-2"
                                  >
                                    {isLocked ? <span className="text-[10px] font-pixel">LOCKED</span> : <span className="text-lg font-mono-pixel">${formatNumber(upgrade.cost)}</span>}
                                  </PixelButton>
                                )}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'garden' && (
                    <div className="space-y-4">
                      <div className="mb-4 text-xs font-pixel bg-pixel-green/30 p-2 border border-pixel-dark">
                        Current Size: <span className="font-bold">{maxGardenSize} Plots</span>
                      </div>
                      
                      {GARDEN_UPGRADES_DATA.map((upgrade, index) => {
                        const purchased = gameController.purchasedGardenUpgrades.has(upgrade.id);
                        const canAfford = gold >= upgrade.cost;
                        
                        // Check if previous upgrade is purchased
                        const prevPurchased = index === 0 || gameController.purchasedGardenUpgrades.has(GARDEN_UPGRADES_DATA[index - 1].id);
                        const isLocked = !purchased && !prevPurchased;
                        
                        return (
                          <div key={upgrade.id} className={`border-b-2 border-pixel-dark/20 pb-4 last:border-0 ${purchased ? 'opacity-50 grayscale' : ''} ${isLocked ? 'opacity-70' : ''}`}>
                             <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-xs font-pixel flex items-center gap-1">
                                  {isLocked && <Lock size={12} className="text-pixel-brown" />}
                                  {upgrade.name}
                                </h3>
                                {purchased && <span className="text-[10px] font-pixel font-bold text-green-700">OWNED</span>}
                             </div>
                             
                             {isLocked ? (
                               <div className="bg-pixel-dark/10 p-2 mb-2 text-sm font-mono-pixel italic border-l-2 border-pixel-dark text-center">
                                 Requires previous expansion
                               </div>
                             ) : (
                               <p className="text-lg leading-tight mb-2 text-pixel-dark/90 font-mono-pixel">{upgrade.description}</p>
                             )}

                             <div className="flex justify-between items-center">
                                <div className="text-xs text-pixel-accent font-pixel font-bold">
                                   +{upgrade.capacityIncrease} Slots
                                </div>
                                {!purchased && (
                                  <PixelButton 
                                    onClick={() => gameController.purchaseGardenUpgrade(upgrade.id)}
                                    disabled={!canAfford || isLocked}
                                    className="py-1 px-2 bg-pixel-brown text-white"
                                  >
                                     {isLocked ? <span className="text-[10px] font-pixel">LOCKED</span> : <span className="text-lg font-mono-pixel">${formatNumber(upgrade.cost)}</span>}
                                  </PixelButton>
                                )}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
             </PixelCard>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="mt-8 flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity font-pixel">
           <button 
             onClick={async () => { const ok = await gameController.saveGame(); if (!ok) setPersistError('Save fehlgeschlagen'); }}
             className="flex items-center gap-2 text-xs uppercase hover:text-pixel-light"
           >
             <Save size={14} /> Force Save
           </button>
           <div className="text-[10px] text-center max-w-[200px] leading-tight">
             GreenOps v0.1.3<br/>
             Pixel Garden Engineering
           </div>
           <button 
             onClick={() => { if(confirm('Reset progress?')) gameController.resetGame() }}
             className="flex items-center gap-2 text-xs uppercase text-red-800 hover:text-red-600"
           >
             <RefreshCw size={14} /> Reset
           </button>
        </div>

      </div>

      {/* Wiki Modal */}
      <PixelModal isOpen={showWiki} onClose={() => setShowWiki(false)} title="GreenOps Wiki">
        <div className="space-y-8 pb-4">
          <section>
            <h3 className="font-pixel text-sm border-b-2 border-pixel-dark mb-3">Introduction</h3>
            <p className="text-xl font-mono-pixel text-pixel-dark/90">
              Welcome to <span className="font-bold text-pixel-accent">GreenOps: Garden</span>. 
              Your goal is to build the ultimate agricultural empire. Plant crops, grow trees, and manage resources 
              across varying biomes.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-pixel-green/20 p-2 border border-pixel-dark">
                    <h4 className="font-pixel text-[10px] mb-1">Crops (Linear)</h4>
                    <p className="font-mono-pixel text-lg leading-tight">Crops grow in value linearly based on level. They are cheap to start but scale slowly.</p>
                </div>
                <div className="bg-pixel-green/20 p-2 border border-pixel-dark">
                    <h4 className="font-pixel text-[10px] mb-1">Trees (Exponential)</h4>
                    <p className="font-mono-pixel text-lg leading-tight">Trees scale exponentially (1.5x) per level. Expensive to buy, but powerful late-game.</p>
                </div>
            </div>
          </section>

          {/* Dynamic Plant Wiki */}
          {[
              { biome: 'FARM', name: 'Farm Biome', level: 'Levels 1-5', plants: PLANTS_DATA.filter(p => p.unlockLevel <= 5) },
              { biome: 'DESERT', name: 'Desert Biome', level: 'Levels 6-10', plants: PLANTS_DATA.filter(p => p.unlockLevel > 5 && p.unlockLevel <= 10) },
              { biome: 'JUNGLE', name: 'Jungle Biome', level: 'Levels 11-15', plants: PLANTS_DATA.filter(p => p.unlockLevel > 10) }
          ].map((section) => (
              <section key={section.biome}>
                 <div className="flex justify-between items-end border-b-2 border-pixel-dark mb-3 pb-1">
                    <h3 className="font-pixel text-sm">{section.name}</h3>
                    <span className="font-mono-pixel text-lg text-pixel-brown">{section.level}</span>
                 </div>
                 
                 <div className="space-y-3">
                     {section.plants.map(plant => (
                         <div key={plant.id} className="flex gap-3 bg-white/40 p-2 border border-pixel-dark/20">
                             <div className="w-10 h-10 flex items-center justify-center bg-pixel-light border border-pixel-dark">
                                 {/* Simple visual representation if no sprite available in this context, or use PlantSprite if accessible */}
                                 <div className={`w-4 h-4 ${plant.type === 'tree' ? 'bg-pixel-dark' : 'bg-pixel-green'}`}></div>
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between">
                                     <span className="font-pixel text-[10px]">{plant.name}</span>
                                     <span className="font-mono-pixel text-sm bg-pixel-sand px-1 border border-pixel-dark/30">Lvl {plant.unlockLevel}</span>
                                 </div>
                                 <div className="font-mono-pixel text-lg leading-none mt-1 text-pixel-dark/80">{plant.description}</div>
                                 <div className="flex gap-4 mt-1 font-mono-pixel text-sm text-pixel-brown">
                                     <span>Base: {plant.baseYield}/s</span>
                                     <span>Cost: ${formatNumber(plant.cost)}</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
              </section>
          ))}
        </div>
      </PixelModal>

      {/* Achievements Modal */}
      <PixelModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} title="Achievements">
        <div className="grid grid-cols-1 gap-3">
          {ACHIEVEMENTS_DATA.map(ach => {
             const unlocked = gameController.unlockedAchievements.has(ach.id);
             return (
               <div key={ach.id} className={`flex items-center gap-4 p-3 border-2 relative ${unlocked ? 'bg-pixel-green/20 border-pixel-dark' : 'bg-gray-200 border-gray-400 opacity-80'}`}>
                 <div className="p-2 bg-white/50 border border-pixel-dark/20 rounded">
                     {unlocked ? getIcon(ach.icon) : <Lock size={24} className="text-pixel-dark/50" />}
                 </div>
                 <div>
                   <div className="font-bold text-xs font-pixel mb-1">{ach.name}</div>
                   <div className="text-lg leading-tight font-mono-pixel text-pixel-dark/80">{ach.description}</div>
                   {unlocked && <div className="text-[10px] font-pixel text-green-800 font-bold mt-1">UNLOCKED</div>}
                 </div>
               </div>
             )
          })}
        </div>
      </PixelModal>

    </div>
  );
}