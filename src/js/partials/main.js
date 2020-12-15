let dragged, dragInside;

function onDragOver(event) {
    event.preventDefault();
}

function onDragLeave(event) {
    event.target.style.backgroundColor = '';
}

function onDragEnter(event) {
    const target = event.target;
    if (target && dragged && target.nodeName === 'DIV') {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move'
        target.style.backgroundColor = 'rgb(118 189 94 / 40%)';
    }
}

function onDrop(event) {
    const target = event.target;
    if (!dragInside){
        if (target && dragged && target.nodeName === 'DIV') {
            target.style.backgroundColor = '';
            dragged.style.opacity = '';
            target.appendChild(dragged.cloneNode());
            dragged.classList.add('dragged');
        } else if (target && dragged && target.nodeName === 'IMG') {
            var hole = target.parentNode;
            while (hole.firstChild) {
                var id = hole.firstChild.dataset.id;
                document.querySelector(".game__dragzone [data-id='"+id+"']").classList.remove('dragged')
                hole.removeChild(hole.firstChild);
            }
            hole.style.backgroundColor = '';
            event.preventDefault();
            dragged.style.opacity = '';
            hole.appendChild(dragged.cloneNode());
            dragged.classList.add('dragged');
        }
    } else {
        if (target && dragged && target.nodeName === 'DIV') {
            target.style.backgroundColor = '';
            dragged.style.opacity = '';
            dragged.parentNode.removeChild(dragged);
            target.append(dragged);
        } else if (target && dragged && target.nodeName === 'IMG') {
            var hole = target.parentNode;
            var oldItem = hole.firstChild;
            while (hole.firstChild) {
                hole.removeChild(hole.firstChild);
            }
            hole.style.backgroundColor = '';
            event.preventDefault();
            dragged.style.opacity = '';
            dragged.parentNode.appendChild(oldItem);
            dragged.parentNode.removeChild(dragged);
            hole.append(dragged);
        }
    }

}

function onDragStart(event) {
    let target = event.target;
    if (target && target.nodeName === 'IMG') {
        dragInside = false;
        dragged = target;
        event.dataTransfer.setData('text', target.id);
        event.dataTransfer.dropEffect = 'move';
        event.target.style.opacity = .3;
    }
}

function onDragEnd(event) {
    if (event.target && event.target.nodeName === 'IMG') {
        event.target.style.opacity = '';
        dragged = null;
    }
}


function onClick(event) {
    const target = event.target;
    var active = target.classList.contains('dragged');
    if (target && target.nodeName === 'IMG' && !active) {
        var dropHoles = document.querySelectorAll('.js-drop');
        try {
            dropHoles.forEach(function(elArg) {
                if (!elArg.firstChild) {
                    elArg.appendChild(target.cloneNode());
                    target.classList.add('dragged');
                    throw 'Break';
                }
            });
        } catch (e) {
            if (e !== 'Break') throw e;
        }
    }
}


const dragZone = document.querySelectorAll('.js-drag');
dragZone.forEach(function(elArg){
    elArg.addEventListener('dragstart', onDragStart);
    elArg.addEventListener('dragend', onDragEnd);
    elArg.addEventListener('click', onClick);
});


const dropZone = document.querySelectorAll('.js-drop');
dropZone.forEach(function(elArg){
    elArg.addEventListener('drop', onDrop);
    elArg.addEventListener('dragenter', onDragEnter);
    elArg.addEventListener('dragleave', onDragLeave);
    elArg.addEventListener('dragover', onDragOver);
});

document.querySelector('.game__dropzone').addEventListener("click", function(event){
    const target = event.target;
    if (target && target.nodeName === 'IMG') {
        var id = target.dataset.id;
        target.parentNode.removeChild(target);
        document.querySelector(".game__dragzone [data-id='"+id+"']").classList.remove('dragged')
    }
});

document.querySelector('.game__dropzone').addEventListener("dragstart", function(event){
    const target = event.target;
    if (target && target.nodeName === 'IMG') {
        dragInside = true;
        dragged = target;
        event.dataTransfer.setData('text', target.id);
        event.dataTransfer.dropEffect = 'move';
        event.target.style.opacity = .3;
    }
});
document.querySelector('.game__dropzone').addEventListener("dragend", function(event){
    const target = event.target;
    if (target && target.nodeName === 'IMG') {
        event.target.style.opacity = '';
        dragged = null;
    }
});



$('.js-game-save').on('click',function (){
    var items = $('.game__dropzone').find('img');
    var count = items.length;
    if (count < 12) {
        alert('Заполните карту до конца.');
    } else {
        var arrayItems = {};
        items.each(function(index) {
            var id = $(this).data('id');
            arrayItems[index] = id;
        });
        var jsonItems = JSON.stringify(arrayItems);
        $.ajax({
            type: "POST",
            url: "/save/",
            data: jsonItems,
            beforeSend: function () {
                $('.game__btn').prop('disabled',true);
            },
            success: function(data) {
                if (data != '') {
                    var myUrl = window.location.href;
                    myUrl  = myUrl.replace(/\/$/, '');
                    forceDownload(myUrl + data,'wishcard.jpg');
                    $('.game__btn').prop('disabled',false);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error '+jqXHR.status);
                $('.game__btn').prop('disabled',false);
            }
        });
    }
});

$('.js-game-print').on('click',function (){
    var items = $('.game__dropzone').find('img');
    var count = items.length;

    if (count < 12) {
        alert('Заполните карту до конца.');
    } else {
        var arrayItems = {};
        items.each(function(index) {
            var id = $(this).data('id');
            arrayItems[index] = id;
        });
        var jsonItems = JSON.stringify(arrayItems);
        $.ajax({
            type: "POST",
            url: "/print/",
            data: jsonItems,
            beforeSend: function () {
                $('.game__btn').prop('disabled',true);
            },
            success: function(data) {
                if (data != '') {
                    var myUrl = window.location.href;
                    myUrl  = myUrl.replace(/\/$/, '');
                    printImg(myUrl + data);
                    $('.game__btn').prop('disabled',false);
                }
                $('.game__btn').prop('disabled',false);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error '+jqXHR.status);
                $('.game__btn').prop('disabled',false);
            }
        });
    }
});

$('.js-game-down').on('click',function (){
    var status = parseInt($('.game__dragzone').data('scroll'));
    if (status < 3){
        status++;
        $('.game__dragzone').attr('data-scroll' ,status);
        $('.game__dragzone').data('scroll' ,status);
        if (status >= 3){
            $('.js-game-down').addClass('game__arrow--disabled');
        }
        $('.js-game-up').removeClass('game__arrow--disabled');
    }
});


$('.js-game-up').on('click',function (){
    var status = parseInt($('.game__dragzone').data('scroll'));
    if (status > 0){
        status--;
        $('.game__dragzone').attr('data-scroll' ,status);
        $('.game__dragzone').data('scroll' ,status);
        if (status <= 0){
            $('.js-game-up').addClass('game__arrow--disabled');
        }
        $('.js-game-down').removeClass('game__arrow--disabled');
    }
});


function forceDownload(url, fileName){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function(){
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
}

function printImg(url) {
    var win = window.open('');
    win.document.write('<img src="' + url + '" onload="window.print();window.close()" />');
    win.focus();
}