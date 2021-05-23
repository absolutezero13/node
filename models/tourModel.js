const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal 40'],
      minlength: [10, 'A tour name must have more or equal 10']
      // validate: [validator.isAlpha, 'Tour name must only contain character']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have durationnn']
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have grooouupp sizeee']
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have diffff!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Wrong difficulty'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1'],
      max: [5, 'rating must be belove 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 4.5
    },
    price: {
      type: Number,
      required: [true, 'Tour must have price kekw']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have price image']
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    startLocation: {
      //geoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Doc middleware runs before save() and create()

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => {
//     return User.findById(id);
//   });

//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('save doccc');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);

//   next();
// });

// Query middleware

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms`);
  this.find({ secretTour: { $ne: true } });

  next();
});

// Agregation middleware

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
