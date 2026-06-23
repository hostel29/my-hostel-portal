const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// 🛑 Cloudinary Configuration
cloudinary.config({
    cloud_name: 'dhg4qy5rw', 
    api_key: '492175456555184', 
    api_secret: 'nPJYcf47rjH56k2cNQtIi6etBLA' 
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hostel_photos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
    },
});

const uploadMiddleware = multer({ storage: storage }).fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'studentSignature', maxCount: 1 },
    { name: 'studentAadharFile', maxCount: 1 }, // 📄 छात्र आधार फ़ाइल इनपुट
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

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mongoURI = "mongodb+srv://surajpurprimatricsthostelsuraj_db_user:HostelSurajpur2026@cluster0.jztdqxu.mongodb.net/hostelData?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("🎰 मोंगोडीबी क्लाउड तिजोरी कनेक्ट हो गई है!"))
    .catch(err => console.error("❌ मोंगोडीबी कनेक्शन एरर:", err));

const StudentSchema = new mongoose.Schema({
    id: String, appNo: String, studentName: String, dob: String, aadharCard: String, mobile: String,
    fatherName: String, motherName: String, annualIncome: Number, category: String, subCast: String,
    permanentAddress: String, blockName: String, districtName: String, homeDistance: Number,
    studentClass: String, course: String, collegeName: String, prevPercent: String, photoUrl: String,
    signatureUrl: { type: String, default: "" }, resultUrl: { type: String, default: "" },
    studentAadharUrl: { type: String, default: "" }, // 📄 डेटाबेस आधार ट्रैकर लिंक
    fatherAadharUrl: { type: String, default: "" }, motherAadharUrl: { type: String, default: "" },
    casteCertUrl: { type: String, default: "" }, residenceCertUrl: { type: String, default: "" },
    incomeCertUrl: { type: String, default: "" }, distanceCertUrl: { type: String, default: "" },
    ayushmanUrl: { type: String, default: "" }, rationCardUrl: { type: String, default: "" },
    isRenewal: { type: Boolean, default: false },
    roomNumber: { type: String, default: "अभी अलॉट नहीं हुआ" }, approved: { type: Boolean, default: false },
    date: String
});
const Student = mongoose.model('Student', StudentSchema);

const NoticeSchema = new mongoose.Schema({ text: String, date: String });
const Notice = mongoose.model('Notice', NoticeSchema);

const WardenSchema = new mongoose.Schema({
    w1Name: String, w1Desig: String, w1Mobile: String, w1Office: String, w1Photo: String,
    w2Name: String, w2Desig: String, w2Mobile: String, w2Office: String, w2Photo: String
});
const Warden = mongoose.model('Warden', WardenSchema);

const LogoSchema = new mongoose.Schema({ url: String });
const Logo = mongoose.model('Logo', LogoSchema);

const SettingSchema = new mongoose.Schema({
    photoActive: { type: Boolean, default: true },
    signatureActive: { type: Boolean, default: true },
    aadharActive: { type: Boolean, default: true },
    resultActive: { type: Boolean, default: true },
    casteActive: { type: Boolean, default: true },
    resActive: { type: Boolean, default: true },
    rationActive: { type: Boolean, default: true },
    meritListLink: { type: String, default: "" }
});
const Setting = mongoose.model('Setting', SettingSchema);

const defaultWarden = {
    w1Name: "श्री पवन कुमार", w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: "9329088615", w1Office: "कार्यालय कक्ष 01", w1Photo: "https://via.placeholder.com/150",
    w2Name: "सहायक अधीक्षक", w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: "9999999999", w2Office: "कार्यालय कक्ष 02", w2Photo: "https://via.placeholder.com/150"
};
const defaultLogo = { url: "https://via.placeholder.com/800x250?text=PRE+MATRIC+BOYS+HOSTEL+SURAJPUR" };
const defaultSetting = { photoActive: true, signatureActive: true, aadharActive: true, resultActive: true, casteActive: true, resActive: true, rationActive: true, meritListLink: "" };

