// @ts-check
// Baús Reforçados: bigger chests in three tiers and kits that upgrade a placed chest without taking the items out.
// Public SDK only. The chests are plain block inventories, so other mods (the Logistics Pipes) use them through
// world.getItemStorage without knowing this mod exists.
import { ModInitializer } from './mineclaude-sdk.js';
import { TIERS, UPGRADES, ChestScreen, ReinforcedChest, UpgradeKit, chestId, paintTextures } from './content.ts';

const I = { iron: 'mineclaude:iron_ingot', gold: 'mineclaude:gold_ingot', diamond: 'mineclaude:diamond', glass: 'mineclaude:glass', planks: 'mineclaude:planks', chest: 'mineclaude:chest' };

export default class BausReforcados extends ModInitializer {
  /** @param {import('../../packages/cli/types/mineclaude-mod').ModContext} ctx */
  onInitialize(ctx) {
    paintTextures(ctx);
    for (const tier of /** @type {(keyof typeof TIERS)[]} */ (Object.keys(TIERS))) {
      ctx.screens.register(`tela_${tier}`, new ChestScreen(tier));
      ctx.blocks.register(`bau_${tier}`, new ReinforcedChest(tier));
    }
    for (const u of UPGRADES) ctx.items.register(u.kit, new UpgradeKit(u));

    const at = 'crafting_table';
    ctx.recipes.add({ key: 'bau_ferro', out: chestId('ferro'), n: 1, pattern: ['III', 'ICI', 'III'], legend: { I: I.iron, C: I.chest }, station: at });
    ctx.recipes.add({ key: 'bau_ouro', out: chestId('ouro'), n: 1, pattern: ['GGG', 'GCG', 'GGG'], legend: { G: I.gold, C: chestId('ferro') }, station: at });
    ctx.recipes.add({ key: 'bau_diamante', out: chestId('diamante'), n: 1, pattern: ['VVV', 'DCD', 'VVV'], legend: { V: I.glass, D: I.diamond, C: chestId('ouro') }, station: at });
    ctx.recipes.add({ key: 'kit_ferro', out: 'baus_reforcados:kit_ferro', n: 1, pattern: ['III', 'IPI', 'III'], legend: { I: I.iron, P: I.planks }, station: at });
    ctx.recipes.add({ key: 'kit_ouro', out: 'baus_reforcados:kit_ouro', n: 1, pattern: ['GGG', 'GIG', 'GGG'], legend: { G: I.gold, I: I.iron }, station: at });
    ctx.recipes.add({ key: 'kit_diamante', out: 'baus_reforcados:kit_diamante', n: 1, pattern: ['VVV', 'DGD', 'VVV'], legend: { V: I.glass, D: I.diamond, G: I.gold }, station: at });
  }
}
