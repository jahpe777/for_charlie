const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");
const jwks = require("jwks-rsa");

const app = express();
app.use(cors());

const port = 3001;

app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.static(join(__dirname, "build")));

const jwtCheck = auth({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-urk57tqh1ecfnln2.us.auth0.com/.well-known/jwks.json",
  }),
  audience: "Charlie Identifier",
  issuerBaseURL: "https://dev-urk57tqh1ecfnln2.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

// enforce on all endpoints
app.use(jwtCheck);

app.get("/protected", function (req, res) {
  res.send("Secured Resource");
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

module.exports = app;
