$( document ).ready(function() {
    console.log( "ready!" );
    $(".rotate").on("input", function(){rotate(this.value,this.id)});
    $(".scale").on("input", function(){scale(this.value,this.id)});
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