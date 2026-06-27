const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 🔐 Render पर सुरक्षित एनवायरनमेंट वेरिएबल्स लोड करने के लिए
try {
    require('dotenv').config();
} catch (e) {
    console.log("ℹ️ Live Environment Variables used.");
}

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
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'webp']
    },
});

const uploadMiddleware = multer({ storage: storage }).fields([
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
    studentAadharUrl: { type: String, default: "" },
    fatherAadharUrl: { type: String, default: "" }, motherAadharUrl: { type: String, default: "" },
    casteCertUrl: { type: String, default: "" }, residenceCertUrl: { type: String, default: "" },
    incomeCertUrl: { type: String, default: "" }, distanceCertUrl: { type: String, default: "" },
    ayushmanUrl: { type: String, default: "" }, rationCardUrl: { type: String, default: "" },
    isRenewal: { type: Boolean, default: false },
    roomNumber: { type: String, default: "अभी अलॉट नहीं हुआ" }, approved: { type: Boolean, default: false },
    date: String
});
const Student = mongoose.model('Student', StudentSchema);

const ArchiveSchema = new mongoose.Schema({
    studentMobile: String,
    studentName: String,
    history: [{
        session: String,
        type: String, 
        studentClass: String,
        collegeName: String,
        permanentAddress: String,
        blockName: String,
        districtName: String,
        dateArchived: String,
        removeReason: { type: String, default: "" },
        fullSnapshot: Object
    }],
    yearsActive: { type: Number, default: 1 }
});
const Archive = mongoose.model('Archive', ArchiveSchema);

const NoticeSchema = new mongoose.Schema({ text: String, date: String });
const Notice = mongoose.model('Notice', NoticeSchema);

