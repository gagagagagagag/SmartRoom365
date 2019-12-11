let permitted_modules_list;
let newSearchSession = true;

const getPermittedModulesList = async () => {
    try {
        // Get the list of the modules form the server

        permitted_modules_list = await $.ajax({
            url: "/resources/modules-list-permitted",
            type: "GET"
        });

    } catch (e) {
        console.log(e);
    }
};

const clearTheSearchInput = () => {
    document.querySelector("#searchBox").value = "";
};

const clearTheSearchResults = () => {
    const searchResults = document.querySelector("#searchList");

    while (searchResults.firstChild){
        searchResults.removeChild(searchResults.firstChild);
    }
};

const showTheResults = () => {
    // Show the element
    const searchListWraper = document.querySelector("#searchListWraper");
    searchListWraper.style.display = "block";

    // Clear the elements
    clearTheSearchResults();
};

const hideTheResults = () => {
    // Hide the element
    const searchListWraper = document.querySelector("#searchListWraper");
    searchListWraper.style.display = "none";
};

const searchTheModules = keyword => {
    if (newSearchSession){
        // Search is being open for the first time

        newSearchSession = false;
        return;
    }

    // A new search is triggered
    showTheResults();

    // Results found counter
    let resultsFoundCounter = 0;

    for (let module of permitted_modules_list.modules){
        if (module.name.toLowerCase().includes(keyword.trim().toLowerCase()) && module.show_up_in_search){
            showResult(module);
            resultsFoundCounter++;
        }
    }

    // Check if no results found
    if (resultsFoundCounter === 0){
        showResult({
            uri: "#",
            name: "No results found."
        });
    }
};

const showResult = module => {
    const searchResults = document.querySelector("#searchList");

    let newResult = document.createElement("a");
    newResult.href = module.uri;
    newResult.classList = `list-group-item list-group-item-action ${module.uri === "#" ? "disabled" : ""}`;
    newResult.innerText = module.name;

    searchResults.appendChild(newResult);
};

// Triggering the search and the closure of the search

document.querySelector("#searchStart").addEventListener("click", () => {
    searchTheModules(document.querySelector("#searchBox").value);
});

document.querySelector("#searchBox").addEventListener("keyup", () => {
    searchTheModules(document.querySelector("#searchBox").value);
});

document.querySelector("#searchClose").addEventListener("click", () => {
    hideTheResults();
    clearTheSearchResults();
    clearTheSearchInput();

    newSearchSession = true;
});

getPermittedModulesList();