/** Alpha-derived sprite frames; supplied/generated masters are preserved unchanged. */
export const groceryFixtureFrames=[[7,250,510,271],[530,215,482,305],[1036,71,488,449],[18,731,472,237],[506,736,515,227],[1040,664,489,303]];
export const groceryPickupFrames=[[246,18,298,480],[894,13,443,477],[194,581,404,418],[855,528,529,484]];
export const carnivalVendorFrames=[[20,9,661,492],[823,10,625,491],[84,521,597,492],[794,519,654,494]];
export const carnivalCoasterFrames=[[10,16,1799,831]];
export function addAtlasFrames(scene,key,crops){const texture=scene.textures.get(key);crops.forEach((crop,i)=>{if(!texture.has(String(i)))texture.add(String(i),0,...crop);});return texture;}
