'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicationSchema = Schema({
    text: String,
    file: String,
    created_at: String,
    user: {type: Schema.ObjectId, ref: 'User'},
    //añadidos por mi
    likes: {type: Number, default: 0},
    loves: {type: Number, default: 0},
    angrys: {type: Number, default: 0},
    hahas: {type: Number, default: 0},
    sads: {type: Number, default: 0},
    wows: {type: Number, default: 0}
});

    
module.exports = mongoose.model('Publication', PublicationSchema);