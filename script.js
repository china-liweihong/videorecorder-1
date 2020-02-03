$(document).ready(function() {
    const recordBtn     = $('#recordBtn')
    const previewBtn    = $('#previewBtn')
    const playBtn       = $('#playBtn')
    const uploadBtn     = $('#uploadBtn')

    const progressBarFill = $('#progressBarFill')
    const progressBarText = $('#progressBarText')

    let uploaded = false

    const camera = videojs('camera', {
        controls: true,
        controlBar: {
            deviceButton: false,
            fullscreenToggle: false,
            // recordToggle: false,
            playToggle: false
        },
        plugins: {
            record: {
                maxLength: 300, // seconds
                audio: true,
                video: true,
                debug: true,
            }
        }
    })

    const record = camera.record()

    // Start camera
    record.getDevice()
    
    // Record button event
    recordBtn.on('click', function() {
        
        // Start Recording
        if (!record.isRecording()) {
            record.start()
        } 
        
        // Stop Recording
        else {
            record.stop()
        }
    })

    // Preview button event
    previewBtn.on('click', function() {
        if (record.getDuration()) {
            camera.play()
        }
    })

    // Play button event
    playBtn.on('click', function() {
        if (record.getDuration()) {
            camera.play()
        }
    })


    // Upload button event
    uploadBtn.on('click', function() {
        if (record.getDuration()) {
            elemDisable(recordBtn)
            elemDisable(previewBtn)
            elemDisable(playBtn)
            elemDisable(uploadBtn)

            const data = camera.recordedData
            const formData = new FormData()
            formData.append('file', data, data.name)

            $.ajax({
                type: 'POST',
                url: 'http://localhost/videorecorder/upload.php',
                data: formData,
                cache: false,
                contentType: 'multipart/form-data',
                processData: false,
                xhr: function() {
                    const xhr = $.ajaxSettings.xhr()

                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function(data) {
                            let percent   = data.lengthComputable ? (data.loaded / data.total) * 100 : 0
                            percent = percent.toFixed(2)

                            progressBarFill.css('width', percent + '%')
                            progressBarText.text(percent + '%')
                        }, false)
                    }

                    return xhr
                },
                success: function() {
                    uploaded = true

                    elemEnable(recordBtn)
                    previewBtn.css('display', 'none')
                    playBtn.css('display', 'block')
                    elemEnable(playBtn)
                }
            })
        }
    })

    camera.on('deviceReady', function() {
        elemEnable(recordBtn)
    })

    camera.on('startRecord', function() {
        recordBtn.text('Stop Recording')
        recordBtn.addClass('recording')
        
        elemDisable(previewBtn)
        elemDisable(uploadBtn)

        if (uploaded) {
            uploaded = false

            previewBtn.css('display', 'block')
            playBtn.css('display', 'none')
            elemDisable(playBtn)
            progressBarFill.css('width', '0%')
            progressBarText.text('0%')
        }
    })

    camera.on('stopRecord', function() {
        recordBtn.text('Start Recoding')
        recordBtn.removeClass('recording')

        elemEnable(previewBtn)
        elemEnable(uploadBtn)
    })
})

function elemDisable(elem) {
    $(elem).prop('disabled', true)
}

function elemEnable(elem) {
    $(elem).prop('disabled', false)
}