export const GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
// Red-cell donor compatibility: each recipient group maps to acceptable donor groups.
export const COMPATIBLE = {
  'O-': ['O-'], 'O+': ['O-', 'O+'], 'A-': ['O-', 'A-'], 'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'], 'B+': ['O-', 'O+', 'B-', 'B+'], 'AB-': ['O-', 'A-', 'B-', 'AB-'], 'AB+': GROUPS,
};

// Small illustrative Delhi network for the ADA demonstration; edge weights are demo km.
export const DELHI_GRAPH = new Map([
  ['Rohini', [['Connaught Place',16],['Laxmi Nagar',21]]],
  ['Connaught Place', [['Rohini',16],['Laxmi Nagar',8.5],['Lajpat Nagar',9.5],['Dwarka Sector 6',22]]],
  ['Laxmi Nagar', [['Rohini',21],['Connaught Place',8.5],['Lajpat Nagar',13.5]]],
  ['Lajpat Nagar', [['Connaught Place',9.5],['Laxmi Nagar',13.5],['Dwarka Sector 6',19.5]]],
  ['Dwarka Sector 6', [['Connaught Place',22],['Lajpat Nagar',19.5]]],
]);
const PIN_NODE={'110085':'Rohini','110001':'Connaught Place','110092':'Laxmi Nagar','110024':'Lajpat Nagar','110075':'Dwarka Sector 6'};
const AREA_NODE=Object.fromEntries([...DELHI_GRAPH.keys()].map(area=>[area.toLowerCase(),area]));

class MinHeap {
  items=[];
  push(item){this.items.push(item);let i=this.items.length-1;while(i>0){const p=(i-1)>>1;if(this.items[p][0]<=item[0])break;this.items[i]=this.items[p];i=p;}this.items[i]=item;}
  pop(){if(!this.items.length)return null;const root=this.items[0],last=this.items.pop();if(this.items.length){let i=0;while(true){let c=2*i+1;if(c>=this.items.length)break;if(c+1<this.items.length&&this.items[c+1][0]<this.items[c][0])c++;if(this.items[c][0]>=last[0])break;this.items[i]=this.items[c];i=c;}this.items[i]=last;}return root;}
  get size(){return this.items.length;}
}
export function resolveDelhiNode(area='',pincode='') { return PIN_NODE[pincode]||AREA_NODE[String(area).trim().toLowerCase()]||null; }
export function dijkstra(startNode, graph=DELHI_GRAPH) {
  const distances=new Map([...graph.keys()].map(node=>[node,Infinity]));
  const previous=new Map();if(!graph.has(startNode))return{distances,previous};
  distances.set(startNode,0);const heap=new MinHeap();heap.push([0,startNode]);
  while(heap.size){const [distance,node]=heap.pop();if(distance!==distances.get(node))continue;
    for(const [neighbor,weight] of graph.get(node)){const candidate=distance+weight;if(candidate<distances.get(neighbor)){distances.set(neighbor,candidate);previous.set(neighbor,node);heap.push([candidate,neighbor]);}}
  }
  return{distances,previous};
}

export function isCompatible(donorGroup, recipientGroup) { return Boolean(COMPATIBLE[recipientGroup]?.includes(donorGroup)); }
function mergeSort(items, compare) {
  if(items.length<=1)return items;
  const middle=Math.floor(items.length/2),left=mergeSort(items.slice(0,middle),compare),right=mergeSort(items.slice(middle),compare),merged=[];
  let i=0,j=0;while(i<left.length&&j<right.length)merged.push(compare(left[i],right[j])<=0?left[i++]:right[j++]);
  return merged.concat(left.slice(i),right.slice(j));
}
export function rankDonors(donors, key = 'distance', requestedPin = '', requestedArea = '') {
  const value = key === 'id' ? d => d.id.toLowerCase() : key === 'priority' ? d => Number(d.priority) : d => Number(d.distance);
  const norm=s=>String(s||'').trim().toLowerCase();
  const compare=(a,b)=>{
    if(key==='dijkstra'){
      const av=Number(a.routeDistanceKm??Infinity),bv=Number(b.routeDistanceKm??Infinity);
      return av-bv||Number(a.priority)-Number(b.priority)||a.id.localeCompare(b.id);
    }
    if(key==='location'){
      const pinA=requestedPin&&a.pincode===requestedPin?0:1,pinB=requestedPin&&b.pincode===requestedPin?0:1;
      if(pinA!==pinB)return pinA-pinB;
      const areaA=requestedArea&&norm(a.location)===norm(requestedArea)?0:1,areaB=requestedArea&&norm(b.location)===norm(requestedArea)?0:1;
      if(areaA!==areaB)return areaA-areaB;
      return Number(a.priority)-Number(b.priority)||a.id.localeCompare(b.id);
    }
    const av=value(a),bv=value(b);return typeof av==='string'?av.localeCompare(bv):av-bv||a.id.localeCompare(b.id);
  };
  return mergeSort([...donors],compare);
}
export function findMatches(donors, recipientGroup, count, key = 'distance', diversify = true, requestedPin = '', requestedArea = '') {
  let eligible=donors.filter(d=>d.available&&isCompatible(d.bloodGroup,recipientGroup));
  if(key==='dijkstra'){
    const start=resolveDelhiNode(requestedArea,requestedPin),routeMap=start?dijkstra(start).distances:new Map();
    eligible=eligible.map(d=>{const node=resolveDelhiNode(d.location,d.pincode);return{...d,routeDistanceKm:node?routeMap.get(node)??Infinity:Infinity};});
  }
  const candidates=rankDonors(eligible,key,requestedPin,requestedArea);
  const greedy=candidates.slice(0,count);
  const greedyValid=!diversify||new Set(greedy.map(d=>d.location.toLowerCase())).size===greedy.length;
  if(greedy.length===count&&greedyValid)return{candidates,selected:greedy,strategy:'greedy',explored:0,greedy};
  if(!diversify)return{candidates,selected:greedy,strategy:'greedy',explored:0,greedy};
  let explored=0,selected=null,bestPartial=[];const chosen=[],locations=new Set();
  function search(start){
    explored+=1;if(chosen.length>bestPartial.length)bestPartial=[...chosen];if(chosen.length===count){selected=[...chosen];return true;}
    for(let i=start;i<candidates.length;i+=1){const donor=candidates[i],area=donor.location.toLowerCase();if(locations.has(area))continue;
      locations.add(area);chosen.push(donor);if(search(i+1))return true;chosen.pop();locations.delete(area);}
    return false;
  }
  search(0);return{candidates,selected:selected??bestPartial,strategy:'backtracking',explored,greedy};
}

