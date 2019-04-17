$(function () {
  var socket = io()
  var id = Date.now()
  console.log({id})
  // 1
  socket.on('connect', function(){
    console.log(socket.id)
  })
  // 3
  socket.on('done', function (message) {
    console.log("Done",{message})
    $("#ajaxloader").hide(500)
    if($("#choice :selected").val()=="sketch"){
      $(`<img src="/output/result_face_${id}.png?${Date.now()}" style="height:256px;width:${$("#imgpreview").width()}px" class="img-fluid" id="result_face" alt="Result image" title="Result">`).appendTo('#output')
      $(`<img src="/output/result_sketch_${id}.png?${Date.now()}" style="display:none;height:256px;width:${$("#imgpreview").width()}px" class="img-fluid" id="result_sketch" alt="Result image" title="Result">`).appendTo('#output')
    }
    else{
      $(`<img src="/output/result_face_${id}.png?${Date.now()}" style="display:none;height:256px;width:${$("#imgpreview").width()}px" class="img-fluid" id="result_face" alt="Result image" title="Result">`).appendTo('#output')
      $(`<img src="/output/result_sketch_${id}.png?${Date.now()}" style="height:256px;width:${$("#imgpreview").width()}px" class="img-fluid" id="result_sketch" alt="Result image" title="Result">`).appendTo('#output')
    }
  })
  $("#choice").on("change",function(){
    if (this.value=="sketch"){
      $("#result_sketch").hide()
      $("#result_face").show()
    }
    else{
      $("#result_face").hide()
      $("#result_sketch").show()
    }
  })
  socket.on("status", function(status){
    console.log({status})
    $("#status").text(status)
  })

  socket.on("console", function(message){
    console.log(message)
  })

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
    // 2
    console.log("uploadImage")
    $.ajax({
        url: `/upload/${id}`,
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
            socket.emit('executeScript',id)
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

