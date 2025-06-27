require('dotenv').config();
const Collectible = require('./public/Collectible');
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const cors = require('cors');
const helmet = require('helmet');
const nocache = require('nocache');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(helmet());
app.use(helmet.noSniff());
app.use(nocache());
app.use(helmet.hidePoweredBy({setTo: 'PHP 7.4.3'}));
app.use((req, res, next) => {
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Players DB
let roster = {};
let currentPrize = new Collectible(0);

// Socket connection
const io = require('socket.io')(server);
io.on('connection', (socket) => {
  // Socket connection
  socket.emit('firstConnection', { id: socket.id, roster: roster, prize: currentPrize });
  socket.on('registerPlayer', (player) => roster[player.id] = player);
  console.log('A user joined');

  // Socket update
  socket.on('updatePlayer', (player) => {
    roster[player.id] = player;
    io.emit('updateRoster', roster);
  });

  // Catch prize
  socket.on('prizeCatch', (id) => {
    currentPrize = new Collectible(id + 1);
    io.emit('updatePrize', currentPrize );
  });

  // Socket disconnection
  socket.on('disconnect', () => {
    socket.broadcast.emit('playerLeft', socket.id);
    delete roster[socket.id];
    console.log('A user left');
  });
});

module.exports = app; // For testing
