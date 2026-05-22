//* fetchAPI.js
const steamUserAPIKey = process.env.STEAM_API_KEY || "YOUR_STEAM_API_KEY";
const steamUserID = "YOUR_STEAM_ID";
const backendUrl = "http://localhost:5005/api/steam-games";
const steamAPIUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamUserAPIKey}&steamid=${steamUserID}&format=json&include_appinfo=true`;
const options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

async function fetchAPI(url, options) {
  const response = await fetch(url, options);
  return response.json();
}

const sendToBackend = async (steamData) => {
  const backendOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(steamData),
  };

  const backendResponse = await fetch(backendUrl, backendOptions);
  return backendResponse.json();
};

const resultado = await fetchAPI(steamAPIUrl, options);
if (resultado.response.game_count > 0) {
  const backendResult = await sendToBackend(resultado);
  console.log(backendResult);
}
