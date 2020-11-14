const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const morgan = require('morgan');
const exhbs = require('express-handlebars');
const methodOverride = require('method-override')
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db');


//load config
dotenv.config({ path: 'config/config.env'})

//Passport config
require('./config/passport')(passport);

//load db
connectDB();

//initialize express
const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

//morgan logging in dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Handlebars helpers
const {formatDate, truncate, stripTags, editIcon, select} = require('./helper/hbs')

//Views: handlebars
app.engine(
	".hbs",
	exhbs({ helpers: { formatDate, truncate, stripTags, editIcon, select }, defaultLayout: "main", extname: ".hbs" })
);
app.set('view engine', '.hbs');

// Sessions
app.use(session({
  secret: 'Eebrugzy_',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//static folder
app.use(express.static(path.join(__dirname, 'public')));

// Global var for handlebars
app.use((req, res, next)=> {
  res.locals.user = req.user || null;
  next();
})

//Routes
app.use("/", require("./routes"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 2222

app.listen(PORT,  console.log(`Server started in ${process.env.NODE_ENV} at port ${PORT}`))
