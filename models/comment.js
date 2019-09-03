'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = Schema({
    publication: {type: Schema.ObjectId, ref: 'Publication'},
    user: {type: Schema.ObjectId, ref: 'User'},
    text: String,
    file: String,
    created_at: String,
});
    
module.exports = mongoose.model('Comment', CommentSchema);