const WardenSchema = new mongoose.Schema({
    w1Name: String, w1Desig: String, w1Mobile: String, w1Office: String, w1Photo: String,
    w2Name: String, w2Desig: String, w2Mobile: String, w2Office: String, w2Photo: String,
    helpLineNumber: { type: String, default: "9329088615" }
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
    w2Name: "सहायक अधीक्षक", w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: "9999999999", w2Office: "कार्यालय कक्ष 02", w2Photo: "https://via.placeholder.com/150",
    helpLineNumber: "9329088615"
};
const defaultLogo = { url: "https://via.placeholder.com/800x250?text=PRE+MATRIC+BOYS+HOSTEL+SURAJPUR" };
const defaultSetting = { photoActive: true, signatureActive: true, aadharActive: true, resultActive: true, casteActive: true, resActive: true, rationActive: true, meritListLink: "" };

const getDynamicSession = () => {
    const now = new Date(); const currentYear = now.getFullYear(); const currentMonth = now.getMonth() + 1;
    if (currentMonth >= 6 && now.getDate() >= 5) { return currentYear + "-" + (String(currentYear + 1).slice(-2)); }
    else { return (currentYear - 1) + "-" + (String(currentYear).slice(-2)); }
};
app.get('/', async (req, res) => {
    try {
        const students = await Student.find({});
        const notices = await Notice.find({}).sort({ _id: -1 });
        const warden = await Warden.findOne({}) || defaultWarden;
        const logo = await Logo.findOne({}) || defaultLogo;
        const config = await Setting.findOne({}) || defaultSetting;
        const sessionVal = getDynamicSession();
        const helpNum = warden.helpLineNumber || warden.w1Mobile || "9329088615";

        const stApproved = students.filter(s => s.approved === true && s.category && s.category.includes('ST')).length;
        const scApproved = students.filter(s => s.approved === true && s.category && s.category.includes('SC')).length;
        const stAvailable = Math.max(0, 100 - stApproved);
        const scAvailable = Math.max(0, 50 - scApproved);

        let h = '<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
        h += '<title>PRE MATRIC ST+SC BOYS HOSTEL SURAJPUR</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
        h += '<style>body { background-color: #f8fafc; color: #0f172a; font-family: system-ui, sans-serif; } .navbar { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; border-bottom: 3px solid #f59e0b; } .card { background-color: #ffffff; border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); transition: transform 0.2s; } .logo-container { width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 25px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center; border: 1px solid #e2e8f0; } .logo-img { width: 100%; height: auto; max-height: 320px; display: block; margin: 0 auto; object-fit: contain; padding: 5px; } .premium-btn { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px 20px; text-align: center; text-decoration: none; display: block; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 12px rgba(0,0,0,0.02); } .premium-btn:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); } .premium-btn.reg { border-bottom: 6px solid #2563eb; } .premium-btn.ren { border-bottom: 6px solid #d97706; } .premium-btn.stat { border-bottom: 6px solid #059669; } .tracker-card { background: #ffffff; border-radius: 16px; border-top: 5px solid #2563eb; box-shadow: 0 4px 12px rgba(0,0,0,0.02); } .tracker-card.sc { border-top: 5px solid #10b981; } .whatsapp-float { position: fixed; bottom: 25px; right: 25px; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); color: white; border-radius: 30px; text-align: center; font-weight: bold; box-shadow: 0 10px 25px rgba(37,211,102,0.4); z-index: 1000; text-decoration: none; padding: 14px 28px; display: flex; align-items: center; gap: 8px; cursor:pointer; border:none; }</style></head><body>';
        
        h += '<nav class="navbar navbar-expand-lg navbar-dark mb-4 shadow py-3"><div class="container"><a class="navbar-brand fw-bold text-warning fs-4" href="/">🏢 PRE MATRIC ST+SC BOYS HOSTEL SURAJPUR</a><div class="navbar-nav ms-auto"><a class="nav-link btn btn-outline-warning text-white px-4 py-1.5 rounded-pill fw-bold" href="/view-students" target="_blank">🔒 Administrative Login</a></div></div></nav>';
        h += '<div class="container"><div class="row mb-4"><div class="col-12 text-center"><button class="btn btn-danger fw-bold shadow px-5 py-3 rounded-pill text-warning fs-5" style="border: 2px solid #ffc107; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);" data-bs-toggle="modal" data-bs-target="#rulesModal">📜 छात्रावास आवश्यक नियम एवं अनिवार्य अनुशासन निर्देशिका (टच करें) ➔</button></div></div>';
        
        h += '<div class="row g-3 mb-4 text-center">';
        h += '<div class="col-md-6"><div class="card p-3 tracker-card h-100"><span class="text-secondary small fw-bold uppercase">अनुसूचित जनजाति (ST) सीट ट्रैकर</span><div class="d-flex justify-content-around align-items-center mt-2"><div><small class="text-muted">कुल सीटें</small><h3 class="fw-bold text-primary mb-0">100</h3></div><div><small class="text-muted">कन्फर्म</small><h3 class="fw-bold text-success mb-0">' + stApproved + '</h3></div><div><small class="text-muted">खाली सीटें</small><h3 class="fw-bold text-danger mb-0">' + stAvailable + '</h3></div></div></div></div>';
        h += '<div class="col-md-6"><div class="card p-3 tracker-card sc h-100"><span class="text-secondary small fw-bold uppercase">अनुसूचित जाति (SC) सीट ट्रैकर</span><div class="d-flex justify-content-around align-items-center mt-2"><div><small class="text-muted">कुल सीटें</small><h3 class="fw-bold text-primary mb-0">50</h3></div><div><small class="text-muted">कन्फर्म</small><h3 class="fw-bold text-success mb-0">' + scApproved + '</h3></div><div><small class="text-muted">खाली सीटें</small><h3 class="fw-bold text-danger mb-0">' + scAvailable + '</h3></div></div></div></div></div>';

        h += '<div class="row g-4"><div class="col-md-8"><div class="logo-container shadow-sm"><img src="' + logo.url + '" alt="Hostel Logo" class="logo-img"></div><div class="card p-4 mb-4 shadow-sm"><div class="card-header bg-dark text-warning rounded-3 mb-3 fw-bold fs-5 py-2 shadow-sm">📢 ऑफिशियल नोटिस बोर्ड (Notice Board)</div><ul class="list-group list-group-flush">';
        if(notices.length === 0) { h += "<li class='text-muted text-center p-3'>कोई नया नोटिस जारी नहीं हुआ है।</li>"; } 
        else { notices.forEach(n => { h += "<li class='list-group-item bg-white text-dark border-bottom mb-1 p-2 fs-6'><b class='text-danger'>[" + n.date + "]:</b> " + n.text + "</li>"; }); }
        h += '</ul></div><hr class="my-4 border-secondary opacity-25">';
        
        h += '<div class="row g-4 mb-5"><div class="col-6 col-md-4"><a href="/registration-form" class="premium-btn reg text-dark shadow-sm"><span style="font-size: 45px; display:block;" class="mb-1">📝</span><h5 class="fw-bold text-primary">नवीन प्रवेश फॉर्म</h5><span class="badge bg-primary px-3 py-1 my-1 rounded-pill">सत्र ' + sessionVal + '</span></a></div>';
        h += '<div class="col-6 col-md-4"><a href="/renewal-form" class="premium-btn ren text-dark shadow-sm"><span style="font-size: 45px; display:block;" class="mb-1">🔄</span><h5 class="fw-bold text-dark">हॉस्टल नवीनीकरण</h5><span class="badge bg-warning text-dark px-3 py-1 my-1 rounded-pill">पुराने छात्र</span></a></div>';
        h += '<div class="col-12 col-md-4"><a href="/check-status-page" class="premium-btn stat text-dark shadow-sm"><span style="font-size: 45px; display:block;" class="mb-1">🔍</span><h5 class="fw-bold text-success">अलॉटमेंट स्टेटस</h5><span class="badge bg-success px-3 py-1 my-1 rounded-pill">प्रोफाइल / रसीद</span></a></div></div></div>';
        
        // 👨‍💼 [OLD ORIGINAL LOOK RESTORED] पुराना असली डिज़ाइन वापस सेट किया गया है
        h += '<div class="col-md-4"><div class="card p-4 text-center mb-4 border-top border-warning border-5 shadow-sm"><div class="card-header bg-light text-dark fw-bold rounded mb-3 border-0 fs-6">👨‍💼 छात्रावास प्रबंधन प्रशासन</div><div class="row g-2">';
        h += '<div class="col-6 border-end"><img src="' + warden.w1Photo + '" class="rounded-3 border mb-2 shadow-sm" style="width: 85px; height: 85px; object-fit: cover;" onerror="this.src=\'https://via.placeholder.com/150\'\"><h6 class="fw-bold text-dark mb-0 small">' + warden.w1Name + '</h6><small class="text-muted block d-block" style="font-size:9px;">' + warden.w1Desig + '</small><div class="text-start bg-light p-2 rounded border mt-2" style="font-size:9px; font-weight:500;"><b>📞:</b> ' + warden.w1Mobile + '<br><b>🏢:</b> ' + warden.w1Office + '</div></div>';
        h += '<div class="col-6"><img src="' + warden.w2Photo + '" class="rounded-3 border mb-2 shadow-sm" style="width: 85px; height: 85px; object-fit: cover;" onerror="this.src=\'https://via.placeholder.com/150\'\"><h6 class="fw-bold text-dark mb-0 small">' + warden.w2Name + '</h6><small class="text-muted block d-block" style="font-size:9px;">' + warden.w2Desig + '</small><div class="text-start bg-light p-2 rounded border mt-2" style="font-size:9px; font-weight:500;"><b>📞:</b> ' + warden.w2Mobile + '<br><b>🏢:</b> ' + warden.w2Office + '</div></div></div></div>';
        
        let meritTarget = config.meritListLink ? config.meritListLink : '/public-admission-list';
        h += '<div class="card p-4 shadow-sm border-top border-success border-5 text-center"><div class="card-header bg-light text-success fw-bold rounded mb-2 border-0 fs-6">📋 छात्रावास फाइनल मेरिट सूची</div><a href="' + meritTarget + '" target="_blank" class="btn btn-success w-100 fw-bold py-2.5 mt-2 rounded-3 shadow">चयन सूची देखें ➔</a></div></div></div></div>';
        
        h += '<button class="whatsapp-float shadow-lg" data-bs-toggle="modal" data-bs-target="#helpCenterModal">💬 सहायता केंद्र</button>';
        
        h += '<div class="modal fade" id="helpCenterModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content rounded-4 border-0 shadow"><div class="modal-header bg-success text-white rounded-top-4"><h5 class="modal-title fw-bold">🤝 डिजिटल हेल्पडेस्क सहायता केंद्र</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div><div class="modal-body p-3 text-center"><h6 class="text-secondary fw-bold mb-3">आपको किस प्रकार की सहायता चाहिए? नीचे संबंधित विषय चुनें:</h6><div class="list-group shadow-sm">';
        h += '<a href="https://wa.me/91' + helpNum + '?text=नमस्ते सर, मुझे नए प्रवेश फॉर्म भरने में समस्या आ रही है, कृपया सहायता करें।" target="_blank" class="list-group-item list-group-item-action text-start fw-bold p-3 text-primary">➔ 📝 नए प्रवेश फॉर्म भरने में समस्या है</a>';
        h += '<a href="https://wa.me/91' + helpNum + '?text=नमस्ते सर, मुझे डॉक्यूमेंट अपलोड करने में साइज का एरर आ रहा है, कृपया मदद करें।" target="_blank" class="list-group-item list-group-item-action text-start fw-bold p-3 text-primary">➔ 📂 दस्तावेज़ अपलोड (साइज) एरर है</a>';
        h += '<a href="https://wa.me/91' + helpNum + '?text=नमस्ते सर, मेरा ROOM अलॉटमेंट स्टेटस नहीं दिख रहा है, कृपया चेक कर दीजिए।" target="_blank" class="list-group-item list-group-item-action text-start fw-bold p-3 text-primary">➔ 🔍 रूम अलॉटमेंट / स्टेटस संबंधी प्रश्न</a>';
        h += '<a href="https://wa.me/91' + helpNum + '?text=नमस्ते सर, मुझे छात्रावास नवीनीकरण फॉर्म (Renewal Form) की जानकारी चाहिए।" target="_blank" class="list-group-item list-group-item-action text-start fw-bold p-3 text-primary">➔ 🔄 नवीनीकरण फॉर्म संबंधी जानकारी</a>';
        h += '</div></div><div class="modal-footer border-0"><button type="button" class="btn btn-secondary w-100 fw-bold rounded-pill py-2" data-bs-dismiss="modal">बंद करें</button></div></div></div></div>';

        h += '<div class="modal fade" id="rulesModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content text-dark"><div class="modal-header bg-danger text-white"><h5 class="modal-title fw-bold text-warning">📜 शासकीय छात्रावास आवश्यक नियम एवं अनिवार्य नियमावली</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div><div class="modal-body p-4" style="font-size: 15px; line-height: 1.8;"><ol class="fw-bold text-secondary"><li class="mb-2">छात्रावास में प्रवेशित छात्र को छात्रावास में भोजन (मेस) करना अनिवार्य है।</li><li class="mb-2">स्थानीय शिक्षण संस्था में छात्र को नियमित प्रवेश व उपस्थिति अनिवार्य है।</li><li class="mb-2">बिना सूचना के लगातार अनुपस्थित रहने पर छात्र को छात्रावास से निष्कासित किया जा सकेगा।</li><li class="mb-2">अप्रवेशी छात्र को बिना अधीक्षक की लिखित अनुमति के ठहराना वर्जित है।</li><li class="mb-2">मादक पदार्थों एवं मद्यपान का सेवन करने पर तत्काल निष्कासित किया जा सकेगा।</li></ol></div></div></div></div>';
        h += '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script></body></html>';
        
        res.send(h);
    } catch (err) { res.status(500).send("Error loading home page"); }
});
const fileValidationScript = '<script>function validateFile(input) { const file = input.files[0]; if (!file) return true; const fileSizeKB = file.size / 1024; if (fileSizeKB < 20 || fileSizeKB > 150) { alert("❌ फ़ाइल का साइज़ 20KB से 150KB के बीच होना अनिवार्य है!"); input.value = ""; return false; } return true; }</script>';

// 📝 नवीन प्रवेश फॉर्म रूट (पूर्णतः फिक्स)
app.get('/registration-form', (req, res) => {
    const sessionVal = getDynamicSession();
    let f = '<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>प्रवेश हेतु आवेदन पत्र ' + sessionVal + '</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{ background-color: #f1f5f9; color:#0f172a; } .card { border:none; border-radius:20px; box-shadow:0 20px 40px rgba(0,0,0,0.05); } .section-title { background-color: #f8fafc; padding: 10px 15px; font-weight: bold; border-left: 5px solid #2563eb; margin-top: 20px; margin-bottom: 15px; border-radius:0 8px 8px 0; color: #1e40af; }</style></head><body class="p-2 p-md-4"><div class="container" style="max-width: 950px;"><div class="card p-3 p-md-5 bg-white"><div class="text-center mb-4"><h5 class="text-secondary fw-bold mb-1" style="font-size:13px; letter-spacing:1px;">आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन</h5><h2 class="text-primary fw-bold fs-3">PRE MATRIC ST+SC BOYS HOSTEL SURAJPUR</h2><span class="badge bg-primary px-4 py-2 mt-2 rounded-pill fs-6 fw-bold">नवीन प्रवेश फॉर्म - सत्र ' + sessionVal + '</span></div><form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3"><input type="hidden" name="isRenewal" value="false"><div class="section-title">1. व्यक्तिगत जानकारी, फ़ोटो एवं डिजिटल हस्ताक्षर</div><div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का नाम (आधार के अनुसार):</label><input type="text" name="studentName" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">जन्मतिथि (DOB):</label><input type="date" name="dob" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का वर्ग (Category):</label><select name="category" class="form-select" required><option value="ST">अनुसूचित जनजाति (ST)</option><option value="SC">अनुसूचित जाति (SC)</option></select></div><div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी की जाति:</label><input type="text" name="subCast" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">पालक का mobile नंबर:</label><input type="tel" name="mobile" class="form-control" required></div>';
    f += '<div class="col-md-6"><label class="form-label fw-bold text-danger">📸 छात्र की फोटो (20KB - 150KB):</label><input type="file" name="studentPhoto" class="form-control" onchange="validateFile(this)" required></div>';
    f += '<div class="col-md-6"><label class="form-label fw-bold text-danger">✍️ छात्र के हस्ताक्षर (20KB - 150KB):</label><input type="file" name="studentSignature" class="form-control" onchange="validateFile(this)" required></div>';
    f += '<div class="col-md-12"><label class="form-label fw-bold text-danger">📂 छात्र का आधार कार्ड दस्तावेज़ (20-150KB):</label><input type="file" name="studentAadharFile" class="form-control" onchange="validateFile(this)" required></div>';
    f += '<div class="section-title">2. पारिवारिक विवरण एवं पालक आधार</div><div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div><div class="col-md-6"><label class="form-label text-muted fw-bold">पिता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="fatherAadharFile" class="form-control" onchange="validateFile(this)"></div><div class="col-md-6"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" required></div><div class="col-md-6"><label class="form-label text-muted fw-bold">माता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="motherAadharFile" class="form-control" onchange="validateFile(this)"></div><div class="col-md-4"><label class="form-label fw-bold">पालक की वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" required></div>';
    f += '<div class="section-title">3. सरकारी प्रमाण पत्र एवं कार्ड फ़ोटो अपलोड (20KB - 150KB)</div><div class="col-md-6"><label class="form-label fw-bold text-primary">जाति प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="casteCertFile" class="form-control" onchange="validateFile(this)" required></div><div class="col-md-6"><label class="form-label fw-bold text-primary">निवास प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="residenceCertFile" class="form-control" onchange="validateFile(this)" required></div><div class="col-md-6"><label class="form-label text-muted fw-bold">आय प्रमाण पत्र अपलोड:</label><input type="file" name="incomeCertFile" class="form-control" onchange="validateFile(this)"></div><div class="col-md-6"><label class="form-label text-muted fw-bold">दूरी प्रमाण पत्र अपलोड:</label><input type="file" name="distanceCertFile" class="form-control" onchange="validateFile(this)"></div><div class="col-md-6"><label class="form-label text-muted fw-bold">आयुष्मान कार्ड अपलोड:</label><input type="file" name="ayushmanFile" class="form-control" onchange="validateFile(this)"></div><div class="col-md-6"><label class="form-label fw-bold text-primary">राशन कार्ड फ़ोटो अपलोड (अनिवार्य):</label><input type="file" name="rationCardFile" class="form-control" onchange="validateFile(this)" required></div>';
    f += '<div class="section-title">4. पता एवं विद्यालय विवरण</div><div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" required></div><div class="col-md-3"><label class="form-label fw-bold">विकासखंड:</label><input type="text" name="blockName" class="form-control" required></div><div class="col-md-3"><label class="form-label fw-bold">जिला:</label><input type="text" name="districtName" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">घर से शाला की दूरी (कि.मी.):</label><input type="number" name="homeDistance" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">वर्तमान कक्षा/वर्ष:</label><input type="text" name="studentClass" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">कोर्स / ब्रांच:</label><input type="text" name="course" class="form-control" required></div><div class="col-md-8"><label class="form-label fw-bold">स्कूल / कॉलेज का नाम:</label><input type="text" name="collegeName" class="form-control" required></div><div class="col-md-4"><label class="form-label fw-bold">पिछला परीक्षा प्रतिशत (%):</label><input type="text" name="prevPercent" class="form-control" required></div><div class="col-12 mt-4"><button type="submit" class="btn btn-primary w-100 fw-bold fs-5 py-3 rounded-3 shadow">🚀 ऑनलाइन आवेदन पत्र सुरक्षित रूप से जमा करें</button></div></form><div class="text-center mt-3"><a href="/" class="btn btn-link text-decoration-none fw-bold">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div></div></div>' + fileValidationScript + '</body></html>';
    res.send(f);
});

// 🔄 नवीनीकरण फॉर्म (स्मार्ट ऑटो-फिल फीचर के साथ)
app.get('/renewal-form', async (req, res) => {
    const config = await Setting.findOne({}) || defaultSetting; const sessionVal = getDynamicSession();
    let rf = '<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>हॉस्टल नवीनीकरण आवेदन पत्र</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{ background-color: #fefcbf; color:#2d3748; } .card { border:none; border-radius:20px; box-shadow:0 20px 40px rgba(0,0,0,0.05); } .section-title { background-color: #fef3c7; padding: 10px 15px; font-weight: bold; border-left: 5px solid #d97706; margin-top: 20px; margin-bottom: 15px; border-radius:0 8px 8px 0; color: #b45309; }</style></head><body class="p-2 p-md-4"><div class="container" style="max-width: 900px;"><div class="card p-3 p-md-5 bg-white"><div class="text-center mb-4"><h3 class="text-warning text-dark fw-bold fs-3">PRE MATRIC ST+SC BOYS HOSTEL SURAJPUR</h3><span class="badge bg-warning text-dark px-4 py-2 mt-2 rounded-pill fs-6 fw-bold">🔄 छात्रावास नवीनीकरण फॉर्म - सत्र ' + sessionVal + '</span></div>';
    
    rf += '<div class="bg-light p-3 rounded-3 mb-4 border text-center"><h6>🔍 पुराना रिकॉर्ड खोजने के लिए मोबाइल या आधार नंबर दर्ज करें:</h6><div class="input-group" style="max-width:500px; margin:0 auto;"><input type="text" id="searchKey" class="form-control" placeholder="मोबाइल या आधार नंबर लिखें..."><button type="button" onclick="fetchOldData()" class="btn btn-dark fw-bold">डेटा लोड करें ➔</button></div></div>';

    rf += '<form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3"><input type="hidden" name="isRenewal" value="true"><div class="section-title">1. छात्र की जानकारी व सत्यापन</div><div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का नाम:</label><input type="text" id="r_studentName" name="studentName" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">पंजीकृत मोबाइल नंबर (वही पुराना नंबर):</label><input type="tel" id="r_mobile" name="mobile" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" id="r_fatherName" name="fatherName" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">आधार नंबर:</label><input type="text" id="r_aadharCard" name="aadharCard" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">नई कक्षा/वर्ष जिसमें प्रवेश लिया है:</label><input type="text" name="studentClass" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-bold">School / College का नाम:</label><input type="text" id="r_collegeName" name="collegeName" class="form-control" required></div>';
    
    rf += '<input type="hidden" id="r_permanentAddress" name="permanentAddress"><input type="hidden" id="r_blockName" name="blockName"><input type="hidden" id="r_districtName" name="districtName"><input type="hidden" id="r_category" name="category"><input type="hidden" id="r_subCast" name="subCast">';

    if (config.photoActive) { rf += '<div class="col-md-6"><label class="form-label fw-bold">📸 नई फोटो अपलोड (20-150KB):</label><input type="file" name="studentPhoto" class="form-control" onchange="validateFile(this)" required></div>'; }
    if (config.signatureActive) { rf += '<div class="col-md-6"><label class="form-label fw-bold">✍️ नया हस्ताक्षर अपलोड (20-150KB):</label><input type="file" name="studentSignature" class="form-control" onchange="validateFile(this)" required></div>'; }
    if (config.aadharActive) { rf += '<div class="col-md-12"><label class="form-label fw-bold">📂 छात्र आधार कार्ड फ़ोटो कॉपी (20-150KB):</label><input type="file" name="studentAadharFile" class="form-control" onchange="validateFile(this)" required></div>'; }
    if (config.resultActive) { rf += '<div class="col-md-12"><label class="form-label fw-bold text-primary">📊 पिछली क्लास का रिजल्ट / मार्कशीट:</label><input type="file" name="resultFile" class="form-control" onchange="validateFile(this)" required></div>'; }
    if (config.casteActive) { rf += '<div class="col-md-4"><label class="form-label fw-bold">जाति प्रमाण पत्र:</label><input type="file" name="casteCertFile" class="form-control" onchange="validateFile(this)" required></div>'; }
    if (config.resActive) { rf += '<div class="col-md-4"><label class="form-label fw-bold">निवास प्रमाण पत्र:</label><input type="file" name="residenceCertFile" class="form-control" onchange="validateFile(this)" required></div>'; }
    if (config.rationActive) { rf += '<div class="col-md-4"><label class="form-label fw-bold">राशन कार्ड फ़ोटो:</label><input type="file" name="rationCardFile" class="form-control" onchange="validateFile(this)" required></div>'; }
    rf += '<div class="col-md-12 mt-4"><button type="submit" class="btn btn-warning text-dark w-100 fw-bold fs-5 py-3 rounded-3 shadow">🔄 नवीनीकरण आवेदन सबमिट करें</button></div></form><div class="text-center mt-3"><a href="/" class="btn btn-link text-decoration-none fw-bold text-dark">🏠 मुख्य पृष्ठ</a></div></div></div>' + fileValidationScript;
    
    rf += '<script>function fetchOldData(){ const key=document.getElementById("searchKey").value; if(!key) return alert("कृपया नंबर दर्ज करें!"); fetch("/api/get-old-student?key="+key).then(r=>r.json()).then(d=>{ if(d.error){ alert("❌ पुराना रिकॉर्ड नहीं मिला! कृपया मैन्युअल भरें।"); } else { document.getElementById("r_studentName").value=d.studentName||""; document.getElementById("r_mobile").value=d.mobile||""; document.getElementById("r_fatherName").value=d.fatherName||""; document.getElementById("r_aadharCard").value=d.aadharCard||""; document.getElementById("r_collegeName").value=d.collegeName||""; document.getElementById("r_permanentAddress").value=d.permanentAddress||""; document.getElementById("r_blockName").value=d.blockName||""; document.getElementById("r_districtName").value=d.districtName||""; document.getElementById("r_category").value=d.category||"ST"; document.getElementById("r_subCast").value=d.subCast||""; alert("✅ पुराना डेटा लोड कर दिया गया है!"); } }).catch(()=>alert("सर्वर एरर")); }</script></body></html>';
    res.send(rf);
});

app.get('/api/get-old-student', async (req, res) => {
    try {
        const queryKey = (req.query.key || '').trim();
        const student = await Student.findOne({ $or: [{ mobile: queryKey }, { aadharCard: queryKey }] });
        if(student) res.json(student);
        else res.json({ error: true });
    } catch(e) { res.json({ error: true }); }
});

app.get('/check-status-page', (req, res) => {
    res.send('<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>अलॉटमेंट स्टेटस</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="p-3 p-md-5 bg-light"><div class="container" style="max-width: 650px;"><div class="card p-3 p-md-4 shadow-sm bg-white border border-success mb-4" style="border-radius:15px;"><h3 class="text-center text-success fw-bold mb-4 fs-4">🔍 छात्रावास अलॉटमेंट रिजल्ट / स्टेटस</h3><div class="input-group mb-3"><input type="tel" id="searchMobile" class="form-control" placeholder="रजिस्टर्ड मोबाइल नंबर दर्ज करें..."><button onclick="checkStatus()" class="btn btn-success fw-bold">रिजल्ट देखें</button></div><div id="statusResult"></div></div><div class="card p-3 p-md-4 shadow-sm bg-white border border-warning" style="border-radius:15px;"><h4 class="text-center text-warning fw-bold mb-3 fs-5 text-dark">⚠️ आवेदन पत्र में त्रुटि सुधार (Edit Form)</h4><div class="input-group"><input type="tel" id="editMobile" class="form-control" placeholder="अपना रजिस्टर्ड मोबाइल नंबर डालें..."><button onclick="openEditForm()" class="btn btn-warning fw-bold">त्रुटि सुधार खोलें</button></div></div><div class="text-center mt-4"><a href="/" class="btn btn-link text-decoration-none fw-bold">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div></div><script>function checkStatus() { const mobile = document.getElementById("searchMobile").value; if(!mobile) { alert("कृपया मोबाइल नंबर लिखें!"); return; } window.location.href = "/get-receipt-view?mobile=" + mobile; } function openEditForm() { const m = document.getElementById("editMobile").value; if(!m) return alert("नंबर लिखें!"); window.location.href = "/edit-student-form?mobile=" + m; }</script></body></html>');
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
        rc += '<table class="table table-bordered bg-light" style="font-size:13px;"><tr><th class="bg-dark text-white" style="width:35%;">वर्तमान कक्षा/वर्ष</th><td>' + sData.studentClass + '</td></tr><tr><th class="bg-dark text-white">स्कूल / कॉलेज का नाम</th><td>' + sData.collegeName + '</td></tr><tr><th class="bg-dark text-white">आबंटित ROOM नंबर (Room)</th><td><b class="text-danger fs-6">' + (sData.roomNumber || 'अभी अलॉट नहीं हुआ') + '</b></td></tr><tr><th class="bg-dark text-white">डिजिटल सबमिशन टाइम</th><td>' + sData.date + '</td></tr></table>';
        rc += '<div class="border-top pt-3 mt-4 text-center"><div class="mb-2 text-muted" style="font-size:10px; font-family:\'Courier New\';">||||| Barcode Verified Data Sync |||||</div><p class="small text-muted mb-0">यह रसीद कंप्यूटर जनित है, इसमें किसी भौतिक हस्ताक्षर की आवश्यकता नहीं है।</p></div><div class="text-center mt-4 no-print"><button onclick="window.print()" class="btn btn-primary fw-bold px-4 me-2">🖨️ प्रिंट / PDF सेव करें</button><a href="/" class="btn btn-secondary px-4">🏠 मुख्य पृष्ठ</a></div></div></div></body></html>';
        res.send(rc);
    } catch(e) { res.status(500).send("Receipt view error"); }
});

