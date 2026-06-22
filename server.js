const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// 🛑 Cloudinary Config
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
const upload = multer({ storage: storage });

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const studentsFile = path.join('/tmp', 'students.json');
const noticesFile = path.join('/tmp', 'notices.json');
const wardenFile = path.join('/tmp', 'warden.json');
const logoFile = path.join('/tmp', 'logo.json');

const defaultWarden = {
    w1Name: "Unknown Warden A", w1Desig: "छात्रावास अधीक्षक (A)", w1Mobile: "+91 XXXXX XXXXX", w1Office: "कार्यालय कक्ष 01", w1Photo: "https://via.placeholder.com/150",
    w2Name: "Unknown Warden B", w2Desig: "छात्रावास अधीक्षक (B)", w2Mobile: "+91 XXXXX XXXXX", w2Office: "कार्यालय कक्ष 02", w2Photo: "https://via.placeholder.com/150"
};
const defaultLogo = { url: "https://via.placeholder.com/800x250?text=HOSTEL+BANNER+LOGO" };

if (!fs.existsSync(studentsFile)) fs.writeFileSync(studentsFile, '[]', 'utf8');
if (!fs.existsSync(noticesFile)) fs.writeFileSync(noticesFile, '[]', 'utf8');
if (!fs.existsSync(wardenFile)) fs.writeFileSync(wardenFile, JSON.stringify(defaultWarden, null, 2), 'utf8');
if (!fs.existsSync(logoFile)) fs.writeFileSync(logoFile, JSON.stringify(defaultLogo, null, 2), 'utf8');

const readWardenSafe = () => {
    try { if (fs.existsSync(wardenFile)) { const d = fs.readFileSync(wardenFile, 'utf8'); return d.trim() ? JSON.parse(d) : defaultWarden; } } catch (e) {} return defaultWarden;
};
const readStudentsSafe = () => {
    try { if (fs.existsSync(studentsFile)) { const d = fs.readFileSync(studentsFile, 'utf8'); return d.trim() ? JSON.parse(d) : []; } } catch (e) {} return [];
};

