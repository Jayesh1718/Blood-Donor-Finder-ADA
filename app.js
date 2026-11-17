import { GROUPS, findMatches, resolveDelhiNode } from './algorithms.js?v=5';

const loginView=document.querySelector('#login-view'),appScreen=document.querySelector('#app-screen');
function enterDemo(){sessionStorage.setItem('bloodlink-demo-session','active');loginView.classList.add('hidden');appScreen.classList.remove('hidden');}
if(sessionStorage.getItem('bloodlink-demo-session')==='active'){loginView.classList.add('hidden');appScreen.classList.remove('hidden');}
document.querySelector('#login-form').addEventListener('submit',event=>{event.preventDefault();enterDemo();event.currentTarget.reset();});
document.querySelector('#skip-login').addEventListener('click',enterDemo);
document.querySelector('#logout').addEventListener('click',()=>{sessionStorage.removeItem('bloodlink-demo-session');appScreen.classList.add('hidden');loginView.classList.remove('hidden');});

const seed = [
  ['D101','Asha Demo','O-','North',1.2,1,true], ['D102','Ravi Demo','O+','Central',2.0,2,true],
  ['D103','Mina Demo','A-','East',3.1,3,true], ['D104','Dev Demo','B+','North',.8,1,true],
  ['D105','Tara Demo','AB+','West',4.0,5,false], ['D106','Neel Demo','O-','South',5.4,4,true],
  ['D107','Ira Demo','A+','Central',1.5,2,true], ['D108','Kabir Demo','B-','East',2.8,4,true],
  ['D109','Rhea Demo','AB-','West',6.0,6,false], ['D110','Arun Demo','O+','North',1.1,2,true],
  ['D111','Sana Demo','A-','South',4.2,5,true], ['D112','Veer Demo','B+','Central',3.6,3,true],
  ['D113','Maya Demo','AB+','East',2.2,2,true], ['D114','Om Demo','O-','West',7.1,7,true],
  ['D115','Nia Demo','A+','North',2.4,3,false], ['D116','Ish Demo','B-','South',3.7,2,true],
  ['D117','Zoya Demo','AB-','Central',5.0,6,true], ['D118','Adi Demo','O+','East',1.9,1,true],
  ['D119','Pia Demo','A-','West',4.6,3,true], ['D120','Kian Demo','B+','South',2.5,1,true],
  ['D121','Uma Demo','AB+','North',6.5,7,true], ['D122','Rey Demo','O-','Central',3.3,3,true],
  ['D123','Diya Demo','A+','East',5.2,5,true], ['D124','Avi Demo','B-','West',2.1,2,true],
  ['D125','Noor Demo','AB-','South',8.0,8,true], ['D126','Sam Demo','O+','Central',4.0,4,false],
  ['D127','Leah Demo','A-','North',3.4,4,true], ['D128','Milan Demo','B+','East',4.7,6,true],
  ['D129','Esha Demo','AB+','West',1.6,1,true], ['D130','Ari Demo','O-','South',6.3,5,true],
];
const REGION_AREA={North:'Rohini',Central:'Connaught Place',East:'Laxmi Nagar',West:'Dwarka Sector 6',South:'Lajpat Nagar'};
const AREA_PIN={'Rohini':'110085','Connaught Place':'110001','Laxmi Nagar':'110092','Dwarka Sector 6':'110075','Lajpat Nagar':'110024'};
const seedDonors=seed.map(([id,name,bloodGroup,region,_distance,_oldPriority,available],index)=>{const location=REGION_AREA[region];return{id,name,bloodGroup,location,pincode:AREA_PIN[location],priority:index+1,available};});

const STORE_KEY = 'bloodlink-donors-v3';
let donors = loadDonors().map((d,index)=>{const oldLocation=d.location||d.area||'';const location=REGION_AREA[oldLocation]||oldLocation;return{...d,location,pincode:d.pincode||AREA_PIN[location]||'',priority:index+1};});
function loadDonors() {
  try {
    const current=JSON.parse(localStorage.getItem(STORE_KEY));
    const previous=JSON.parse(localStorage.getItem('bloodlink-donors-v2'));
    const saved=Array.isArray(current)?current:Array.isArray(previous)?previous:[];
    if(saved.every(d=>d.id&&d.bloodGroup)){
      const ids=new Set(seedDonors.map(d=>d.id));
      return [...seedDonors,...saved.filter(d=>!ids.has(d.id))];
    }
  } catch { /* use the bundled fictional sample set */ }
  return seedDonors;
}
function persist() { localStorage.setItem(STORE_KEY, JSON.stringify(donors)); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2100); }
function setSelectOptions(id) { document.querySelector(`#${id}`).innerHTML = GROUPS.map(g => `<option value="${g}">${g}</option>`).join(''); }

