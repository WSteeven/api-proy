var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Publication = require('../models/publication');
var Comment = require('../models/comment');

function probando(req, res) {
    res.status(200).send({
        message: `Hola desde el controlador de Comentarios. Lanzate a comentar las publicaciones de tus amigos`
    });
}

//guardar un comentario que se hace en una publicacion
function saveComment(req, res) {
    var params = req.body;

    if (!params.text) return res.status(200).send({ message: 'Debes enviar un texto' });
    var comment = new Comment;
    comment.text = params.text;
    comment.file = null;
    comment.created_at = moment().unix();
    //estos dos son objetos a los que se debe enlazar
    comment.user = req.user.sub;
    comment.publication = params.publication;

    comment.save((err, commentStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar el comentario' });

        if (!commentStored) return res.status(404).send({ message: 'El comentario no se ha guardado' });

        return res.status(200).send({ comment: commentStored });
    });
}

//obtener todos los comentarios de una publicacion
function getComments(req, res){
    /*
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
        if(err) return res.status(200).send({message: 'Error al devolver el seguimiento'});

        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        follows_clean.push(req.user.sub);
        
        Publication.find({user: {"$in": follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if(err) return res.status(500).send({message: 'Error al devolver publicaciones'});
 
            if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total/itemsPerPage),
                page: page,
                items_per_page: itemsPerPage,
                publications
            });
        });
    });
    */
}

/**
 * El siguiente metodo podría usarse para obtener todos los comentarios
 * de una publicación. Change your mind
 * @param {*} req 
 * @param {*} res 
 */
/*
function getPublicationsUser(req, res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var user = req.user.sub;
    if(req.params.user){
        user = req.params.user;
    }

    var itemsPerPage = 4;
    
    Publication.find({user: user}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
        if(err) return res.status(500).send({message: 'Error al devolver publicaciones'});

        if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

        return res.status(200).send({
            total_items: total,
            pages: Math.ceil(total/itemsPerPage),
            page: page,
            items_per_page: itemsPerPage,
            publications
        });
    });
}
 */

//obtener un comentario de una publicacion 
function getComment(req, res) {
    var commentId = req.params.id;

    Comment.findById(commentId, (err, comment) => {
        if (err) return res.status(500).send({ message: 'Error al devolver el comentario' });

        if (!comment) return res.status(404).send({ message: 'No existe el comentario' });

        return res.status(200).send({ comment });
    });
}
//borrar un comentario, solo la persona dueña del comentario lo puede borrar
async function deleteComment(req, res) {
    var commentId = req.params.id;

    var comentario = await Comment.findById(commentId, (err, comment) => {
        if (err) return res.status(500).send({ message: 'Error al devolver el comentario' });

        if (!comment) return res.status(404).send({ message: 'No existe el comentario' });
        return comment;
    });
    console.log({comment: comentario.user, user: req.user.sub}); //Comprobación del usuario
    if (comentario.user == req.user.sub) {
        console.log('Entró?');
        Comment.find({ 'user': req.user.sub, '_id': commentId }).remove(err => {
            if (err) return res.status(500).send({ message: 'Error al borrar comentario'});

            return res.status(200).send({ message: 'Comentario eliminado correctamente'});
        });
    }else{
        return res.status(500).send({ message: 'Este usuario no puede eliminar el mensaje, no es su propietario' });
    }
}

//subir archivos adjuntos en los comentarios 
function uploadImage(req, res){
    var commentId = req.params.id;    
    
    if(req.files){
        var file_path = req.files.image.path;
        console.log(file_path);
        
        var file_split = file_path.split('\\');
        console.log(file_split);

        var file_name = file_split[3];
        console.log(file_name);
        
        var ext_split = file_name.split('\.');
        console.log(ext_split);

        var file_ext = ext_split[1];
        console.log(file_ext);  
        
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            
            Comment.findOne({'user':req.user.sub, '_id':commentId}).exec((err, comment) => {
                console.log(comment);
                
                if(comment){
                    //actualizar documento de comentario
                    Comment.findByIdAndUpdate(commentId, {file: file_name}, {new:true}, (err, commentUpdated) => {
                        if(err) return res.status(500).send({message: 'Error en la peticion'});

                        if(!commentUpdated) return res.status(404).send({message: 'No se ha podido actualizar el comentario'});
                        
                        return res.status(200).send({comment: commentUpdated});
                    });
                }else{
                    return removeFilesUploads(res, file_path, 'No tienes permiso para actualizar este comentario');
                }
            });
        }else{
            return removeFilesUploads(res, file_path, 'Extension no valida');
        }
    }else{
        return res.status(200).send({message: 'No se han subido imagenes'});
    }
}

function removeFilesUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    });
}

function getImageFile(req, res){    
    var image_file = req.params.imageFile;
    var path_file = './api/uploads/comments/'+image_file;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}



module.exports = {
    probando,
    saveComment,
    getComment,
    deleteComment,
    uploadImage, 
    getImageFile
};
