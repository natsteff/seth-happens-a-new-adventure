import {birthdaySethFrame,birthdayAllisonFrame,birthdayBanner} from './birthday-sprites.mjs';
type Crop=[number,number,number,number];
type Atlas={image:HTMLImageElement;frames:Crop[];scale:number};
/** Dedicated alpha sprites include every wearable/held prop in the authored pose. */
export class BirthdayArt{
 private atlases=new Map<string,Atlas>();private token=0;private c:CanvasRenderingContext2D;
 constructor(private canvas:HTMLCanvasElement){this.c=canvas.getContext('2d')!;}
 async load(){const token=++this.token;await Promise.all([['seth','seth-birthday-v1',4,2],['allison','allison-birthday-v1',4,2],['banner','fabric-banner-v1',2,3]].map(async([key,file,cols,rows])=>{const image=new Image();image.src=new URL(`./assets/birthday/${file}.png`,document.baseURI).href;await image.decode();if(token!==this.token){image.removeAttribute('src');return;}const frames=this.bounds(image,Number(cols),Number(rows));this.atlases.set(String(key),{image,frames,scale:1/Math.max(...frames.map(f=>f[3]))});}));}
 private bounds(img:HTMLImageElement,cols:number,rows:number){const sheet=document.createElement('canvas');sheet.width=img.width;sheet.height=img.height;const c=sheet.getContext('2d',{willReadFrequently:true})!;c.drawImage(img,0,0);const data=c.getImageData(0,0,img.width,img.height).data,frames:Crop[]=[];
  for(let i=0;i<cols*rows;i++){const x=Math.round(i%cols*img.width/cols),y=Math.round(Math.floor(i/cols)*img.height/rows),right=Math.round((i%cols+1)*img.width/cols),bottom=Math.round((Math.floor(i/cols)+1)*img.height/rows);let l=right,r=x,t=bottom,b=y;for(let py=y;py<bottom;py++)for(let px=x;px<right;px++)if(data[(py*img.width+px)*4+3]>96){l=Math.min(l,px);r=Math.max(r,px);t=Math.min(t,py);b=Math.max(b,py);}if(r<l)throw Error('Empty birthday sprite');frames.push([l,t,r-l+1,b-t+1]);}sheet.width=sheet.height=1;return frames;
 }
 resize(){const rect=this.canvas.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);this.canvas.width=Math.max(1,Math.round(rect.width*d));this.canvas.height=Math.max(1,Math.round(rect.height*d));}
 private sprite(key:string,index:number,x:number,y:number,height:number){const atlas=this.atlases.get(key);if(!atlas)return;const crop=atlas.frames[index],scale=atlas.scale*height,w=crop[2]*scale,h=crop[3]*scale;this.c.drawImage(atlas.image,...crop,x-w/2,y-h,w,h);return {x:x-w/2,y:y-h,width:w,height:h};}
 private banner(t:number,reduced:boolean,w:number,h:number){const state=birthdayBanner(t,reduced),atlas=this.atlases.get('banner');if(!state.visible||!atlas)return;const crop=atlas.frames[state.frame],width=Math.min(w*.88,1000),scale=width/(atlas.image.width/2),height=crop[3]*scale,top=h*.055-(1-state.drop)*(height+h*.12),c=this.c;
  c.save();c.translate(w/2,top);c.rotate(state.sway);c.shadowColor='#0009';c.shadowBlur=state.frame===2||state.frame===3?18:5;c.shadowOffsetY=state.frame===2||state.frame===3?10:3;c.drawImage(atlas.image,...crop,-crop[2]*scale/2,0,crop[2]*scale,height);c.restore();
 }
 render(t:number,reduced=false){const c=this.c,d=Math.min(2,devicePixelRatio||1),w=this.canvas.width/d,h=this.canvas.height/d;c.setTransform(d,0,0,d,0,0);
  // Warm plaster wall, lit by the existing party lights; the cloth casts a contact shadow.
  const wall=c.createLinearGradient(0,0,w,h);wall.addColorStop(0,'#39304d');wall.addColorStop(.65,'#302d43');wall.addColorStop(1,'#201f34');c.fillStyle=wall;c.fillRect(0,0,w,h);
  c.strokeStyle='#ffffff04';c.lineWidth=1;for(let i=0;i<40;i++){c.beginPath();c.moveTo(0,i*h/40);c.lineTo(w,i*h/40+Math.sin(i)*3);c.stroke();}
  const portrait=w/h<1.1,height=Math.min(h*.64,w*(portrait?.72:.40)),floor=h*.88,x=w*.32,ally=w*.77;
  for(let i=0;i<3;i++){c.fillStyle=['#e991db10','#7ae4e510','#ffd77712'][i];c.beginPath();c.moveTo(w*(.1+i*.4),0);c.lineTo(w*(i*.4-.25),floor);c.lineTo(w*(i*.4+.4),floor);c.fill();}
  c.fillStyle='#131a2b';c.fillRect(0,floor,w,h-floor);c.strokeStyle='#7e4c8370';for(let i=0;i<9;i++){c.beginPath();c.moveTo(w/2,floor);c.lineTo(w*i/8,h);c.stroke();}
  this.banner(t,reduced,w,h);
  for(const px of [x,ally]){c.fillStyle='#0004';c.beginPath();c.ellipse(px,floor+2,height*.30,height*.035,0,0,Math.PI*2);c.fill();}
  this.sprite('seth',birthdaySethFrame(t,reduced),x,floor,height);
  const allison=this.sprite('allison',birthdayAllisonFrame(t),ally,floor,height*.94);
  if(t>=17&&allison){
   // Fill the photograph already held in her final sprite with the captured pose.
   const photoX=allison.x+allison.width*.64,photoY=allison.y+allison.height*.235,pw=allison.width*.16,ph=allison.height*.072;
   c.save();c.translate(photoX,photoY);c.rotate(-.12);c.beginPath();c.rect(-pw/2,-ph/2,pw,ph);c.clip();c.fillStyle='#372148';c.fillRect(-pw/2,-ph/2,pw,ph);this.sprite('seth',7,0,ph*.48,ph*.94);c.restore();
  }
  if(t>=10){const colors=['#ef79c5','#79dec5','#ffe292','#a78ef2'];for(let i=0;i<(reduced?16:65);i++){const cx=(i*83.71)%w,cy=reduced?(i*71)%h:((t-10)*(30+i%5*12)+i*37)%(h+35)-20;c.save();c.translate(cx,cy);c.rotate(reduced?0:t+i);c.fillStyle=colors[i%4];c.fillRect(-2,-2,4,8);c.restore();}}
  if(t>=15&&t<15.18&&!reduced){c.fillStyle=`rgba(255,255,255,${.55*(1-(t-15)/.18)})`;c.fillRect(0,0,w,h);}
 }
 dispose(){this.token++;for(const atlas of this.atlases.values())atlas.image.removeAttribute('src');this.atlases.clear();this.canvas.width=this.canvas.height=1;}
}
