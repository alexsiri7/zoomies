(function(){
const lam=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
const box=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?lam(c):c);m.position.set(x||0,y||0,z||0);return m;};
const cyl=(rt,rb,h,seg,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),typeof c==='number'?lam(c):c);m.position.set(x||0,y||0,z||0);return m;};

// ---------- Obstacles ----------
const bookColors=[0x3d5a80,0x56708f,0x81b29a,0x9a6fb0,0x6b4f7a,0x4f7d6a];

// Inside furniture
function bookcase(){const g=new THREE.Group();g.add(box(1.8,2.9,0.7,0x7a4a2c,0,1.45));
  [0.35,1.2,2.05].forEach(y=>{let x=-0.72;while(x<0.7){const w=0.12+Math.random()*0.12,h=0.45+Math.random()*0.25;g.add(box(w,h,0.3,bookColors[Math.floor(Math.random()*6)],x+w/2,y+h/2,0.26));x+=w+0.02;}});return g;}
function armchair(){const g=new THREE.Group(),m=lam(0x3f7d8c);g.add(box(1.8,0.55,1.2,m,0,0.45),box(1.2,0.18,0.9,0x5a9aa8,0,0.8,0.1),box(1.8,1.5,0.32,m,0,1.1,-0.45),box(0.3,0.9,1.2,m,-0.78,0.75),box(0.3,0.9,1.2,m,0.78,0.75));return g;}
function plant(){const g=new THREE.Group();g.add(cyl(0.5,0.38,0.8,8,0x8c4a32,0,0.4));
  for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.ConeGeometry(0.25,1.4,4),lam(i%2?0x4f7d4a:0x6a9a5e));l.position.set(Math.cos(i)*0.25,1.4+Math.random()*0.4,Math.sin(i)*0.25);l.rotation.set(Math.sin(i)*0.4,0,Math.cos(i)*0.4);g.add(l);}return g;}
function pouffe(){const g=new THREE.Group();g.add(cyl(0.7,0.7,0.55,12,0x4a6fa5,0,0.28),cyl(0.72,0.72,0.1,12,0x2f4a73,0,0.28));return g;}
function bookStack(){const g=new THREE.Group();for(let i=0;i<4;i++){const b=box(1.3-i*0.1,0.14,0.9,bookColors[(i*2+1)%6],0,0.07+i*0.15);b.rotation.y=(Math.random()-.5)*0.4;g.add(b);}return g;}
function backDoor(){const g=new THREE.Group(),w=lam(0xfbefe0);
  g.add(box(0.5,3.6,0.5,w,-3.75,1.8),box(0.5,3.6,0.5,w,3.75,1.8),box(8,0.5,0.6,w,0,3.6));
  const light=new THREE.Mesh(new THREE.PlaneGeometry(7,3.35),new THREE.MeshBasicMaterial({color:0xbfe6ee,transparent:true,opacity:.55}));light.position.set(0,1.7,-0.3);g.add(light);
  g.add(box(2,0.04,1,0x8a5a3a,0,0.03,0.6));return g;}

// Garden obstacles
function bush(){const g=new THREE.Group();const a=new THREE.Mesh(new THREE.IcosahedronGeometry(1.05,0),lam(0x4f7d4a));a.position.y=1;
  const b=new THREE.Mesh(new THREE.IcosahedronGeometry(0.75,0),lam(0x5f9a52));b.position.set(0.3,1.8,0.2);g.add(a,b);
  [[-0.5,1.2,0.8],[0.6,0.9,0.7],[0,1.9,0.6]].forEach(p=>{const f=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6),lam(0xb9a7d9));f.position.set(...p);g.add(f);});return g;}
function birdbath(){const g=new THREE.Group(),s=lam(0xbfb8ad);g.add(cyl(0.5,0.6,0.25,8,s,0,0.12),cyl(0.18,0.25,1.4,8,s,0,0.9),cyl(0.9,0.5,0.3,10,s,0,1.7),cyl(0.75,0.75,0.05,10,0x7ec8e3,0,1.84));
  const bird=new THREE.Group();bird.add(box(0.25,0.22,0.35,0x8a5a3a),box(0.18,0.16,0.16,0x8a5a3a,0,0.14,-0.18),box(0.18,0.14,0.08,0xa0482e,0,0.05,-0.18));bird.position.set(0.5,2.0,0);g.add(bird);return g;}
