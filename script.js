const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const errPage = document.querySelector(".errorImageBox");

// initially variables need
let currentTab = userTab; 
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");

// one more thing is pending ->now done, see line just below it
getfromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        // checking if search form wala container is visible or not
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            errPage.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // switching from search weather to user weather
            errPage.classList.remove("active");
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // now we came into my weather tab, so we need to display the weather, so let's check local storage first for coordinates if we have saved them there
            getfromSessionStorage();
        }
    }
} 

userTab.addEventListener('click',()=>{
    // pass clicked tab as input parameter
    switchTab(userTab)
})

searchTab.addEventListener('click',()=>{
    // pass clicked tab as input parameter
    switchTab(searchTab);
})

// check if coordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    // make grant container invisible
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");
    // call API
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        // remove loader
        loadingScreen.classList.remove("active");
        // make user info container visible
        userInfoContainer.classList.add("active");
        // render the data on UI
        renderWeatherInfo(data);
    }
    catch(err){
        // remove loading screen
        loadingScreen.classList.remove("active");
        // Homework

    }
}

function renderWeatherInfo(weatherInfo){
    // first we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]")
    const weatherIcon = document.querySelector("[data-weatherIcon]")
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it in UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description; 
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp}°C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click',getLocation);

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{   
        //Homework  show an alert for no geolocation support available
        alert("Geolocation not supported");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat : position.coords.latitude,
        lon :position.coords.longitude
    }

    // store in session storage
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}


const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return; 
    else{
        errPage.classList.remove("active");
        fetchSearchWeatherInfo(cityName);
    }
        
})


async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
         console.log(data);
        if(data?.cod!='404')
            renderWeatherInfo(data);
        else{
            userInfoContainer.classList.remove("active");
             errPage.classList.add("active");
        }
        searchInput.value="";
    }
    catch(err){
        


    }
}


