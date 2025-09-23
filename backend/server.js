const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemon = require('nodemon');


const app = express();
const PORT = process.env.PORT || 8080;  

const userRoutes = require('./routes/userRoutes');