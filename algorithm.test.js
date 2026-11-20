import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isCompatible,
  dijkstra,
  reconstructRoute,
  resolveDelhiNode,
  findMatches
} from '../algorithms.js';

test('AB+ recipient accepts all donor groups', () => {
  assert.equal(isCompatible('O-', 'AB+'), true);
  assert.equal(isCompatible('A+', 'AB+'), true);
  assert.equal(isCompatible('B+', 'AB+'), true);
  assert.equal(isCompatible('AB+', 'AB+'), true);
});

test('O- recipient accepts only O- donors', () => {
  assert.equal(isCompatible('O+', 'O-'), false);
  assert.equal(isCompatible('A-', 'O-'), false);
  assert.equal(isCompatible('O-', 'O-'), true);
});

test('unavailable donors are excluded', () => {
  const donors = [
    { id: 'D1', bloodGroup: 'O-', location: 'Rohini', priority: 1, available: false },
    { id: 'D2', bloodGroup: 'O-', location: 'Connaught Place', priority: 2, available: true }
  ];

  const result = findMatches(donors, 'AB+', 1);
  assert.equal(result.selected.length, 1);
  assert.equal(result.selected[0].id, 'D2');
});

test('empty directory returns no donors', () => {
  assert.equal(findMatches([], 'AB+', 2).selected.length, 0);
});

test('greedy selection chooses ranked distinct locations', () => {
  const donors = [
    { id: 'D1', bloodGroup: 'O-', location: 'Rohini', priority: 1, available: true },
    { id: 'D2', bloodGroup: 'A+', location: 'Connaught Place', priority: 2, available: true },
    { id: 'D3', bloodGroup: 'B+', location: 'Laxmi Nagar', priority: 3, available: true }
  ];

  const result = findMatches(donors, 'AB+', 2);
  assert.equal(result.strategy, 'greedy');
  assert.deepEqual(result.selected.map(donor => donor.id), ['D1', 'D2']);
});

test('backtracking preserves location diversity', () => {
  const donors = [
    { id: 'D1', bloodGroup: 'O-', location: 'Rohini', priority: 1, available: true },
    { id: 'D2', bloodGroup: 'A+', location: 'Rohini', priority: 2, available: true },
    { id: 'D3', bloodGroup: 'B+', location: 'Laxmi Nagar', priority: 3, available: true }
  ];

  const result = findMatches(donors, 'AB+', 2);
  assert.equal(result.strategy, 'backtracking');
  assert.equal(new Set(result.selected.map(donor => donor.location)).size, 2);
});

test('insufficient distinct locations produce a partial result', () => {
  const donors = [
    { id: 'D1', bloodGroup: 'O-', location: 'Rohini', priority: 1, available: true },
    { id: 'D2', bloodGroup: 'A+', location: 'Rohini', priority: 2, available: true }
  ];

  const result = findMatches(donors, 'AB+', 2);
  assert.equal(result.selected.length, 1);
});

test('Dijkstra returns shortest distances from Rohini', () => {
  const result = dijkstra('Rohini');
  assert.equal(result.distances.get('Rohini'), 0);
  assert.equal(result.distances.get('Connaught Place'), 16);
  assert.equal(result.distances.get('Laxmi Nagar'), 21);
});

test('shortest route is reconstructed', () => {
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

test('locality and PIN codes resolve to Delhi graph nodes', () => {
  assert.equal(resolveDelhiNode('Rohini'), 'Rohini');
  assert.equal(resolveDelhiNode('', '110001'), 'Connaught Place');
  assert.equal(resolveDelhiNode('Unknown Area'), null);
});