// 📅 डायनामिक सत्र ऑटो-कैलकुलेटर स्क्रिप्ट (5 जून को बदल जाएगा)
const getDynamicSession = () => {
    const now = new Date(); const currentYear = now.getFullYear(); const currentMonth = now.getMonth() + 1;
    if (currentMonth >= 6 && now.getDate() >= 5) { return currentYear + "-" + (String(currentYear + 1).slice(-2)); }
    else { return (currentYear - 1) + "-" + (String(currentYear).slice(-2)); }
};
// 🏠 मुख्य पृष्ठ
app.get('/', async (req, res) => {
    try {
        const students = await Student.find({});
        const notices = await Notice.find({}).sort({ _id: -1 });
        const warden = await Warden.findOne({}) || defaultWarden;
        const logo = await Logo.findOne({}) || defaultLogo;
        const config = await Setting.findOne({}) || defaultSetting;
        const sessionVal = getDynamicSession();

        const stApproved = students.filter(s => s.approved === true && s.category && s.category.includes('ST')).length;
        const scApproved = students.filter(s => s.approved === true && s.category && s.category.includes('SC')).length;
        const stAvailable = Math.max(0, 100 - stApproved);
        const scAvailable = Math.max(0, 50 - scApproved);

        let h = '<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
        h += '<title>PRE MATRIC ST+SC BOYS HOSTEL SURAJPUR</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
        h += '<style>body { background-color: #f4f6f9; color: #212529; font-family: sans-serif; } .navbar { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important; } .card { background-color: #ffffff; border: none; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.03); } .logo-container { width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 25px; background: #fff; text-align: center; border: 1px solid #dee2e6; } .logo-img { width: 100%; height: auto; max-height: 320px; display: block; margin: 0 auto; object-fit: contain; padding: 5px; } .premium-btn { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; text-align: center; text-decoration: none; display: block; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); } .premium-btn:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.06); } .premium-btn.reg { border-bottom: 5px solid #0d6efd; } .premium-btn.ren { border-bottom: 5px solid #ffc107; } .premium-btn.stat { border-bottom: 5px solid #198754; } .tracker-card { background: #ffffff; border-radius: 14px; border-top: 4px solid #3b82f6; box-shadow: 0 4px 6px rgba(0,0,0,0.01); } .tracker-card.sc { border-top: 4px solid #10b981; } .whatsapp-btn-w { background: #25d366; color: white; border: none; padding: 6px 12px; font-weight: bold; font-size:11px; border-radius: 20px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; margin-top: 5px; } .whatsapp-btn-w:hover { background: #128c7e; color: white; }</style></head><body>';
        
        h += '<nav class="navbar navbar-expand-lg navbar-dark mb-4 shadow-sm py-3"><div class="container"><a class="navbar-brand fw-bold text-warning fs-4" href="/">🏢 PRE MATRIC ST+SC BOYS HOSTEL SURAJPUR</a><div class="navbar-nav ms-auto"><a class="nav-link btn btn-outline-warning text-white px-4 py-1" href="/view-students" target="_blank">🔒 Administrative Login</a></div></div></nav>';
        h += '<div class="container"><div class="row mb-4"><div class="col-12 text-center"><button class="btn btn-danger fw-bold shadow px-5 py-2.5 rounded-pill text-warning fs-5" style="border: 2px solid #ffc107;" data-bs-toggle="modal" data-bs-target="#rulesModal">📜 छात्रावास आवश्यक नियम एवं अनिवार्य अनुशासन निर्देशिका (टच करें) ➔</button></div></div>';
        
        h += '<div class="row g-3 mb-4 text-center">';
        h += '<div class="col-md-6"><div class="card p-3 tracker-card h-100"><span class="text-secondary small fw-bold">अनुसूचित जनजाति (ST) सीट ट्रैकर</span><div class="d-flex justify-content-around align-items-center mt-2"><div><small class="text-muted">कुल सीटें</small><h4 class="fw-bold text-primary mb-0">100</h4></div><div><small class="text-muted">कन्फर्म</small><h4 class="fw-bold text-success mb-0">' + stApproved + '</h4></div><div><small class="text-muted">खाली सीटें</small><h4 class="fw-bold text-danger mb-0">' + stAvailable + '</h4></div></div></div></div>';
        h += '<div class="col-md-6"><div class="card p-3 tracker-card sc h-100"><span class="text-secondary small fw-bold">अनुसूचित जाति (SC) सीट ट्रैकर</span><div class="d-flex justify-content-around align-items-center mt-2"><div><small class="text-muted">कुल सीटें</small><h4 class="fw-bold text-primary mb-0">50</h4></div><div><small class="text-muted">कन्फर्म</small><h4 class="fw-bold text-success mb-0">' + scApproved + '</h4></div><div><small class="text-muted">खाली सीटें</small><h4 class="fw-bold text-danger mb-0">' + scAvailable + '</h4></div></div></div></div></div>';

        h += '<div class="row g-4"><div class="col-md-8"><div class="logo-container shadow-sm"><img src="' + logo.url + '" alt="Hostel Logo" class="logo-img"></div><div class="card p-3 mb-4 shadow-sm"><div class="card-header bg-danger text-white rounded mb-2 fw-bold fs-6">Notice Board</div><ul class="list-group list-group-flush">';
        if(notices.length === 0) { h += "<li class='text-muted text-center p-3'>कोई नया नोटिस नहीं है।</li>"; } 
        else { notices.forEach(n => { h += "<li class='list-group-item bg-white text-dark border-bottom mb-1 p-2'><b class='text-danger'>[" + n.date + "]:</b> " + n.text + "</li>"; }); }
        h += '</ul></div><hr class="my-4 border-secondary opacity-25">';
        
        h += '<div class="row g-4 mb-5"><div class="col-6 col-md-4"><a href="/registration-form" class="premium-btn reg text-dark shadow-sm"><span style="font-size: 35px; display:block;" class="mb-1">📝</span><h6 class="fw-bold text-primary">नवीन प्रवेश फॉर्म</h6><span class="badge bg-primary px-2 py-0.5 my-1" style="font-size:10px;">सत्र ' + sessionVal + '</span></a></div>';
        h += '<div class="col-6 col-md-4"><a href="/renewal-form" class="premium-btn ren text-dark shadow-sm"><span style="font-size: 35px; display:block;" class="mb-1">🔄</span><h6 class="fw-bold text-dark">हॉस्टल नवीनीकरण</h6><span class="badge bg-warning text-dark px-2 py-0.5 my-1" style="font-size:10px;">पुराने छात्र</span></a></div>';
        h += '<div class="col-12 col-md-4"><a href="/check-status-page" class="premium-btn stat text-dark shadow-sm"><span style="font-size: 35px; display:block;" class="mb-1">🔍</span><h6 class="fw-bold text-success">अलॉटमेंट स्टेटस</h6><span class="badge bg-success px-2 py-0.5 my-1" style="font-size:10px;">प्रोफाइल / रसीद</span></a></div></div></div>';
        
        // ✨ [ADVANCED HELP CENTER] वॉर्डन सहायता केंद्र का कड़क लेआउट
        h += '<div class="col-md-4"><div class="card p-3 text-center mb-4 border-top border-warning border-4 shadow-sm"><div class="card-header bg-light text-dark fw-bold rounded mb-3 border-0 fs-6">👨‍💼 हॉस्टल अधीक्षक सहायता केंद्र</div><div class="row g-2">';
        h += '<div class="col-6 border-end"><img src="' + warden.w1Photo + '" class="rounded border mb-2 shadow-sm" style="width: 85px; height: 85px; object-fit: cover;" onerror="this.src=\'https://via.placeholder.com/150\'\"><h6 class="fw-bold text-dark mb-0 small">' + warden.w1Name + '</h6><small class="text-muted block" style="font-size:9px;">' + warden.w1Desig + '</small><div class="text-start bg-light p-1.5 rounded border mt-2" style="font-size:9px;"><b>🏢:</b> ' + warden.w1Office + '</div><a href="https://wa.me/91' + warden.w1Mobile + '?text=Namaste_Sir" target="_blank" class="whatsapp-btn-w">💬 चैट सपोर्ट</a></div>';
        h += '<div class="col-6"><img src="' + warden.w2Photo + '" class="rounded border mb-2 shadow-sm" style="width: 85px; height: 85px; object-fit: cover;" onerror="this.src=\'https://via.placeholder.com/150\'\"><h6 class="fw-bold text-dark mb-0 small">' + warden.w2Name + '</h6><small class="text-muted block" style="font-size:9px;">' + warden.w2Desig + '</small><div class="text-start bg-light p-1.5 rounded border mt-2" style="font-size:9px;"><b>🏢:</b> ' + warden.w2Office + '</div><a href="https://wa.me/91' + warden.w2Mobile + '?text=Namaste_Sir" target="_blank" class="whatsapp-btn-w">💬 चैट सपोर्ट</a></div></div></div>';
        
        let meritTarget = config.meritListLink ? config.meritListLink : '/public-admission-list';
        h += '<div class="card p-3 shadow-sm border-top border-success border-4"><div class="card-header bg-light text-success fw-bold rounded mb-2 border-0 fs-6 text-center">📋 फाइनल मेरिट चयन सूची</div><a href="' + meritTarget + '" target="_blank" class="btn btn-sm btn-success w-100 fw-bold py-2 mt-1 rounded-3">सूची देखें ➔</a></div></div></div></div>';
        
        h += '<div class="modal fade" id="rulesModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content text-dark"><div class="modal-header bg-danger text-white"><h5 class="modal-title fw-bold text-warning">📜 आवश्यक नियम एवं नियमावली</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div><div class="modal-body p-4" style="font-size: 15px; line-height: 1.8;"><ol class="fw-bold text-secondary"><li class="mb-2">छात्रावास में प्रवेशित छात्र को छात्रावास में भोजन (मेस) करना अनिवार्य है।</li><li class="mb-2">स्थानीय शिक्षण संस्था में छात्र को नियमित प्रवेश व उपस्थिति अनिवार्य है।</li><li class="mb-2">बिना सूचना के लगातार अनुपस्थित रहने पर छात्र को छात्रावास से निष्कासित किया जा सकेगा।</li><li class="mb-2">अप्रवेशी छात्र को बिना अधीक्षक की लिखित अनुमति के ठहराना वर्जित है।</li><li class="mb-2">मादक पदार्थों एवं मद्यपान का सेवन करने पर तत्काल निष्कासित किया जा सकेगा।</li></ol></div></div></div></div>';
        h += '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script></body></html>';
        
        res.send(h);
    } catch (err) { res.status(500).send("Error loading home page"); }
});
const fileValidationScript = '<script>function validateFile(input, minKB, maxKB, allowedFormats) { const file = input.files[0]; if (!file) return true; const fileSizeKB = file.size / 1024; const ext = file.name.split(".").pop().toLowerCase(); if (!allowedFormats.includes(ext)) { alert("❌ केवल " + allowedFormats.join(", ") + " फॉर्मेट ही मान्य है।"); input.value = ""; return false; } if (fileSizeKB < minKB || fileSizeKB > maxKB) { alert("❌ फ़ाइल का साइज़ " + minKB + "KB से " + maxKB + "KB के बीच होना अनिवार्य है।"); input.value = ""; return false; } return true; }</script>';

