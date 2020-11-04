// Created all functions inside the document.ready function to ensure the functions will run just after the entire document is loaded.
$(document).ready(function(){
    
    // Created global variables for classes in the html file that will constatly be used in this js file.
    const searchArea = $(".searchArea");
    const today = $(".today");
    const forecast = $(".forecast");

    // Created global variables for the API key that will be used in different AJAX calls.
    const APIKey = "b37332257de420fc6dfcda2bbba28fbd";

    // Created a variable to change the API response units of measurement.
    const imperialUnit = "&units=imperial";

    // Created a global variable to store the city inputed from user.
    let city;

    // Created an array to stored the cities returned from the API response.
    let savedCity = [];
    // console.log(savedCity);

    // Call initial function.    
    initial()    
    
    function initial(){
        // Created a variable to pull the cities stored in the local storage.
        const storedCities = JSON.parse(localStorage.getItem("savedCity"));

        // If there are cities stored in the local storage, then it will take place in the savedCity array.
        if (storedCities !== null){
            savedCity = storedCities;
        }

        // Call function createBtn to create buttons for the cities in the local storage.
        createBtn();

        // Created variable to identify the last city researched by user, that is the last city pushed to the savedCity array.
        const takeLastCity = savedCity[savedCity.length - 1];

        // Run function currentDay with the last city in the array to display the results of the last researched city.
        currentDay(takeLastCity);
    }

    // Function created to storeCities.
    function storeCities(){
        localStorage.setItem("savedCity", JSON.stringify(savedCity));
    }
    
    // Event listner to search button.
    $(".searchBtn").on("click", event => {
        event.preventDefault();
        // Take value from input field that user entered. Trim to take any blank spaces at the end.
        city = $("#addCity").val().trim();
        
        // If no city name is entered it will not run the search in the API.
        if(city == ""){
            return;
        }

        // If a city name is entered then the currentDay function is called, true boolean refers to the creation of a button for this city name.
        currentDay(city, true);   
                   
    })

    // Event listner for the clean button. This gives an option to user to clean the previous searched cities.
    $(".cleanBtn").on("click", event => {
        event.preventDefault();
        // Clean local storage.
        localStorage.clear();
        // Clean elements from array.
        savedCity = [];
        // Remove city buttons.
        $(".cityBtn").remove();
    })
    
    // currentDay function runs with the giving city from where the function is called, and with the createButton boolean true or false.
    function currentDay(inputCity, createButton){
        
        // Variable that holds the API url along with variables key, unit and inputed city from user.
        const queryURL = "https://api.openweathermap.org/data/2.5/weather?appid=" + APIKey + imperialUnit + "&q=" + inputCity;

         
        // AJAX call for the specific criteria (city name) entered by the user.
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(response => {            
            // console.log(response);

            // Created variable to hold the city name response from API.
            const cityName = response.name
            // console.log(cityName);

            // If createButton boolean is true than create button; however, another if statement is entered, so if user types a name of a city that he/she searched before, then this city will not be entered in the savedCity array.
            if (createButton) {
                if ((savedCity.indexOf(cityName)) <= -1){
                        // console.log(cityName);
                        savedCity.push(cityName);
                    }
            }

            // Created variable to grab current day.
            const d = new Date();

            // Created variable to grab the icon image name.
            const dayIcon = response.weather[0].icon;

            // Create new elements to be append in the html file using the API response as part of the text.
            const newCurrentWeather = `
            <h2>${cityName}<span>(${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()})</span>
            <img src="https://openweathermap.org/img/wn/${dayIcon}.png"></img>
            </h2>
            <p>Temperature: ${response.main.temp} ℉</p>
            <p>Humidity: ${response.main.humidity}%</p>
            <p>Wind Speed: ${response.wind.speed} mph;
            <p class="uv">UV Index: </p>
            <img class='imgUv' src="https://www.epa.gov/sites/production/files/sunwise/images/uviscaleh_lg.gif" alt="UV Color Scale"></img>
            <br>
            <br>
            `
            // Created varibles to store the latitude and longitude responses that are going to be used in the URL to grab the UV.
            const latitude = response.coord.lat            
            const long = response.coord.lon
            
            // Calls the function that runs the AJAX with the UV API.
            getUV();

            // Clears the div with the today class, and add the response for the new city searched.
            today.empty().append(newCurrentWeather);            

            function getUV(){

                // Created variable to hold API url along with key, and the searched city latitute and longitude.
                const uvURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + long + "&appid=" + APIKey

                // AJAX call function for to get the UV API response.
                $.ajax({
                    url: uvURL,
                    method: "GET"
                }).then(resUV => {
                    // console.log(resUV);
                    
                    // Created variable to hold UV response.
                    const uv = resUV.value;

                    $(".spUv").remove();

                    // Created a span tag with the UV response.
                    const spanUV = $("<span class='spUv'>").text(uv);

                    // Append the span tag to the p tag created previously.
                    $(".uv").append(spanUV);
                    
                    // Gets the UV response and turns into a number.
                    const parsenUV = parseInt(uv);

                    // The following if statements are to color code the UV level according to https://www.epa.gov/sunsafety/uv-index-scale-0
                    if (parsenUV <= 2){
                        spanUV.attr("style", "background: green")
                    }
                    else if (parsenUV >= 3 && parsenUV <= 5){
                        spanUV.attr("style", "background: yellow")
                    }
                    else if (parsenUV === 6 || parsenUV === 7){
                        spanUV.attr("style", "background: orange")
                    }
                    else if (parsenUV >= 8 && parsenUV <= 10){
                        spanUV.attr("style", "color: white;background: red")
                    }
                    else if (parsenUV >= 11){
                        spanUV.attr("style", "color: white;background: purple")
                    }
                })
            }

            // Call function that displays 5 days forecast.
            futureDates()

            function futureDates(){
                
                // Created variable to hold the forecast URL, adding the user search city name, API key, and unit change from standard to imperial.
                const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + APIKey + imperialUnit

                // AJAX call for the specific city search by the user.
                $.ajax({
                    url: forecastURL,
                    method: "GET"
                }).then(forecastRes => {
                    // console.log(forecastRes);

                    // Created varibale that holds the API response with a list of the every three works forecast for a five days period.
                    const forecastArray = forecastRes.list

                    // Create a h3 tag to display the 5-Day Forecast title.
                    const newForH3 = `<h3>5-Day Forecast</h3>`;
                    
                    // Create a new div with a bootstrap class card-deck.
                    const newCardDeck = `<div class="card-deck"></div>`;

                    // Empty the div with class forecast, then append the new h3 and the new div.
                    forecast.empty().append(newForH3, newCardDeck);

                    // Create a for loop to loop through the forecast array. Start to loop at index 7 to skip the current day. The response comes back in 3 hours range; therefore, each returns 8 result per day, that's why i is added by 8 each time, to take a new day.
                    for (let i=7; i < forecastArray.length; i+=8){

                        // Created variable to store date from response and format it to JavaScript.
                        const forDate = new Date(forecastArray[i].dt_txt);
                        // console.log(forDate);

                        // Created variable to hold each icon name.
                        const forDayIcon = forecastArray[i].weather[0].icon;

                        // Create a new div with bootstrap class card-body for each result.
                        const newDivCardBody = `<div class="card-body">
                        <p>${forDate.getMonth()+1}/${forDate.getDate()}/${forDate.getFullYear()}
                        <img src="https://openweathermap.org/img/wn/${forDayIcon}.png"></img>
                        <p>Temperature: ${forecastArray[i].main.temp} ℉<p>
                        <p>Humidity: ${forecastArray[1].main.humidity}%</p>
                        </div>  
                        `
                        // Append the div with class card-body to the div with class card-deck.
                        $(".card-deck").append(newDivCardBody);
                    }                      
                })
            }
            // Call create button function.
            createBtn();   
        })            
    }

    // Event listern for the buttons created with the city names searched by the user.
    $(document).on("click", ".cityBtn", function (event){
        event.preventDefault();

        // Take the city name as the data-name of the button.
        city = $(this).attr("data-name");
        // Call function currentDay, uses the city name taken above. Set boolean to false, to not create a new button.
        currentDay(city, false); 
    }) 

    // Function that creates a new button with the city name searched by the user.
    function createBtn(){
        
        // Remove existing buttons with the city name.
        $(".cityBtn").remove();   

        // Create new button for each element inside the savedCity array.
        savedCity.forEach(cn => {
            // console.log(cn);            
            
            // Create a new button with the city names inside the savedCity array.
            const newCityBtn = `<button class="cityBtn btn-block" data-name="${cn}">${cn}</button>`

            // Append the new button tag to the div with class searchArea.
            searchArea.append(newCityBtn);
        })
        // Call storeCities function.
        storeCities();
    }
})