// 🏠 मुख्य पृष्ठ (With Popup Rules & Intro)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #f8f9fa; color: #212529; font-family: 'Segoe UI', sans-serif; }
                .card { background-color: #ffffff; border: 1px solid #dee2e6; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .logo-container { width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 15px; text-align: center; }
                .logo-img { width: 100%; height: auto; max-height: 280px; display: block; margin: 0 auto; }
                .nav-btn-box { transition: all 0.3s ease; border: 2px dashed #0d6efd; text-decoration: none; display: block; }
                .nav-btn-box:hover { transform: translateY(-3px); background-color: #f1f7ff; }
                .nav-btn-box-2 { transition: all 0.3s ease; border: 2px dashed #198754; text-decoration: none; display: block; }
                .nav-btn-box-2:hover { transform: translateY(-3px); background-color: #f1fdf7; }
            </style>
        </head>
        <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
            <div class="container">
                <a class="navbar-brand fw-bold text-warning" href="/">🏠 प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर (छ. ग.)</a>
                <div class="navbar-nav ms-auto"><a class="nav-link btn btn-outline-warning text-white px-3" href="/view-students" target="_blank">🔒 एडमिन पैनल</a></div>
            </div>
        </nav>
        <div class="container">
            <div class="row mb-4"><div class="col-12 text-center"><button class="btn btn-danger fw-bold shadow-sm px-4 py-2 rounded-pill" data-bs-toggle="modal" data-bs-target="#rulesModal">📜 छात्रावास के आवश्यक नियम एवं अनुशासन (टच करें) ➔</button></div></div>
            <div class="card p-3 mb-4 border-start border-primary border-4 bg-white shadow-sm">
                <h6 class="fw-bold text-primary mb-1">ℹ️ संक्षिप्त परिचय (Short Intro)</h6>
                <p class="text-muted small mb-0">यह छात्रावास आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन द्वारा संचालित है, जहाँ सूरजपुर जिले के दूर-दराज क्षेत्रों से आने वाले अनुसूचित जनजाति (ST) एवं अनुसूचित जाति (SC) के छात्रों को उत्कृष्ट शैक्षणिक वातावरण और बेहतर आवासीय सुविधाएं प्रदान की जाती हैं।</p>
            </div>
            <div class="row g-4">
                <div class="col-md-8">
                    <div class="logo-container border shadow-sm"><img id="hostel-logo" src="" alt="Hostel Logo" class="logo-img"></div>
                    <div class="card p-3 mb-4 shadow-sm">
                        <div class="card-header bg-danger text-white fw-bold rounded mb-2">📢 महत्वपूर्ण नोटिस बोर्ड</div>
                        <ul id="live-notices" class="list-group list-group-flush"></ul>
                    </div>
                    <hr class="my-4">
                    <div class="row g-3 mb-5">
                        <div class="col-md-6">
                            <a href="/registration-form" class="nav-btn-box text-dark">
                                <div class="card p-4 text-center h-100">
                                    <span style="font-size: 40px;">📝</span>
                                    <h4 class="fw-bold text-primary mt-2">हॉस्टल रजिस्ट्रेशन फॉर्म</h4>
                                    <span class="badge bg-primary px-3 py-2 mt-2 fs-6">सत्र 2026-27</span>
                                    <p class="text-muted small mt-2 mb-0">नया एडमिशन फॉर्म भरने के लिए यहाँ क्लिक करें</p>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-6">
                            <a href="/check-status-page" class="nav-btn-box-2 text-dark">
                                <div class="card p-4 text-center h-100">
                                    <span style="font-size: 40px;">🔍</span>
                                    <h4 class="fw-bold text-success mt-2">प्रोफाइल / रूम अलॉटमेंट स्टेटस</h4>
                                    <span class="badge bg-success px-3 py-2 mt-2 fs-6">एडमिन द्वारा जारी रिजल्ट</span>
                                    <p class="text-muted small mt-2 mb-0">अपना अलॉटेड रूम और स्टेटस देखने के लिए यहाँ क्लिक करें</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-top border-danger border-3 p-3 shadow-sm text-center mb-4">
                        <div class="card-header bg-light text-danger fw-bold rounded mb-3 border-0 fs-5">👨‍💼 हॉस्टल वॉर्डन कॉर्नर</div>
                        <div class="row">
                            <div class="col-6 border-end">
                                <img id="w1-img" src="" class="rounded border mb-2 shadow-sm" style="width: 90px; height: 90px; object-fit: cover;">
                                <h6 id="w1-name" class="fw-bold text-dark mb-0"></h6>
                                <small id="w1-desig" class="text-muted block"></small>
                                <div class="text-start bg-light p-2 rounded border mt-2" style="font-size:11px;">
                                    <b>📞:</b> <span id="w1-phone"></span><br><b>🏢:</b> <span id="w1-office"></span>
                                </div>
                            </div>
                            <div class="col-6">
                                <img id="w2-img" src="" class="rounded border mb-2 shadow-sm" style="width: 90px; height: 90px; object-fit: cover;">
                                <h6 id="w2-name" class="fw-bold text-dark mb-0"></h6>
                                <small id="w2-desig" class="text-muted block"></small>
                                <div class="text-start bg-light p-2 rounded border mt-2" style="font-size:11px;">
                                    <b>📞:</b> <span id="w2-phone"></span><br><b>🏢:</b> <span id="w2-office"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card border-top border-success border-3 p-3 shadow-sm">
                        <div class="card-header bg-light text-success fw-bold rounded mb-2 border-0 fs-6 text-center">📋 छात्रावास प्रवेश चयन सूची (Admission List)</div>
                        <p class="text-muted small text-center mb-2">केवल स्वीकृत छात्रों के नाम और कक्षा की सूची</p>
                        <a href="/public-admission-list" target="_blank" class="btn btn-sm btn-success w-100 fw-bold">चयनित छात्रों की सूची देखें ➔</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="rulesModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content text-dark">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title fw-bold">📜 शासकीय छात्रावास आवश्यक नियम एवं अनुशासन निर्देशिका</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="font-size: 14px; line-height: 1.6;">
                        <ol class="fw-bold text-secondary">
                            <li>छात्रावास में प्रवेशित छात्र को छात्रावास में भोजन (मेस) करना अनिवार्य है।</li>
                            <li>छात्रावास में प्रवेश के लिये स्थानीय शासकीय/मानृता प्राप्त शिक्षण संस्था में छात्र को नियमित उपस्थिति अनिवार्य है।</li>
                            <li>बिना सूचना के लगातार अनुपस्थित रहने पर अनुशासनहीनता एवं दूराचरण के कारण छात्रावास से निष्कासित किया जा सकता है।</li>
                            <li>किसी भी बाहरी व्यक्ति या अप्रवेशी छात्र को बिना अधीक्षक की अनुमति के ठहराना वर्जित है।</li>
                            <li>मादक पदार्थों एवं मद्यपान का सेवन करने पर छात्रावास से बिना सूचना के तत्काल निष्कासित किया जा सकेगा।</li>
                            <li>छात्रावास में सस्ते दर पर उपलब्ध कराये गये बी.पी.एल. (खाद्यान्न) चावल सभी छात्रों को खाना अनिवार्य होगा।</li>
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
                });
            };
        </script>
        </body>
        </html>
    `);
});
// 📝 लिंक 1: रजिस्ट्रेशन फॉर्म पेज 
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
                        <div class="col-md-6"><label class="form-label fw-bold text-muted">पिता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="fatherAadharFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold">माता का नाम:</label><input type="text" name="motherName" class="form-control" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold text-muted">माता का आधार कार्ड फ़ोटो (Optional):</label><input type="file" name="motherAadharFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पिता का व्यवसाय:</label><input type="text" name="fatherJob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">माता का व्यवसाय:</label><input type="text" name="motherJob" class="form-control" required></div>
                        <div class="col-md-4"><label class="form-label fw-bold">पालक की वार्षिक आय (₹):</label><input type="number" name="annualIncome" class="form-control" required></div>

                        <div class="section-title">3. सरकारी प्रमाण पत्र एवं कार्ड फ़ोटो अपलोड</div>
                        <div class="col-md-6"><label class="form-label fw-bold">जाति प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="casteCertFile" class="form-control" accept="image/*,application/pdf" required></div>
                        <div class="col-md-6"><label class="form-label fw-bold">निवास प्रमाण पत्र अपलोड (अनिवार्य):</label><input type="file" name="residenceCertFile" class="form-control" accept="image/*,application/pdf" required></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">आय प्रमाण पत्र अपलोड (Optional):</label><input type="file" name="incomeCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">दूरी प्रमाण पत्र अपलोड (Optional):</label><input type="file" name="distanceCertFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label text-muted fw-bold">आयुष्मान कार्ड अपलोड (Optional):</label><input type="file" name="ayushmanFile" class="form-control" accept="image/*,application/pdf"></div>
                        <div class="col-md-6"><label class="form-label fw-bold">राशन कार्ड फ़ोटो अपलोड (अनिवार्य):</label><input type="file" name="rationCardFile" class="form-control" accept="image/*,application/pdf" required></div>

                        <div class="section-title">4. स्टेटस, पता एवं विद्यालय विवरण</div>
                        <div class="col-md-3"><label class="form-label fw-bold">नक्सल प्रभावित:</label><select name="naxalStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">दिव्यांग (PH):</label><select name="phStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">बीपीएल (BPL):</label><select name="bplStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        <div class="col-md-3"><label class="form-label fw-bold">पीवीटीजी (PVTG):</label><select name="pvtgStatus" class="form-select"><option value="नहीं">नहीं</option><option value="हाँ">हाँ</option></select></div>
                        
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
// 🔍 लिंक 2: स्टेटस चेक करने वाला पेज
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

app.get('/public-admission-list', (req, res) => {
    const list = readStudentsSafe().filter(s => s.approved === true);
    let rows = '';
    list.forEach((s, idx) => {
        rows += `<tr><td>${idx+1}</td><td><b>${s.studentName}</b></td><td>${s.fatherName}</td><td>${s.studentClass}</td><td><b>${s.roomNumber || 'वेटिंग'}</b></td></tr>`;
    });
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>चयन सूची 2026-27</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
        <body class="p-5 bg-light">
            <div class="container" style="max-width: 850px;">
                <div class="card p-4 shadow-sm bg-white">
                    <h4 class="text-center text-primary fw-bold mb-4">📋 स्वीकृत छात्र प्रवेश चयन सूची (सत्र 2026-27)</h4>
                    <table class="table table-bordered table-striped text-center">
                        <thead class="table-dark"><tr><th>S.No</th><th>छात्र का नाम</th><th>पिता का नाम</th><th>कक्षा</th><th>रूम नंबर</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="5" class="text-center text-muted">अभी कोई चयन सूची स्वीकृत नहीं है।</td></tr>'}</tbody>
                    </table>
                    <div class="text-center mt-3"><a href="/" class="btn btn-link">🏠 मुख्य पृष्ठ</a></div>
                </div>
            </div>
        </body>
        </html>
    `);
});
// 🛠️ मल्टी-फ़ाइल अपलोड कॉन्फ़िगरेशन (वॉर्डन फ़ोटो सहित पूरी तरह फ़िक्स)
const cpUpload = upload.fields([
    { name: 'studentPhoto', maxCount: 1 }, { name: 'casteCertFile', maxCount: 1 },
    { name: 'residenceCertFile', maxCount: 1 }, { name: 'rationCardFile', maxCount: 1 },
    { name: 'w1PhotoFile', maxCount: 1 }, { name: 'w2PhotoFile', maxCount: 1 }
]);