app.get('/registration-form', (req, res) => {
    const sessionVal = getDynamicSession();
    let f = '<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>प्रवेश हेतु आवेदन पत्र ' + sessionVal + '</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{ background-color: #f8f9fa; } .section-title { background-color: #e9ecef; padding: 6px 12px; font-weight: bold; border-left: 4px solid #0d6efd; margin-top: 15px; margin-bottom: 15px; color: #333; }</style></head><body class="p-2 p-md-4"><div class="container" style="max-width: 950px;"><div class="card p-3 p-md-4 shadow shadow-sm bg-white border-0"><div class="text-center mb-3"><h5 class="text-muted mb-1" style="font-size:12px;">आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन</h5><h3 class="text-primary fw-bold fs-4">छात्रावास में प्रवेश हेतु आवेदन पत्र (नवीन)</h3><h6 class="fw-bold">वर्ष ' + sessionVal + '</h6></div><form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3"><input type="hidden" name="isRenewal" value="false"><div class="section-title">1. व्यक्तिगत जानकारी, फ़ोटो एवं हस्ताक्षर</div><div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का नाम (आधार के अनुसार):</label><input type="text" name="studentName" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">जन्मतिथि (DOB):</label><input type="date" name="dob" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का वर्ग (Category):</label><select name="category" class="form-select" required><option value="ST">अनुसूचित जनजाति (ST)</option><option value="SC">अनुसूचित जाति (SC)</option></select></div><div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी की जाति:</label><input type="text" name="subCast" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">पालक का मोबाइल नंबर:</label><input type="tel" name="mobile" class="form-control" required></div>';
    f += '<div class="col-md-6"><label class="form-label fw-bold text-danger">📸 छात्र की फोटो (10KB - 100KB, JPG/PNG):</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\'])" required></div>';
    f += '<div class="col-md-6"><label class="form-label fw-bold text-danger">✍️ छात्र के हस्ताक्षर (10KB - 50KB, JPG/PNG):</label><input type="file" name="studentSignature" class="form-control" accept="image/*" onchange="validateFile(this, 10, 50, [\'jpg\',\'jpeg\',\'png\'])" required></div>';
    
    // 📄 [UNIVERSAL EXPLICIT UPLOAD] छात्र आधार फ़ाइल इनपुट विकल्प (PDF/PNG)
    f += '<div class="col-md-12"><label class="form-label fw-bold text-danger">📂 छात्र का आधार कार्ड दस्तावेज़ अपलोड करें (10-100KB, PDF/PNG/JPG):</label><input type="file" name="studentAadharFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div>';
    
    f += '<div class="section-title">2. पारिवारिक विवरण एवं पालक आधार</div><div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div><div class="col-md-6"><label class="form-label text-muted fw-bold">पिता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="fatherAadharFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div><div class="col-md-6"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" required></div><div class="col-md-6"><label class="form-label text-muted fw-bold">माता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="motherAadharFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div><div class="col-md-4"><label class="form-label fw-bold">पालक की वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" required></div>';
    f += '<div class="section-title">3. सरकारी प्रमाण पत्र एवं कार्ड फ़ोटो अपलोड (Max 100KB)</div><div class="col-md-6"><label class="form-label fw-bold text-primary">जाति प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="casteCertFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div><div class="col-md-6"><label class="form-label fw-bold text-primary">निवास प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="residenceCertFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div><div class="col-md-6"><label class="form-label text-muted fw-bold">आय प्रमाण पत्र अपलोड:</label><input type="file" name="incomeCertFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div><div class="col-md-6"><label class="form-label text-muted fw-bold">दूरी प्रमाण पत्र अपलोड:</label><input type="file" name="distanceCertFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div><div class="col-md-6"><label class="form-label text-muted fw-bold">आयुष्मान कार्ड अपलोड:</label><input type="file" name="ayushmanFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div><div class="col-md-6"><label class="form-label fw-bold text-primary">राशन कार्ड फ़ोटो अपलोड (अनिवार्य):</label><input type="file" name="rationCardFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div>';
    f += '<div class="section-title">4. पता एवं विद्यालय विवरण</div><div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" required></div><div class="col-md-3"><label class="form-label fw-bold">विकासखंड:</label><input type="text" name="blockName" class="form-control" required></div><div class="col-md-3"><label class="form-label fw-bold">जिला:</label><input type="text" name="districtName" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">घर से शाला की दूरी (कि.मी.):</label><input type="number" name="homeDistance" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">वर्तमान कक्षा/वर्ष:</label><input type="text" name="studentClass" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">कोर्स / ब्रांच:</label><input type="text" name="course" class="form-control" required></div><div class="col-md-8"><label class="form-label fw-bold">स्कूल / कॉलेज का नाम:</label><input type="text" name="collegeName" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">पिछला परीक्षा प्रतिशत (%):</label><input type="text" name="prevPercent" class="form-control" required></div><div class="col-12 mt-4"><button type="submit" class="btn btn-primary w-100 fw-bold fs-5 shadow-sm">🚀 ऑनलाइन आवेदन पत्र सुरक्षित रूप से जमा करें</button></div></form><div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div></div></div>' + fileValidationScript + '</body></html>';
    res.send(f);
});

