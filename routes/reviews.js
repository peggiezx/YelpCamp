const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');

const reviews = require('../controllers/reviews')

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
//POST a review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//DELETE a Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, validateReview, catchAsync(reviews.deleteReview))

module.exports = router;