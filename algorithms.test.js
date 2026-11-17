
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isCompatible,
  dijkstra,
  reconstructRoute,
  resolveDelhiNode,
  findMatches
} from '../algorithms.js';

// Helper function for creating test donors
function donor(id, bloodGroup, location, distance, available = true) {
  return {
    id,
    name: `Donor ${id}`,
    bloodGroup,
    location,
    distance,
    priority: Number(id.replace(/\D/g, '')) || 1,
    available
  };
}

// TEST 1: Blood group compatibility
test('AB+ recipient accepts all donor groups', () => {
  assert.equal(isCompatible('O-', 'AB+'), true);
  assert.equal(isCompatible('A+', 'AB+'), true);
  assert.equal(isCompatible('B+', 'AB+'), true);
  assert.equal(isCompatible('AB+', 'AB+'), true);
});

// TEST 2: Incompatible blood group
test('O- recipient accepts only O- donors', () => {
  assert.equal(isCompatible('O+', 'O-'), false);
  assert.equal(isCompatible('A-', 'O-'), false);
  assert.equal(isCompatible('O-', 'O-'), true);
});

// TEST 3: Unavailable donors are excluded
test('Unavailable donors are not selected', () => {
  const donors = [
    donor('D1', 'O-', 'Rohini', 2, false),
    donor('D2', 'O-', 'Connaught Place', 5, true)
  ];

  const result = findMatches(donors, 'AB+', 1);

  assert.equal(result.selected.length, 1);
  assert.equal(result.selected[0].id, 'D2');
});

// TEST 4: Empty donor directory
test('Empty directory returns no donors', () => {
  const result = findMatches([], 'AB+', 2);

  assert.equal(result.selected.length, 0);
});

// TEST 5: Greedy selection
test('Greedy selects nearest donors from distinct locations', () => {
  const donors = [
    donor('D1', 'O-', 'Rohini', 2),
    donor('D2', 'A+', 'Connaught Place', 5),
    donor('D3', 'B+', 'Laxmi Nagar', 8)
  ];

  const result = findMatches(donors, 'AB+', 2);

  assert.equal(result.strategy, 'greedy');
  assert.equal(result.selected.length, 2);
  assert.equal(result.selected[0].id, 'D1');
  assert.equal(result.selected[1].id, 'D2');
});

// TEST 6: Backtracking fallback
test('Backtracking finds alternatives when locations repeat', () => {
  const donors = [
    donor('D1', 'O-', 'Rohini', 1),
    donor('D2', 'A+', 'Rohini', 2),
    donor('D3', 'B+', 'Laxmi Nagar', 3)
  ];

  const result = findMatches(donors, 'AB+', 2);

  assert.equal(result.strategy, 'backtracking');
  assert.equal(result.selected.length, 2);

  const locations = result.selected.map(d => d.location);
  assert.equal(new Set(locations).size, 2);
});

// TEST 7: Fewer distinct locations than required
test('Returns partial selection when locations are insufficient', () => {
  const donors = [
    donor('D1', 'O-', 'Rohini', 1),
    donor('D2', 'A+', 'Rohini', 2)
  ];

  const result = findMatches(donors, 'AB+', 2);

  assert.equal(result.selected.length, 1);
});

// TEST 8: Dijkstra shortest path
test('Dijkstra calculates shortest distance from Rohini', () => {
  const result = dijkstra('Rohini');

  assert.equal(result.distances.get('Rohini'), 0);
  assert.equal(result.distances.get('Connaught Place'), 16);
  assert.equal(result.distances.get('Laxmi Nagar'), 21);
});

// TEST 9: Route reconstruction
test('Reconstructs shortest route correctly', () => {
  const result = dijkstra('Rohini');

  const route = reconstructRoute(
    'Rohini',
    'Lajpat Nagar',
    result.previous
  );

  assert.deepEqual(route, [
    'Rohini',
    'Connaught Place',
    'Lajpat Nagar'
  ]);
});

// TEST 10: Locality and PIN resolution
test('Resolves Delhi localities and PIN codes', () => {
  assert.equal(resolveDelhiNode('Rohini'), 'Rohini');
  assert.equal(resolveDelhiNode('', '110001'), 'Connaught Place');
  assert.equal(resolveDelhiNode('Unknown Area'), null);
});