// 🛠️ त्रुटि सुधार फ़ॉर्म पैनल (पूर्णतः फिक्स)
app.get('/edit-student-form', async (req, res) => {
    try {
        const student = await Student.findOne({ mobile: (req.query.mobile || '').trim() });
        if (!student) return res.send("<h1>❌ रिकॉर्ड नहीं मिला!</h1>");

        let editHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>त्रुटि सुधार पैनल</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{background-color:#f1f5f9;}.card {border:none; border-radius:20px; box-shadow:0 15px 35px rgba(0,0,0,0.05);}.section-title { background-color: #e2e8f0; padding: 8px 12px; font-weight: bold; border-left: 5px solid #d97706; margin-top: 15px; margin-bottom: 15px; border-radius:0 6px 6px 0; color:#9a3412; }</style></head><body class="p-2 p-md-4 bg-light"><div class="container" style="max-width: 900px;"><div class="card p-3 p-md-5 bg-white border border-warning"><h2 class="text-center text-warning fw-bold mb-4 fs-4 text-dark">🛠️ आवेदन पत्र में त्रुटि सुधार (Full Form Edit Hub)</h2><form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">';
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
        editHtml += '<div class="section-title">3. दस्तावेज़ संपादन (20-150KB)</div>';
        editHtml += '<div class="col-md-6"><label class="form-label text-danger fw-bold">📸 छात्र की फ़ोटो बदलें:</label><input type="file" name="studentPhoto" class="form-control" onchange="validateFile(this)"></div>';
        editHtml += '<div class="col-md-6"><label class="form-label text-danger fw-bold">✍️ छात्र के हस्ताक्षर बदलें:</label><input type="file" name="studentSignature" class="form-control" onchange="validateFile(this)"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold text-primary">📂 छात्र आधार बदलें:</label><input type="file" name="studentAadharFile" class="form-control" onchange="validateFile(this)"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">जाति प्रमाण पत्र बदलें:</label><input type="file" name="casteCertFile" class="form-control" onchange="validateFile(this)"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">निवास प्रमाण पत्र बदलें:</label><input type="file" name="residenceCertFile" class="form-control" onchange="validateFile(this)"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold">राशन कार्ड बदलें:</label><input type="file" name="rationCardFile" class="form-control" onchange="validateFile(this)"></div>';
        editHtml += '<div class="col-md-4"><label class="form-label fw-bold text-success">📊 मार्कशीट रिजल्ट बदलें:</label><input type="file" name="resultFile" class="form-control" onchange="validateFile(this)"></div>';
        editHtml += '<div class="col-12 mt-4"><button type="submit" class="btn btn-warning w-100 text-dark fw-bold py-2.5 shadow">🔄 पूरा फॉर्म अपडेट करें</button></div></form></div></div>' + fileValidationScript + '</body></html>';
        editHtml += '</body></html>';
        res.send(editHtml);
    } catch(err) { res.status(500).send("Error loading edit page"); }
});

app.get('/public-admission-list', async (req, res) => {
    res.send('<h2>📋 चयन सूची अभी एडमिन पैनल पर लिंक लोड की जा रही है। कृपया स्टेटस पेज चेक करें।</h2><br><a href="/">मुख्य पृष्ठ</a>');
});
app.post('/submit-form', (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const cleanMobile = req.body.mobile.trim();
            const old = await Student.findOne({ mobile: cleanMobile });
            const currentSession = getDynamicSession();
            
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

            // 🗄️ [डेटा रिकॉर्ड लाइव ऑटो सिंक]
            let archiveRecord = await Archive.findOne({ studentMobile: cleanMobile });
            const historyEntry = {
                session: currentSession,
                type: sData.isRenewal ? 'Renewal' : 'New',
                studentClass: sData.studentClass,
                collegeName: sData.collegeName,
                permanentAddress: sData.permanentAddress,
                blockName: sData.blockName,
                districtName: sData.districtName,
                dateArchived: new Date().toLocaleDateString(),
                fullSnapshot: sData
            };

            if (archiveRecord) {
                const sessionIdx = archiveRecord.history.findIndex(h => h.session === currentSession);
                if (sessionIdx === -1) {
                    archiveRecord.history.push(historyEntry);
                } else {
                    archiveRecord.history[sessionIdx] = historyEntry;
                }
                archiveRecord.yearsActive = archiveRecord.history.length;
                await archiveRecord.save();
            } else {
                const newArchive = new Archive({
                    studentMobile: cleanMobile,
                    studentName: sData.studentName,
                    history: [historyEntry],
                    yearsActive: 1
                });
                await newArchive.save();
            }

            res.redirect('/get-receipt-view?mobile=' + cleanMobile);
        } catch (e) { res.status(500).send("Upload Form Error"); }
    });
});
app.get('/view-students', async (req, res) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123hostel';
    const auth = { login: 'admin', password: adminPassword }; 
    const b64 = (req.headers.authorization || '').split(' ')[1] || ''; 
    const [login, password] = Buffer.from(b64, 'base64').toString().split(':');
    if (!login || !password || login !== auth.login || password !== auth.password) { 
        res.set('WWW-Authenticate', 'Basic realm="401"'); 
        return res.status(401).send('❌ गलत पासवर्ड या अनाधिकृत एक्सेस!'); 
    }
    
    let currentWarden = await Warden.findOne({}) || defaultWarden;
    let config = await Setting.findOne({}) || defaultSetting;
    let sList = await Student.find({}); 
    let archives = await Archive.find({});
    
    const selectedSession = req.query.filterSession || getDynamicSession();
    
    let rows = '';
    sList.forEach((s, idx) => {
        let actionBtn = s.approved ? '<span class="badge bg-success">Approved</span>' : '<button onclick="approveStudent(\'' + s.mobile + '\')" class="btn btn-sm btn-primary py-0 px-1">Approve</button>';
        
        // 📁 [पुराने दस्तावेज़ मैट्रिक्स रीस्टोर] माता-पिता आधार, आयुष्मान, दूरी आदि सब वापस जोड़े गए हैं
        let docsLinks = '<div style="display: flex; flex-wrap: wrap; gap: 3px; justify-content: center;">';
        docsLinks += s.photoUrl ? '<a href="' + s.photoUrl + '" target="_blank" class="btn btn-xs btn-outline-dark p-1" style="font-size:9px; font-weight:bold;">फ़ोटो</a>' : '';
        docsLinks += s.signatureUrl ? '<a href="' + s.signatureUrl + '" target="_blank" class="btn btn-xs btn-outline-secondary p-1" style="font-size:9px; font-weight:bold;">हस्ताक्षर</a>' : '';
        docsLinks += s.studentAadharUrl ? '<a href="' + s.studentAadharUrl + '" target="_blank" class="btn btn-xs btn-outline-primary p-1" style="font-size:9px; font-weight:bold;">छात्र आधार</a>' : '';
        docsLinks += s.fatherAadharUrl ? '<a href="' + s.fatherAadharUrl + '" target="_blank" class="btn btn-xs btn-outline-primary p-1" style="font-size:9px; font-weight:bold;">पिता आधार</a>' : '';
        docsLinks += s.motherAadharUrl ? '<a href="' + s.motherAadharUrl + '" target="_blank" class="btn btn-xs btn-outline-primary p-1" style="font-size:9px; font-weight:bold;">माता आधार</a>' : '';
        docsLinks += s.casteCertUrl ? '<a href="' + s.casteCertUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">जाति</a>' : '';
        docsLinks += s.residenceCertUrl ? '<a href="' + s.residenceCertUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">निवास</a>' : '';
        docsLinks += s.incomeCertUrl ? '<a href="' + s.incomeCertUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">आय</a>' : '';
        docsLinks += s.distanceCertUrl ? '<a href="' + s.distanceCertUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">दूरी</a>' : '';
        docsLinks += s.ayushmanUrl ? '<a href="' + s.ayushmanUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">आयुष्मान</a>' : '';
        docsLinks += s.rationCardUrl ? '<a href="' + s.rationCardUrl + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:9px; font-weight:bold;">राशन</a>' : '';
        docsLinks += s.resultUrl ? '<a href="' + s.resultUrl + '" target="_blank" class="btn btn-xs btn-outline-success p-1" style="font-size:9px; font-weight:bold;">रिजल्ट</a>' : '';
        docsLinks += '</div>';

        let typeBadge = s.isRenewal ? '<span class="badge bg-warning text-dark" style="font-size:10px;">रिन्यूअल</span>' : '<span class="badge bg-primary" style="font-size:10px;">नवीन</span>';
        let fullAddressText = `<small class="text-muted d-block mt-1" style="font-size:10px; background:#f1f5f9; padding:2px 5px; border-radius:4px; max-width:180px; word-wrap:break-word;">📍 <b>पता:</b> ${s.permanentAddress || 'N/A'}, ${s.blockName || ''}, ${s.districtName || ''}</small>`;

        rows += '<tr class="align-middle" style="font-size:12px;"><td>' + (idx + 1) + '</td><td class="text-start"><b>' + s.studentName + '</b><br>' + typeBadge + '</td><td>' + s.fatherName + '</td><td><b>' + s.mobile + '</b>' + fullAddressText + '</td><td>' + docsLinks + '</td><td><div class="d-flex justify-content-center"><input type="text" id="room-' + s.mobile + '" class="form-control form-control-sm me-1" value="' + (s.roomNumber || '') + '" style="width:45px; height:24px; font-size:11px;"><button onclick="saveRoom(\'' + s.mobile + '\')" class="btn btn-sm btn-dark py-0 px-1" style="font-size:11px;">सेव</button></div></td><td>' + actionBtn + '</td><td><button onclick="secureRemoveStudent(\'' + s.mobile + '\',\'' + s.studentName + '\')" class="btn btn-sm btn-danger py-0 px-1" style="font-size:11px;">Remove</button></td></tr>';
    });

    let archiveRows = '';
    let archCounter = 1;
    archives.forEach((arc) => {
        let matchingHistories = arc.history.filter(h => h.session === selectedSession);
        matchingHistories.forEach(h => {
            let badgeColor = h.type === 'Renewal' ? 'bg-warning text-dark' : h.type === 'Removed' ? 'bg-danger text-white' : 'bg-primary';
            let reasonText = h.type === 'Removed' ? `<br><small class="text-danger">💥 <b>कारण:</b> ${h.removeReason}</small>` : '';
            let locInfo = `<small class="text-secondary d-block" style="font-size:10px;">📍 ${h.permanentAddress || 'N/A'}, ब्लॉक: ${h.blockName || ''}, जिला: ${h.districtName || ''}</small>`;

            archiveRows += `<tr style="font-size:12px;"><td>${archCounter++}</td><td><b>${arc.studentName}</b><br><small class="text-muted">ID: ${arc.studentMobile}</small>${locInfo}</td><td><span class="badge ${badgeColor}">सत्र ${h.session} (${h.type})</span>${reasonText}</td><td>${h.studentClass || 'N/A'}</td><td>${h.collegeName || 'N/A'}</td></tr>`;
        });
    });

    let admHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>प्रशासनिक कंट्रोल हब</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="bg-light p-2 p-md-4"><div class="row g-3 mb-4"><div class="col-lg-3 col-md-6"><div class="bg-white border p-3 rounded shadow-sm"><h5>⚙️ लोगो बदलें</h5><form action="/update-logo" method="POST" enctype="multipart/form-data"><input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-primary w-100">अपलोड</button></form><hr><form action="/update-merit" method="POST"><h5>📋 मेरिट सूची लिंक</h5><input type="url" name="meritListLink" class="form-control form-control-sm mb-2" value="' + (config.meritListLink || '') + '"><button type="submit" class="btn btn-sm btn-success w-100">सेव</button></form></div></div><div class="col-lg-3 col-md-6"><div class="bg-white border p-3 rounded shadow-sm"><h5>📢 नया नोटिस</h5><form action="/post-notice" method="POST"><input type="text" name="noticeText" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-danger w-100">लाइव करें</button></form></div></div>';
    admHtml += '<div class="col-lg-3 col-md-6"><div class="bg-white border p-3 rounded shadow-sm"><h5>⚙️ वॉर्डन विवरण</h5><form action="/update-warden" method="POST" enctype="multipart/form-data" class="row g-2"><input type="text" name="w1Name" class="form-control form-control-sm" value="' + currentWarden.w1Name + '"><input type="text" name="w1Mobile" class="form-control form-control-sm" value="' + currentWarden.w1Mobile + '"><input type="file" name="w1PhotoFile" class="form-control form-control-sm"><input type="text" name="helpLineNumber" class="form-control form-control-sm" value="' + (currentWarden.helpLineNumber || "9329088615") + '"><button type="submit" class="btn btn-sm btn-warning w-100 mt-2">सुरक्षित करें</button></form></div></div>';
    admHtml += '<div class="col-lg-3 col-md-6"><div class="bg-white border p-3 rounded shadow-sm"><h5>🎛️ दस्तावेज़ मैट्रिक्स</h5><button onclick="toggleF(\'photoActive\')" class="btn btn-sm w-100 mb-1 btn-' + (config.photoActive?'success':'danger') + '">फ़ोटो</button><button onclick="toggleF(\'signatureActive\')" class="btn btn-sm w-100 mb-1 btn-' + (config.signatureActive?'success':'danger') + '">हस्ताक्षर</button><button onclick="toggleF(\'aadharActive\')" class="btn btn-sm w-100 mb-1 btn-' + (config.aadharActive?'success':'danger') + '">आधार</button><button onclick="toggleF(\'resultActive\')" class="btn btn-sm w-100 mb-1 btn-' + (config.resultActive?'success':'danger') + '">मार्कशीट</button></div></div></div>';

    admHtml += '<div class="card p-3 mb-4 shadow-sm border-start border-primary border-4 bg-white"><div class="d-flex justify-content-between align-items-center mb-3 flex-wrap"><div><h4 class="text-primary fw-bold mb-0 fs-5">🗄️ डेटा रिकॉर्ड हब (सत्र अनुसार आर्काइव फ़ाइलें)</h4></div><div><form method="GET" action="/view-students" class="d-flex gap-2 align-items-center"><label class="fw-bold small mb-0 text-secondary">सत्र चुनें:</label><select name="filterSession" onchange="this.form.submit()" class="form-select form-select-sm" style="width:140px;"><option value="2026-27" ${selectedSession==="2026-27"?"selected":""}>2026-27</option><option value="2027-28" ${selectedSession==="2027-28"?"selected":""}>2027-28</option><option value="2028-29" ${selectedSession==="2028-29"?"selected":""}>2028-29</option></select></form></div></div><div class="table-responsive" style="max-height:280px; overflow-y:auto;"><table class="table table-bordered table-striped table-sm text-center align-middle"><thead class="table-secondary"><tr><th>क्र.</th><th>छात्र एवं पता</th><th>सत्र स्थिति (Status)</th><th>कक्षा</th><th>स्कूल/कॉलेज का नाम</th></tr></thead><tbody>' + (archiveRows || `<tr><td colspan="5" class="p-3 text-muted">सत्र ${selectedSession} में कोई आर्काइव रिकॉर्ड नहीं मिला।</td></tr>`) + '</tbody></table></div></div>';

    admHtml += '<div class="bg-white border p-2 rounded shadow-sm table-responsive"><h4 class="text-center text-primary fw-bold mb-3 fs-5">🔒 हॉस्टल लाइव छात्र सूची</h4><table class="table table-bordered table-striped text-center align-middle" style="min-width: 950px;"><thead class="table-dark"><tr><th>S.No</th><th>छात्र</th><th>पिता</th><th>मोबाइल व पता</th><th>📁 दस्तावेज़</th><th>ROOM अलॉट</th><th>Approval</th><th>हटाएं</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8">कोई छात्र रिकॉर्ड नहीं है।</td></tr>') + '</tbody></table></div>';
    
    admHtml += '<script>function saveRoom(id){ const val=document.getElementById("room-"+id).value; fetch("/assign-room",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id,roomNumber:val})}).then(()=>location.reload())} function approveStudent(id){ fetch("/approve-student",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id})}).then(()=>location.reload())} function secureRemoveStudent(id, name){ const reason = prompt("⚠️ छात्र \'" + name + "\' का रिकॉर्ड हटाने का मुख्य कारण (Reason) दर्ज करें:"); if(!reason) { alert("❌ कारण लिखना अनिवार्य है! रिमूवल निरस्त।"); return; } const doubleCheck = prompt("💥 सुरक्षा जांच! रिकॉर्ड हटाने के लिए बड़े अक्षरों में YES टाइप करें:"); if(doubleCheck === "YES"){ fetch("/remove-student",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:id, removeReason: reason})}).then(()=>location.reload()); } else { alert("❌ निरस्त कर दिया गया है।"); } } function toggleF(field){ fetch("/toggle-field-setting",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({field:field})}).then(()=>location.reload()); }</script></body></html>';
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

