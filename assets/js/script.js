// Created all functions inside the document.ready function to ensure the functions will run just after the entire document is loaded.
$(document).ready(function(){
    
    // Created global variables for classes in the html file that will constatly be used in this js file.
    var searchArea = $(".searchArea");
    var today = $(".today");
    var forecast = $(".forecast");

    // Created global variables for the API key that will be used in different AJAX calls.
    var APIKey = "b37332257de420fc6dfcda2bbba28fbd";

    // Created a variable to change the API response units of measurement.
    var imperialUnit = "&units=imperial";

    // Created a global variable to store the city inputed from user.
    var city ="";

    // Created an array to stored the cities returned from the API response.
    var savedCity = [];
    // console.log(savedCity);

    // Call initial function.    
    initial()
    
    
    function initial(){
        // Created a variable to pull the cities stored in the local storage.
        var storedCities = JSON.parse(localStorage.getItem("savedCity"));

        // If there are cities stored in the local storage, then it will take place in the savedCity array.
        if (storedCities !== null){
            savedCity = storedCities;
        }

        // Call function createBtn to create buttons for the cities in the local storage.
        createBtn();

        // Created variable to identify the last city researched by user, that is the last city pushed to the savedCity array.
        var takeLastCity = savedCity[savedCity.length - 1];

        // Run function currentDay with the last city in the array to display the results of the last researched city.
        currentDay(takeLastCity);
    }

    // Function created to storeCities.
    function storeCities(){
        localStorage.setItem("savedCity", JSON.stringify(savedCity));
    }
    
    // Event listner to search button.
    $(".searchBtn").on("click", function (event){
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
    
    // currentDay function runs with the giving city from where the function is called, and with the createButton boolean true or false.
    function currentDay(inputCity, createButton){
        
        // Variable that holds the API url along with variables key, unit and inputed city from user.
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?appid=" + APIKey + imperialUnit + "&q=" + inputCity;

         
        // AJAX call for the specific criteria (city name) entered by the user.
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response){            
            // console.log(response);

            // Created variable to hold the city name response from API.
            var cityName = response.name
            // console.log(cityName);

            // If createButton boolean is true than create button; however, another if statement is entered, so if user types a name of a city that he/she searched before, then this city will not be entered in the savedCity array.
            if (createButton) {
                if ((savedCity.indexOf(cityName)) <= -1){
                        // console.log(cityName);
                        savedCity.push(cityName);
                    }
            }

            // Create a h2 tag with the city name.
            var newh2 = $("<h2>").text(cityName);

            // Created variable to grab current day.
            var d = new Date();

            // Create a new span tag, and format the current day to be displayed as a text content.
            var newH2Span = $("<span>").text(" (" + (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear() + ")");

            // Created variable to grab the icon image name.
            var dayIcon = response.weather[0].icon;

            // Create an image tag. Add an attribute with the image address and add image name saved in variavle dayIcon.
            var imgDayIcon = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + dayIcon + ".png");
            
            // Append new span and image tag to the created h2 tag.
            newh2.append(newH2Span, imgDayIcon);
            
            // Create a p tag to display the temperature response.
            var ptemp = $("<p>").text("Temperature: " + response.main.temp + " ℉");

            // Create a p tag to display the humidity response.
            var phumidity = $("<p>").text("Humidity: " + response.main.humidity + "%");
            
            // Create a p tag to display the wind speed response.
            var pwindSpeed = $("<p>").text("Wind Speed: " + response.wind.speed + " mph");
            
            // Created varibles to store the latitude and longitude responses that are going to be used in the URL to grab the UV.
            var latitude = response.coord.lat            
            var long = response.coord.lon
            
            // Create a p tag to display the UV response.
            var pUV = $("<p>").text("UV Index: ");
            
            // Calls the function that runs the AJAX with the UV API.
            getUV();

            // Clears the div with the today class, and add the response for the new city searched.
            today.empty().append(newh2, ptemp, phumidity, pwindSpeed, pUV);

            

            function getUV(){

                // Created variable to hold API url along with  key, and the searched city latitute and longitude.
                var uvURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + long + "&appid=" + APIKey

                    // AJAX call function for to get the UV API response.
                    $.ajax({
                        url: uvURL,
                        method: "GET"
                    }).then(function(resUV){
                        // console.log(resUV);
                        
                        // Created variable to hold UV response.
                        var uv = resUV.value;

                        // Created a span tag with the UV response.
                        var spanUV = $("<span>").text(uv);

                        // Append the span tag to the p tag created previously.
                        pUV.append(spanUV);
                        
                        // Gets the UV response and turns into a number.
                        var parsenUV = parseInt(uv);

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
                var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + APIKey + imperialUnit

                // AJAX call for the specific city search by the user.
                $.ajax({
                    url: forecastURL,
                    method: "GET"
                }).then(function(forecastRes){
                    // console.log(forecastRes);

                    // Created varibale that holds the API response with a list of the every three works forecast for a five days period.
                    var forecastArray = forecastRes.list

                    // Create a h3 tag to display the 5-Day Forecast title.
                    var newForH3 = $("<h3>").text("5-Day Forecast");
                    
                    // Create a new div with a bootstrap class card-deck.
                    var newCardDeck = $("<div class='card-deck'>");

                    // Empty the div with class forecast, then append the new h3 and the new div.
                    forecast.empty().append(newForH3, newCardDeck);

                    // Create a for loop to loop through the forecast array. Start to loop at index 7 to skip the current day. The response comes back in 3 hours range; therefore, each returns 8 result per day, that's why i is added by 8 each time, to take a new day.
                    for (var i=7; i < forecastArray.length; i+=8){

                        // Create a new div with bootstrap class card-body for each result.
                        var newDivCardBody = $("<div class='card-body'>");

                        // Created variable to store date from response and format it to JavaScript.
                        var forDate = new Date(forecastArray[i].dt_txt);
                        // console.log(forDate);

                        // Created a new p tag to hold the date, as well as format it to be displayed.
                        var pForDate = $("<p>").text(forDate.getMonth()+1 + "/" + forDate.getDate() + "/" + forDate.getFullYear());

                        // Created variable to hold each icon name.
                        var forDayIcon = forecastArray[i].weather[0].icon;

                        // Create a new img tag, and add an attribute with the image address along with the icon name held in the forDayIcon variable.
                        var imgForDayIcon = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + forDayIcon + ".png");
                        
                        // Create p tage to display the temperature.
                        var pForTemp = $("<p>").text("Temperature: " + forecastArray[i].main.temp + " ℉");
                        
                        // Create p tag to display humidity.
                        var pForHumidity = $("<p>").text("Humidity: " + forecastArray[1].main.humidity + "%");  
                        
                        // Append the new p tags and image tag to the div with class card-body.
                        newDivCardBody.append(pForDate, imgForDayIcon, pForTemp, pForHumidity);

                        // Append the div with class card-body to the div with class card-deck.
                        newCardDeck.append(newDivCardBody);
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
        savedCity.forEach(function(cn){
            // console.log(cn);            
            
            // Create a new button with the city names inside the savedCity array.
            var newCityBtn = $("<button>").text(cn);

            // Add a data-name attribute with the city name.
            newCityBtn.attr("data-name", cn);

            // Add classes to the new button.
            newCityBtn.addClass("cityBtn btn-block");
            
            // Append the new button tag to the div with class searchArea.
            searchArea.append(newCityBtn);
        })
        // Call storeCities function.
        storeCities();
    }
    
        
})