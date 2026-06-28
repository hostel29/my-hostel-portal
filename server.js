const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

cloudinary.config({
    cloud_name: 'dhg4qy5rw', 
    api_key: '492175456555184', 
    api_secret: 'nPJYcf47rjH56k2cNQtIi6etBLA' 
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'hostel_photos', allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'webp'] }
});

const uploadMiddleware = multer({ storage: storage }).fields([
    { name: 'studentPhoto', maxCount: 1 }, { name: 'studentSignature', maxCount: 1 },
    { name: 'studentAadharFile', maxCount: 1 }, { name: 'fatherAadharFile', maxCount: 1 },
    { name: 'motherAadharFile', maxCount: 1 }, { name: 'casteCertFile', maxCount: 1 },
    { name: 'residenceCertFile', maxCount: 1 }, { name: 'incomeCertFile', maxCount: 1 },
    { name: 'distanceCertFile', maxCount: 1 }, { name: 'ayushmanFile', maxCount: 1 },
    { name: 'rationCardFile', maxCount: 1 }, { name: 'resultFile', maxCount: 1 },
    { name: 'hostelLogo', maxCount: 1 }, { name: 'w1PhotoFile', maxCount: 1 },
    { name: 'w2PhotoFile', maxCount: 1 }, { name: 'meritFile', maxCount: 1 }
]);

mongoose.connect("mongodb+srv://surajpurprimatricsthostelsuraj_db_user:HostelSurajpur2026@cluster0.jztdqxu.mongodb.net/hostelData?appName=Cluster0");

// Schemas & Models
const Student = mongoose.model('Student', new mongoose.Schema({ id: String, appNo: String, studentName: String, dob: String, aadharCard: String, mobile: String, fatherName: String, motherName: String, annualIncome: Number, category: String, subCast: String, permanentAddress: String, blockName: String, districtName: String, homeDistance: Number, studentClass: String, course: String, collegeName: String, prevPercent: String, photoUrl: String, signatureUrl: String, resultUrl: String, studentAadharUrl: String, fatherAadharUrl: String, motherAadharUrl: String, casteCertUrl: String, residenceCertUrl: String, incomeCertUrl: String, distanceCertUrl: String, ayushmanUrl: String, rationCardUrl: String, isRenewal: Boolean, roomNumber: String, approved: Boolean, date: String }));
const Archive = mongoose.model('Archive', new mongoose.Schema({ studentMobile: String, studentName: String, history: Array, yearsActive: Number }));
const Notice = mongoose.model('Notice', new mongoose.Schema({ text: String, date: String }));
const Warden = mongoose.model('Warden', new mongoose.Schema({ w1Name: String, w1Desig: String, w1Mobile: String, w1Office: String, w1Photo: String, w2Name: String, w2Desig: String, w2Mobile: String, w2Office: String, w2Photo: String, helpLineNumber: String }));
const Logo = mongoose.model('Logo', new mongoose.Schema({ url: String }));
const Setting = mongoose.model('Setting', new mongoose.Schema({ photoActive: Boolean, signatureActive: Boolean, aadharActive: Boolean, resultActive: Boolean, casteActive: Boolean, resActive: Boolean, rationActive: Boolean, meritListLink: String }));

const getDynamicSession = () => {
    const now = new Date(); const currentYear = now.getFullYear(); const currentMonth = now.getMonth() + 1;
    return (currentMonth >= 6 && now.getDate() >= 5) ? (currentYear + "-" + String(currentYear + 1).slice(-2)) : ((currentYear - 1) + "-" + String(currentYear).slice(-2));
};

// Routes
app.get('/', async (req, res) => {
    // [Main Home Page Route Code Here - (As discussed in previous parts)]
    // Important: Keep all the logic for translation script here.
});

app.post('/submit-form', (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        if (err) return res.status(500).send("Upload Form Error");
        try {
            // [Full Submission Logic with Archive support]
            res.redirect('/get-receipt-view?mobile=' + req.body.mobile);
        } catch (e) { res.status(500).send("Error"); }
    });
});

app.get('/view-students', async (req, res) => {
    // Admin Panel logic with Notice Deletion
});

app.post('/delete-notice', async (req, res) => {
    await Notice.deleteOne({ _id: req.body.noticeId });
    res.json({ success: true });
});

app.post('/update-merit', uploadMiddleware, async (req, res) => {
    let config = await Setting.findOne({});
    if (req.files && req.files['meritFile']) config.meritListLink = req.files['meritFile'][0].path;
    else if (req.body.meritListLink) config.meritListLink = req.body.meritListLink;
    await config.save(); res.redirect('/view-students');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('🚀 Server running perfectly...'));
