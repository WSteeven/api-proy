'use strict'

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function saveFollow(req, res){
    var params =  req.body;
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;
    follow.save((err, followStored) => {
        if(err) res.status(500).send({message: 'Error al guardar el seguimiento'});
        if(!followStored) res.status(404).send({message: 'El seguimiento no se ha guardado'});
        return res.status(200).send({follow: followStored});
    });
}

function deleteFollow(req, res){
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({'user': userId, 'followed': followId}).remove(err => {
        if (err) return res.status(500).send({message: 'Error al dejar de seguir'});
        return res.status(200).send({message: 'El follow se ha eliminado'});
    })
}

function getFollowingUsers(req, res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemPerPage = 4;

    Follow.find({user: userId}).populate({path: 'followed'}).paginate(page, itemPerPage, (err, follows, total) => {
        if(err) return res.status(500).send({message: 'Error en el servidor'});
        
        if(!follows) return res.status(404).send({message: 'No estas siguiendo a ningun usuario'});
        
        followUserIds(req.user.sub).then((value) => {
            return res.status(500).send({
                total: total,
                pages: Math.ceil(total/itemPerPage),
                follows,
                users_following: value.following,
                users_follow_me: value.followed
            });
        });
    });
}

async function followUserIds(user_id) {
    var following = await Follow.find({ "user": user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec().then((follows) => {
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        return follows_clean;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec().then((follows) => {
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.user);
        });

        return follows_clean;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed
    }
}

function getFollowedUsers(req, res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemPerPage = 4;

    Follow.find({followed: userId}).populate('user').paginate(page, itemPerPage, (err, follows, total) => {
        if(err) return res.status(500).send({message: 'Error en el servidor'});

        if(!follows) return res.status(404).send({message: 'No te sigue ningun usuario'});

        return res.status(500).send({
            total: total,
            pages: Math.ceil(total/itemPerPage),
            follows
         });
    });
}

//devolver listado de usuarios
function getMyFollows(req, res) {
    var userId = req.user.sub;
    
    var find = Follow.find({user: userId});

    if(req.params.followed){
         find = Follow.find({followed: userId});
    }

    find.populate('user followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error en el servidor'});
        
        if(!follows) return res.status(404).send({message: 'No sigues ningun usuario'});

        return res.status(200).send({follows}); 
    });
}

module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}