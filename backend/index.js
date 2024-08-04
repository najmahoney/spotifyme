require("dotenv").config();
const axios = require("axios");
const express = require("express");
const querystring = require("querystring");
const app = express();
const PORT = 9000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const generateSateToken = (length) => {
  let text = "";
  const possiblechar =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possiblechar.charAt(
      Math.floor(Math.random() * possiblechar.length)
    );
  }
  return text;
};

const stateKey = 'spotify_state_token';

app.get("/", (req, res) => {
  const data = {
    name: "Najah",
    city: "Shreveport",
    greeting: "Welcome",
    message: "To the Node.js Server Najah",
    ID: process.env.CLIENT_ID,
  };

  console.log("Sending data:", data); // Debugging line
  res.json(data);
});

app.get("/info", (req, res) => {
  const { name, city } = req.query;
  res.send(
    `Hello Whatup${name}! You are from ${city} and your message is great wait in line! Najah`
  );
});

app.get("/login", (req, res) => {

  const state = generateSateToken(16);
  const scope = "user-read-private user-read-email";
  res.cookie(stateKey, state);
  const queryparams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,

  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryparams}`);
});


app.get("/callback", (req, res) => {

  const code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
    },
  })
  .then(response => {
    if (response.status === 200) {
      
      const { access_token, refresh_token } = response.data;

      axios.get(`https://api.spotify.com/v1/me`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(response => {
        res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
      })
      .catch(error => {
        res.send(error);
      });
    } else {
      res.send(response);
    }
  })
  .catch(error => {
    res.send(error);
  });
});

app.get("/refresh_token", (req, res) => {
  const {refresh_token} = req.query;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type:'refresh_token',
      refresh_token: refresh_token
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
  .then(response => {
    res.send(response.data);
  })
  .catch(error => {
    res.send(error);
  });
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} HAPPY CODING! 🥳`);
});
