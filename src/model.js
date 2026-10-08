export const locations = [
  { id: 'art', name: 'Portland Museum of Art', category: 'Visual Art', address: '7 Congress Square', lat: 43.65361, lng: -70.26222, article: 'Portland Museum of Art' },
  { id: 'state', name: 'State Theatre', category: 'Music', address: '609 Congress Street', lat: 43.6534, lng: -70.2640, article: 'State Theatre (Portland, Maine)' },
  { id: 'stage', name: 'Portland Stage', category: 'Theater', address: '25A Forest Avenue', lat: 43.6575, lng: -70.2623, article: 'Portland Stage Company' },
  { id: 'merrill', name: 'Merrill Auditorium', category: 'Music & Performing Arts', address: '20 Myrtle Street', lat: 43.6597, lng: -70.2561, article: 'Merrill Auditorium' },
  { id: 'meca', name: 'Maine College of Art & Design', category: 'Visual Art', address: '522 Congress Street', lat: 43.6558, lng: -70.2611, article: 'Maine College of Art & Design' }
];
export function filterLocations(items, query) {
  const term = query.trim().toLocaleLowerCase();
  return items.filter(item => `${item.name} ${item.category} ${item.address}`.toLocaleLowerCase().includes(term));
}
