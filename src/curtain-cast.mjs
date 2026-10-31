import {castSheets} from './cast-data.mjs';
/** @type {{id:string,name:string,path?:string,crop?:number[],tint?:number,animal?:string}[]} */
export const curtainCast=[
 {id:'clown',name:'The balcony clown',path:'runtime/clown.png'},
 {id:'scruffy',name:'The late-night regular',path:'runtime/scruffy-pedestrian.png'},
 {id:'soccer-star',name:'The soccer star',path:'runtime/soccer-star.png'},
 {id:'fan-one',name:'The concert fans · one',path:'concert-fans.png',crop:[180,9,525,979]},
 {id:'fan-two',name:'The concert fans · two',path:'concert-fans.png',crop:[851,11,448,985]},
 ...Object.entries(castSheets).flatMap(([sheet,frames])=>frames.map((frame,i)=>({id:`${sheet}-${i}`,name:frame.name,path:`cast/${sheet}-v1.png`,crop:frame.crop}))),
 ...['The hooded wraith','The skull spirit','The shrieking specter','The attic landlord'].map((name,i)=>({id:`ghost-${i}`,name,path:'haunted/ghosts-v1.png',crop:[i%2*627,Math.floor(i/2)*627,627,627]})),
 {id:'zombie-one',name:'The undead regular',path:'runtime/scruffy-pedestrian.png',tint:0x99bd76},
 {id:'zombie-two',name:'The undead clown',path:'runtime/clown.png',tint:0x87b8a0},
 {id:'oakey',name:'Oakey',path:'cats.png',crop:[27,146,564,964]},
 {id:'ellowyn',name:'Ellowyn',path:'cats.png',crop:[634,469,614,562]},
 {id:'goose',name:'The cabin goose',animal:'goose'},
 {id:'raccoon',name:'The cabin raccoon',animal:'raccoon'},
 {id:'pigeon',name:'The rooftop pigeon',animal:'pigeon'},
 {id:'allison',name:'Allison',path:'runtime/allison.png'},
 {id:'seth',name:'Seth',path:'runtime/seth-walk.png',crop:[192,0,192,256]}
];
export const CURTAIN_CYCLE=6000;
export function curtainMoment(ms){const index=Math.floor(Math.max(0,ms)/CURTAIN_CYCLE),phase=Math.max(0,ms)%CURTAIN_CYCLE;return {index,phase,done:index>=curtainCast.length,bowing:phase>=2000&&phase<3500,applause:phase>=1500&&phase<4200};}
