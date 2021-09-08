const express = require('express');
const router = express.Router();


// Test

router.post('/', (req,res,next)=>{
    // console.log('notify arrived');
    // console.log('data');
    // console.log(req.body);
        res.status(200).json({
            message:'notify accepted'
        });
});

module.exports = router;