app.get('/renewal-form', async (req, res) => {
    const config = await Setting.findOne({}) || defaultSetting; const sessionVal = getDynamicSession();
    let rf = '<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>हॉस्टल नवीनीकरण आवेदन पत्र</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{ background-color: #fff8e7; } .section-title { background-color: #fff3cd; padding: 6px 12px; font-weight: bold; border-left: 4px solid #ffc107; margin-top: 15px; margin-bottom: 15px; color: #664d03; }</style></head><body class="p-2 p-md-4"><div class="container" style="max-width: 900px;"><div class="card p-3 p-md-4 shadow shadow-sm bg-white border-warning"><div class="text-center mb-3"><h3 class="text-warning text-dark fw-bold fs-4">🔄 छात्रावास नवीनीकरण फॉर्म (Renewal Form)</h3><h6 class="fw-bold text-muted">सत्र ' + sessionVal + ' (पुराने छात्रों के लिए)</h6></div><form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3"><input type="hidden" name="isRenewal" value="true"><div class="section-title">1. छात्र की जानकारी व सत्यापन</div><div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का नाम:</label><input type="text" name="studentName" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">पंजीकृत मोबाइल नंबर (वही पुराना नंबर):</label><input type="tel" name="mobile" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">नई कक्षा/वर्ष जिसमें प्रवेश लिया है:</label><input type="text" name="studentClass" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">School / College का नाम:</label><input type="text" name="collegeName" class="form-control" required></div>';
    
    if (config.photoActive) { rf += '<div class="col-md-6"><label class="form-label fw-bold">📸 नई फोटो अपलोड करें (10-100KB):</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\'])" required></div>'; }
    if (config.signatureActive) { rf += '<div class="col-md-6"><label class="form-label fw-bold">✍️ नया हस्ताक्षर अपलोड करें (10-50KB):</label><input type="file" name="studentSignature" class="form-control" accept="image/*" onchange="validateFile(this, 10, 50, [\'jpg\',\'jpeg\',\'png\'])" required></div>'; }
    if (config.aadharActive) { rf += '<div class="col-md-12"><label class="form-label fw-bold">📂 छात्र आधार कार्ड फ़ोटो कॉपी (10-100KB):</label><input type="file" name="studentAadharFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div>'; }
    if (config.resultActive) { rf += '<div class="col-md-12"><label class="form-label fw-bold text-primary">📊 पिछली क्लास का रिजल्ट / मार्कशीट (10-100KB):</label><input type="file" name="resultFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div>'; }
    if (config.casteActive) { rf += '<div class="col-md-4"><label class="form-label fw-bold">जाति प्रमाण पत्र (10-100KB):</label><input type="file" name="casteCertFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div>'; }
    if (config.resActive) { rf += '<div class="col-md-4"><label class="form-label fw-bold">निवास प्रमाण पत्र (10-100KB):</label><input type="file" name="residenceCertFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div>'; }
    if (config.rationActive) { rf += '<div class="col-md-4"><label class="form-label fw-bold">राशन कार्ड फ़ोटो (10-100KB):</label><input type="file" name="rationCardFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this, 10, 100, [\'jpg\',\'jpeg\',\'png\',\'pdf\'])" required></div>'; }
    
    rf += '<div class="col-md-12 mt-4"><button type="submit" class="btn btn-warning text-dark w-100 fw-bold fs-5 shadow-sm">🔄 नवीनीकरण आवेदन सबमिट करें</button></div></form><div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ</a></div></div></div>' + fileValidationScript + '</body></html>';
    res.send(rf);
});
app.get('/check-status-page', (req, res) => {
    res.send('<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>अलॉटमेंट रिजल्ट स्टेटस</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="p-3 p-md-5 bg-light"><div class="container" style="max-width: 650px;"><div class="card p-3 p-md-4 shadow-sm bg-white border border-success mb-4"><h3 class="text-center text-success fw-bold mb-4 fs-4">🔍 छात्रावास अलॉटमेंट रिजल्ट / स्टेटस</h3><div class="input-group mb-3"><input type="tel" id="searchMobile" class="form-control" placeholder="रजिस्टर्ड मोबाइल नंबर दर्ज करें..."><button onclick="checkStatus()" class="btn btn-success fw-bold">रिजल्ट देखें</button></div><div id="statusResult"></div></div><div class="card p-3 p-md-4 shadow-sm bg-white border border-warning"><h4 class="text-center text-warning fw-bold mb-3 fs-5 text-dark">⚠️ आवेदन पत्र में त्रुटि सुधार (Edit Form)</h4><div class="input-group"><input type="tel" id="editMobile" class="form-control" placeholder="अपना रजिस्टर्ड मोबाइल नंबर डालें..."><button onclick="openEditForm()" class="btn btn-warning fw-bold">त्रुटि सुधार खोलें</button></div></div><div class="text-center mt-4"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div></div><script>function checkStatus() { const mobile = document.getElementById("searchMobile").value; if(!mobile) { alert("कृपया मोबाइल नंबर लिखें!"); return; } window.location.href = "/get-receipt-view?mobile=" + mobile; } function openEditForm() { const m = document.getElementById("editMobile").value; if(!m) return alert("नंबर लिखें!"); window.location.href = "/edit-student-form?mobile=" + m; }</script></body></html>');
});

