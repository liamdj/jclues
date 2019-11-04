
(function() {

const API_PATH = "https://cors-anywhere.herokuapp.com/http://jservice.io/api";
const MAX_RESULTS = 30;

const main = $("main");
const container = $(".search-container");

intializeCategorySearch();

// create search html elements to find and display categories
function intializeCategorySearch() {
   main.html("");
   container.html("");
   
   const terms = $("<input placeholder='search for categories' type='text'>"); 
   container.append(terms);
   const button = $("<button type='button'> <i class='fa fa-search'> </i> search </button>");
   container.append(button);
   // search and add all results to DOM
   button.click(() => {
      findCategories(terms.val().trim().split(" "));
   });
   const search_all = $("<br> <button type='button'> Search all categories </button>");
   container.append(search_all);
   // switch to clue search
   search_all.click(() => intializeClueSeach());
}

// create search html elements to find and display clues
function intializeClueSeach(category) {
   main.html("");
   container.html("");

   if (category === undefined) 
      category = {title: "all categories (<b>Warning:</b> slow)"};
   else 
      findClues([""], {category: category.id});

    
   container.append(`<p> Searching clues in ${category.title}`);
   const terms = $("<input placeholder='search for clues' type='text'>"); 
   container.append(terms);

   container.append("<label for='values'> Value </label>")
   const values = $("<select id='values'> </select> <br> ");
   ["Any", 100, 200, 300, 400, 500, 600, 800, 1000].forEach(val =>
      values.append(`<option> ${val} </option>`));
   container.append(values);

   const min_date = $("<input id='min_date' type='date'>"); 
   const max_date = $("<input id='max_date' type='date'>"); 
   container.append("<label for='min_date'> Earliest airdate </label>")
   container.append(min_date);
   container.append("<label for='max_date'> Latest airdate </label>")
   container.append(max_date);

   const button = $("<button type='button'> <i class='fa fa-search'> </i> search </button>");
   container.append(button);
    // search and add all results to DOM
    button.click(function() {
      const filters = {};
      if (category.id) filters.category = category.id;
      if (values.val() != "Any") filters.value = values.val();
      if (min_date.val()) filters.min_date = min_date.val();
      if (max_date.val()) filters.max_date = max_date.val();
      findClues(terms.val().trim().split(" "), filters);
   });

}

// finds and adds category search results to DOM
function displayCategory(category, list) {
   ele = $(`<li class="category" id=${category.id} </li>`);
   ele.append(` 
      <span class="title"> ${category.title.toUpperCase()} </span>
      <span class="clues_count"> ${category.clues_count} </span>`);
   button = $(`<button type="button" class="select_category"> show clues </button>`);
   ele.append(button);
   list.append(ele);
   button.click(function() {
      const parent = $(this).parent();
      intializeClueSeach({id: parent.attr('id'), title: parent.children(".title").html()});
   });
}

// returns all categoies containing at least one of the search terms
function findCategories(search_terms) {
   const list = $("<ul> </ul>");
   list.append("<p id='searching'> searching... </p>");
   main.html(list);
   recursiveCategorySearch(API_PATH + "/categories/?count=100&", 0, search_terms, list, 0);
}

// adds clue search results to DOM
function displayClue(clue, list) {
   ele = $("<li class='clue'> </li>");
   ele.append(`<p class="question"> ${clue.question.toUpperCase()} </p>
      <span class="category-q"> ${clue.category.title.toUpperCase()} </span>
      <span class="value"> \$${clue.value} </span>
      <span class="date"> ${formatDate(clue.airdate)} </span>
      <p hidden class="answer"> <i> Answer: </i> ${clue.answer.toUpperCase()} </p>`);
   list.append(ele);
   ele.hover(function() {
      $(this).children(".answer").toggle("fast");
   });
}

function formatDate(date) {
   s = date.slice(0, 10).split("-");
   return s[1] + "/" + s[2] + "/" + s[0];
}

// returns all clues mathcing all filters and containing at least one of the search terms
function findClues(search_terms, filters) {
   let url = API_PATH + "/clues/?";
   for (let option in filters)
      url += option + "=" + filters[option] + "&";
   const list = $("<ul> </ul>");
   list.append("<p id='searching'> searching... </p>");
   main.html(list);
   recursiveClueSearch(url, 0, search_terms, list, 0);
}

function recursiveCategorySearch(url, offset, search_terms, list, results) {
   fetch(url + "offset=" + offset)
      .then(responce => responce.json())
      .then(arr => {
         arr.forEach(category => {
            if (results < MAX_RESULTS)
               if (category.title && search_terms.some(word => 
                     category.title.includes(word))) {
                  displayCategory(category, list);
                  results++;
               }
         })
         if (arr.length > 0 && results < MAX_RESULTS)
            recursiveCategorySearch(url, offset + 100, search_terms, list, results)
         else 
            list.children("#searching").remove();
      });
}

function recursiveClueSearch(url, offset, search_terms, list, results) {
   fetch(url + "offset=" + offset)
      .then(responce => responce.json())
      .then(arr => {
         arr.forEach(clue => {
            if (results < MAX_RESULTS)
               if (search_terms.some(word => 
                     clue.question.includes(word)) ||
                  search_terms.some(word => 
                     clue.answer.includes(word))) {
                  displayClue(clue, list);
                  results++;
               }
         })
         if (arr.length > 0 && results < MAX_RESULTS)
            recursiveClueSearch(url, offset + 100, search_terms, list, results)
         else {
            list.children("#searching").remove();
         }
      });
}

})()
