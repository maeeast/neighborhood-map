// One shared Promise ensures React remounts never load Google Maps twice.
// Reference: https://developers.google.com/maps/documentation/javascript/load-maps-js-api
let mapsPromise;
export function loadMaps(key) {
  if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return Promise.reject(new Error('Add your Google Maps API key to .env, then restart the app.'));
  }
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => reject(new Error('Google Maps timed out. Check your connection and reload.')), 15000);
    window.neighborhoodMapReady = () => { clearTimeout(timer); resolve(window.google.maps); };
    window.gm_authFailure = () => {
      clearTimeout(timer);
      window.dispatchEvent(new Event('maps-auth-error'));
      reject(new Error('Google Maps could not authenticate. Check your API key, billing, and allowed websites.'));
    };
    const params = new URLSearchParams({key, loading:'async', callback:'neighborhoodMapReady', libraries:'marker', v:'quarterly'});
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => { clearTimeout(timer); reject(new Error('Google Maps could not load. Check your connection and reload.')); };
    document.head.append(script);
  });
  return mapsPromise;
}