app.post('/remove-student', async (req, res) => {
    try {
        const studentId = req.body.studentId;
        const reason = req.body.removeReason || "निष्कासित";
        const currentSession = getDynamicSession();
        const s = await Student.findOne({ mobile: studentId });
        if(s) {
            let archiveRecord = await Archive.findOne({ studentMobile: studentId });
            const historyEntry = {
                session: currentSession,
                type: 'Removed',
                studentClass: s.studentClass,
                collegeName: s.collegeName,
                permanentAddress: s.permanentAddress,
                blockName: s.blockName,
                districtName: s.districtName,
                dateArchived: new Date().toLocaleDateString(),
                removeReason: reason,
                fullSnapshot: s
            };
            if (archiveRecord) {
                archiveRecord.history.push(historyEntry);
                await archiveRecord.save();
            } else {
                const newArchive = new Archive({
                    studentMobile: studentId,
                    studentName: s.studentName,
                    history: [historyEntry],
                    yearsActive: 1
                });
                await newArchive.save();
            }
            await Student.deleteOne({ mobile: studentId });
        }
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: true }); }
});

app.post('/update-warden', uploadMiddleware, async (req, res) => { 
    let cur = await Warden.findOne({}) || defaultWarden; let p1 = cur.w1Photo, p2 = cur.w2Photo;
    if (req.files) {
        if (req.files['w1PhotoFile']) p1 = req.files['w1PhotoFile'][0].path;
        if (req.files['w2PhotoFile']) p2 = req.files['w2PhotoFile'][0].path;
    }
    const updated = { w1Name: req.body.w1Name || cur.w1Name, w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: req.body.w1Mobile || cur.w1Mobile, w1Office: "कार्यालय कक्ष 01", w1Photo: p1, w2Name: req.body.w2Name || cur.w2Name, w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: req.body.w2Mobile || cur.w2Mobile, w2Office: "कार्यालय कक्ष 02", w2Photo: p2, helpLineNumber: req.body.helpLineNumber || cur.helpLineNumber || "9329088615" }; 
    await Warden.deleteMany({}); const nw = new Warden(updated); await nw.save(); res.redirect('/view-students');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 भव्य क्लाउड सिंक सर्वर पूरी तरह से एक्टिव है!'));
