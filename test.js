const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'postgres',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: '052Az2S%',
        database: 'smartbrain'
    }
});


const app = express();

app.use(bodyParser.json());

app.use(cors());

const database = {
    users: [{
            id: '123',
            name: 'john',
            password: 'cookies',
            email: 'john@gmail.com',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'sally',
            password: 'bananas',
            email: 'sally@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [{
        id: '987',
        hash: '',
        email: 'john@gmail.com'
    }]
}

app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
    bcrypt.compare("apples", "$2a$10$dIdQ/4t5x21/B8Ibx0PA5OAkdUTuUiA84il6SN0eIun3mmZHav5l.", function(err, res) {});
    bcrypt.compare("bacon", "$2a$10$dIdQ/4t5x21/B8Ibx0PA5OAkdUTuUiA84il6SN0eIun3mmZHav5l.", function(err, res) {});

    if (req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json("error logging in")
    }
})

// app.post('/register', (req, res) => {
//     const { email, name, password } = req.body;
//     const hash = bcrypt.hashSync(password);
//     db.transaction(trx => {
//             trx.insert({
//                     hash: hash,
//                     email: email
//                 })
//                 .into('login')
//                 .returning('email')
//                 .then(loginEmail => {
//                     return trx('users')
//                         .returning('*')
//                         .insert({
//                             email: loginEmail,
//                             name: name,
//                             joined: new Date()
//                         }).then(user => {
//                             res.json(user[0])
//                         })
//                 })
//         })
//         .catch(err => res.status(400).json('unable to register'))
// })

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
            trx.insert({
                    hash: hash,
                    email: email
                })
                .into('login')
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            email: loginEmail[0],
                            name: name,
                            joined: new Date()
                        })
                        .then(user => {
                            res.json(user[0]);
                        })
                })
                // .then(trx.commit)
                // .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({
        id: id
    }).then(user => {
        if (user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('Not Found')
        }
    }).catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0])
        }).catch(err => res.status(400).json('unable to get entries'))
})

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3000, () => {
    console.log('app is running on port 3000');
})