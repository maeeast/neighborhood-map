import test from 'node:test';
import assert from 'node:assert/strict';
import {locations, filterLocations} from './model.js';
test('default model has at least five unique locations', () => {assert.ok(locations.length >= 5);assert.equal(new Set(locations.map(l => l.id)).size, locations.length);});
test('empty filter returns every location', () => assert.deepEqual(filterLocations(locations, ' '), locations));
test('filter matches names ignoring case and surrounding spaces', () => assert.deepEqual(filterLocations(locations, '  STATE '), [locations[1]]));
test('category filter matches both visual art places', () => assert.equal(filterLocations(locations, 'visual art').length, 2));
test('unmatched input produces no markers or list items', () => assert.equal(filterLocations(locations, 'xyz').length, 0));
