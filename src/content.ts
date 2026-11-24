// @ts-check
// The chests, their screens, the upgrade kits and the art (shared by both sides; the art is painted by code, no PNG).
// Every chest is an ordinary block inventory (`inventory`), so any other mod finds it by position with
// world.getItemStorage — that is how the Logistics Pipes reach them, with no line of code about this mod.
import { BlockType, ItemType, ScreenHandlerType, Slot } from './mineclaude-sdk.js';

const MOD = 'baus_reforcados';

/** The tiers: slots, how many columns the screen uses, hardness and colours of the art. */
export const TIERS = /** @type {const} */ ({
  ferro: { name: 'Baú de Ferro', slots: 54, cols: 9, hardness: 5, metal: ['#b9bec6', '#a4aab3', '#cfd3d9'], dark: '#5d636c', light: '#eef0f3' },
  ouro: { name: 'Baú de Ouro', slots: 81, cols: 9, hardness: 5, metal: ['#e8c13a', '#d4aa28', '#f2d457'], dark: '#8a6510', light: '#fff2a8' },
  diamante: { name: 'Baú de Diamante', slots: 108, cols: 12, hardness: 6, metal: ['#59d6d0', '#45c2bd', '#7ce6e0'], dark: '#1f7f7b', light: '#d8fffb' },
});
/** @typedef {keyof typeof TIERS} Tier */
export const chestId = (/** @type {Tier} */ tier) => `${MOD}:bau_${tier}`;

// The upgrades, in order: which block each kit turns into which (the first one takes the game's own chest).
export const UPGRADES = /** @type {const} */ ([
  { kit: 'kit_ferro', name: 'Kit de melhoria: madeira → ferro', from: 'mineclaude:chest', to: 'ferro' },
  { kit: 'kit_ouro', name: 'Kit de melhoria: ferro → ouro', from: `${MOD}:bau_ferro`, to: 'ouro' },
  { kit: 'kit_diamante', name: 'Kit de melhoria: ouro → diamante', from: `${MOD}:bau_ouro`, to: 'diamante' },
]);

// ---- screens: a grid of the chest's slots, the engine's default screen draws it (and scrolls when it does not fit)
export class ChestScreen extends ScreenHandlerType {
  title = '';
  private _cols = 9; // the mod's own state: the engine ignores fields starting with `_` (docs/sdk-classes.md)
  /** @param {Tier} tier */
  constructor(tier) {
    super();
    this.title = TIERS[tier].name;
    this._cols = TIERS[tier].cols;
  }
  /** @param {{ size: number }} e */
  slots({ size }) {
    return Array.from({ length: size }, (_, i) => Slot.block(i, 8 + (i % this._cols) * 18, 16 + Math.floor(i / this._cols) * 18));
  }
}

// ---- blocks
export class ReinforcedChest extends BlockType {
  /** @param {Tier} tier */
  constructor(tier) {
    super();
    const t = TIERS[tier];
    this.name = t.name;
    this.solid = true;
    this.hardness = t.hardness;
    this.tool = 'pickaxe';
    this.tiles = { top: `${MOD}:${tier}_topo`, bottom: `${MOD}:${tier}_topo`, side: `${MOD}:${tier}_lado` };
    /** @type {import('../../packages/cli/types/mineclaude-mod').BlockInventory} */
    this.inventory = { slots: t.slots, screen: /** @type {any} */ (`${MOD}:tela_${tier}`) };
  }
}

// ---- upgrade kits: right click on a chest of the tier below
/**
 * Turns the chest at `pos` into the tier `to`, keeping every stack (durability and components too). The chest is
 * emptied first (changing a block with an inventory drops what is in it), the block is changed, the stacks go into the
 * new one; a failure puts them back in the old chest, and anything left over drops at the chest, never lost.
 * @param {any} world @param {{ x: number, y: number, z: number }} pos @param {string} to the new block's full name
 * @returns {boolean} whether the chest was upgraded
 */