app.get('/get-receipt-view', async (req, res) => {
    try {
        const sData = await Student.findOne({ mobile: req.query.mobile.trim() });
        if (!sData) return res.send("<h2>❌ रिकॉर्ड नहीं मिला!</h2><a href='/'>वापस</a>");
        let badge = sData.approved ? '<span class="badge bg-success p-2 fs-6">✅ ADMISSION CONFIRMED</span>' : '<span class="badge bg-danger p-2 fs-6">⏳ PENDING APPROVAL</span>';

        let rc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>डिजिटल पावती रसीद</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
        rc += '<style>body { background-color: #f1f5f9; } .receipt-box { background: white; border: 4px double #1e293b; max-width: 750px; margin: 15px auto; padding: 20px; border-radius: 8px; position: relative; box-shadow: 0 15px 35px rgba(0,0,0,0.1); } .watermark { position: absolute; top: 35%; left: 15%; font-size: 55px; color: rgba(15, 23, 42, 0.04); transform: rotate(-25deg); font-weight: 900; pointer-events: none; text-transform: uppercase; user-select: none; } .stamp { border: 3px dashed #16a34a; color: #16a34a; transform: rotate(-5deg); display: inline-block; padding: 5px 15px; font-weight: bold; border-radius: 4px; font-size: 13px; } @media print { .no-print { display: none; } body { background: white; } .receipt-box { border: 2px solid #000; box-shadow: none; margin: 0; padding:10px; } }</style></head><body><div class="container"><div class="receipt-box"><div class="watermark">SURAJPUR HOSTEL</div>';
        rc += '<div class="row border-bottom pb-3 mb-4 align-items-center"><div class="col-2 text-center"><img src="https://via.placeholder.com/80?text=GOVT" class="img-fluid"></div><div class="col-8 text-center"><h6 class="text-secondary fw-bold mb-0" style="font-size:10px; letter-spacing:1px;">आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन</h6><h4 class="fw-bold text-dark my-1 fs-5" style="font-family:\'Georgia\',serif;">PRE MATRIC ST+SC BOYS HOSTEL SURAJPUR</h4><span class="badge bg-dark px-3 py-1 text-warning fw-bold" style="font-size:10px;">🔒 डिजिटल पावती रसीद (सत्र ' + getDynamicSession() + ')</span></div><div class="col-2 text-center"><div class="stamp">DIGITAL<br>VERIFIED</div></div></div>';
        rc += '<div class="row mb-4"><div class="col-sm-8"><h5 class="fw-bold text-primary mb-3 fs-6">🎫 रसीद संख्या: <span class="text-danger">' + sData.appNo + '</span></h5><p class="mb-2"><b>विद्यार्थी का नाम:</b> ' + sData.studentName + '</p><p class="mb-2"><b>पिता का नाम:</b> ' + sData.fatherName + '</p><p class="mb-2"><b>पंजीकृत मोबाइल:</b> +91 ' + sData.mobile + '</p><p class="mb-2"><b>प्रकार:</b> ' + (sData.isRenewal ? '<span class="badge bg-warning text-dark">नवीनीकरण (Renewal)</span>' : '<span class="badge bg-primary">नवीन प्रवेश (New)</span>') + '</p></div>';
        rc += '<div class="col-sm-4 text-center mt-3 mt-sm-0"><img src="' + sData.photoUrl + '" class="img-thumbnail shadow-sm mb-2" style="width: 120px; height: 130px; object-fit: cover;" onerror="this.src=\'https://via.placeholder.com/150\'\"><div class="small fw-bold text-secondary mb-1">विद्यार्थी हस्ताक्षर:</div><img src="' + (sData.signatureUrl || 'https://via.placeholder.com/120x40?text=No+Sign') + '" class="border bg-white" style="width:120px; height:40px; object-fit:contain;"><div class="mt-2">' + badge + '</div></div></div>';
        rc += '<table class="table table-bordered bg-light" style="font-size:13px;"><tr><th class="bg-dark text-white" style="width:35%;">वर्तमान कक्षा/वर्ष</th><td>' + sData.studentClass + '</td></tr><tr><th class="bg-dark text-white">स्कूल / कॉलेज का नाम</th><td>' + sData.collegeName + '</td></tr><tr><th class="bg-dark text-white">आबंटित रूम नंबर (Room)</th><td><b class="text-danger fs-6">' + (sData.roomNumber || 'अभी अलॉट नहीं हुआ') + '</b></td></tr><tr><th class="bg-dark text-white">डिजिटल सबमिशन टाइम</th><td>' + sData.date + '</td></tr></table>';
        rc += '<div class="border-top pt-3 mt-4 text-center"><div class="mb-2 text-muted" style="font-size:10px; font-family:\'Courier New\';">||||| Barcode Verified Data Sync |||||</div><p class="small text-muted mb-0">यह रसीद कंप्यूटर जनित है, इसमें किसी भौतिक हस्ताक्षर की आवश्यकता नहीं है।</p></div><div class="text-center mt-4 no-print"><button onclick="window.print()" class="btn btn-primary fw-bold px-4 me-2">🖨️ प्रिंट / PDF सेव करें</button><a href="/" class="btn btn-secondary px-4">🏠 मुख्य पृष्ठ</a></div></div></div></body></html>';
        res.send(rc);
    } catch(e) { res.status(500).send("Receipt view error"); }
});

