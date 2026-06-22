const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// मेरिट लिस्ट का मास्टर मोंगोडीबी कलेक्शन मॉडल
const AdminListSchema = new mongoose.Schema({
    listType: { type: String, default: "text" },
    textContent: { type: String, default: "" },
    pdfDriveLink: { type: String, default: "" }
});

const AdminList = mongoose.models.AdminList || mongoose.model('AdminList', AdminListSchema);

// 🔒 बिना पुराना डेटा हटाए नया अपडेट सिंक करने की मास्टर API
router.post('/api/update-merit-master', async (req, res) => {
    try {
        let record = await AdminList.findOne({});
        if (!record) { record = new AdminList(); }
        record.listType = req.body.listType;
        record.textContent = req.body.textContent || "";
        record.pdfDriveLink = req.body.pdfDriveLink || "";
        await record.save();
        res.send("<h1>🎉 मेरिट लिस्ट का नया अपडेट तिजोरी में सुरक्षित हो गया है!</h1><a href='/view-students'>एडमिन पैनल पर वापस जाएँ</a>");
    } catch (err) {
        res.status(500).send("Error updating merit list inside new file");
    }
});

module.exports = router;
