const express       = require('express')
const path          = require('path')
const favicon       = require('serve-favicon')
const logger        = require('morgan')
const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')

const chat          = require('./routes/chat')

mongoose.Promise    = global.Promise

mongoose.connect('mongodb://localhost/mean-chat')
    .then(() => console.log('connection successful'))
    .catch(err => console.error(err))


const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'dist')))

app.use('/chat', chat)

app.use((req, res, next) => {
    let err = new Error('Not found')
    err.status = 404
    next(err)
})

app.use((err, req, res, next) => {
    res.locals.message  = err.message
    res.locals.error    = req.app.get('env') === 'development' ? err : {}
    
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app