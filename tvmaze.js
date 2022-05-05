"use strict";

const MISSING_IMAGES = "https://tinyurl.com/missing-tv";
const TVMAZE_API = "http://api.tvmaze.com/";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $episodesList = $("#episodes-list");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term) {
  
  // pulling responses from the API
  const response = await axios({
    url: `${TVMAZE_API}search/shows?q=${term}`,
    method: "GET",
  });

  // generating objects of shows pulled from API query
  return response.data.map(result => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGES,
    };
  });
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  $showsList.empty();
  console.log(shows);
  if (shows.length > 0) {
    // looping through the shows returned by the API 
    for (let show of shows) {
      const $show = $(
          `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
          <div class="media">
            <img 
                src="${show.image}" 
                alt="${show.name}" 
                class="w-25 mr-3">
            <div class="media-body">
              <h5 class="text-primary">${show.name}</h5>
              <div><small>${show.summary}</small></div>
              <button type="button" class="btn btn-primary btn-sm Show-getEpisodes" data-bs-toggle="modal" data-bs-target="#episodes-area">
                Episodes
              </button>
            </div>
          </div>  
        </div>
        `);
      
      // adding to the #show-list area on the page
      $showsList.append($show);
    }
  } else {
    alert("Sorry - no TV Show matches for that search");
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
  const response = await axios({
    url: `${TVMAZE_API}shows/${id}/episodes`,
    method: "GET",
  });

  return response.data.map(e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
}

// adding episode infor to the DOM
function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(
        `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

    $episodesList.append($item);
  }

  $episodesArea.show();
}


async function getEpisodesAndDisplay(evt) {
  // finding the showId from the class of the parent div closest to the button
  const showId = $(evt.target).closest(".Show").data("show-id");
  // defining the map of episodes from the showId
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);

$('.btn-close, .modal-footer .btn-secondary').click(function() {
  $( "#episodes-area" ).hide();
});