function resultCard(d, i) { const route=Number.isFinite(d.routeDistanceKm)?`${d.routeDistanceKm.toFixed(1)} demo km`:'Route unavailable';const path=d.routePath?.length?d.routePath.join(' → '):'No graph path';return `<div class="result-row"><span class="rank">${i+1}</span><div><div class="donor-title">${escapeHtml(d.name)}</div><div class="donor-sub">${escapeHtml(d.id)} · ${escapeHtml(d.location)} · PIN ${escapeHtml(d.pincode||'not entered')} · ${route}<br>Route: ${escapeHtml(path)}</div></div><div class="result-cell"><span class="blood-pill">${escapeHtml(d.bloodGroup)}</span></div><div class="result-cell optional-cell">Registered #${d.priority}</div><span class="status-pill">Available</span></div>`; }

document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(t => { t.classList.toggle('active',t===button);t.setAttribute('aria-selected',String(t===button)); });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('hidden',p.id !== `panel-${button.dataset.tab}`));
}));
setSelectOptions('required-group'); setSelectOptions('donor-group');
document.querySelector('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  const group = document.querySelector('#required-group').value;
  const count = Math.max(1,Math.min(10,Number(document.querySelector('#needed-count').value)||1));
  const key = 'dijkstra';
  const pin = document.querySelector('#request-pin').value.trim();
  const area = document.querySelector('#request-area').value.trim();
  if (!resolveDelhiNode(area,pin)) {
    document.querySelector('#search-summary').textContent = 'Enter a supported Delhi area or PIN to calculate shortest routes.';
    return;
  }
  const diversify = document.querySelector('#diversify').checked;
  const start = performance.now();
  const result = findMatches(donors,group,count,key,diversify,pin,area);
  const elapsed = performance.now() - start;
  document.querySelector('#search-summary').textContent = `${result.candidates.length} compatible available donor${result.candidates.length===1?'':'s'} for ${group} · shortest demo route from ${resolveDelhiNode(area,pin)} · ${elapsed.toFixed(3)} ms`;
  const list = document.querySelector('#results');
  if (!result.selected.length) {
    list.className='results-empty'; list.innerHTML='<div class="empty-icon">⌕</div><h3>No compatible available donors found</h3><p>Try another blood group or add more demo records.</p>';
  } else {
    list.className='result-list'; list.innerHTML=result.selected.map(resultCard).join('');
    if (result.selected.length < count) list.insertAdjacentHTML('beforeend',`<div class="algorithm-note">Only <b>${result.selected.length}</b> of ${count} requested donors could be selected under the current constraints.</div>`);
  }
  const note = document.querySelector('#algorithm-note'); note.classList.remove('hidden');
  note.innerHTML = result.strategy === 'backtracking'
    ? `<b>Backtracking fallback used.</b> The top-ranked greedy set repeated a location. The search explored ${result.explored} states and found a location-diverse set of ${result.selected.length}.`
    : `<b>Greedy selection used.</b> The first ${result.selected.length} ranked eligible donors ${result.selected.length===count?'satisfied':'were the best available'} selection. ${diversify?'Each selected donor is from a different location.':'Location diversity was turned off.'}`;
});
// Show useful sample matches immediately after entry; users can change the request and search again.
document.querySelector('#search-form').requestSubmit();

function resetForm() {
  document.querySelector('#donor-form').reset(); document.querySelector('#edit-id').value='';
  document.querySelector('#save-donor').textContent='Add donor'; document.querySelector('#cancel-edit').classList.add('hidden');
}
document.querySelector('#donor-form').addEventListener('submit',event=>{
  event.preventDefault();
  const editing = document.querySelector('#edit-id').value;
  const id = document.querySelector('#donor-id').value.trim().toUpperCase();
  if (donors.some(d=>d.id.toLowerCase()===id.toLowerCase()&&d.id!==editing)) { toast('That donor ID already exists.');return; }
  const oldDonor=editing?donors.find(d=>d.id===editing):null;
  const donor={id,name:document.querySelector('#donor-name').value.trim(),bloodGroup:document.querySelector('#donor-group').value,
    contact:document.querySelector('#donor-contact').value.trim(),
    location:document.querySelector('#donor-location').value.trim(),pincode:document.querySelector('#donor-pin').value.trim(),
    priority:oldDonor?.priority??(donors.length?Math.max(...donors.map(d=>d.priority))+1:1),available:document.querySelector('#donor-available').checked};
  if(editing){donors=donors.map(d=>d.id===editing?donor:d);toast('Donor record updated.');}else{donors.push(donor);toast('Donor added to this browser.');}
  persist();resetForm();
});
document.querySelector('#cancel-edit').addEventListener('click',resetForm);



