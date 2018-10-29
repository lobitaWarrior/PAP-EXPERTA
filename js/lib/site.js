$(document).ready(function () {
    $("#rowGrid").css("visibility","hidden");
    document.getElementById("loader").style.display = "none";
    $('[data-toggle="tooltip"]').tooltip();
});

function fileValidation(){
    var fileInput = $("#inputGroupFile01");
    var filePath = fileInput[0].value;
    var allowedExtensions = /(\.xls|\.xlsx)$/i;
    if(!allowedExtensions.exec(filePath)){
        $("#modalStyle").removeClass("modal-notify modal-danger");
        $("#modalStyle").addClass("modal-notify modal-warning");
        $("#titleModal").html("Atención");
        $("#bodyModal").html("Solo se permiten archivos con la siguiente extension: .xls/.xlsx");
        $('#alertModal').modal()
        fileInput.value = '';
        return false;
    }else{
        document.getElementById("loader").style.display = "block";

        var data = new FormData();
        jQuery.each(jQuery('#inputGroupFile01')[0].files, function (i, file) {
            data.append("file",file);
        })

        //  rest/accidents/predict/
        //  http://localhost:8080/rest/accidents/predict/
        jQuery.ajax({
            url: 'rest/accidents/predict/',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (data) {
                var odata=TransformarJSON(data);
                $("#rowGrid").css("visibility","visible");
                document.getElementById("loader").style.display = "none";
                ArmarTable(odata);
                ArmarPieChart(odata);
                $('[data-toggle="tooltip"]').tooltip();
            },
            error: function (data) {
                document.getElementById("loader").style.display = "none";
                $("#modalStyle").removeClass("modal-notify modal-warning");                        
                $("#modalStyle").addClass("modal-notify modal-danger");
                $("#titleModal").html("Error");
                $("#bodyModal").html("Ocurrió un error en la comunicacion con el servicio, intente mas tarde");
                $('#alertModal').modal()
            }
        }); 
    }
}  

function ArmarTable(odata){
    $('#dtBasic').DataTable({
        data: odata,
        destroy: true,
        columns: [
            { data: 'id' },
            { data: 'siniestroSeveridad' },
            { data: 'siniestroCausa'},
            { data: 'siniestroParteCuerpo' },
            { data: 'siniestroPrestador' },
            { data: 'siniestroTipoPoliza' },
            { data: 'siniestroPorcentajeJuicio' },
            { data: 'siniestroTieneJuicio' }
        ],columnDefs: [{
            targets: 2,//CAUSA
            render:function(data, type, row) {
            if (type === 'display' && data != null) {
              data = data.replace(/<(?:.|\\n)*?>/gm, '');
              if(data.length > 80) {
                return '<span class="show-ellipsis" data-toggle="tooltip" data-placement="bottom" title="'+ data +'">' + data.substr(0, 80) + '</span><span class="no-show">' + data.substr(80) + '</span>';
              } else {
                return data;
              }
            } else {
              return data;
            }
          }
        },{
            targets: [6],//%JUICIO
            render: $.fn.dataTable.render.number(',', '.', 2)
        }],
        dom:"<'row buttonrows'<'col-sm-3'l><'col-sm-6 text-center'B><'col-sm-3'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        buttons: [
            {
                extend:'excel',text:'<span data-toggle="tooltip" data-placement="bottom" title="EXPORTAR RESULTADOS">EXPORTAR RESULTADOS </span><span class="fa fa-download"></span>'
            }
            
        ],
        language: {
            "info": "Mostrando _START_ a _END_ de _TOTAL_ Registros",
            "search": "Buscar",
            "lengthMenu": "Mostrar _MENU_ registros",
            "infoEmpty": "Mostrando 0 a 0 de 0 registros",
            "emptyTable": "No hay registros en la tabla",
            "zeroRecords": "No se encontraron los registros buscados",
            paginate: {
                first:    '«',
                previous: '‹',
                next:     '›',
                last:     '»'
            },
            aria: {
                paginate: {
                    first:    'Primero',
                    previous: 'Anterior',
                    next:     'Siguiente',
                    last:     'Último'
                }
            }
        },
        "order":[6,'desc'],//%JUICIO
        //"ordering": false,
        "createdRow": function( row, data, dataIndex ) {
            if ( parseFloat(data.siniestroPorcentajeJuicio) <= 30 ) {
                $(row).addClass( 'rowGood' );
            }else if( parseFloat(data.siniestroPorcentajeJuicio) > 30 && parseFloat(data.siniestroPorcentajeJuicio) < 55){
                $(row).addClass( 'rowWarning' );
            }else{
                $(row).addClass( 'rowDanger' );
            } 
            
        }
    });
    $('.dataTables_length').addClass('bs-select');
}

function ArmarPieChart(odata){

    var array=[0,0,0];

    for (var index = 0; index < odata.length; index++) {

        if(parseFloat(odata[index].siniestroPorcentajeJuicio)<= 30){
            array[2]++;
        }else if(parseFloat(odata[index].siniestroPorcentajeJuicio) > 30 && parseFloat(odata[index].siniestroPorcentajeJuicio)< 55){
            array[1]++;
        }else{
            array[0]++;
        }

    }

    var ctx = document.getElementById("myChart");
    var Data = {
        labels: [
            "Rojo",
            "Naranja",
            "Verde"
        ],
        datasets: [
            {
                data: array,
                backgroundColor: [
                    "#b71c1c",
                    '#ff8f00',
                    "#1b5e20"
                ]
            }]
    };  
    var myPieChart = new Chart(ctx,{
        type: 'pie',
        data: Data
    });
}

function TransformarJSON(jsonarray){
    var array=[];

    for (var index = 0; index < jsonarray._accidents.length; index++) {

        var object={
        id:"",
        siniestroSeveridad:"",
        siniestroCausa:"",
        siniestroParteCuerpo:"",
        siniestroPorcentajeJuicio:"",
        siniestroTieneJuicio:"",
        siniestroPrestador:"",
        siniestroTipoPoliza:""
        }
        object.id=jsonarray._accidents[index].accident.id;
        object.siniestroCausa=jsonarray._accidents[index].accident.siniestroCausa;
        object.siniestroParteCuerpo=jsonarray._accidents[index].accident.siniestroParteCuerpo;
        object.siniestroSeveridad=jsonarray._accidents[index].accident.siniestroSeveridad;
        object.siniestroPorcentajeJuicio=jsonarray._accidents[index].inferredValue;
        object.siniestroTieneJuicio=jsonarray._accidents[index].accident.juicioTiene;
        object.siniestroPrestador=jsonarray._accidents[index].accident.siniestroPrestador;
        object.siniestroTipoPoliza=jsonarray._accidents[index].accident.tipoPoliza;
        array.push(object);
    }
    return array;
}