// 🛠️ [FULL EDIT MASTER CONTROL] त्रुटि सुधार में 100% सभी फील्ड्स और डॉक्यूमेंट एडिट करने की ताक़त
app.get('/edit-student-form', async (req, res) => {
    try {
        const student = await Student.findOne({ mobile: (req.query.mobile || '').trim() });
        if (!student) return res.send("<h1>❌ रिकॉर्ड नहीं मिला!</h1>");

        let editHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>त्रुटि सुधार पैनल</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>.section-title { background-color: #e9ecef; padding: 4px 8px; font-weight: bold; border-left: 4px solid #ffc107; margin-top: 10px; margin-bottom: 10px; }</style></head><body class="p-2 p-md-4 bg-light"><div class="container" style="max-width: 900px;"><div class="card p-3 p-md-4 bg-white border border-warning shadow-sm"><h2 class="text-center text-warning fw-bold mb-4 fs-4 text-dark">🛠️ आवेदन पत्र में त्रुटि सुधार (Full Form Edit Mode)</h2><form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">';
        editHtml += '<input type="hidden" name="mobile" value="' + student.mobile + '"><input type="hidden" name="isRenewal" value="' + student.isRenewal + '">';
        editHtml += '<div class="section-title">1. व्यक्तिगत विवरण संपादन</div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का नाम:</label><input type="text" name="studentName" class="form-control" value="' + (student.studentName || '') + '" required></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" value="' + (student.fatherName || '') + '" required></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" value="' + (student.motherName || '') + '" required></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">जन्मतिथि:</label><input type="date" name="dob" class="form-control" value="' + (student.dob || '') + '" required></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" value="' + (student.aadharCard || '') + '" required></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" value="' + (student.annualIncome || 0) + '" required></div>';
        
        editHtml += '<div class="section-title">2. स्कूल / कॉलेज एवं पता संपादन</div>';
        editHtml += '<div class="col-md-6"><label class="form-label fw-bold">स्कूल / कॉलेज का नाम:</label><input type="text" name="collegeName" class="form-control" value="' + (student.collegeName || '') + '" required></div>';
        editHtml += '<div class="col-md-3"><label class="form-label fw-bold">वर्तमान कक्षा:</label><input type="text" name="studentClass" class="form-control" value="' + (student.studentClass || '') + '" required></div>';
        editHtml += '<div class="col-md-3"><label class="form-label fw-bold">पिछला प्रतिशत (%):</label><input type="text" name="prevPercent" class="form-control" value="' + (student.prevPercent || '') + '" required></div>';
        editHtml += '<div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" value="' + (student.permanentAddress || '') + '" required></div>';
        editHtml += '<div class="col-md-3"><label class="form-label fw-bold">विकासखंड:</label><input type="text" name="blockName" class="form-control" value="' + (student.blockName || '') + '" required></div>';
        editHtml += '<div class="col-md-3"><label class="form-label fw-bold">जिला:</label><input type="text" name="districtName" class="form-control" value="' + (student.districtName || '') + '" required></div>';
        
        editHtml += '<div class="section-title">3. दस्तावेज़ संपादन (बदलने के लिए फ़ाइल चुनें - Max 100KB)</div>';
        editHtml += '<div class="col-md-6"><label class="form-label text-danger fw-bold">📸 छात्र की फ़ोटो बदलें:</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" onchange="validateFile(this,10,100,[\'jpg\',\'jpeg\',\'png\'])"></div>';
        editHtml += '<div class="col-md-6"><label class="form-label text-danger fw-bold">✍️ छात्र के हस्ताक्षर बदलें:</label><input type="file" name="studentSignature" class="form-control" accept="image/*" onchange="validateFile(this,10,50,[\'jpg\',\'jpeg\',\'png\'])"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold text-primary">📂 छात्र आधार बदलें:</label><input type="file" name="studentAadharFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this,10,100,[\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">जाति प्रमाण पत्र बदलें:</label><input type="file" name="casteCertFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this,10,100,[\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">निवास प्रमाण पत्र बदलें:</label><input type="file" name="residenceCertFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this,10,100,[\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">राशन कार्ड बदलें:</label><input type="file" name="rationCardFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this,10,100,[\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold text-success">📊 मार्कशीट रिजल्ट बदलें:</label><input type="file" name="resultFile" class="form-control" accept="image/*,application/pdf" onchange="validateFile(this,10,100,[\'jpg\',\'jpeg\',\'png\',\'pdf\'])"></div>';
        
        editHtml += '<div class="col-12 mt-4"><button type="submit" class="btn btn-warning w-100 text-dark fw-bold">🔄 त्रुटि सुधार के साथ पूरा फॉर्म अपडेट करें</button></div></form></div></div>' + fileValidationScript + '</body></html>';
        res.send(editHtml);
    } catch(err) { res.status(500).send("Error"); }
});
app.post('/submit-form', (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const cleanMobile = req.body.mobile.trim();
            const old = await Student.findOne({ mobile: cleanMobile });
            
            let sData = {
                id: cleanMobile, studentName: req.body.studentName, dob: req.body.dob || (old ? old.dob : ""), aadharCard: req.body.aadharCard,
                mobile: cleanMobile, fatherName: req.body.fatherName, motherName: req.body.motherName || (old ? old.motherName : ""),
                annualIncome: req.body.annualIncome || (old ? old.annualIncome : 0), category: req.body.category || (old ? old.category : "ST"), subCast: req.body.subCast || (old ? old.subCast : ""),
                permanentAddress: req.body.permanentAddress || (old ? old.permanentAddress : ""), blockName: req.body.blockName || (old ? old.blockName : ""), districtName: req.body.districtName || (old ? old.districtName : ""),
                homeDistance: req.body.homeDistance || (old ? old.homeDistance : 0), studentClass: req.body.studentClass, course: req.body.course || "N/A",
                collegeName: req.body.collegeName, prevPercent: req.body.prevPercent || (old ? old.prevPercent : ""),
                isRenewal: req.body.isRenewal === 'true', photoUrl: old ? old.photoUrl : "", signatureUrl: old ? old.signatureUrl : "", studentAadharUrl: old ? old.studentAadharUrl : "", fatherAadharUrl: old ? old.fatherAadharUrl : "", motherAadharUrl: old ? old.motherAadharUrl : "", casteCertUrl: old ? old.casteCertUrl : "", residenceCertUrl: old ? old.residenceCertUrl : "", incomeCertUrl: old ? old.incomeCertUrl : "", distanceCertUrl: old ? old.distanceCertUrl : "", ayushmanUrl: old ? old.ayushmanUrl : "", rationCardUrl: old ? old.rationCardUrl : "", resultUrl: old ? old.resultUrl : "",
                date: new Date().toLocaleString()
            };

            if (req.files) {
                if (req.files['studentPhoto']) sData.photoUrl = req.files['studentPhoto'][0].path;
                if (req.files['studentSignature']) sData.signatureUrl = req.files['studentSignature'][0].path;
                if (req.files['studentAadharFile']) sData.studentAadharUrl = req.files['studentAadharFile'][0].path;
                if (req.files['fatherAadharFile']) sData.fatherAadharUrl = req.files['fatherAadharFile'][0].path;
                if (req.files['motherAadharFile']) sData.motherAadharUrl = req.files['motherAadharFile'][0].path;
                if (req.files['casteCertFile']) sData.casteCertUrl = req.files['casteCertFile'][0].path;
                if (req.files['residenceCertFile']) sData.residenceCertUrl = req.files['residenceCertFile'][0].path;
                if (req.files['incomeCertFile']) sData.incomeCertUrl = req.files['incomeCertFile'][0].path;
                if (req.files['distanceCertFile']) sData.distanceCertUrl = req.files['distanceCertFile'][0].path;
                if (req.files['ayushmanFile']) sData.ayushmanUrl = req.files['ayushmanFile'][0].path;
                if (req.files['rationCardFile']) sData.rationCardUrl = req.files['rationCardFile'][0].path;
                if (req.files['resultFile']) sData.resultUrl = req.files['resultFile'][0].path;
            }

            sData.appNo = "SUR-" + (sData.category || "ST") + "-" + cleanMobile.slice(-4);

            if (old) { await Student.updateOne({ mobile: cleanMobile }, { $set: sData }); }
            else { const newStudent = new Student(sData); await newStudent.save(); }
            res.redirect('/get-receipt-view?mobile=' + cleanMobile);
        } catch (e) { res.status(500).send("Upload Form Error"); }
    });
});