function sunflowers(){const g=new THREE.Group();[-0.5,0,0.5].forEach((x,i)=>{const h=1.8+i%2*0.5;g.add(cyl(0.06,0.08,h,5,0x4f7d4a,x,h/2));
  const head=new THREE.Group();head.add(cyl(0.42,0.42,0.08,10,0x9c7a1e),cyl(0.2,0.2,0.1,8,0x6b4226));head.rotation.x=Math.PI/2-0.3;head.position.set(x,h+0.1,0.1);g.add(head);});return g;}
function flowerpot(){const g=new THREE.Group();g.add(cyl(0.55,0.4,0.55,8,0x8c4a32,0,0.28),cyl(0.58,0.58,0.1,8,0xb3552f,0,0.55));
  [[-0.2,0.8,0],[0.2,0.75,0.1],[0,0.85,-0.2]].forEach((p,i)=>{const f=new THREE.Mesh(new THREE.SphereGeometry(0.16,6,6),lam([0x9a6fb0,0x5b7fc4,0xb9a7d9][i]));f.position.set(...p);g.add(f);});return g;}
function hedgehog(){const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6,0,Math.PI*2,0,Math.PI/2),lam(0x7a5a3c));body.scale.set(1,1,1.3);g.add(body);
  for(let i=0;i<14;i++){const sp=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.3,4),lam(0x4a3322));const a=i/14*Math.PI*2;sp.position.set(Math.cos(a)*0.32,0.35,Math.sin(a)*0.4);sp.rotation.set(Math.sin(a)*0.6,0,-Math.cos(a)*0.6);g.add(sp);}
  g.add(box(0.3,0.22,0.3,0xc9a27a,0,0.15,0.55),box(0.08,0.08,0.06,0x2b1a12,0,0.18,0.72));return g;}
function gardenGate(){const g=new THREE.Group(),w=lam(0x7a4a2c);
  g.add(box(0.5,3.4,0.5,w,-3.75,1.7),box(0.5,3.4,0.5,w,3.75,1.7),box(8,0.4,0.6,w,0,3.5));
  for(let i=0;i<10;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(0.2,6,6),lam(i%2?0x5f9a52:0xe07a5f));f.position.set(-3.6+i*0.8,3.75,0.2);g.add(f);}
  return g;}

// Rooftop obstacles
function chimney(){const g=new THREE.Group(),b=lam(0xa0482e);g.add(box(1.4,2.4,1.3,b,0,1.2),box(1.6,0.25,1.5,0x7a3522,0,2.45),cyl(0.22,0.25,0.6,8,0x8a4a3a,-0.35,2.85),cyl(0.22,0.25,0.5,8,0x8a4a3a,0.35,2.8));
  const smoke=new THREE.Mesh(new THREE.IcosahedronGeometry(0.35,0),new THREE.MeshLambertMaterial({color:0xcfd4e6,transparent:true,opacity:.5}));smoke.position.set(-0.35,3.5,0);g.add(smoke);return g;}
function dish(){const g=new THREE.Group(),m=lam(0xd6d9e0);g.add(box(0.8,0.3,0.8,0x8a8f9c,0,0.15),cyl(0.08,0.1,1.4,6,0x8a8f9c,0,1));
  const d=cyl(1.0,0.25,0.35,14,m,0,1.9,0.15);d.rotation.x=Math.PI/2-0.35;g.add(d);g.add(cyl(0.04,0.04,0.9,5,0x8a8f9c,0,2.05,0.6));return g;}
function aerial(){const g=new THREE.Group(),m=lam(0x9aa0ad);g.add(box(0.6,0.3,0.6,0x6a7080,0,0.15),cyl(0.06,0.08,3,5,m,0,1.6));
  [2.1,2.5,2.9].forEach((y,i)=>g.add(box(1.8-i*0.4,0.06,0.06,m,0,y)));g.add(box(0.06,0.06,1.2,m,0,2.9,0));return g;}
