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

// ⚡ छात्र फ़ोटो, वॉर्डन फ़ोटो और सभी सरकारी दस्तावेज़ों को प्रोसेस करने वाला मल्टी-अपलोड इंजन
const uploadMiddleware = multer({ storage: storage }).fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'fatherAadharFile', maxCount: 1 },
    { name: 'motherAadharFile', maxCount: 1 },
    { name: 'casteCertFile', maxCount: 1 },
    { name: 'residenceCertFile', maxCount: 1 },
    { name: 'incomeCertFile', maxCount: 1 },
    { name: 'distanceCertFile', maxCount: 1 },
    { name: 'ayushmanFile', maxCount: 1 },
    { name: 'rationCardFile', maxCount: 1 },
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

// 🔒 मोंगोडीबी क्लाउड तिजोरी कनेक्शन लिंक
const mongoURI = "mongodb+srv://surajpurprimatricsthostelsuraj_db_user:HostelSurajpur2026@cluster0.jztdqxu.mongodb.net/hostelData?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("🎰 मोंगोडीबी क्लाउड तिजोरी कनेक्ट हो गई है!"))
    .catch(err => console.error("❌ मोंगोडीबी कनेक्शन एरर:", err));

// 📝 मोंगोडीबी डेटा स्कीमा मॉडल्स (दस्तावेज़ ट्रैकिंग के साथ)
const StudentSchema = new mongoose.Schema({
    id: String, appNo: String, studentName: String, dob: String, aadharCard: String, mobile: String,
    fatherName: String, motherName: String, annualIncome: Number, category: String, subCast: String,
    permanentAddress: String, blockName: String, districtName: String, homeDistance: Number,
    studentClass: String, course: String, collegeName: String, prevPercent: String, photoUrl: String,
    fatherAadharUrl: { type: String, default: "" }, motherAadharUrl: { type: String, default: "" },
    casteCertUrl: { type: String, default: "" }, residenceCertUrl: { type: String, default: "" },
    incomeCertUrl: { type: String, default: "" }, distanceCertUrl: { type: String, default: "" },
    ayushmanUrl: { type: String, default: "" }, rationCardUrl: { type: String, default: "" },
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

const defaultWarden = {
    w1Name: "श्री पवन कुमार", w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: "9329088615", w1Office: "कार्यालय कक्ष 01", w1Photo: "https://via.placeholder.com/150",
    w2Name: "सहायक अधीक्षक", w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: "9999999999", w2Office: "कार्यालय कक्ष 02", w2Photo: "https://via.placeholder.com/150"
};
const defaultLogo = { url: "https://via.placeholder.com/800x250?text=HOSTEL+BANNER+LOGO" };
// 🏠 मुख्य पृष्ठ (✨ Grand Mega Premium Edition - Bigger Logo & Strict Rules)
app.get('/', async (req, res) => {
    try {
        const students = await Student.find({});
        const stApproved = students.filter(s => s.approved === true && s.category && s.category.includes('ST')).length;
        const scApproved = students.filter(s => s.approved === true && s.category && s.category.includes('SC')).length;
        const stAvailable = Math.max(0, 100 - stApproved);
        const scAvailable = Math.max(0, 50 - scApproved);

        res.send(`
            <!DOCTYPE html>
            <html lang="hi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { background-color: #f4f6f9; color: #212529; font-family: 'Segoe UI', system-ui, sans-serif; }
                    .navbar { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important; }
                    .card { background-color: #ffffff; border: none; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.03); }
                    .logo-container { width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 25px; background: #fff; text-align: center; border: 2px solid #dee2e6; }
                    .logo-img { width: 100%; height: auto; max-height: 320px; display: block; margin: 0 auto; object-fit: contain; padding: 5px; }
                    .premium-btn { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; text-align: center; text-decoration: none; display: block; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                    .premium-btn:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.06); }
                    .premium-btn.reg { border-bottom: 5px solid #0d6efd; }
                    .premium-btn.stat { border-bottom: 5px solid #198754; }
                    .tracker-card { background: #ffffff; border-radius: 14px; border-top: 4px solid #3b82f6; box-shadow: 0 4px 6px rgba(0,0,0,0.01); }
                    .tracker-card.sc { border-top: 4px solid #10b981; }
                    .whatsapp-float { position: fixed; bottom: 25px; right: 25px; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); color: white; border-radius: 30px; text-align: center; font-weight: 600; box-shadow: 0 10px 20px rgba(37,211,102,0.3); z-index: 1000; text-decoration: none; padding: 12px 24px; display: flex; align-items: center; gap: 8px; }
                </style>
            </head>
            <body>
            <nav class="navbar navbar-expand-lg navbar-dark mb-4 shadow-sm py-3">
                <div class="container">
                    <a class="navbar-brand fw-bold text-warning fs-4" href="/">🏢 शासकीय प्री मैट्रिक ST/SC बालक छात्रावास सूरजपुर</a>
                    <div class="navbar-nav ms-auto"><a class="nav-link btn btn-outline-warning text-white px-4 py-1" href="/view-students" target="_blank">🔒 प्रशासनिक लॉगिन (Admin)</a></div>
                </div>
            </nav>
            <div class="container">
                <div class="row mb-4"><div class="col-12 text-center"><button class="btn btn-danger fw-bold shadow px-5 py-2.5 rounded-pill text-warning fs-5" style="border: 2px solid #ffc107;" data-bs-toggle="modal" data-bs-target="#rulesModal">📜 छात्रावास के कड़े नियम एवं अनिवार्य अनुशासन नियमावली (टच करें) ➔</button></div></div>
                
                <div class="row g-3 mb-4 text-center">
                    <div class="col-md-6">
                        <div class="card p-3 tracker-card h-100"><span class="text-secondary small fw-bold">अनुसूचित जनजाति (ST) सीट ट्रैकर</span><div class="d-flex justify-content-around align-items-center mt-2"><div><small class="text-muted">कुल सीटें</small><h4 class="fw-bold text-primary mb-0">100</h4></div><div><small class="text-muted">कन्फर्म</small><h4 class="fw-bold text-success mb-0">\${stApproved}</h4></div><div><small class="text-muted">खाली सीटें</small><h4 class="fw-bold text-danger mb-0">\ Astro; \${stAvailable}</h4></div></div></div>
                    </div>
                    <div class="col-md-6">
                        <div class="card p-3 tracker-card sc h-100"><span class="text-secondary small fw-bold">अनुसूचित जाति (SC) सीट ट्रैकर</span><div class="d-flex justify-content-around align-items-center mt-2"><div><small class="text-muted">कुल सीटें</small><h4 class="fw-bold text-primary mb-0">50</h4></div><div><small class="text-muted">कन्फर्म</small><h4 class="fw-bold text-success mb-0">\${scApproved}</h4></div><div><small class="text-muted">खाली सीटें</small><h4 class="fw-bold text-danger mb-0">\${scAvailable}</h4></div></div></div>
                    </div>
                </div>

                <div class="card p-3 mb-4 border-start border-primary border-4 bg-white shadow-sm">
                    <h6 class="fw-bold text-primary mb-1">ℹ️ छात्रावास परिचय</h6>
                    <p class="text-muted small mb-0">यह भव्य छात्रावास आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन द्वारा संचालित है, जहाँ सूरजपुर जिले के सुदूर ग्रामीण अंचलों के प्रतिभावान छात्रों को निःशुल्क आवासीय एवं आधुनिक शैक्षणिक सुविधाएँ दी जाती हैं।</p>
                </div>
                <div class="row g-4">
                    <div class="col-md-8">
                        <div class="logo-container shadow-sm"><img id="hostel-logo" src="" alt="Hostel Logo" class="logo-img"></div>
                        <div class="card p-3 mb-4 shadow-sm">
                            <div class="card-header bg-danger text-white rounded mb-2 fw-bold fs-6">📢 लाइव आधिकारिक सूचना पट्ट (Notice Board)</div>
                            <ul id="live-notices" class="list-group list-group-flush"></ul>
                        </div>
                        <hr class="my-4 border-secondary opacity-25">
                        
                        <div class="row g-4 mb-5">
                            <div class="col-md-6">
                                <a href="/registration-form" class="premium-btn reg text-dark shadow-sm">
                                    <span style="font-size: 45px; display:block;" class="mb-2">📝</span>
                                    <h4 class="fw-bold text-primary">ऑनलाइन प्रवेश पंजीकरण फॉर्म</h4>
                                    <span class="badge bg-primary px-3 py-2 my-2 fs-6">सत्र 2026-27 (नवीन)</span>
                                    <p class="text-muted small mb-0 mt-1">डिजिटल माध्यम से हॉस्टल एडमिशन अप्लाई करने हेतु यहाँ क्लिक करें</p>
                                </a>
                            </div>
                            <div class="col-md-6">
                                <a href="/check-status-page" class="premium-btn stat text-dark shadow-sm">
                                    <span style="font-size: 45px; display:block;" class="mb-2">🔍</span>
                                    <h4 class="fw-bold text-success">डिजिटल प्रोफाइल / रूम अलॉटमेंट</h4>
                                    <span class="badge bg-success px-3 py-2 my-2 fs-6">लाइव अलॉटमेंट रिजल्ट</span>
                                    <p class="text-muted small mb-0 mt-1">अपना रूम नंबर, रसीद डाउनलोड और स्टेटस जाँचने हेतु यहाँ क्लिक करें</p>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card p-3 text-center mb-4 border-top border-warning border-4 shadow-sm">
                            <div class="card-header bg-light text-dark fw-bold rounded mb-3 border-0 fs-6">👨‍💼 छात्रावास प्रशासन प्रमुख (Warden Corner)</div>
                            <div class="row g-2">
                                <div class="col-6 border-end">
                                    <img id="w1-img" src="" class="rounded border mb-2 shadow-sm" style="width: 90px; height: 90px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/150'">
                                    <h6 id="w1-name" class="fw-bold text-dark mb-0 small"></h6>
                                    <small id="w1-desig" class="text-muted block" style="font-size:10px;"></small>
                                    <div class="text-start bg-light p-2 rounded border mt-2" style="font-size:10px;">
                                        <b>📞:</b> <span id="w1-phone"></span><br><b>🏢:</b> <span id="w1-office"></span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <img id="w2-img" src="" class="rounded border mb-2 shadow-sm" style="width: 90px; height: 90px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/150'">
                                    <h6 id="w2-name" class="fw-bold text-dark mb-0 small"></h6>
                                    <small id="w2-desig" class="text-muted block" style="font-size:10px;"></small>
                                    <div class="text-start bg-light p-2 rounded border mt-2" style="font-size:10px;">
                                        <b>📞:</b> <span id="w2-phone"></span><br><b>🏢:</b> <span id="w2-office"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card p-3 shadow-sm border-top border-success border-4">
                            <div class="card-header bg-light text-success fw-bold rounded mb-2 border-0 fs-6 text-center">📋 छात्रावास फाइनल मेरिट चयन सूची</div>
                            <a href="/public-admission-list" target="_blank" class="btn btn-sm btn-success w-100 fw-bold py-2 mt-1 rounded-3">चयनित छात्रों की सूची देखें ➔</a>
                        </div>
                    </div>
                </div>
            </div>

            <a id="whatsapp-link" href="#" target="_blank" class="whatsapp-float">💬 आधिकारिक वॉर्डन सहायता केंद्र</a>

            <div class="modal fade" id="rulesModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content text-dark">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title fw-bold text-warning">📜 शासकीय छात्रावास अनिवार्य नियम एवं अनुशासन नियमावली</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4" style="font-size: 15px; line-height: 1.8;">
                            <ol class="fw-bold text-secondary">
                                <li class="mb-2">छात्रावास में चयनित प्रत्येक छात्र को मेस (भोजन व्यवस्था) में सम्मिलित होना तथा नियमों का पालन करना अनिवार्य है।</li>
                                <li class="mb-2">स्थानीय शिक्षण संस्थान (स्कूल/कॉलेज) में छात्र की नियमित उपस्थिति न्यूनतम 75% होना अनिवार्य है।</li>
                                <li class="mb-2">बिना अधीक्षक की लिखित अनुमति के छात्रावास से अनुपस्थित रहने पर तत्काल प्रभाव से निष्कासित किया जाएगा।</li>
                                <li class="mb-2">किसी भी बाहरी या अप्रवेशी व्यक्ति को छात्रावास परिसर में ठहराना पूर्णतः वर्जित एवं दण्डनीय अपराध है।</li>
                                class="mb-2">परिसर के भीतर किसी भी प्रकार के मादक पदार्थ या अनुशासनहीनता पाए जाने पर बिना नोटिस निष्कासन की कार्रवाई की जाएगी।</li>
                            </ol>
                        </div>
                        <div class="modal-footer"><button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">मैंने नियम पढ़ लिए हैं</button></div>
                    </div>
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script>
                window.onload = function() {
                    fetch('/get-logo').then(res => res.json()).then(logo => { document.getElementById('hostel-logo').src = logo.url; });
                    fetch('/get-notices').then(res => res.json()).then(notices => {
                        const list = document.getElementById('live-notices');
                        list.innerHTML = notices.length === 0 ? "<li class='text-muted text-center p-3'>कोई नया नोटिस नहीं है।</li>" : "";
                        notices.forEach(n => { list.innerHTML += "<li class='list-group-item bg-white text-dark border-bottom mb-1 p-2'><b class='text-danger'>[" + n.date + "]:</b> " + n.text + "</li>"; });
                    });
                    fetch('/get-warden').then(res => res.json()).then(w => {
                        document.getElementById('w1-img').src = w.w1Photo; document.getElementById('w1-name').innerText = w.w1Name;
                        document.getElementById('w1-desig').innerText = w.w1Desig; document.getElementById('w1-phone').innerText = w.w1Mobile; document.getElementById('w1-office').innerText = w.w1Office;
                        document.getElementById('w2-img').src = w.w2Photo; document.getElementById('w2-name').innerText = w.w2Name;
                        document.getElementById('w2-desig').innerText = w.w2Desig; document.getElementById('w2-phone').innerText = w.w2Mobile; document.getElementById('w2-office').innerText = w.w2Office;
                        document.getElementById('whatsapp-link').href = "https://wa.me/91" + w.w1Mobile + "?text=नमस्ते अधीक्षक सर, मैं सूरजपुर छात्रावास पोर्टल के संबंध में आपसे सहायता चाहता हूँ।";
                    });
                };
            </script>
            </body>
            </html>
        `);
    } catch (err) { res.status(500).send("Error loading home page"); }
});
// 📝 लिंक 1: ऑनलाइन रजिस्ट्रेशन फॉर्म पेज
app.get('/registration-form', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head>
            <meta charset="UTF-8">
            <title>प्रवेश हेतु आवेदन पत्र 2026-27</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>body{ background-color: #f8f9fa; } .section-title { background-color: #e9ecef; padding: 6px 12px; font-weight: bold; border-left: 4px solid #0d6efd; margin-top: 15px; margin-bottom: 15px; color: #333; }</style>
        </head>
        <body class="p-4">
            <div class="container" style="max-width: 950px;">
                <div class="card p-4 shadow shadow-sm bg-white border-0">
                    <div class="text-center mb-3">
                        <h5 class="text-muted mb-1">आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन</h5>
                        <h3 class="text-primary fw-bold">छात्रावास में प्रवेश हेतु आवेदन पत्र (नवीन)</h3>
                        <h6 class="fw-bold">वर्ष 2026-27</h6>
                    </div>
                    <form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">
                        <div class="section-title">1. व्यक्तिगत जानकारी एवं फोटो</div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का नाम (आधार के अनुसार):</label><input type="text" name="studentName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">जन्मतिथि (DOB):</label><input type="date" name="dob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का वर्ग (Category):</label><select name="category" class="form-select" required><option value="ST">अनुसूचित जनजाति (ST)</option><option value="SC">अनुसूचित जाति (SC)</option></select></div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी की जाति:</label><input type="text" name="subCast" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पालक का मोबाइल नंबर:</label><input type="tel" name="mobile" class="form-control" required></div>
                        <div class="col-12"><label class="form-label fw-bold text-danger">📸 छात्र की फोटो अपलोड करें (अनिवार्य):</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" required></div>
                        
                        <div class="section-title">2. पारिवारिक विवरण एवं पालक आधार</div>
                        <div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">पिता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="fatherAadharFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">माता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="motherAadharFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पालक की वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" required></div>

                        <div class="section-title">3. सरकारी प्रमाण पत्र एवं कार्ड फ़ोटो अपलोड (अनिवार्य दस्तावेज़)</div>
                        <div class="col-md-6"><label class="form-label fw-bold text-primary">जाति प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="casteCertFile" class="form-control" accept="image/*,application/pdf" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold text-primary">निवास प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="residenceCertFile" class="form-control" accept="image/*,application/pdf" required></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">आय प्रमाण पत्र अपलोड:</label><input type="file" name="incomeCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">दूरी प्रमाण पत्र अपलोड:</label><input type="file" name="distanceCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">आयुष्मान कार्ड अपलोड:</label><input type="file" name="ayushmanFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold text-primary">राशन कार्ड फ़ोटो अपलोड (अनिवार्य):</label><input type="file" name="rationCardFile" class="form-control" accept="image/*,application/pdf" required></div>

                        <div class="section-title">4. पता एवं विद्यालय विवरण</div>
                        <div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">विकासखंड:</label><input type="text" name="blockName" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">जिला:</label><input type="text" name="districtName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">घर से शाला की दूरी (कि.मी.):</label><input type="number" name="homeDistance" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">वर्तमान कक्षा/वर्ष:</label><input type="text" name="studentClass" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">कोर्स / ब्रांच:</label><input type="text" name="course" class="form-control" required></div>
                        <div class="col-md-8"><label class="form-label fw-bold">शाला/कॉलेज का नाम:</label><input type="text" name="collegeName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पिछला परीक्षा प्रतिशत (%):</label><input type="text" name="prevPercent" class="form-control" required></div>
                        
                        <div class="col-12 mt-4"><button type="submit" class="btn btn-primary w-100 fw-bold fs-5 shadow-sm">🚀 ऑनलाइन आवेदन पत्र सुरक्षित रूप से जमा करें</button></div>
                    </form>
                    <div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/check-status-page', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head><title>अलॉटमेंट रिजल्ट स्टेटस</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
        <body class="p-5 bg-light">
            <div class="container" style="max-width: 650px;">
                <div class="card p-4 shadow-sm bg-white border border-success mb-4">
                    <h3 class="text-center text-success fw-bold mb-4">🔍 छात्रावास अलॉटमेंट रिजल्ट / स्टेटस</h3>
                    <div class="input-group mb-3">
                        <input type="tel" id="searchMobile" class="form-control" placeholder="रजिस्टर्ड मोबाइल नंबर दर्ज करें...">
                        <button onclick="checkStatus()" class="btn btn-success fw-bold">रिजल्ट देखें</button>
                    </div>
                    <div id="statusResult"></div>
                </div>
                <div class="card p-4 shadow-sm bg-white border border-warning">
                    <h4 class="text-center text-warning fw-bold mb-3">⚠️ आवेदन पत्र में त्रुटि सुधार (Edit Form)</h4>
                    <div class="input-group">
                        <input type="tel" id="editMobile" class="form-control" placeholder="अपना रजिस्टर्ड मोबाइल नंबर डालें...">
                        <button onclick="openEditForm()" class="btn btn-warning fw-bold">त्रुटि सुधार खोलें</button>
                    </div>
                </div>
                <div class="text-center mt-4"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
            </div>
            <script>
                function checkStatus() {
                    const mobile = document.getElementById('searchMobile').value; if(!mobile) { alert('कृपया मोबाइल नंबर लिखें!'); return; }
                    window.location.href = '/get-receipt-view?mobile=' + mobile;
                }
                function openEditForm() {
                    const m = document.getElementById('editMobile').value; if(!m) return alert('नंबर लिखें!'); window.location.href = '/edit-student-form?mobile=' + m;
                }
            </script>
        </body>
        </html>
    `);
});
app.get('/public-admission-list', async (req, res) => {
    try {
        const list = await Student.find({ approved: true });
        let rows = '';
        list.forEach((s, idx) => {
            rows += '<tr><td>' + (idx+1) + '</td><td><b>' + s.studentName + '</b></td><td>' + s.fatherName + '</td><td>' + s.studentClass + '</td><td><span class="badge bg-success fs-6">' + (s.roomNumber || 'वेटिंग') + '</span></td></tr>';
        });
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>चयन सूची 2026-27</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="p-5 bg-light"><div class="container" style="max-width: 850px;"><div class="card p-4 shadow-sm bg-white"><h4 class="text-center text-primary fw-bold mb-4">📋 स्वीकृत छात्र प्रवेश चयन सूची (सत्र 2026-27)</h4><table class="table table-bordered table-striped text-center"><thead class="table-dark"><tr><th>S.No</th><th>छात्र का नाम</th><th>पिता का नाम</th><th>कक्षा</th><th>रूूूम नंबर</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="text-center text-muted">अभी कोई चयन सूची स्वीकृत नहीं है।</td></tr>') + '</tbody></table><div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ</a></div></div></div></body></html>');
    } catch(e) { res.status(500).send("Error"); }
});

app.get('/edit-student-form', async (req, res) => {
    try {
        const mobileQuery = (req.query.mobile || '').trim();
        const student = await Student.findOne({ mobile: mobileQuery });
        if (!student) return res.send("<h1>❌ रिकॉर्ड नहीं मिला!</h1>");

        res.send(`
            <!DOCTYPE html><html><head><meta charset="UTF-8"><title>त्रुटि सुधार</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
            <body class="p-4 bg-light"><div class="container" style="max-width: 900px;"><div class="card p-4 bg-white border border-warning shadow-sm"><h2 class="text-center text-warning fw-bold mb-4">🛠️ आवेदन पत्र में त्रुटि सुधार</h2>
                        <form action="/submit-form" method="POST" enctype="multipart/form-data" class="row g-3">
                            <input type="hidden" name="mobile" value="${student.mobile}"><input type="hidden" name="existingPhoto" value="${student.photoUrl}">
                            <div class="col-md-6"><label class="form-label fw-bold">विद्यार्थी का नाम:</label><input type="text" name="studentName" class="form-control" value="${student.studentName || ''}" required></div>
                            <div class="col-md-6"><label class="form-label fw-bold">आधार नंबर:</label><input type="text" name="aadharCard" class="form-control" value="${student.aadharCard || ''}" required></div>
                            <div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" value="${student.fatherName || ''}" required></div>
                            <div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" value="${student.permanentAddress || ''}" required></div>
                            <div class="col-md-4"><label class="form-label fw-bold">वर्तमान कक्षा:</label><input type="text" name="studentClass" class="form-control" value="${student.studentClass || ''}" required></div>
                            <div class="col-md-4"><label class="form-label fw-bold">शाला का नाम:</label><input type="text" name="collegeName" class="form-control" value="${student.collegeName || ''}" required></div>
                            <div class="col-md-4"><label class="form-label fw-bold">पिछला प्रतिशत (%):</label><input type="text" name="prevPercent" class="form-control" value="${student.prevPercent || ''}" required></div>
                            <div class="col-12"><label class="form-label text-danger">📸 नई फोटो (यदि बदलना चाहें):</label><input type="file" name="studentPhoto" class="form-control" accept="image/*"></div>
                            <div class="col-12 mt-4"><button type="submit" class="btn btn-warning w-100 text-dark fw-bold">🔄 जानकारी सुरक्षित करें</button></div>
                        </form>
                    </div></div></body></html>
        `);
    } catch(err) { res.status(500).send("Error"); }
});

// 🎫 [GRAND DIGITAL RECEIPT] बारकोड लुक और ऑफिशियल वाटरमार्क वाली भव्य रसीद
app.get('/get-receipt-view', async (req, res) => {
    try {
        const sData = await Student.findOne({ mobile: req.query.mobile.trim() });
        if (!sData) return res.send("<h2>❌ रिकॉर्ड नहीं मिला!</h2><a href='/'>वापस</a>");
        let badge = sData.approved ? '<span class="badge bg-success p-2 fs-6">✅ ADMISSION CONFIRMED</span>' : '<span class="badge bg-danger p-2 fs-6">⏳ PENDING APPROVAL</span>';

        res.send(\`
            <!DOCTYPE html><html><head><meta charset="UTF-8"><title>डिजिटल पावती रसीद</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #f1f5f9; }
                .receipt-box { background: white; border: 4px double #1e293b; max-width: 750px; margin: 30px auto; padding: 30px; border-radius: 8px; position: relative; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
                .watermark { position: absolute; top: 35%; left: 15%; font-size: 55px; color: rgba(15, 23, 42, 0.04); transform: rotate(-25deg); font-weight: 900; pointer-events: none; text-transform: uppercase; user-select: none; }
                .stamp { border: 3px dashed #16a34a; color: #16a34a; transform: rotate(-5deg); display: inline-block; padding: 5px 15px; font-weight: bold; border-radius: 4px; font-size: 13px; }
                @media print { .no-print { display: none; } body { background: white; } .receipt-box { border: 2px solid #000; box-shadow: none; margin: 0; } }
            </style></head>
            <body><div class="container">
                <div class="receipt-box">
                    <div class="watermark">SURAJPUR HOSTEL</div>
                    <div class="row border-bottom pb-3 mb-4 align-items-center">
                        <div class="col-2 text-center"><img src="https://via.placeholder.com/80?text=GOVT" class="img-fluid"></div>
                        <div class="col-8 text-center">
                            <h6 class="text-secondary fw-bold mb-0" style="font-size:12px; letter-spacing:1px;">आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन</h6>
                            <h4 class="fw-bold text-dark my-1" style="font-family:'Georgia',serif;">प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर</h4>
                            <span class="badge bg-dark px-3 py-1 text-warning fw-bold" style="font-size:11px;">🔒 ऑफिशियल डिजिटल पावती रसीद (सत्र 2026-27)</span>
                        </div>
                        <div class="col-2 text-center"><div class="stamp">DIGITAL<br>VERIFIED</div></div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-8">
                            <h5 class="fw-bold text-primary mb-3">🎫 कोड रसीद संख्या: <span class="text-danger">\${sData.appNo}</span></h5>
                            <p class="mb-2"><b>विद्यार्थी का नाम (Name):</b> \${sData.studentName}</p>
                            <p class="mb-2"><b>पिता का नाम (Father):</b> \${sData.fatherName}</p>
                            <p class="mb-2"><b>पंजीकृत मोबाइल (Mobile):</b> +91 \${sData.mobile}</p>
                            <p class="mb-2"><b>कैटेगरी / वर्ग (Category):</b> \${sData.category} (\${sData.subCast || 'ST'})</p>
                        </div>
                        <div class="col-4 text-end">
                            <img src="\${sData.photoUrl}" class="img-thumbnail shadow-sm mb-2" style="width: 130px; height: 140px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/150'">
                            <div>\${badge}</div>
                        </div>
                    </div>
                    <table class="table table-bordered bg-light" style="font-size:14px;">
                        <tr><th class="bg-dark text-white" style="width:35%;">वर्तमान कक्षा/वर्ष</th><td>\${sData.studentClass} (\${sData.course || 'N/A'})</td></tr>
                        <tr><th class="bg-dark text-white">अध्ययनरत शाला/संस्थान</th><td>\${sData.collegeName}</td></tr>
                        <tr><th class="bg-dark text-white">घर से शाला की दूरी / पता</th><td>\${sData.homeDistance} KM - \${sData.permanentAddress}, \${sData.blockName} (\${sData.districtName})</td></tr>
                        <tr><th class="bg-dark text-white">आबंटित रूम नंबर (Room)</th><td><b class="text-danger fs-5">\${sData.roomNumber || 'अभी अलॉट नहीं हुआ'}</b></td></tr>
                        <tr><th class="bg-dark text-white">डिजिटल सबमिशन टाइम</th><td>\${sData.date}</td></tr>
                    </table>
                    <div class="border-top pt-3 mt-4 text-center">
                        <div class="mb-2 text-muted" style="font-size:10px; font-family:'Courier New';">||||| Barcode Verified Data Sync ||||| \${sData.aadharCard}</div>
                        <p class="small text-muted mb-0">यह रसीद कंप्यूटर जनित है, इसमें किसी भौतिक हस्ताक्षर की आवश्यकता नहीं है।</p>
                    </div>
                    <div class="text-center mt-4 no-print">
                        <button onclick="window.print()" class="btn btn-primary fw-bold px-4 me-2">🖨️ रसीद प्रिंट / PDF सेव करें</button>
                        <a href="/" class="btn btn-secondary px-4">🏠 मुख्य पृष्ठ पर जाएँ</a>
                    </div>
                </div>
            </div></body></html>
        \`);
    } catch(e) { res.status(500).send("Receipt view error"); }
});
// 🔒 सबमिशन प्रोसेसर (Cloud Sync Storage)
app.post('/submit-form', (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            let pPath = "https://via.placeholder.com/150", fAadhar = "", mAadhar = "", casteDoc = "", resDoc = "", incDoc = "", distDoc = "", ayushDoc = "", rationDoc = "";
            
            if (req.files) {
                if (req.files['studentPhoto']) pPath = req.files['studentPhoto'][0].path;
                if (req.files['fatherAadharFile']) fAadhar = req.files['fatherAadharFile'][0].path;
                if (req.files['motherAadharFile']) mAadhar = req.files['motherAadharFile'][0].path;
                if (req.files['casteCertFile']) casteDoc = req.files['casteCertFile'][0].path;
                if (req.files['residenceCertFile']) resDoc = req.files['residenceCertFile'][0].path;
                if (req.files['incomeCertFile']) incDoc = req.files['incomeCertFile'][0].path;
                if (req.files['distanceCertFile']) distDoc = req.files['distanceCertFile'][0].path;
                if (req.files['ayushmanFile']) ayushDoc = req.files['ayushmanFile'][0].path;
                if (req.files['rationCardFile']) rationDoc = req.files['rationCardFile'][0].path;
            }

            const cleanMobile = req.body.mobile.trim();
            const appNumber = "SUR-" + (req.body.category || "ST") + "-" + cleanMobile.slice(-4);

            const sData = {
                id: cleanMobile, appNo: appNumber, studentName: req.body.studentName, dob: req.body.dob || "", aadharCard: req.body.aadharCard,
                mobile: cleanMobile, fatherName: req.body.fatherName, motherName: req.body.motherName || "",
                annualIncome: req.body.annualIncome || 0, category: req.body.category || "ST", subCast: req.body.subCast || "",
                permanentAddress: req.body.permanentAddress, blockName: req.body.blockName, districtName: req.body.districtName,
                homeDistance: req.body.homeDistance, studentClass: req.body.studentClass, course: req.body.course || "N/A",
                collegeName: req.body.collegeName, prevPercent: req.body.prevPercent, photoUrl: pPath,
                date: new Date().toLocaleString()
            };

            if (fAadhar) sData.fatherAadharUrl = fAadhar; if (mAadhar) sData.motherAadharUrl = mAadhar;
            if (casteDoc) sData.casteCertUrl = casteDoc; if (resDoc) sData.residenceCertUrl = resDoc;
            if (incDoc) sData.incomeCertUrl = incDoc; if (distDoc) sData.distanceCertUrl = distDoc;
            if (ayushDoc) sData.ayushmanUrl = ayushDoc; if (rationDoc) sData.rationCardUrl = rationDoc;

            const old = await Student.findOne({ mobile: cleanMobile });
            if (old) { await Student.updateOne({ mobile: cleanMobile }, { $set: sData }); }
            else { const newStudent = new Student(sData); await newStudent.save(); }

            res.redirect('/get-receipt-view?mobile=' + cleanMobile);
        } catch (e) { res.status(500).send("Upload Form Error"); }
    });
});

// 🔒 प्रशासनिक कंट्रोल पैनल (✨ Document Viewer & Warden Photo Upload Fully Active)
app.get('/view-students', async (req, res) => {
    const auth = { login: 'admin', password: 'password123' }; const b64 = (req.headers.authorization || '').split(' ')[1] || ''; const [login, password] = Buffer.from(b64, 'base64').toString().split(':');
    if (!login || !password || login !== auth.login || password !== auth.password) { res.set('WWW-Authenticate', 'Basic realm="401"'); return res.status(401).send('❌ गलत पासवर्ड!'); }
    let currentWarden = await Warden.findOne({}) || defaultWarden; let sList = await Student.find({}); let rows = '';
    
    sList.forEach((s, idx) => {
        let actionBtn = s.approved ? '<span class="badge bg-success">Approved</span>' : '<button onclick="approveStudent(\'' + s.id + '\')" class="btn btn-sm btn-primary">Approve</button>';
        
        // 📁 [FIXED] एडमिन पैनल से छात्र के दस्तावेज़ लाइव एक क्लिक में खुलेंगे
        let docsLinks = '<a href="' + (s.casteCertUrl || '#') + '" target="_blank" class="btn btn-xs btn-outline-info p-1 me-1" style="font-size:10px;">जाति</a>';
        docsLinks += '<a href="' + (s.residenceCertUrl || '#') + '" target="_blank" class="btn btn-xs btn-outline-info p-1 me-1" style="font-size:10px;">निवास</a>';
        docsLinks += '<a href="' + (s.rationCardUrl || '#') + '" target="_blank" class="btn btn-xs btn-outline-info p-1" style="font-size:10px;">राशन</a>';

        rows += '<tr class="align-middle" style="font-size:12px;"><td>' + (idx + 1) + '</td><td><img src="' + s.photoUrl + '" class="rounded me-1" style="width:35px; height:35px; object-fit:cover;"><b>' + s.studentName + '</b><br><small class="text-muted">' + s.category + '</small></td><td>' + s.fatherName + '</td><td>' + s.mobile + '</td><td>' + docsLinks + '</td><td><div class="d-flex"><input type="text" id="room-' + s.id + '" class="form-control form-control-sm me-1" value="' + (s.roomNumber || '') + '" style="width:55px;"><button onclick="saveRoom(\'' + s.id + '\')" class="btn btn-sm btn-dark">सेव</button></div></td><td>' + actionBtn + '</td><td><button onclick="removeStudent(\'' + s.id + '\')" class="btn btn-sm btn-danger">Remove</button></td></tr>';
    });

    res.send(\`
        <!DOCTYPE html><html><head><meta charset="UTF-8"><title>एडमिन पैनल</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
        <body class="bg-light p-4"><div class="row mb-4"><div class="col-md-4"><div class="bg-white border p-3 rounded h-100 shadow-sm"><h5>⚙️ लोगो बदलें</h5><form action="/update-logo" method="POST" enctype="multipart/form-data"><input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-primary w-100">अपलोड</button></form></div></div><div class="col-md-4"><div class="bg-white border p-3 rounded h-100 shadow-sm"><h5 class="text-danger">📢 नया नोटिस जारी करें</h5><form action="/post-notice" method="POST"><input type="text" name="noticeText" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-danger w-100">लाइव करें</button></form></div></div><div class="col-md-4"><div class="bg-white border p-3 rounded h-100 shadow-sm"><h5 class="text-success">⚙️ वॉर्डन जानकारी व फ़ोटो बदलें</h5><form action="/update-warden" method="POST" enctype="multipart/form-data" class="row g-2"><div class="col-6"><input type="text" name="w1Name" class="form-control form-control-sm" value="\${currentWarden.w1Name}"></div><div class="col-6"><input type="text" name="w1Mobile" class="form-control form-control-sm" value="\${currentWarden.w1Mobile}"></div><div class="col-12"><small class="text-muted">वॉर्डन फ़ोटो अपलोड:</small><input type="file" name="w1PhotoFile" class="form-control form-control-sm" accept="image/*"></div><div class="col-12"><button type="submit" class="btn btn-sm btn-success w-100">वॉर्डन सुरक्षित करें</button></div></form></div></div></div><div class="bg-white border p-3 rounded shadow-sm"><h4 class="text-center text-primary fw-bold mb-3">🔒 हॉस्टल कंट्रोल पैनल</h4><table class="table table-bordered text-center"><thead class="table-dark"><tr><th>S.No</th><th>छात्र</th><th>पिता</th><th>मोबाइल</th><th>📁 दस्तावेज़ देखें</th><th>ROOM अलॉट</th><th>Approval</th><th>हटाएं</th></tr></thead><tbody>\${rows || '<tr><td colspan="8">कोई छात्र रिकॉर्ड नहीं है।</td></tr>'}</tbody></table></div>
        <script>
            function saveRoom(id){ const val=document.getElementById('room-'+id).value; fetch('/assign-room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:id,roomNumber:val})}).then(()=>location.reload())}
            function approveStudent(id){ fetch('/approve-student',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:id})}).then(()=>location.reload())}
            function removeStudent(id){ if(confirm('क्या आप डिलीट करना चाहते हैं?')){ fetch('/remove-student',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:id})}).then(()=>location.reload())} }
        </script></body></html>
    \`);
});

app.post('/update-logo', uploadMiddleware, async (req, res) => { if (req.files && req.files['hostelLogo']) { await Logo.deleteMany({}); const l = new Logo({ url: req.files['hostelLogo'][0].path }); await l.save(); } res.send("<h1>🎉 लोगो अपडेट!</h1><a href='/view-students'>वापस</a>"); });
app.post('/assign-room', async (req, res) => { await Student.updateOne({ mobile: req.body.studentId }, { $set: { roomNumber: req.body.roomNumber } }); res.json({ success: true }); });
app.post('/approve-student', async (req, res) => { await Student.updateOne({ mobile: req.body.studentId }, { $set: { approved: true } }); res.json({ success: true }); });
app.post('/remove-student', async (req, res) => { await Student.deleteOne({ mobile: req.body.studentId }); res.json({ success: true }); });
app.post('/post-notice', uploadMiddleware, async (req, res) => { const n = new Notice({ text: req.body.noticeText, date: new Date().toLocaleDateString() }); await n.save(); res.send("<h1>🎉 नोटिस लाइव!</h1><a href='/view-students'>वापस</a>"); });

// 📸 [FIXED] वॉर्डन फ़ोटो अपलोड प्रोसेसर
app.post('/update-warden', uploadMiddleware, async (req, res) => { 
    let cur = await Warden.findOne({}) || defaultWarden; let p1 = cur.w1Photo;
    if (req.files && req.files['w1PhotoFile']) { p1 = req.files['w1PhotoFile'][0].path; }
    const updated = { w1Name: req.body.w1Name || cur.w1Name, w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: req.body.w1Mobile || cur.w1Mobile, w1Office: "कार्यालय कक्ष 01", w1Photo: p1, w2Name: cur.w2Name, w2Desig: cur.w2Desig, w2Mobile: cur.w2Mobile, w2Office: cur.w2Office, w2Photo: cur.w2Photo }; 
    await Warden.deleteMany({}); const nw = new Warden(updated); await nw.save(); 
    res.send("<h1>🎉 वॉर्डन विवरण फ़ोटो के साथ अपडेट!</h1><a href='/view-students'>वापस</a>"); 
});

app.get('/get-warden', async (req, res) => res.json(await Warden.findOne({}) || defaultWarden));
app.get('/get-logo', async (req, res) => res.json(await Logo.findOne({}) || defaultLogo));
app.get('/get-notices', async (req, res) => { const n = await Notice.find({}).sort({ _id: -1 }); res.json(n); });
app.get('/check-room-status', async (req, res) => { const s = await Student.findOne({ mobile: (req.query.mobile || '').trim() }); res.json(s ? { found: true, ...s.toObject() } : { found: false }); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 भव्य क्लाउड सिंक सर्वर पूरी तरह से एक्टिव है!'));