app.get('/view-students', async (req, res) => {
    const auth = { login: 'admin', password: 'password123' }; const b64 = (req.headers.authorization || '').split(' ')[1] || ''; const [login, password] = Buffer.from(b64, 'base64').toString().split(':');
    if (!login || !password || login !== auth.login || password !== auth.password) { res.set('WWW-Authenticate', 'Basic realm="401"'); return res.status(401).send('❌ गलत पासवर्ड!'); }
    
    let currentWarden = await Warden.findOne({}) || defaultWarden;
    let config = await Setting.findOne({}) || defaultSetting;
    let sList = await Student.find({}); let rows = '';
    
    sList.forEach((s, idx) => {
        let actionBtn = s.approved ? '<span class="badge bg-success">Approved</span>' : '<button onclick="approveStudent(\'' + s.id + '\')" class="btn btn-sm btn-primary py-0 px-1">Approve</button>';
        
        let docsLinks = '<div style="display: flex; flex-wrap: wrap; gap: 3px; justify-content: center;">';
        if(s.photoUrl) docsLinks += '<a href="' + s.photoUrl + '" target="_blank" class="btn btn-xs btn-outline-dark p-1" style="font-size:9px; font-weight:bold;">फ़ोटो</a>';
        if(s.signatureUrl) docsLinks += '<a href="' + s.signatureUrl + '" target="_blank" class="btn btn-xs btn-outline-secondary p-1" style="font-size:9px; font-weight:bold;">हस्ताक्षर</a>';
        if(s.studentAadharUrl) docsLinks += '<a href="' + s.studentAadharUrl + '" target="_blank" class="btn btn-xs btn-outline-primary p-1" style="font-size:9px; font-weight:bold; background-color:#eef2ff;">छात्र आधार</a>';
        if(s.fatherAadharUrl) docsLinks += '<a href="' + s.fatherAadharUrl + '" target="_blank" class="btn btn-xs btn-outline-primary p-1" style="font-size:9px; font-weight:bold;">पिता आधार</a>';
        if(s.motherAadharUrl) docsLinks += '<a href="' + s.motherAadharUrl + '" target="_blank" class="btn btn-xs btn-outline-primary p-1" style="font-size:9px; font-weight:bold;">माता आधार</a>';
        if(s.casteCertUrl) docsLinks += '<a href="' + s.casteCertUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">जाति</a>';
        if(s.residenceCertUrl) docsLinks += '<a href="' + s.residenceCertUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">निवास</a>';
        if(s.rationCardUrl) docsLinks += '<a href="' + s.rationCardUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">राशन</a>';
        if(s.resultUrl) docsLinks += '<a href="' + s.resultUrl + '" target="_blank" class="btn btn-xs btn-outline-success p-1" style="font-size:9px; font-weight:bold;">रिजल्ट</a>';
        docsLinks += '</div>';

        let typeBadge = s.isRenewal ? '<span class="badge bg-warning text-dark" style="font-size:10px;">रिन्यूअल</span>' : '<span class="badge bg-primary" style="font-size:10px;">नवीन</span>';
        
        rows += '<tr class="align-middle" style="font-size:12px;"><td>' + (idx + 1) + '</td><td class="text-start"><img src="' + (s.photoUrl || 'https://via.placeholder.com/150') + '" class="rounded-circle me-2" style="width:35px; height:35px; object-fit:cover; border:1px solid #ccc;"><b>' + s.studentName + '</b><br>' + typeBadge + '</td><td>' + s.fatherName + '</td><td>' + s.mobile + '</td><td>' + docsLinks + '</td><td><div class="d-flex justify-content-center"><input type="text" id="room-' + s.id + '" class="form-control form-control-sm me-1" value="' + (s.roomNumber || '') + '" style="width:45px; height:24px; font-size:11px;"><button onclick="saveRoom(\'' + s.id + '\')" class="btn btn-sm btn-dark py-0 px-1" style="font-size:11px;">सेव</button></div></td><td>' + actionBtn + '</td><td><button onclick="secureRemoveStudent(\'' + s.id + '\',\'' + s.studentName + '\')" class="btn btn-sm btn-danger py-0 px-1" style="font-size:11px;">Remove</button></td></tr>';
    });

    let admHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>प्रशासनिक कंट्रोल हब</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="bg-light p-2 p-md-4"><div class="row g-3 mb-4"><div class="col-lg-3 col-md-6"><div class="bg-white border p-3 rounded shadow-sm"><h5>⚙️ लोगो बदलें</h5><form action="/update-logo" method="POST" enctype="multipart/form-data"><input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-primary w-100">अपलोड</button></form><hr><form action="/update-merit" method="POST"><h5>📋 मेरिट लिस्ट PDF लिंक</h5><input type="url" name="meritListLink" class="form-control form-control-sm mb-2" value="' + (config.meritListLink || '') + '" placeholder="https://drive..."><button type="submit" class="btn btn-sm btn-success w-100">लिंक सेव करें</button></form></div></div><div class="col-lg-3 col-md-6"><div class="bg-white border p-3 rounded shadow-sm"><h5 class="text-danger">📢 नया नोटिस जारी करें</h5><form action="/post-notice" method="POST"><input type="text" name="noticeText" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-danger w-100">Notice Board लाइव करें</button></form></div></div>';
    admHtml += '<div class="col-lg-3 col-md-6"><div class="bg-white border p-3 rounded shadow-sm"><h5>⚙️ 2 वॉर्डन विवरण व फ़ोटो</h5><form action="/update-warden" method="POST" enctype="multipart/form-data" class="row g-2"><h6>वॉर्डन (A)</h6><input type="text" name="w1Name" class="form-control form-control-sm" value="' + currentWarden.w1Name + '"><input type="text" name="w1Mobile" class="form-control form-control-sm" value="' + currentWarden.w1Mobile + '"><input type="file" name="w1PhotoFile" class="form-control form-control-sm" accept="image/*"><hr class="my-1"><h6>वॉर्डन (B)</h6><input type="text" name="w2Name" class="form-control form-control-sm" value="' + currentWarden.w2Name + '"><input type="text" name="w2Mobile" class="form-control form-control-sm" value="' + currentWarden.w2Mobile + '"><input type="file" name="w2PhotoFile" class="form-control form-control-sm" accept="image/*"><button type="submit" class="btn btn-sm btn-warning w-100 mt-2">दोनों वॉर्डन सेव करें</button></form></div></div>';
    admHtml += '<div class="col-lg-3 col-md-6"><div class="bg-white border p-3 rounded shadow-sm"><h5>🎛️ रिन्यूअल दस्तावेज़ मैट्रिक्स कंट्रोल</h5>';
    admHtml += '<button onclick="toggleF(\'photoActive\')" class="btn btn-xs w-100 mb-1 btn-' + (config.photoActive?'success':'danger') + '">फ़ोटो: ' + (config.photoActive?'ON':'OFF') + '</button>';
    admHtml += '<button onclick="toggleF(\'signatureActive\')" class="btn btn-xs w-100 mb-1 btn-' + (config.signatureActive?'success':'danger') + '">हस्ताक्षर: ' + (config.signatureActive?'ON':'OFF') + '</button>';
    admHtml += '<button onclick="toggleF(\'aadharActive\')" class="btn btn-xs w-100 mb-1 btn-' + (config.aadharActive?'success':'danger') + '">आधार कार्ड: ' + (config.aadharActive?'ON':'OFF') + '</button>';
    admHtml += '<button onclick="toggleF(\'resultActive\')" class="btn btn-xs w-100 mb-1 btn-' + (config.resultActive?'success':'danger') + '">मार्कशीट: ' + (config.resultActive?'ON':'OFF') + '</button>';
    admHtml += '<button onclick="toggleF(\'casteActive\')" class="btn btn-xs w-100 mb-1 btn-' + (config.casteActive?'success':'danger') + '">जाति: ' + (config.casteActive?'ON':'OFF') + '</button>';
    admHtml += '<button onclick="toggleF(\'resActive\')" class="btn btn-xs w-100 mb-1 btn-' + (config.resActive?'success':'danger') + '">निवास: ' + (config.resActive?'ON':'OFF') + '</button>';
    admHtml += '<button onclick="toggleF(\'rationActive\')" class="btn btn-xs w-100 mb-1 btn-' + (config.rationActive?'success':'danger') + '">राशन: ' + (config.rationActive?'ON':'OFF') + '</button>';
    admHtml += '</div></div></div>';
    admHtml += '<div class="bg-white border p-2 rounded shadow-sm table-responsive"><h4 class="text-center text-primary fw-bold mb-3 fs-5">🔒 हॉस्टल कंट्रोल पैनल</h4><table class="table table-bordered table-striped text-center align-middle" style="min-width: 950px;"><thead class="table-dark"><tr><th>S.No</th><th>छात्र</th><th>पिता</th><th>मोबाइल</th><th style="width:280px;">📁 दस्तावेज़ मैट्रिक्स</th><th>ROOM अलॉट</th><th>Approval</th><th>हटाएं</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8">कोई छात्र रिकॉर्ड नहीं है।</td></tr>') + '</tbody></table></div><script>function saveRoom(id){ const val=document.getElementById("room-"+id).value; fetch("/assign-room",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id,roomNumber:val})}).then(()=>location.reload())} function approveStudent(id){ fetch("/approve-student",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id})}).then(()=>location.reload())} function secureRemoveStudent(id, name){ const confirmAlert = confirm("⚠️ क्या आप सच में छात्र \'" + name + "\' का पूरा रिकॉर्ड डिलीट करना चाहते हैं?"); if(confirmAlert){ const doubleCheck = prompt("💥 सुरक्षा जांच! छात्र का डेटा हमेशा के लिए हटाने के लिए नीचे बड़े अक्षरों में YES CONFIRM टाइप करें:"); if(doubleCheck === "YES CONFIRM"){ fetch("/remove-student",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id})}).then(()=>location.reload()); } else { alert("❌ गलत टेक्स्ट टाइप किया! डिलीट प्रोसेस निरस्त कर दी गई है।"); } } } function toggleF(field){ fetch("/toggle-field-setting",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({field:field})}).then(()=>location.reload()); }</script></body></html>';
    res.send(admHtml);
});

