//Authentication With Open Authorization(Example: Github, Google)
const express = require ("express");
const passport = require("passport");
const session = require("cookie-session");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");

const app = express();

// Configure session
app.use(
  session({
    maxAge: 24 * 60 * 60 * 1000, 
    keys: ["your-session-secret"], 
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport with Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

// Configure Passport with GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: "YOUR_GITHUB_CLIENT_ID",
      clientSecret: "YOUR_GITHUB_CLIENT_SECRET",
      callbackURL: "/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome!</h1>
    <a href="/auth/google">Login with Google</a> | 
    <a href="/auth/github">Login with GitHub</a>
  `);
});

// Google Auth route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Auth callback route
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// GitHub Auth route
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub Auth callback route
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Dashboard route (protected)
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>Welcome, ${req.user.displayName || req.user.username}</h1>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.redirect("/");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
