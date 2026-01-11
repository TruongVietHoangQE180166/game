
import { ExpGem, HealthDrop, PlayerStats, FloatingText } from '../types';
import { getDistance } from '../utils';

export const updateCollectibles = (
  dt: number,
  gems: ExpGem[],
  healthDrops: HealthDrop[],
  player: { x: number, y: number },
  stats: PlayerStats,
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>,
  handleLevelUp: () => void,
  floatingTexts: FloatingText[]
) => {
    // Gems
    gems.forEach(g => {
      const dist = getDistance(player.x, player.y, g.x, g.y);
      if (dist < stats.magnetRange) {
        const angle = Math.atan2(player.y - g.y, player.x - g.x);
        g.x += Math.cos(angle) * 800 * dt;
        g.y += Math.sin(angle) * 800 * dt;
      }
      if (dist < 30) {
        setStats(prev => {
          const newExp = prev.exp + g.amount; 
          if (newExp >= prev.expToNext) {
            handleLevelUp();
            return { 
                ...prev, 
                exp: newExp - prev.expToNext, 
                expToNext: Math.floor(prev.expToNext * 1.3), 
                level: prev.level + 1,
                hp: Math.min(prev.maxHP, prev.hp + prev.maxHP * 0.1),
                currentArmor: prev.maxArmor 
            };
          }
          return { ...prev, exp: newExp };
        });
        g.amount = 0;
      }
    });
    const nextGems = gems.filter(g => g.amount > 0);

    // Health
    healthDrops.forEach(h => {
        h.life -= dt;
        const dist = getDistance(player.x, player.y, h.x, h.y);
        if (dist < 35) {
             setStats(prev => ({ ...prev, hp: Math.min(prev.maxHP, prev.hp + h.healAmount) }));
             floatingTexts.push({
                id: Math.random().toString(), x: player.x, y: player.y - 40,
                text: `+${h.healAmount} HP`, color: '#22c55e', life: 1.0, vx: 0, vy: -3
             });
             h.life = 0;
        }
    });
    const nextHealth = healthDrops.filter(h => h.life > 0);

    return { nextGems, nextHealth };
};
