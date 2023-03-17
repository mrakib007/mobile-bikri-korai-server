const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;