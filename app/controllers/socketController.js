const exec = require('util').promisify(require('child_process').exec)
const fs = require('fs').promises

module.exports = socket => {
    
    socket.on('executeScript', (id)=>{
        executeScript(id)
    })

    function prescript_setup(id){
        return new Promise(async(resolve,reject)=>{
            try{
                console.log("prescript_setup")
                socket.emit("status", "Running pre-script setup")
                await fs.copyFile(`/workspace/input/image_${id}.png`,`/workspace/input/valA/image_${id}.png`)
                await fs.copyFile(`/workspace/input/image_${id}.png`,`/workspace/input/valB/image_${id}.png`)
                console.log("prescript_setup done")
                resolve()
            }catch(err){
                reject(err)
            }
        })  
    }

    async function postscript_cleanup(id) {
        console.log("postscript_cleanup")
        socket.emit("status", "Running post-script cleanup")
        await fs.copyFile(`/workspace/output/sketch2face_cyclegan/val_latest/images/image_${id}_fake_A.png`, `/workspace/output/result_sketch_${id}.png`)
        await fs.copyFile(`/workspace/output/sketch2face_cyclegan/val_latest/images/image_${id}_fake_B.png`, `/workspace/output/result_face_${id}.png`)
        console.log("Copied result images")
        let delete_list = [
            `/workspace/input/image_${id}.png`,
            `/workspace/input/valA/image_${id}.png`,
            `/workspace/input/valB/image_${id}.png`,
            `/workspace/output/sketch2face_cyclegan/val_latest/images/image_${id}_fake_A.png`,
            `/workspace/output/sketch2face_cyclegan/val_latest/images/image_${id}_fake_B.png`,
            `/workspace/output/sketch2face_cyclegan/val_latest/images/image_${id}_real_A.png`,
            `/workspace/output/sketch2face_cyclegan/val_latest/images/image_${id}_real_B.png`,
            `/workspace/output/sketch2face_cyclegan/val_latest/images/image_${id}_rec_A.png`,
            `/workspace/output/sketch2face_cyclegan/val_latest/images/image_${id}_rec_B.png`
        ]
        for(let path of delete_list){
            console.log('unlinking',path)
            try{
                await fs.unlink(path)
            }catch(e){console.log('failed unlinking',path)}
        }
        console.log("postscript_cleanup done")
    }

    async function executeScript(id){
        console.log("executeScript")
        try{
            await prescript_setup(id)
            console.log("Executing script (This will take some time)")
            socket.emit("status", "Executing script (This will take some time)")
            let output = await exec(`cd /workspace/pytorch-CycleGAN-and-pix2pix && python test.py --phase val --dataroot /workspace/input --results_dir /workspace/output --name sketch2face_cyclegan --model cycle_gan  --direction AtoB --gpu_ids -1`)
            console.log("Finished executing script")
            socket.emit("console", output)
            socket.emit("status", "Finished executing script")
            console.log({output})
            postscript_cleanup(id)
            socket.emit('status','Here is your converted image')
            socket.emit('done','Finished converting image.')
        }catch(err){
            console.error({err})
            socket.emit('alert', err.toString())
        }
    }
}