const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');

const favoriteRouter = express.Router();
const cors = require('./cors');

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res,) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user:req.user._id})
        .populate('user')
        .populate('campsites')
        .then(favorite => {
          console.log(favorite);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        })
        .catch(err => next(err));
      })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach((f) => {
                        if (!favorite.campsites.includes(f._id)) {
                            favorite.campsites.push(f._id);
                        }
                    })
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            console.log('Favorite Created', favorite);
                            if (!favorite.campsites.includes(f._id)) {
                                favorite.campsites.push(f._id);
                            }
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(response => {
                if (!req.user._id) {
                    res.end("You do not have any favorites to delete");
                    res.json(response);
                }
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(403))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(favorite => {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end("This campsite is already a favorite");
                    }
                } else {
                    Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findByIdAndUpdate(req.params.campsiteId, { $set: req.body }, { new: true })
            .then(favorite => {
                res.statusCode = 403;
                res.end("Operation is not supported")
                res.json(favorite);
            })
            .catch(err => next(err));
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user:req.user._id})
        .then(favorite => {
          if (favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId)
            if (index >= 0) {
              favorite.campsites.splice(index, 1)
            } 
            favorite.save()
            .then(favorite => {
              Favorite.findById(favorite._id)
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              })
              .catch(err => next(err));
            })
          .catch(err => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          }
        })
        .catch(err => next(err));
      });


module.exports = favoriteRouter;