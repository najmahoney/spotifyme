import axios from 'axios';

//Map for localstorage keys
const LOCALHOST_KEY = {
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expireTime: "spotify_expire_time",
  timmstamp: "spotify_timestamp",
};

// map to get localstorage values
const LOCALSTORAGE_VALUE = {
  accessToken: window.localStorage.getItem(LOCALHOST_KEY.accessToken),
  refreshToken: window.localStorage.getItem(LOCALHOST_KEY.refreshToken),
  expireTime: window.localStorage.getItem(LOCALHOST_KEY.expireTime),
  timestamp: window.localStorage.getItem(LOCALHOST_KEY.timmstamp),
};

const hasTokenExpired = () => {
    const {accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUE;
    if (!accessToken ||!timestamp) {
        return false;
    }
    const millisecondsElapsed = Date.now() - Number(timestamp);
    return (millisecondsElapsed / 1000) > Number(expireTime);
};

const refreshToken = async () => {
    try {
        if (!LOCALSTORAGE_VALUE.refreshToken || LOCALSTORAGE_VALUE.refreshToken === "undefined" || (Date.now() - Number(LOCALSTORAGE_VALUE.timestamp) / 1000) < 1000){
         console.log("Not enough time to refresh token");
         logout();   
        }

        const {data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUE.refreshToken}`)

        window.localStorage.setItem(LOCALHOST_KEY.accessToken, data.accessToken);
        window.localStorage.setItem(LOCALHOST_KEY.timestamp, Date.now());

        window.location.reload();
    } catch (e) {
        console.log(e);
    }
};

export const logout = () => {
    for (let key in LOCALHOST_KEY) {
        window.localStorage.removeItem(LOCALHOST_KEY[key]);
    }
    window.location = window.location.origin;
}

const getAccessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {
    [LOCALSTORAGE_VALUE.accessToken]: urlParams.get("access_token"),
    [LOCALSTORAGE_VALUE.refreshToken]: urlParams.get("refresh_token"),
    [LOCALSTORAGE_VALUE.expireTime]: urlParams.get("expires_in"),
  };

  const hasError = urlParams.get("error");

  if (
    hasError ||
    hasTokenExpired() ||
    LOCALSTORAGE_VALUE.accessToken === "undefined"
  ) {
    refreshToken();
  }

  if (
    LOCALSTORAGE_VALUE.accessToken &&
    LOCALSTORAGE_VALUE.accessToken !== "undefined"
  ) {
    return LOCALSTORAGE_VALUE.accessToken;
  }

  if (queryParams[LOCALSTORAGE_VALUE.accessToken]) {
    for (let key in queryParams) {
      window.localStorage.setItem(key, queryParams[key]);
    }

    window.localStorage.setItem(LOCALSTORAGE_VALUE.timmstamp, Date.now());
    return queryParams[LOCALSTORAGE_VALUE.accessToken];
  }

  return false;
};

export const accessToken = getAccessToken();
