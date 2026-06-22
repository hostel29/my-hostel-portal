const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// मेरिट लिस्ट के लिए एक नया मोंगोडीबी कलेक्शन मॉडल (ताकि डेटा कभी गायब न हो)
const AdminListSchema = new mongoose.Schema({
    listType: { type: String, default: "text" }, // 'text' या 'pdf'
    textContent: { type: String, default: "" },
    pdfDriveLink: { type: String, default: "" }
});

// अगर मॉडल पहले से बना है तो पुराना इस्तेमाल करेगा, नहीं तो नया बनाएगा
const AdminList = mongoose.models.AdminList || mongoose.model('AdminList', AdminListSchema);

// 🔒 एडमिन पैनल से मेरिट लिस्ट का नया डेटा बिना डिलीट किए सीधे अपडेट करने की API
router.post('/api/update-merit-master', async (req, res) => {
    try {
        let record = await AdminList.findOne({});
        if (!record) {
            record = new AdminList();
        }
        
        record.listType = req.body.listType; // एडमिन जो टाइप चुनेगा (text या pdf)
        record.textContent = req.body.textContent || "";
        record.pdfDriveLink = req.body.pdfDriveLink || "";
        
        await record.save();
        res.send("<h1>🎉 मेरिट लिस्ट का नया अपडेट तिजोरी में सुरक्षित हो गया है!</h1><a href='/view-students'>एडमिन पैनल पर वापस जाएँ</a>");
    } catch (err) {
        res.status(500).send("Error updating merit list inside new file");
    }
});

// 📋 पब्लिक के देखने के लिए डेटा भेजने का रूट
router.get('/api/get-merit-data', async (req, res) => {
    const data = await AdminList.findOne({}) || { listType: "text", textContent: "अभी सूची तैयार की जा रही है...", pdfDriveLink: "" };
    res.json(data);
});

module.exports = router;
