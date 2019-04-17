const multer = require('multer')

module.exports = app => {
    const upload = multer({ 
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, '/workspace/input')
            },
            filename: function (req, file, cb) {
                console.log({id:req.params.id,file})
                cb(null, `image_${req.params.id}.png`)
            }
        }) 
    })
    app.post('/upload/:id', upload.single('imagefile'), (req, res) => {
        console.log('/upload')
        res.sendStatus(200)
    })
}