export function upgradeChest(world, pos, to) {
  const old = world.getItemStorage(pos);
  if (!old) return false;
  /** @type {{ item: any, amount: number }[]} */
  const kept = [];
  try {
    world.transact((/** @type {any} */ tx) => {
      for (const r of old.list()) {
        const n = old.extract(r.item, r.amount, tx);
        if (n > 0) kept.push({ item: r.item, amount: n });
      }
    });
  } catch { return false; }
  const before = world.getBlock(pos);
  let changed = false;
  try { changed = world.setBlock(pos, to) !== false; } catch { changed = false; }
  const target = changed ? world.getItemStorage(pos) : world.getItemStorage(pos) ?? old;
  for (const k of kept) {
    let left = k.amount;
    if (target) { try { world.transact((/** @type {any} */ tx) => { left -= target.insert(k.item, left, tx); }); } catch { /* falls through to the drop */ } }
    if (left > 0) world.dropItem({ x: pos.x + 0.5, y: pos.y + 1, z: pos.z + 0.5 }, typeof k.item === 'string' ? k.item : k.item.item, left);
  }
  return changed && world.getBlock(pos) !== before;
}

export class UpgradeKit extends ItemType {
  /** @param {typeof UPGRADES[number]} u */
  constructor(u) {
    super();
    this.name = u.name;
    this.icon = `${MOD}:${u.kit}`;
    this.stack = 16;
    this.lore = ['Clique direito num baú do nível de baixo:', 'ele vira o próximo nível, com tudo dentro.'];
    this._upgrade = u;
  }
  private _upgrade: typeof UPGRADES[number]; // the mod's own state (ignored by the engine: it starts with `_`)
  /** @param {any} e */
  onUse(e) {
    const u = this._upgrade;
    if (e.target?.type !== 'block') return false;
    const pos = e.target.pos, block = e.world.getBlock(pos);
    if (block !== u.from) {
      e.player.message(`§c[Baús Reforçados] Use num ${u.from === 'mineclaude:chest' ? 'baú comum' : TIERS[/** @type {Tier} */ (u.from.split('_').pop())]?.name ?? 'baú'}.`);
      return false;
    }
    if (!upgradeChest(e.world, pos, chestId(u.to))) return false;
    e.player.take(`${MOD}:${u.kit}`, 1);
    e.player.message(`§a[Baús Reforçados]§r Agora é um ${TIERS[u.to].name}.`);
    return true;
  }
}

// ---- the art (16 x 16, browser only)
/** @param {any} ctx */
export function paintTextures(ctx) {
  for (const [tier, t] of Object.entries(TIERS)) {
    // the side: metal plates, a darker band at the lid's seam, rivets, and the lock plate in the middle
    ctx.textures.paint(`${tier}_lado`, (/** @type {any} */ p) => {
      p.fill(t.metal);
      for (let i = 0; i < p.S; i++) { p.set(i, 0, t.dark); p.set(i, p.S - 1, t.dark); p.set(0, i, t.dark); p.set(p.S - 1, i, t.dark); }
      for (let x = 1; x < p.S - 1; x++) { p.set(x, 5, t.dark); p.set(x, 6, t.light); }
      for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) p.set(x, y, t.light);
      for (let y = 4; y <= 8; y++) for (let x = 6; x <= 9; x++) p.set(x, y, y === 4 || y === 8 || x === 6 || x === 9 ? '#2b2b30' : '#8d8d96');
      p.set(7, 6, '#1a1a1e'); p.set(8, 6, '#1a1a1e');
    });
    // the top: plates with a cross band
    ctx.textures.paint(`${tier}_topo`, (/** @type {any} */ p) => {
      p.fill(t.metal);
      for (let i = 0; i < p.S; i++) { p.set(i, 0, t.dark); p.set(i, p.S - 1, t.dark); p.set(0, i, t.dark); p.set(p.S - 1, i, t.dark); }
      for (let i = 1; i < p.S - 1; i++) { p.set(i, 7, t.dark); p.set(7, i, t.dark); p.set(i, 8, t.light); }
      for (const [x, y] of [[3, 3], [12, 3], [3, 12], [12, 12]]) p.set(x, y, t.light);
    });
  }
  // the kits: a small plate of the new tier's metal with an arrow
  for (const u of UPGRADES) {
    const t = TIERS[u.to];
    ctx.textures.paint(u.kit, (/** @type {any} */ p) => {
      for (let y = 4; y <= 11; y++) for (let x = 2; x <= 13; x++) p.set(x, y, y === 4 || y === 11 || x === 2 || x === 13 ? t.dark : p.pick(t.metal));
      for (let x = 5; x <= 10; x++) p.set(x, 8, '#2b2b30');
      p.set(9, 7, '#2b2b30'); p.set(9, 9, '#2b2b30'); p.set(8, 6, '#2b2b30'); p.set(8, 10, '#2b2b30');
    });
  }
}
