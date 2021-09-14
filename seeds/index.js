const mongoose = require('mongoose');
const campground = require('../models/campground');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
   for (let i = 0; i < 200; i++) {
       const random1000 = Math.floor(Math.random() * 1000);
       const price = Math.floor(Math.random() * 20) + 10;
       const camp = new Campground({
           author: '6137c9b434aeeee511a50eee',
           location : `${cities[random1000].city}, ${cities[random1000].state}`,
           title: `${sample(descriptors)} ${sample(places)}`,
           description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel ab ut dignissimos repellat saepe impedit unde consectetur aperiam fuga cupiditate architecto, pariatur nobis perferendis quam laborum quasi suscipit? Ducimus, ipsa.',
           price,
           geometry: { 
               type: 'Point', 
               coordinates: [
                   cities[random1000].longitude,
                   cities[random1000].latitude

            ] },
           images: [          
                {
                  url: 'https://res.cloudinary.com/peggiexplode/image/upload/v1631541588/YelpCamp/ipd2ekvxzkpsder2vsqr.jpg',
                  filename: 'YelpCamp/ipd2ekvxzkpsder2vsqr',
                },
                {
                  url: 'https://res.cloudinary.com/peggiexplode/image/upload/v1631541588/YelpCamp/dkusje7dqsndcn4rztqq.jpg',
                  filename: 'YelpCamp/dkusje7dqsndcn4rztqq',
                },
                {
                  url: 'https://res.cloudinary.com/peggiexplode/image/upload/v1631541588/YelpCamp/m7i3m8ibfdzv5maspzxj.jpg',
                  filename: 'YelpCamp/m7i3m8ibfdzv5maspzxj',
                }
              
            ]
        })
       await camp.save();
   }
}

seedDB().then(() => {
    mongoose.connection.close();
})