function skylight(){const g=new THREE.Group();g.add(box(1.7,0.45,1.3,0x3a4258,0,0.22),box(1.5,0.08,1.1,0x5a7aa8,0,0.46));return g;}
function pigeon(){const g=new THREE.Group(),grey=lam(0x9098a8);g.add(box(0.5,0.4,0.7,grey,0,0.3),box(0.35,0.32,0.32,grey,0,0.62,-0.3),box(0.12,0.08,0.14,0x6a6a72,0,0.58,-0.5),box(0.52,0.12,0.5,0x6a7d8a,0,0.42,0.05),box(0.3,0.08,0.3,0x70778a,0,0.25,0.45));
  [-0.12,0.12].forEach(x=>g.add(box(0.05,0.12,0.05,0x8a5a5a,x,0.05)));return g;}
function atticWindow(){const g=new THREE.Group(),w=lam(0x3a2a22);
  g.add(box(0.5,3.4,0.5,w,-3.75,1.7),box(0.5,3.4,0.5,w,3.75,1.7),box(8,0.5,0.6,w,0,3.5));
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(7,3.2),new THREE.MeshBasicMaterial({color:0xbfd0ff,transparent:true,opacity:.6}));glow.position.set(0,1.65,-0.3);g.add(glow);return g;}

// Every low (jumpable) obstacle carries the same hurdle bar, so it reads apart from tall ones without relying on colour.
const HURDLE=0xdfe6f2;
function hurdle(){const g=new THREE.Group();g.userData.marker='hurdle';
  g.add(box(0.08,1.05,0.08,HURDLE,-0.95,0.525,0.5),box(0.08,1.05,0.08,HURDLE,0.95,0.525,0.5),box(1.98,0.1,0.1,HURDLE,0,1.05,0.5));return g;}
const low=fn=>()=>{const g=fn();g.add(hurdle());return g;};

const LEVELS=[
  {name:'The hallway',env:0,tune:0,finish:backDoor,
   tall:{bookcase:[bookcase,'the bookcase'],armchair:[armchair,'the armchair'],plant:[plant,'the plant']},
   low:{pouffe:[low(pouffe),'the footstool'],books:[low(bookStack),'a pile of books']}},
  {name:'The garden',env:1,tune:1,finish:gardenGate,
   tall:{bush:[bush,'a bush'],birdbath:[birdbath,'the bird bath'],sunflowers:[sunflowers,'the sunflowers']},
   low:{flowerpot:[low(flowerpot),'a flowerpot'],hedgehog:[low(hedgehog),'a hedgehog']}},
  {name:'The rooftops',env:2,tune:2,finish:atticWindow,
   tall:{chimney:[chimney,'a chimney'],dish:[dish,'a satellite dish'],aerial:[aerial,'a TV aerial']},
   low:{skylight:[low(skylight),'a skylight'],pigeon:[low(pigeon),'a pigeon']}}
];

const kibbleGeo=new THREE.DodecahedronGeometry(0.13,0);
// Collectables, and only collectables, glow warm gold (tests/style.mjs enforces this).
const pickupMat=c=>lam(c,{emissive:c,emissiveIntensity:0.45});
const PICKUP_COLORS=[0xffb81c,0xffcc33,0xffa31a];
const kibbleMats=PICKUP_COLORS.map(pickupMat);
// Collectables, and only collectables, bob and spin (tests/style.mjs enforces this too).
const bobbing=(g,y,amp,spin)=>{g.userData.bob={y,amp,spin};g.position.y=y;return g;};
function bob(m,dt,t){const b=m.userData.bob;m.rotation.y+=dt*b.spin;m.position.y=b.y+Math.sin(t*4+m.position.z)*b.amp;}
function kibble(){const g=new THREE.Group();[[-0.14,0,0],[0.14,0.02,0.05],[0,0.2,-0.04]].forEach((p,i)=>{const k=new THREE.Mesh(kibbleGeo,kibbleMats[i]);k.position.set(...p);g.add(k);});return bobbing(g,0.9,0.1,3);}
function bowl(){const g=new THREE.Group();g.add(cyl(0.5,0.35,0.3,12,pickupMat(0xffcc33)));
  for(let i=0;i<9;i++){const k=new THREE.Mesh(kibbleGeo,kibbleMats[i%3]);k.position.set(Math.cos(i*2.1)*0.25*(i%3/2),0.18+(i%3)*0.06,Math.sin(i*2.1)*0.25*(i%3/2));g.add(k);}return bobbing(g,0.3,0.08,1.5);}

window.ZoomiesThings={lam,box,cyl,LEVELS,kibble,bowl,bob};
})();
