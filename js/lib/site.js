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
            url: 'http://localhost:8080/rest/accidents/predict/',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (data) {
                $('[data-toggle="tooltip"]').tooltip();
                var odata=transformarJSON(data);
                $("#rowGrid").css("visibility","visible");
                document.getElementById("loader").style.display = "none";
                $('#dtBasic').DataTable({
                    data: odata,
                    destroy: true,
                    columns: [
                        { data: 'siniestroSeveridad' },
                        { data: 'siniestroCausa'},
                        { data: 'siniestroParteCuerpo' },
                        { data: 'siniestroPorcentajeJuicio' }
                    ],columnDefs: [{
                        targets: 1,
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
                        targets: [3],
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
                    "order":[3,'desc'],
                    //"ordering": false,
                    "createdRow": function( row, data, dataIndex ) {
                        if ( parseFloat(data.siniestroPorcentajeJuicio) <= 45 ) {
                            $(row.childNodes[3]).addClass( 'rowGood' );
                        }else if( parseFloat(data.siniestroPorcentajeJuicio) > 45 && parseFloat(data.siniestroPorcentajeJuicio) < 60){
                            $(row.childNodes[3]).addClass( 'rowWarning' );
                        }else{
                            $(row.childNodes[3]).addClass( 'rowDanger' );
                        } 
                        
                    }
                });
                $('.dataTables_length').addClass('bs-select');
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


function transformarJSON(jsonarray){
    var array=[];

    for (var index = 0; index < jsonarray._accidents.length; index++) {

        var object={
        siniestroSeveridad:"",
        siniestroCausa:"",
        siniestroParteCuerpo:"",
        siniestroPorcentajeJuicio:""
        }
        object.siniestroCausa=jsonarray._accidents[index].accident.siniestroCausa;
        object.siniestroParteCuerpo=jsonarray._accidents[index].accident.siniestroParteCuerpo;
        object.siniestroSeveridad=jsonarray._accidents[index].accident.siniestroSeveridad;
        object.siniestroPorcentajeJuicio=jsonarray._accidents[index].inferredValue;
        array.push(object);
    }
    return array;
}