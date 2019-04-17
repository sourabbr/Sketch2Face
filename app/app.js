const express = require('express')
const path = require('path')
const exec = require('util').promisify(require('child_process').exec)
const fs = require('fs').promises
const app = express()

app.use(express.static('public'))
app.set('port', (process.env.PORT || 3000))
const listener = app.listen(process.env.PORT, function() {
  console.log('App is listening on port ' + listener.address().port)
})

const io = require('socket.io')(listener)

io.sockets.on('connection', socket => {
  console.log('client connected', {id: socket.id, time:socket.handshake.time, useragent:socket.handshake.headers['user-agent']})
  socket.on('executeScript', ()=>{
    executeScript(socket)
  })
})

async function prescript_setup(socket){
  console.log("prescript_setup")
  socket.emit("status", "Running pre-script setup")
  await fs.copyFile('/workspace/input/image.png','/workspace/input/valA/image.png')
  await fs.copyFile('/workspace/input/image.png','/workspace/input/valB/image.png')
  console.log("prescript_setup done")
}

async function postscript_cleanup(socket) {
  console.log("postscript_cleanup")
  socket.emit("status", "Running post-script cleanup")
  await fs.copyFile('/workspace/output/sketch2face_cyclegan/val_latest/images/image_fake_B.png', '/workspace/output/result.png')
  await fs.copyFile('/workspace/output/sketch2face_cyclegan/val_latest/images/image_real_A.png', '/workspace/output/input.png')
  console.log("Copied result images")
  let delete_list = [
    '/workspace/input/image.png',
    '/workspace/input/valA/image.png',
    '/workspace/input/valB/image.png',
    '/workspace/output/sketch2face_cyclegan/val_latest/images/image_fake_A.png',
    '/workspace/output/sketch2face_cyclegan/val_latest/images/image_fake_B.png',
    '/workspace/output/sketch2face_cyclegan/val_latest/images/image_real_A.png',
    '/workspace/output/sketch2face_cyclegan/val_latest/images/image_real_B.png',
    '/workspace/output/sketch2face_cyclegan/val_latest/images/image_rec_A.png',
    '/workspace/output/sketch2face_cyclegan/val_latest/images/image_rec_B.png'
  ]
  for(let path of delete_list){
    console.log('unlinking',path)
    try{
      await fs.unlink(path)
    }catch(e){console.log('failed unlinking',path)}
  }
  console.log("postscript_cleanup done")
}

async function executeScript(socket){
  console.log("executeScript")
  try{
    prescript_setup(socket)
    console.log("Executing script (This will take some time)")
    socket.emit("status", "Executing script (This will take some time)")
    let output = await exec(`cd /workspace/pytorch-CycleGAN-and-pix2pix && python test.py --phase val --dataroot /workspace/input --results_dir /workspace/output --name sketch2face_cyclegan --model cycle_gan  --direction AtoB --gpu_ids -1`)
    console.log("Finished executing script")
    socket.emit("console", output)
    socket.emit("status", "Finished executing script")
    console.log({output})
    postscript_cleanup(socket)
    socket.emit('status','Here is your converted image')
    socket.emit('done','Finished converting image.')
  }catch(err){
    console.error({err})
    socket.emit('alert', err.toString())
  }
}

app.get("/", function (request, response) {
    console.log("Requested /")
    response.sendFile(path.join(__dirname, './views/index.html'))
})


app.get("/input.png", function (request, response) {
  console.log("Requested /input.png")
  response.sendFile('/workspace/output/input.png')
})
app.get("/result.png", function (request, response) {
  console.log("Requested /result.png")
  response.sendFile('/workspace/output/result.png')
})


const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/workspace/input')
  },
  filename: function (req, file, cb) {
    cb(null, 'image.png')
  }
})
const upload = multer({ storage: storage })

app.post('/upload', upload.single('imagefile'), (req, res) => {
  console.log('/upload')
  res.sendStatus(200)
})


