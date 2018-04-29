// Default export is a4 paper, portrait, using milimeters for units

$(document).ready(function(){
    $("#createPDF").click(function(event){
        var doc = new jsPDF();
        doc.text('This file was created on a chrome extension', 10, 10);
        doc.save('a4.pdf');
    });
});
