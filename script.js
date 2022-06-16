

let APIKey = "c5518d6afb2e6ad4c03fcb2f5a56ba05";
let locations = [];

function getWeatherData(lat, lon, city) {

    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=,minutely,hourly,alerts&appid=" + APIKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (response) {

            showWeatherData(response, city);

        });           
 };

function loadWeatherZip(zipCpde, isClicked) {

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?zip=" + zipCpde + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    $.ajax({
        url: queryURL,
        method: "GET"
    })
     
        .then(function (response) { 

            console.log(response);

            if (!isClicked)
            {
                saveLocations(response);  
                renderLocations();
            }

            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function (response){
            alert("Not a vaild Zip Code")
        });
}

function loadWeatherCity(city, isClicked) {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    $.ajax({
        url: queryURL,
        method: "GET"
    })

        .then(function (response) {

            console.log(response);

            if (!isClicked)
            {
                saveLocations(response);  
                renderLocations();
            }

            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function(response){
            alert("Not a valid City");
        });
}

function showWeatherData(weatherData, city)
{
    var iconURL = "http://openweathermap.org/img/w/" + weatherData.current.weather[0].icon + ".png";  //get weather icon
    $("#cityDate").html(city + " (" + new Date().toLocaleDateString() + ") <img id=\"icon\" src=\"" + iconURL  + "\" alt=\"Weather icon\"/>");

    var temp = parseInt(weatherData.current.temp);
    temp = Math.round(((temp-273.15)*1.8) + 32);
    $("#currentTemp").html(" " + temp +  "  &degF");
    $("#currentHumidity").html(weatherData.current.humidity + "%");
    $("#currentWindSpeed").html(weatherData.current.wind_speed + " MPH");

    var uvIndex = weatherData.current.uvi;

    var bgColor = ""; 
    var textColor = ""; 

    if (uvIndex < 3)
    {
        bgColor = "bg-success";
        textColor = "text-light";  
    }
    else if (uvIndex > 2 && uvIndex < 6)
    {
        bgColor = "bg-warning";
        textColor = "text-dark";             
    }
    else  
    {
        bgColor = "bg-danger";
        textColor = "text-light";            
    }

    $("#currentUVIndex").html(uvIndex).addClass(bgColor + " p-1 " +  textColor); 

    var ul5 = $("#fiveDay");
    ul5.empty();

    for (i=1; i < 6; i++)  
    {
        var div = $("<div>").addClass("bg-primary");

        var dateTime = parseInt(weatherData.daily[i].dt); 
        var dateHeading = $("<h6>").text(new Date(dateTime * 1000).toLocaleDateString());  
        var iconDayURL = "http://openweathermap.org/img/w/" + weatherData.daily[i].weather[0].icon + ".png";  
        var icon = $("<img>").attr("src", iconDayURL);

        temp = parseInt(weatherData.daily[i].temp.day);  
        temp = Math.round(((temp-273.15)*1.8) + 32);  
        var temp5 = $("<p>").html("Temp: " + temp +  "  &degF");

        var humidity5 = $("<p>").html("Humidity: " + weatherData.daily[i].humidity + "%");

        div.append(dateHeading);
        div.append(icon);
        div.append(temp5);
        div.append(humidity5);
        ul5.append(div);

    }

    $("#weatherData").show();
}


function loadLocations()
{
    var locationsArray = localStorage.getItem("locations");
    if (locationsArray) 
    {
      locations = JSON.parse(locationsArray); 
      renderLocations();
    }
    else {
      localStorage.setItem("locations", JSON.stringify(locations));  
    }
}

function renderLocations()
{
    var divLocations = $("#locationHistory");
    divLocations.empty(); 

    $.each(locations, function(index, item){
        var a = $("<a>").addClass("list-group-item list-group-item-action city").attr("data-city", locations[index]).text(locations[index]);
        divLocations.append(a);
    });

    $("#locationHistory > a").off();

    $("#locationHistory > a").click(function (event)
    {   
        var element = event.target;
        var city = $(element).attr("data-city");

        loadWeatherCity(city, true);
    });

}


function saveLocations(data)
{

    var city = data.city.name; 

    locations.unshift(city);
    localStorage.setItem("locations", JSON.stringify(locations));  

}

$(document).ready(function () {

    $("#weatherData").hide();  

    loadLocations();  

    $("#searchBtn").click(function (event) {  
        var element = event.target; 
        var searchCriteria = $("#zipCode").val();  
        
        if (searchCriteria !== "") 
        {
            var zip = parseInt(searchCriteria); 

            if (!isNaN(zip)) 
            {
                loadWeatherZip(zip, false);
            }
            else
            {
                loadWeatherCity(searchCriteria, false); 
            }
        }
    });
});
