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

// ⚡ Unexpected field एरर को पूरी तरह ब्लॉक करने वाला फ़ाइल प्रोसेसर
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

// 🔒 मोंगोडीबी क्लाउड परमानेंट तिजोरी कनेक्शन
const mongoURI = "mongodb+srv://surajpurprimatricsthostelsuraj_db_user:HostelSurajpur2026@cluster0.jztdqxu.mongodb.net/hostelData?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("🎰 मोंगोडीबी क्लाउड तिजोरी कनेक्ट हो गई है!"))
    .catch(err => console.error("❌ डेटाबेस कनेक्शन एरर:", err));

// 📝 मोंगोडीबी स्कीमा मॉडल्स
const StudentSchema = new mongoose.Schema({
    id: String, appNo: String, studentName: String, aadharCard: String, mobile: String,
    fatherName: String, motherName: String, annualIncome: Number, category: String, subCast: String,
    permanentAddress: String, blockName: String, districtName: String, homeDistance: Number,
    studentClass: String, course: String, collegeName: String, prevPercent: String, photoUrl: String,
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
    w1Name: "Unknown Warden A", w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: "+91 XXXXX XXXXX", w1Office: "कार्यालय कक्ष 01", w1Photo: "https://via.placeholder.com/150",
    w2Name: "Unknown Warden B", w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: "+91 XXXXX XXXXX", w2Office: "कार्यालय कक्ष 02", w2Photo: "https://via.placeholder.com/150"
};
const defaultLogo = { url: "https://via.placeholder.com/800x250?text=HOSTEL+BANNER+LOGO" };
// 🏠 मुख्य पृष्ठ (✨ पुराना Premium Beautiful Edition)
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
                    .logo-container { width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 20px; background: #fff; text-align: center; border: 1px solid #dee2e6; }
                    .logo-img { width: 100%; height: auto; max-height: 260px; display: block; margin: 0 auto; object-fit: contain; }
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
                    <a class="navbar-brand fw-bold text-warning fs-5" href="/">🏠 प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर (छ. ग.)</a>
                    <div class="navbar-nav ms-auto"><a class="nav-link btn btn-outline-warning text-white px-4 py-1" href="/view-students" target="_blank">🔒 एडमिन पैनल</a></div>
                </div>
            </nav>
            <div class="container">
                <div class="row mb-4"><div class="col-12 text-center"><button class="btn btn-dark fw-bold shadow-sm px-5 py-2.5 rounded-pill text-warning" style="border: 2px solid #ffc107;" data-bs-toggle="modal" data-bs-target="#rulesModal">📜 छात्रावास के आवश्यक नियम एवं अनुशासन निर्देशिका (टच करें) ➔</button></div></div>
                
                <div class="row g-3 mb-4 text-center">
                    <div class="col-md-6">
                        <div class="card p-3 tracker-card h-100"><span class="text-secondary small fw-bold">अनुसूचित जनजाति (ST) सीट ट्रैकर</span><div class="d-flex justify-content-around align-items-center mt-2"><div><small class="text-muted">कुल सीटें</small><h4 class="fw-bold text-primary mb-0">100</h4></div><div><small class="text-muted">कन्फर्म</small><h4 class="fw-bold text-success mb-0">\${stApproved}</h4></div><div><small class="text-muted">खाली सीटें</small><h4 class="fw-bold text-danger mb-0">\${stAvailable}</h4></div></div></div>
                    </div>
                    <div class="col-md-6">
                        <div class="card p-3 tracker-card sc h-100"><span class="text-secondary small fw-bold">अनुसूचित जाति (SC) सीट ट्रैकर</span><div class="d-flex justify-content-around align-items-center mt-2"><div><small class="text-muted">कुल सीटें</small><h4 class="fw-bold text-primary mb-0">50</h4></div><div><small class="text-muted">कन्फर्म</small><h4 class="fw-bold text-success mb-0">\${scApproved}</h4></div><div><small class="text-muted">खाली सीटें</small><h4 class="fw-bold text-danger mb-0">\${scAvailable}</h4></div></div></div>
                    </div>
                </div>

                <div class="card p-3 mb-4 border-start border-primary border-4 bg-white shadow-sm">
                    <h6 class="fw-bold text-primary mb-1">ℹ️ संक्षिप्त परिचय (Short Intro)</h6>
                    <p class="text-muted small mb-0">यह छात्रावास आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन द्वारा संचालित है, जहाँ सूरजपुर जिले के ग्रामीण क्षेत्रों के छात्रों को आवासीय एवं शैक्षणिक वातावरण प्रदान किया जाता है।</p>
                </div>
                <div class="row g-4">
                    <div class="col-md-8">
                        <div class="logo-container border"><img id="hostel-logo" src="" alt="Hostel Logo" class="logo-img"></div>
                        <div class="card p-3 mb-4 shadow-sm">
                            <div class="card-header bg-danger text-white rounded mb-2 fw-bold">📢 महत्वपूर्ण नोटिस बोर्ड</div>
                            <ul id="live-notices" class="list-group list-group-flush"></ul>
                        </div>
                        <hr class="my-4 border-secondary opacity-25">
                        
                        <div class="row g-4 mb-5">
                            <div class="col-md-6">
                                <a href="/registration-form" class="premium-btn reg text-dark">
                                    <span style="font-size: 45px; display:block;" class="mb-2">📝</span>
                                    <h4 class="fw-bold text-primary">हॉस्टल रजिस्ट्रेशन फॉर्म</h4>
                                    <span class="badge bg-primary px-3 py-2 my-2 fs-6">सत्र 2026-27</span>
                                    <p class="text-muted small mb-0 mt-1">नया एडमिशन फॉर्म भरने के लिए यहाँ क्लिक करें</p>
                                </a>
                            </div>
                            <div class="col-md-6">
                                <a href="/check-status-page" class="premium-btn stat text-dark">
                                    <span style="font-size: 45px; display:block;" class="mb-2">🔍</span>
                                    <h4 class="fw-bold text-success">प्रोफाइल / रूम अलॉटमेंट स्टेटस</h4>
                                    <span class="badge bg-success px-3 py-2 my-2 fs-6">एडमिन द्वारा जारी रिजल्ट</span>
                                    <p class="text-muted small mb-0 mt-1">अपना अलॉटेड रूम और स्टेटस देखने के लिए यहाँ क्लिक करें</p>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card p-3 text-center mb-4 border-top border-warning border-4 shadow-sm">
                            <div class="card-header bg-light text-dark fw-bold rounded mb-3 border-0 fs-6">👨‍💼 हॉस्टल वॉर्डन कॉर्नर</div>
                            <div class="row g-2">
                                <div class="col-6 border-end">
                                    <img id="w1-img" src="" class="rounded border mb-2 shadow-sm" style="width: 85px; height: 85px; object-fit: cover;">
                                    <h6 id="w1-name" class="fw-bold text-dark mb-0 small"></h6>
                                    <small id="w1-desig" class="text-muted block" style="font-size:10px;"></small>
                                    <div class="text-start bg-light p-2 rounded border mt-2" style="font-size:10px;">
                                        <b>📞:</b> <span id="w1-phone"></span><br><b>🏢:</b> <span id="w1-office"></span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <img id="w2-img" src="" class="rounded border mb-2 shadow-sm" style="width: 85px; height: 85px; object-fit: cover;">
                                    <h6 id="w2-name" class="fw-bold text-dark mb-0 small"></h6>
                                    <small id="w2-desig" class="text-muted block" style="font-size:10px;"></small>
                                    <div class="text-start bg-light p-2 rounded border mt-2" style="font-size:10px;">
                                        <b>📞:</b> <span id="w2-phone"></span><br><b>🏢:</b> <span id="w2-office"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card p-3 shadow-sm border-top border-success border-4">
                            <div class="card-header bg-light text-success fw-bold rounded mb-2 border-0 fs-6 text-center">📋 छात्रावास प्रवेश चयन सूची (Admission List)</div>
                            <a href="/public-admission-list" target="_blank" class="btn btn-sm btn-success w-100 fw-bold py-2 mt-1 rounded-3">चयनित छात्रों की सूची देखें ➔</a>
                        </div>
                    </div>
                </div>
            </div>

            <a id="whatsapp-link" href="#" target="_blank" class="whatsapp-float">💬 वॉर्डन सहायता केंद्र</a>

            <div class="modal fade" id="rulesModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content text-dark">
                        <div class="modal-header bg-dark text-white">
                            <h5 class="modal-title fw-bold text-warning">📜 छात्रावास आवश्यक नियम एवं अनुशासन निर्देशिका</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4" style="font-size: 14px; line-height: 1.7;">
                            <ol class="fw-bold text-secondary">
                                <li>छात्रावास में प्रवेशित छात्र को छात्रावास में भोजन (मेस) करना अनिवार्य है।</li>
                                <li>स्थानीय शिक्षण संस्था में छात्र को नियमित प्रवेश व उपस्थिति अनिवार्य है।</li>
                                <li>बिना सूचना के लगातार अनुपस्थित रहने पर छात्रावास से निष्कासित किया जा सकता है।</li>
                                <li>अप्रवेशी छात्र को बिना अधीक्षक की लिखित अनुमति के ठहराना वर्जित है।</li>
                                <li>मादक पदार्थों एवं मद्यपान का सेवन करने पर तत्काल निष्कासित किया जा सकेगा।</li>
                            </ol>
                        </div>
                        <div class="modal-footer"><button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">बंद करें</button></div>
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
                        notices.forEach(n => { list.innerHTML += \`<li class='list-group-item bg-white text-dark border-bottom mb-1 p-2'><b class='text-danger'>[\${n.date}]:</b> \${n.text}</li>\`; });
                    });
                    fetch('/get-warden').then(res => res.json()).then(w => {
                        document.getElementById('w1-img').src = w.w1Photo; document.getElementById('w1-name').innerText = w.w1Name;
                        document.getElementById('w1-desig').innerText = w.w1Desig; document.getElementById('w1-phone').innerText = w.w1Mobile; document.getElementById('w1-office').innerText = w.w1Office;
                        document.getElementById('w2-img').src = w.w2Photo; document.getElementById('w2-name').innerText = w.w2Name;
                        document.getElementById('w2-desig').innerText = w.w2Desig; document.getElementById('w2-phone').innerText = w.w2Mobile; document.getElementById('w2-office').innerText = w.w2Office;
                        document.getElementById('whatsapp-link').href = "https://wa.me/" + w.w1Mobile.replace(/[^0-9]/g, "") + "?text=नमस्ते सर, मैं सूरजपुर छात्रावास पोर्टल के संबंध में सहायता चाहता हूँ।";
                    });
                };
            </script>
            </body>
            </html>
        `);
    } catch (err) { res.status(500).send("Error loading home page"); }
});
// 📝 लिंक 1: ऑनलाइन रजिस्ट्रेशन फॉर्म पेज (प्रीमियम डिज़ाइन)
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
                <div class="card p-4 shadow-sm bg-white border-0">
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
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी का वर्ग:</label><select name="category" class="form-select" required><option value="अनुसूचित जनजाति (ST)">अनुसूचित जनजाति (ST)</option><option value="अनुसूचित जाति (SC)">अनुसूचित जाति (SC)</option><option value="अन्य पिछड़ा वर्ग (OBC)">अन्य पिछड़ा वर्ग (OBC)</option><option value="सामान्य (General)">सामान्य (General)</option></select></div>
                        <div class="col-md-4"><label class="form-label fw-bold">विद्यार्थी की जाति:</label><input type="text" name="subCast" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पालक का मोबाइल नंबर:</label><input type="tel" name="mobile" class="form-control" required></div>
                        <div class="col-12"><label class="form-label fw-bold text-danger">📸 छात्र की फोटो अपलोड करें (अनिवार्य):</label><input type="file" name="studentPhoto" class="form-control" accept="image/*" required></div>
                        
                        <div class="section-title">2. पारिवारिक विवरण एवं पालक आधार (Optional)</div>
                        <div class="col-md-6"><label class="form-label fw-bold">पिता का नाम:</label><input type="text" name="fatherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">पिता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="fatherAadharFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">माता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="motherAadharFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पिता का व्यवसाय:</label><input type="text" name="fatherJob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">माता का व्यवसाय:</label><input type="text" name="motherJob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पालक की वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" required></div>

                        <div class="section-title">3. सरकारी प्रमाण पत्र एवं कार्ड फ़ोटो अपलोड</div>
                        <div class="col-md-6"><label class="form-label fw-bold">जाति प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="casteCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold">निवास प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="residenceCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">आय प्रमाण पत्र अपलोड (Optional):</label><input type="file" name="incomeCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">दूरी प्रमाण पत्र अपलोड (Optional):</label><input type="file" name="distanceCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">आयुष्मान कार्ड अपलोड (Optional):</label><input type="file" name="ayushmanFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold">राशन कार्ड फ़ोटो अपलोड (अनिवार्य):</label><input type="file" name="rationCardFile" class="form-control" accept="image/*,application/pdf"></div>

                        <div class="section-title">4. स्टेटस, पता एवं विद्यालय विवरण</div>
                        <div class="col-md-6"><label class="form-label fw-bold">स्थायी पता:</label><input type="text" name="permanentAddress" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">विकासखंड:</label><input type="text" name="blockName" class="form-control" required></div>
                        <div class="col-md-3"><label class="form-label fw-bold">जिला:</label><input type="text" name="districtName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">घर से शाला की दूरी (कि.मी.):</label><input type="number" name="homeDistance" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">वर्तमान कक्षा/वर्ष:</label><input type="text" name="studentClass" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">कोर्स / ब्रांच:</label><input type="text" name="course" class="form-control" required></div>
                        <div class="col-md-8"><label class="form-label fw-bold">शाला का नाम:</label><input type="text" name="collegeName" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पिछला परीक्षा प्रतिशत (%):</label><input type="text" name="prevPercent" class="form-control" required></div>
                        
                        <div class="col-12 mt-4"><button type="submit" class="btn btn-primary w-100 fw-bold fs-5">🚀 ऑनलाइन आवेदन पत्र जमा करें</button></div>
                    </form>
                    <div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ पर वापस जाएँ</a></div>
                </div>
            </div>
        </body>
        </html>
    `);
});
// 🔍 लिंक 2: अलॉटमेंट स्टेटस चेक करने वाला पेज
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
                    const mobile = document.getElementById('searchMobile').value;
                    const resultDiv = document.getElementById('statusResult');
                    if(!mobile) { alert('कृपया मोबाइल नंबर लिखें!'); return; }
                    fetch('/check-room-status?mobile=' + mobile).then(res => res.json()).then(data => {
                        if (data.found) {
                            let isAllocated = data.roomNumber && data.roomNumber !== "अभी अलॉट नहीं हुआ";
                            let badge = (data.approved && isAllocated) ? '<span class="badge bg-success fs-6 ms-2">✅ Admission Confirmed</span>' : '<span class="badge bg-warning text-dark fs-6 ms-2">⏳ Request Pending</span>';
                            resultDiv.innerHTML = \`
                                <div class="card p-3 bg-light border mt-3 shadow-sm">
                                    <div class="d-flex align-items-center mb-3">
                                        <img src="\${data.photoUrl}" class="rounded border me-3" style="width:85px; height:85px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/150'">
                                        <div>
                                            <h4 class="text-success fw-bold mb-0">🎉 \${data.studentName}</h4>
                                            <p class="text-muted mb-0">\${data.studentClass} - \${data.collegeName}</p>
                                        </div>
                                    </div>
                                    <div class="bg-white p-3 rounded border">
                                        <p class="mb-2"><b>👨 पिता का नाम:</b> \${data.fatherName}</p>
                                        <p class="mb-2"><b>वर्ग:</b> \${data.category}</p>
                                        <hr>
                                        <p class="mb-0"><b>🏢 अलॉटेड रूम नंबर:</b> <span class="badge bg-warning text-dark fs-6">\${data.roomNumber || 'अभी अलॉट नहीं हुआ'}</span> \${badge}</p>
                                    </div>
                                </div>\`;
                        } else { resultDiv.innerHTML = \`<div class="alert alert-danger mt-3">❌ कोई प्रोफाइल नहीं मिली!</div>\`; }
                    });
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
            rows += \`<tr><td>\${idx+1}</td><td><b>\${s.studentName}</b></td><td>\${s.fatherName}</td><td>\${s.studentClass}</td><td><b>\${s.roomNumber || 'वेटिंग'}</b></td></tr>\`;
        });
        res.send(\`
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>चयन सूची 2026-27</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
            <body class="p-5 bg-light">
                <div class="container" style="max-width: 850px;">
                    <div class="card p-4 shadow-sm bg-white">
                        <h4 class="text-center text-primary fw-bold mb-4">📋 स्वीकृत छात्र प्रवेश चयन सूची (सत्र 2026-27)</h4>
                        <table class="table table-bordered table-striped text-center">
                            <thead class="table-dark"><tr><th>S.No</th><th>छात्र का नाम</th><th>पिता का नाम</th><th>कक्षा</th><th>रूम नंबर</th></tr></thead>
                            <tbody>\${rows || '<tr><td colspan="5" class="text-center text-muted">अभी कोई चयन सूची स्वीकृत नहीं है।</td></tr>'}</tbody>
                        </table>
                        <div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ</a></div>
                    </div>
                </div>
            </body>
            </html>
        \`);
    } catch(e) { res.status(500).send("Error"); }
});
// 🛠️ त्रुटि सुधार फ़ॉर्म डेटा ऑटो-लोड (Edit Form Repaired)
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

// 🔒 क्लाउड डेटा सिंक सबमिशन प्रोसेसर
app.post('/submit-form', (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            let photoPath = "https://via.placeholder.com/150";
            if (req.files) {
                if (req.files['studentPhoto'] && req.files['studentPhoto'].length > 0) { photoPath = req.files['studentPhoto'][0].path; }
            } else if (req.body.existingPhoto) { photoPath = req.body.existingPhoto; }

            const appNumber = "SUR-2026-" + req.body.mobile.trim().slice(-4);
            const sData = { id: req.body.mobile.trim(), appNo: appNumber, studentName: req.body.studentName, aadharCard: req.body.aadharCard, mobile: req.body.mobile.trim(), fatherName: req.body.fatherName, permanentAddress: req.body.permanentAddress, studentClass: req.body.studentClass, collegeName: req.body.collegeName, prevPercent: req.body.prevPercent, photoUrl: photoPath, date: new Date().toLocaleString() };

            const old = await Student.findOne({ mobile: sData.mobile });
            if (old) { 
                await Student.updateOne({ mobile: sData.mobile }, { $set: sData }); 
                sData.roomNumber = old.roomNumber; 
                sData.category = old.category; 
            } else { 
                const newStudent = new Student(sData); 
                await newStudent.save(); 
                sData.roomNumber = "अभी अलॉट नहीं हुआ"; 
                sData.category = req.body.category || "अनुसूचित जनजाति (ST)"; 
            }

            res.send(\`
                <!DOCTYPE html><html><head><meta charset="UTF-8"><title>पावती रसीद</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
                <body><div class="container"><div class="card p-4 border border-dark mx-auto mt-4" style="max-width:600px;"><div class="text-center border-bottom pb-2"><h6>छत्तीसगढ़ शासन</h6><h4>प्री मैट्रिक छात्रावास सूरजपुर</h4><h5 class="text-success">आवेदन पावती रसीद 2026-27</h5></div>
                <div class="row my-3"><div class="col-8"><p><b>आवेदन क्रमांक:</b> <span class="text-danger fw-bold">\${sData.appNo}</span></p><p><b>छात्र का नाम:</b> \${sData.studentName}</p><p><b>पिता का नाम:</b> \${sData.fatherName}</p><p><b>मोबाइल:</b> \${sData.mobile}</p></div><div class="col-4 text-end"><img src="\${photoPath}" class="img-thumbnail" style="width:100px; height:100px; object-fit:cover;"></div></div>
                <div class="text-center mt-4"><button onclick="window.print()" class="btn btn-primary fw-bold me-2">🖨️ प्रिंट रसीद</button><a href="/" class="btn btn-secondary">🏠 मुख्य पृष्ठ</a></div></div></div></body></html>
            \`);
        } catch (e) { res.status(500).send("Upload Error"); }
    });
});

// 🔒 एडमिन पैनल (✨ Dynamic Dashboard)
app.get('/view-students', async (req, res) => {
    const auth = { login: 'admin', password: 'password123' }; const b64 = (req.headers.authorization || '').split(' ')[1] || ''; const [login, password] = Buffer.from(b64, 'base64').toString().split(':');
    if (!login || !password || login !== auth.login || password !== auth.password) { res.set('WWW-Authenticate', 'Basic realm="401"'); return res.status(401).send('❌ गलत पासवर्ड!'); }
    let currentWarden = await Warden.findOne({}) || defaultWarden; let sList = await Student.find({}); let rows = '';
    sList.forEach((s, idx) => {
        let actionBtn = s.approved ? \`<span class="badge bg-success">Approved</span>\` : \`<button onclick="approveStudent('\${s.id}')" class="btn btn-sm btn-primary">Approve</button>\`;
        rows += \`<tr class="align-middle"><td>\${idx + 1}</td><td><img src="\${s.photoUrl}" class="rounded me-1" style="width:35px; height:35px; object-fit:cover;"><b>\${s.studentName}</b></td><td>\${s.fatherName}</td><td>\${s.mobile}</td><td><div class="d-flex"><input type="text" id="room-\${s.id}" class="form-control form-control-sm me-1" value="\${s.roomNumber || ''}" style="width:65px;"><button onclick="saveRoom('\${s.id}')" class="btn btn-sm btn-dark">सेव</button></div></td><td>\${actionBtn}</td><td><button onclick="removeStudent('\${s.id}')" class="btn btn-sm btn-danger">Remove</button></td></tr>\`;
    });
    res.send(\`
        <!DOCTYPE html><html><head><meta charset="UTF-8"><title>एडमिन पैनल</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
        <body class="bg-light p-4"><div class="row mb-4"><div class="col-md-4"><div class="bg-white border p-3 rounded h-100 shadow-sm"><h5>⚙️ लोगो बदलें</h5><form action="/update-logo" method="POST" enctype="multipart/form-data"><input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-primary w-100">अपलोड</button></form></div></div><div class="col-md-4"><div class="bg-white border p-3 rounded h-100 shadow-sm"><h5 class="text-danger">📢 नया नोटिस जारी करें</h5><form action="/post-notice" method="POST"><input type="text" name="noticeText" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-danger w-100">लाइव करें</button></form></div></div><div class="col-md-4"><div class="bg-white border p-3 rounded h-100 shadow-sm"><h5 class="text-success">⚙️ वॉर्डन जानकारी बदलें</h5><form action="/update-warden" method="POST" class="row g-2"><div class="col-6"><input type="text" name="w1Name" class="form-control form-control-sm" value="\${currentWarden.w1Name}"></div><div class="col-6"><input type="text" name="w1Mobile" class="form-control form-control-sm" value="\${currentWarden.w1Mobile}"></div><div class="col-12"><button type="submit" class="btn btn-sm btn-success w-100">सेव करें</button></div></form></div></div></div><div class="bg-white border p-3 rounded shadow-sm"><h4 class="text-center text-primary fw-bold mb-3">🔒 हॉस्टल कंट्रोल पैनल</h4><table class="table table-bordered text-center"><thead class="table-dark"><tr><th>S.No</th><th>छात्र</th><th>पिता</th><th>मोबाइल</th><th>ROOM अलॉट</th><th>Approval</th><th>हटाएं</th></tr></thead><tbody>\${rows || '<tr><td colspan="7">कोई छात्र रिकॉर्ड नहीं है।</td></tr>'}</tbody></table></div>
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
app.post('/update-warden', uploadMiddleware, async (req, res) => { let cur = await Warden.findOne({}) || defaultWarden; const updated = { w1Name: req.body.w1Name || cur.w1Name, w1Desig: "अधीक्षक (A)", w1Mobile: req.body.w1Mobile || cur.w1Mobile, w1Office: "कक्ष 01", w1Photo: cur.w1Photo, w2Name: cur.w2Name, w2Desig: "अधीक्षक (B)", w2Mobile: cur.w2Mobile, w2Office: "कक्ष 02", w2Photo: cur.w2Photo }; await Warden.deleteMany({}); const nw = new Warden(updated); await nw.save(); res.send("<h1>🎉 वॉर्डन अपडेट!</h1><a href='/view-students'>वापस</a>"); });
app.get('/get-warden', async (req, res) => res.json(await Warden.findOne({}) || defaultWarden));
app.get('/get-logo', async (req, res) => res.json(await Logo.findOne({}) || defaultLogo));
app.get('/get-notices', async (req, res) => { const n = await Notice.find({}).sort({ _id: -1 }); res.json(n); });
app.get('/check-room-status', async (req, res) => { const s = await Student.findOne({ mobile: (req.query.mobile || '').trim() }); res.json(s ? { found: true, ...s.toObject() } : { found: false }); });

// ✨ रेंडर ऑटो-पोर्ट डिटेक्टर
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 सर्वर सफलतापूर्वक चालू हो गया है!'));
