// Plain-text extracts avoid injecting remote HTML. CORS is enabled with origin=*.
// References: https://www.mediawiki.org/wiki/API:Cross-site_requests
// https://www.mediawiki.org/wiki/Extension:TextExtracts#API
export async function getDetails(location, signal) {
  const params = new URLSearchParams({action:'query', prop:'extracts', exintro:'1', explaintext:'1', redirects:'1', titles:location.article, format:'json', origin:'*'});
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {signal});
  if (!response.ok) throw new Error('Wikipedia is unavailable right now. Please try again.');
  const result = await response.json();
  const page = Object.values(result.query?.pages || {})[0];
  if (!page?.extract || page.missing !== undefined) throw new Error('Wikipedia did not return information for this location.');
  return {text:page.extract, url:`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`};
}
