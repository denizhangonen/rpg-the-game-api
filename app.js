const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = 8080;

const authRoutes = require('./routes/auth');

require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// set headers to prevent cors errors on client side
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, HEAD'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use('/', (req, res) => {
  console.log('hola');
  res.send('yeah?!?!');
});
app.use('/auth', authRoutes);

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.get('/login', (req, res) => {
//   res.send('login');
// });

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;

  res.status(status).json({ message: message });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASS}@cluster0-8gblk.mongodb.net/${process.env.MONGO_DB}`
  )
  .then((result) => {
    app.listen(process.env.PORT || port);
    console.log('started listening : ' + process.env.PORT || port)
  })
  .catch((err) => {
    console.log(
      '----------------------------------Mongo Connection Error--------------------------------'
    );
    console.log('process.env.MONGO_USER : ', process.env.MONGO_USER);
    console.log('process.env.MONGO_USER_PASS : ', process.env.MONGO_USER_PASS);
    console.log('process.env.MONGO_USER_PASS : ', process.env.MONGO_DB);
    console.log(err);
  });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });
