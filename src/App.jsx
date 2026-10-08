import React, {useEffect, useMemo, useRef, useState} from 'react';
import {filterLocations, locations} from './model';
import {getDetails} from './wiki';
import MapView from './MapView';

function LocationList({visible, selected, onSelect}) {
  return <ul className="locations">{visible.map(location => <li key={location.id}>
    <button id={`location-${location.id}`} className={selected === location.id ? 'active' : ''} aria-pressed={selected === location.id} onClick={() => onSelect(location.id)}>
      <span className="number">{locations.indexOf(location) + 1}</span><span><strong>{location.name}</strong><small>{location.category}</small></span><span aria-hidden="true">↗</span>
    </button>
  </li>)}</ul>;
}
function LocationDetails({location, onClose}) {
  const [result, setResult] = useState({status:'loading'});
  const [attempt, setAttempt] = useState(0);
  const heading = useRef(null);
  useEffect(() => {heading.current?.focus();}, [location.id]);
  // Abort old selections and enforce a deadline, so stale responses cannot
  // overwrite the selected location and failed networks never spin forever.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 12000);
    setResult({status:'loading'});
    getDetails(location, controller.signal).then(data => {
      if (active) setResult({status:'success', ...data});
    }).catch(error => {
      if (active) setResult({status:'error', message:error.name === 'AbortError' ? 'Wikipedia took too long to respond. Check your connection and try again.' : error.message});
    }).finally(() => clearTimeout(timeout));
    return () => {active = false; clearTimeout(timeout); controller.abort();};
  }, [location, attempt]);
  return <section className="details" aria-labelledby="details-heading">
    <button className="close" onClick={onClose} aria-label="Close location details">×</button>
    <p className="eyebrow">{location.category} · Portland, Maine</p><p>{location.address}</p>
    <h2 id="details-heading" tabIndex="-1" ref={heading}>{location.name}</h2>
    <div aria-live="polite" aria-busy={result.status === 'loading'}>
      {result.status === 'loading' && <p>Loading information from Wikipedia…</p>}
      {result.status === 'error' && <><p role="alert">{result.message}</p><button className="retry" onClick={() => setAttempt(attempt + 1)}>Try again</button></>}
      {result.status === 'success' && <><p className="extract">{result.text}</p><a href={result.url} target="_blank" rel="noreferrer">Read more on Wikipedia (opens a new tab)</a></>}
    </div>
    <p className="attribution">Location information: Wikipedia contributors, CC BY-SA. Map: Google Maps.</p>
  </section>;
}
export default function App() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const visible = useMemo(() => filterLocations(locations, query), [query]);
  const location = locations.find(item => item.id === selected);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => {window.removeEventListener('online', update); window.removeEventListener('offline', update);};
  }, []);
  function changeQuery(value) {
    setQuery(value);
    if (!filterLocations(locations, value).some(item => item.id === selected)) setSelected(null);
  }
  function closeDetails() {
    const old = selected; setSelected(null);
    document.getElementById(`location-${old}`)?.focus();
  }
  return <>
    <a className="skip" href="#explore">Skip to locations</a>
    <header><span className="brand" aria-hidden="true">P / M</span><div><p className="eyebrow">A Portland arts field guide</p><h1>Portland, Maine</h1></div><span className="header-note">Art. Music. Live performance.</span></header>
    {offline && <p className="offline" role="status">You’re offline. The saved app and location list are available. Maps and uncached Wikipedia details need a connection.</p>}
    <main>
      <aside id="explore" className="sidebar" aria-labelledby="explore-title">
        <p className="eyebrow">Discover the peninsula</p><h2 id="explore-title">Find your next stop.</h2><p>Five arts destinations, from gallery walls to the stage.</p>
        <label htmlFor="filter">Filter by place or category</label>
        <div className="search"><input id="filter" type="search" value={query} onChange={event => changeQuery(event.target.value)} placeholder="Try art, music, or theater" />{query && <button onClick={() => {changeQuery('');document.getElementById('filter').focus();}} aria-label="Clear filter">×</button>}</div>
        <p className="count" role="status">{visible.length} of {locations.length} places</p>
        <LocationList visible={visible} selected={selected} onSelect={setSelected} />
        {visible.length === 0 && <p>No places match “{query}”. Try another name or category.</p>}
        <p className="sidebar-footer">Select a place to highlight its marker and discover its story.</p>
      </aside>
      <div className="map-column"><MapView visible={visible} selected={selected} onSelect={setSelected}/>{location && <LocationDetails key={location.id} location={location} onClose={closeDetails}/>}</div>
    </main>
    <footer>Maps by Google · Additional location data from <a href="https://en.wikipedia.org/">Wikipedia</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA</a></footer>
  </>;
}