app.post('/submit-form', cpUpload, (req, res) => {
    const files = req.files || {};
    const photoPath = files.studentPhoto ? files.studentPhoto[0].path : (req.body.existingPhoto || "https://via.placeholder.com/150");
    const appNumber = "SUR-2026-" + req.body.mobile.trim().slice(-4);
    const dateSubmitted = new Date().toLocaleString();

    const sData = {
        id: req.body.mobile.trim(), appNo: appNumber, studentName: req.body.studentName, aadharCard: req.body.aadharCard,
        mobile: req.body.mobile.trim(), fatherName: req.body.fatherName, motherName: req.body.motherName,
        annualIncome: req.body.annualIncome || 0, category: req.body.category, subCast: req.body.subCast || "",
        permanentAddress: req.body.permanentAddress, blockName: req.body.blockName, districtName: req.body.districtName,
        homeDistance: req.body.homeDistance, studentClass: req.body.studentClass, course: req.body.course,
        collegeName: req.body.collegeName, prevPercent: req.body.prevPercent, photoUrl: photoPath,
        roomNumber: "अभी अलॉट नहीं हुआ", approved: false, date: dateSubmitted
    };
    let sList = readStudentsSafe();
    const old = sList.find(s => s.mobile === sData.mobile);
    if (old) { sData.roomNumber = old.roomNumber; sData.approved = old.approved; sData.appNo = old.appNo || appNumber; }
    sList = sList.filter(s => s.mobile !== sData.mobile); sList.push(sData);
    fs.writeFileSync(studentsFile, JSON.stringify(sList, null, 2));

    // 🖨️ रसीद इंटरफ़ेस रेंडरर
    res.send(`
        <!DOCTYPE html>
        <html lang="hi">
        <head>
            <meta charset="UTF-8">
            <title>प्रवेश आवेदन पावती रसीद</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #f8f9fa; font-family: sans-serif; }
                .receipt-card { background: white; border: 2px solid #333; max-width: 650px; margin: 30px auto; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                @media print { .no-print { display: none; } body { background: white; } .receipt-card { border: none; box-shadow: none; margin: 0; } }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="receipt-card">
                    <div class="text-center border-bottom pb-2 mb-3">
                        <h6 class="text-muted mb-0">आदिम जाति तथा अनुसूचित जाति विकास विभाग, छत्तीसगढ़ शासन</h6>
                        <h4 class="fw-bold text-primary my-1">प्री मैट्रिक ST+SC बालक छात्रावास सूरजपुर</h4>
                        <h5 class="text-success fw-bold">प्रवेश आवेदन पावती रसीद (सत्र 2026-27)</h5>
                    </div>
                    <div class="row mb-3">
                        <div class="col-8">
                            <p class="mb-1"><b>आवेदन क्रमांक:</b> <span class="text-danger fw-bold">${sData.appNo}</span></p>
                            <p class="mb-1"><b>विद्यार्थी का नाम:</b> ${sData.studentName}</p>
                            <p class="mb-1"><b>पिता का नाम:</b> ${sData.fatherName}</p>
                            <p class="mb-1"><b>मोबाइल:</b> ${sData.mobile}</p>
                        </div>
                        <div class="col-4 text-end">
                            <img src="${sData.photoUrl}" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
                        </div>
                    </div>
                    <table class="table table-bordered table-sm" style="font-size: 14px;">
                        <tr><th>कक्षा / संस्थान</th><td>${sData.studentClass} - ${sData.collegeName}</td></tr>
                        <tr><th>वर्ग / कैटेगरी</th><td>${sData.category}</td></tr>
                        <tr><th>जमा दिनांक व समय</th><td>${sData.date}</td></tr>
                    </table>
                    <div class="text-center mt-4 no-print">
                        <button onclick="window.print()" class="btn btn-primary fw-bold me-2">🖨️ रसीद प्रिंट / PDF डाउनलोड</button>
                        <a href="/" class="btn btn-secondary">🏠 मुख्य पृष्ठ</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/view-students', (req, res) => {
    const auth = { login: 'admin', password: 'password123' };
    const b64 = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64, 'base64').toString().split(':');
    if (!login || !password || login !== auth.login || password !== auth.password) {
        res.set('WWW-Authenticate', 'Basic realm="401"'); return res.status(401).send('❌ गलत पासवर्ड!');
    }
    let currentWarden = readWardenSafe();
    let sList = readStudentsSafe();
    let rows = '';
    sList.forEach((s, idx) => {
        let actionBtn = s.approved ? `<span class="badge bg-success">Approved</span>` : `<button onclick="approveStudent('${s.id}')" class="btn btn-sm btn-primary">Approve</button>`;
        rows += `
            <tr class="align-middle" style="font-size:12px;">
                <td>${idx + 1}</td>
                <td><img src="${s.photoUrl}" class="rounded me-1" style="width:35px; height:35px; object-fit:cover;"><b>${s.studentName}</b></td>
                <td>${s.fatherName}</td><td>${s.mobile}</td><td>${s.studentClass}</td>
                <td>
                    <div class="d-flex">
                        <input type="text" id="room-${s.id}" class="form-control form-control-sm me-1" value="${s.roomNumber || ''}" style="width:65px;">
                        <button onclick="saveRoom('${s.id}')" class="btn btn-sm btn-dark">सेव</button>
                    </div>
                </td>
                <td>${actionBtn}</td>
                <td><button onclick="removeStudent('${s.id}')" class="btn btn-sm btn-danger">Remove</button></td>
            </tr>`;
    });
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>एडमिन पैनल</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
        <body class="bg-light p-4">
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="bg-white border p-3 rounded h-100 shadow-sm">
                        <h5>⚙️ लोगो / बैनर बदलें</h5>
                        <form action="/update-logo" method="POST" enctype="multipart/form-data"><input type="file" name="hostelLogo" class="form-control form-control-sm mb-2" accept="image/*" required><button type="submit" class="btn btn-sm btn-primary w-100">अपलोड</button></form>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="bg-white border p-3 rounded h-100 shadow-sm">
                        <h5 class="text-danger">📢 नया नोटिस जारी करें</h5>
                        <form action="/post-notice" method="POST"><input type="text" name="noticeText" class="form-control form-control-sm mb-2" required><button type="submit" class="btn btn-sm btn-danger w-100">लाइव करें</button></form>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="bg-white border p-3 rounded h-100 shadow-sm">
                        <h5 class="text-success">⚙️ वॉर्डन जानकारी व फ़ोटो बदलें</h5>
                        <form action="/update-warden" method="POST" enctype="multipart/form-data" class="row g-2">
                            <div class="col-6"><input type="text" name="w1Name" class="form-control form-control-sm" value="${currentWarden.w1Name}"></div>
                            <div class="col-6"><input type="text" name="w2Name" class="form-control form-control-sm" value="${currentWarden.w2Name}"></div>
                            <div class="col-6"><input type="text" name="w1Mobile" class="form-control form-control-sm" value="${currentWarden.w1Mobile}"></div>
                            <div class="col-6"><input type="text" name="w2Mobile" class="form-control form-control-sm" value="${currentWarden.w2Mobile}"></div>
                            <div class="col-6"><small class="text-muted">वॉर्डन A फ़ोटो:</small><input type="file" name="w1PhotoFile" class="form-control form-control-sm" accept="image/*"></div>
                            <div class="col-6"><small class="text-muted">वॉर्डन B फ़ोटो:</small><input type="file" name="w2PhotoFile" class="form-control form-control-sm" accept="image/*"></div>
                            <div class="col-12"><button type="submit" class="btn btn-sm btn-success w-100 mt-1">दोनों वॉर्डन सेव करें</button></div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="bg-white border p-3 rounded shadow-sm">
                <h4 class="text-center text-primary fw-bold mb-3">🔒 हॉस्टल कंट्रोल पैनल</h4>
                <table class="table table-bordered table-striped text-center">
                    <thead class="table-dark"><tr><th>S.No</th><th>छात्र</th><th>पिता का नाम</th><th>मोबाइल</th><th>कक्षा</th><th>रूम अलॉट</th><th>Approval</th><th>हटाएं</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="8">कोई छात्र रिकॉर्ड उपलब्ध नहीं है।</td></tr>'}</tbody>
                </table>
            </div>
            <script>
                function saveRoom(id){ const val=document.getElementById('room-'+id).value; fetch('/assign-room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:id,roomNumber:val})}).then(res=>res.json()).then(d=>{if(d.success){alert('🎉 रूम अलॉट हो गया!');location.reload();}})}
                function approveStudent(id){ fetch('/approve-student',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:id})}).then(res=>res.json()).then(d=>{if(d.success){alert('🎉 एडमिशन स्वीकृत!');location.reload();}})}
                function removeStudent(id){ if(confirm('क्या आप डिलीट करना चाहते हैं?')){ fetch('/remove-student',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:id})}).then(res=>res.json()).then(d=>{if(d.success){alert('🗑️ रिकॉर्ड हटा दिया गया!');location.reload();}})} }
            </script>
        </body>
        </html>
    `);
});

