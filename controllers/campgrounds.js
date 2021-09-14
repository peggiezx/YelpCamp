const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index' ,{campgrounds})
} 

module.exports.renderNewForm = (req, res) => {  
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    if (campground.geometry) {
        campground.geometry = geoData.body.features[0].geometry;
    } 
    campground.author = req.user._id;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    console.log(campground.geometry);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async(req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //console.log(campground);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async(req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    //check if campground exists
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    //check if you are the owner
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async(req, res) => {
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        console.log(campground)
    }
    
    await campground.save();
    req.flash('success','Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}