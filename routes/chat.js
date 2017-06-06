const express   = require('express')
const router    = express.Router()
const mongoose  = require('mongoose')
const app       = express()
const server    = require('http').createServer(app)
const io        = require('socket.io')(server)
const Chat      = require('../models/Chat') 

server.listen(4000)

io.on('connection', socket => {
    console.log('User connected')
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })

    socket.on('save-message', data => {
        console.log(data)
        io.emit('new-message', { message: data })
    })
})


router.get('/:room', function (req, res, next) {
    Chat.find({ room: req.params.room }, (err, chats) => {
        if (err) return next(err)
        res.json(chats)
    })
})

router.post('/', (req, res, next) => {
    Chat.create(req.body, (err, post) => {
        if (err) return next(err)
        res.json(post)
    })
})

module.exports = router