app.post('/update-logo', upload.single('hostelLogo'), (req, res) => {
    if (req.file) { fs.writeFileSync(logoFile, JSON.stringify({ url: req.file.path }, null, 2)); res.send("<h1>🎉 लोगो अपडेट!</h1><a href='/view-students'>वापस</a>"); } else res.redirect('/view-students');
});
app.post('/assign-room', (req, res) => {
    let list = readStudentsSafe(); list = list.map(s => { if (s.id === req.body.studentId) s.roomNumber = req.body.roomNumber; return s; });
    fs.writeFileSync(studentsFile, JSON.stringify(list, null, 2)); res.json({ success: true });
});
app.post('/approve-student', (req, res) => {
    let list = readStudentsSafe(); list = list.map(s => { if (s.id === req.body.studentId) s.approved = true; return s; });
    fs.writeFileSync(studentsFile, JSON.stringify(list, null, 2)); res.json({ success: true });
});
app.post('/remove-student', (req, res) => {
    let list = readStudentsSafe(); list = list.filter(s => s.id !== req.body.studentId);
    fs.writeFileSync(studentsFile, JSON.stringify(list, null, 2)); res.json({ success: true });
});
app.post('/post-notice', (req, res) => {
    const list = JSON.parse(fs.readFileSync(noticesFile, 'utf8') || '[]'); list.unshift({ text: req.body.noticeText, date: new Date().toLocaleDateString() });
    fs.writeFileSync(noticesFile, JSON.stringify(list, null, 2)); res.send("<h1>📢 नोटिस लाइव!</h1><a href='/view-students'>वापस</a>");
});
app.post('/update-warden', cpUpload, (req, res) => {
    const files = req.files || {}; let cur = readWardenSafe();
    const w1Path = files.w1PhotoFile ? files.w1PhotoFile[0].path : cur.w1Photo;
    const w2Path = files.w2PhotoFile ? files.w2PhotoFile[0].path : cur.w2Photo;
    const updated = { w1Name: req.body.w1Name || cur.w1Name, w1Desig: "अधीक्षक (A)", w1Mobile: req.body.w1Mobile || cur.w1Mobile, w1Office: "कक्ष 01", w1Photo: w1Path, w2Name: req.body.w2Name || cur.w2Name, w2Desig: "अधीक्षक (B)", w2Mobile: req.body.w2Mobile || cur.w2Mobile, w2Office: "कक्ष 02", w2Photo: w2Path };
    fs.writeFileSync(wardenFile, JSON.stringify(updated, null, 2)); res.send("<h1>🎉 वॉर्डन अपडेट!</h1><a href='/view-students'>वापस</a>");
});
app.get('/get-warden', (req, res) => res.json(readWardenSafe()));
app.get('/get-logo', (req, res) => res.json(JSON.parse(fs.readFileSync(logoFile, 'utf8') || '{}')));
app.get('/get-notices', (req, res) => res.json(JSON.parse(fs.readFileSync(noticesFile, 'utf8') || '[]')));
app.get('/check-room-status', (req, res) => {
    const s = readStudentsSafe().find(s => s.mobile === (req.query.mobile || '').trim());
    res.json(s ? { found: true, ...s } : { found: false });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('🚀 सर्वर चालू है!'));
