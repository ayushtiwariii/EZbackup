import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from 'express-session';
import flash from 'connect-flash';
import cors from 'cors';
import authRoute from "./routes/auth.js"
import backupRoute from "./routes/backup.js"
import connectDb from "./models/db.js";
dotenv.config()
const app =express();


app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true,                // allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key_here',  // keep this secret and safe (use env var in production)
  resave: false,                   // don't save session if unmodified
  saveUninitialized: false,        // don't create session until something stored
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,  // session expires in 1 day (optional)
    // secure: true                // set this true only if your site uses HTTPS
  }
}));
  
  app.use(flash());
  
  app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
  });
connectDb()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static assets from /public
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse request body


const port =process.env.PORT||8080;

app.use("/",authRoute)
app.use("/",backupRoute)

app.listen(port,()=>{
    console.log(`app is listening on http://localhost:${port}`)
})