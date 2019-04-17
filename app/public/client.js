$(function () {

  var socket = io()
  socket.on('done', function (message) {
      console.log("Done",{message})
      $("#ajaxloader").hide(500)
      $("#imgpreview").slideUp(500)
      $(`<img src = "/input.png" class="img-fluid" id="input_img" alt="Input image" title="Input">`).appendTo('#output')
      $(`<img src = "/result.png" class="img-fluid" id="result_img" alt="Result image" title="Result">`).appendTo('#output')
     
  })

  socket.on("status", function(status){
    console.log({status})
    $("#status").text(status)
  })

  socket.on("console", x => console.log(x))

  socket.on('alert', function (message) {
    console.log({alert:message})
    alert(message)
  })

  $(':file').on('change', function() {
      var file = this.files[0]
      // Also see .name, .type
  })
  $(':button').on('click', uploadImage)
  
  
  function uploadImage() {
    console.log("uploadImage")
    $.ajax({
        url: '/upload',
        type: 'POST',
        data: new FormData($('form')[0]),
        cache: false,
        contentType: false,
        processData: false,
        xhr: function() {
            var myXhr = $.ajaxSettings.xhr()
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        $('progress').attr({
                            value: e.loaded,
                            max: e.total,
                        })
                    }
                } , false)
            }
            return myXhr
        },
        success: function(data) {
          if(data==="OK"){
            console.log("executeScript")
            socket.emit('executeScript','')
          }
        }
    })
  }

  function readURL(input) {
    console.log("readURL")
    if (input.files && input.files[0]) {
      var reader = new FileReader()
      reader.onload = function(e) {
        $('#imgpreview').attr('src', e.target.result)
        $('#imgpreview').hide()
        $('#imgpreview').fadeIn(650)
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  $("#imageUpload").change(function() {
    $("#output").html('')
    $("#ajaxloader").show(1000)
    readURL(this)
    uploadImage()
  })
  
  
  
})

