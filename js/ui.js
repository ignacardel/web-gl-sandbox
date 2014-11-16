$( document ).ready(function() {
    console.log( "ready!" );
    $(".rotate").on("input", function(){rotate(this.value,this.id)});
    $(".scale").on("input", function(){scale(this.value,this.id)});
    $('#objectsMenu').on('click','a', function(e) {
        e.preventDefault();
        $("#objectsMenu a.active").removeClass("active");
        $(this).addClass("active");
        currentObjectIndex=parseInt($(this).attr('id').split("_").pop());
        $("#rotateX").val(objects[currentObjectIndex].xRot);
        $("output[for='rotateX']").text(objects[currentObjectIndex].xRot);
        $("#rotateY").val(objects[currentObjectIndex].yRot);
        $("output[for='rotateY']").text(objects[currentObjectIndex].yRot);
        $("#rotateZ").val(objects[currentObjectIndex].zRot);
        $("output[for='rotateZ']").text(objects[currentObjectIndex].zRot);
        $("#scaleX").val(objects[currentObjectIndex].xScale);
        $("output[for='scaleX']").text(objects[currentObjectIndex].xScale);
        $("#scaleY").val(objects[currentObjectIndex].yScale);
        $("output[for='scaleY']").text(objects[currentObjectIndex].yScale);
        $("#scaleZ").val(objects[currentObjectIndex].zScale);
        $("output[for='scaleZ']").text(objects[currentObjectIndex].zScale);
    });
});

$(document).keydown(function(e) {
	var translateType=$("input[name=translate]:checked").val();
    switch(e.which) {
        case 37: // left
        	if (translateType=="x")
        		translate(translateType,"-");
        	break;

        case 38: // up
        	if (translateType=="y")
        		translate(translateType,"+");
        	if (translateType=="z")
        		translate(translateType,"+");
        	break;

        case 39: // right
        	if (translateType=="x")
        		translate(translateType,"+");
        	break;

        case 40: // down
        	if (translateType=="y")
        		translate(translateType,"-");
        	if (translateType=="z")
        		translate(translateType,"-");
        	break;

        default: return;
    }
    e.preventDefault();
});

function addMenuItem(type,timeStamp){
    if (type=="pyramidDrag")
        $( "#objectsMenu" ).append( '<a href="#" id="object_'+timeStamp+'" class="list-group-item">Pirámide</a>');
    if (type=="cubeDrag")
        $( "#objectsMenu" ).append( '<a href="#" id="object_'+timeStamp+'" class="list-group-item">Cubo</a>');

    if ($( "#objectsMenu a").size()==1){
        $("#object_"+timeStamp).addClass("active");
        currentObjectIndex=timeStamp;
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var timeStamp = new Date().getTime();
    addObject(ev.dataTransfer.getData("text"),timeStamp);
    addMenuItem(ev.dataTransfer.getData("text"),timeStamp);
}