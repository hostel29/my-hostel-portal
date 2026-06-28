const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');


// 🔐 SECURITY
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');


// ☁️ CLOUDINARY
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


const app = express();


// ======================================================
// 🔐 BASIC SECURITY
// ======================================================

app.use(helmet());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    message: "⚠️ Too many requests. Try again later."
});

app.use(limiter);

app.use(mongoSanitize());

app.use(xss());

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

app.set('trust proxy', 1);


// ======================================================
// 📦 BODY PARSER
// ======================================================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// ======================================================
// ☁️ CLOUDINARY CONFIG
// ======================================================

cloudinary.config({
    cloud_name: 'dhg4qy5rw',
    api_key: '492175456555184',
    api_secret: 'nPJYcf47rjH56k2cNQtIi6etBLA'
});


// ======================================================
// 📂 CLOUDINARY STORAGE
// ======================================================

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: async (req, file) => ({

        folder: 'hostel_photos',

        allowed_formats: [
            'jpg',
            'jpeg',
            'png',
            'webp',
            'pdf'
        ],

        resource_type: 'auto'
    })
});


// ======================================================
// 📂 SAFE FILE UPLOAD
// ======================================================

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedMime = [

            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf'

        ];

        if (allowedMime.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error('❌ Invalid file type'));

        }
    }

});


// ======================================================
// 📂 MULTIPLE FILES
// ======================================================

const uploadMiddleware = upload.fields([

    { name: 'studentPhoto', maxCount: 1 },
    { name: 'studentSignature', maxCount: 1 },
    { name: 'studentAadharFile', maxCount: 1 },
    { name: 'fatherAadharFile', maxCount: 1 },
    { name: 'motherAadharFile', maxCount: 1 },
    { name: 'casteCertFile', maxCount: 1 },
    { name: 'residenceCertFile', maxCount: 1 },
    { name: 'incomeCertFile', maxCount: 1 },
    { name: 'distanceCertFile', maxCount: 1 },
    { name: 'ayushmanFile', maxCount: 1 },
    { name: 'rationCardFile', maxCount: 1 },
    { name: 'resultFile', maxCount: 1 },
    { name: 'hostelLogo', maxCount: 1 },
    { name: 'w1PhotoFile', maxCount: 1 },
    { name: 'w2PhotoFile', maxCount: 1 }

]);


// ======================================================
// 🌐 DATABASE CONNECTION
// ======================================================

const mongoURI = "mongodb+srv://surajpurprimatricsthostelsuraj_db_user:HostelSurajpur2026@cluster0.jztdqxu.mongodb.net/hostelData?appName=Cluster0";


mongoose.connect(mongoURI)

.then(() => {

    console.log("✅ MongoDB Connected");

})

.catch((err) => {

    console.log("❌ MongoDB Error:", err);

});