app.post('/toggle-field-setting', async (req, res) => {
    let config = await Setting.findOne({}); if(!config) { config = new Setting(defaultSetting); }
    const field = req.body.field; config[field] = !config[field]; await config.save(); res.json({ success: true });
});

app.post('/update-merit', async (req, res) => {
    let config = await Setting.findOne({}); if(!config) { config = new Setting(defaultSetting); }
    config.meritListLink = req.body.meritListLink; await config.save(); res.redirect('/view-students');
});

app.post('/update-logo', uploadMiddleware, async (req, res) => { if (req.files && req.files['hostelLogo']) { await Logo.deleteMany({}); const l = new Logo({ url: req.files['hostelLogo'][0].path }); await l.save(); } res.redirect('/view-students'); });
app.post('/post-notice', uploadMiddleware, async (req, res) => { const n = new Notice({ text: req.body.noticeText, date: new Date().toLocaleDateString() }); await n.save(); res.redirect('/view-students'); });
app.post('/assign-room', async (req, res) => { await Student.updateOne({ mobile: req.body.studentId }, { $set: { roomNumber: req.body.roomNumber } }); res.json({ success: true }); });
app.post('/approve-student', async (req, res) => { await Student.updateOne({ mobile: req.body.studentId }, { $set: { approved: true } }); res.json({ success: true }); });
app.post('/remove-student', async (req, res) => { await Student.deleteOne({ mobile: req.body.studentId }); res.json({ success: true }); });

app.post('/update-warden', uploadMiddleware, async (req, res) => { 
    let cur = await Warden.findOne({}) || defaultWarden; let p1 = cur.w1Photo, p2 = cur.w2Photo;
    if (req.files) {
        if (req.files['w1PhotoFile']) p1 = req.files['w1PhotoFile'][0].path;
        if (req.files['w2PhotoFile']) p2 = req.files['w2PhotoFile'][0].path;
    }
    const updated = { w1Name: req.body.w1Name || cur.w1Name, w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: req.body.w1Mobile || cur.w1Mobile, w1Office: "कार्यालय कक्ष 01", w1Photo: p1, w2Name: req.body.w2Name || cur.w2Name, w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: req.body.w2Mobile || cur.w2Mobile, w2Office: "कार्यालय कक्ष 02", w2Photo: p2 }; 
    await Warden.deleteMany({}); const nw = new Warden(updated); await nw.save(); res.redirect('/view-students');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 भव्य क्लाउड सिंक सर्वर पूरी तरह से एक्टिव है!'));
