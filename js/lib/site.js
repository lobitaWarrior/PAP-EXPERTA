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
                console.log(data);
                $('[data-toggle="tooltip"]').tooltip();
                var odata=TransformarJSON(data);
                $("#rowGrid").css("visibility","visible");
                document.getElementById("loader").style.display = "none";
                ArmarTable(odata);
                ArmarPieChart(odata);
            },
            error: function (data) {
                document.getElementById("loader").style.display = "none";
                $("#modalStyle").removeClass("modal-notify modal-warning");                        
                $("#modalStyle").addClass("modal-notify modal-danger");
                $("#titleModal").html("Error");
                $("#bodyModal").html("Ocurrió un error en la comunicacion con el servicio, intente mas tarde");
                $('#alertModal').modal()

                //SOLO PARA PRUEBA
                /*
                data={"_accidents":[{"accident":
                    {"id":"2","siniestroSeveridad":"Leve","siniestroCausa":"Injuria Punzo-Cortante O Contusa Involuntaria","siniestroParteCuerpo":"Dedos De Las Manos","siniestradoDescUltimoDX":"Herida Punzante Con Riesgo Biologico En Estudio","siniestroCircunstancia":"Realizando Tarea Habitual","siniestroFKT":"0","siniestroAltaMedica":"1","siniestroDiagnostico":"1","siniestroCirugia":"0","siniestroEstudios":"0","siniestroPeriodo":"201601","siniestroPrestadorProvincia":"Capital Federal","siniestroCanalIngreso":"DA","siniestroCaseSML":"Dllano","siniestroCaseSupervisor":"Alvarez_sup","siniestroPrestador":"Cemic","empresaCP":"1425","empresaProvincia":"0","siniestradoNacionalidad":"0","siniestradoCP":"1095","siniestradoSexo":"27","siniestradoFhNacimiento":"1901-01-01","tipoPoliza":"RG","localidadPoliza":"Capital Federal"},
                    "inferredValue":"73,04"},
                    {"accident":{"id":"3","siniestroSeveridad":"Leve","siniestroCausa":"Contacto Con Fuego","siniestroParteCuerpo":"Pierna","siniestradoDescUltimoDX":"Quemadura Cadera Y Minf 1er Grado Exc Tob/Pie Sup Hasta 10%","siniestroCircunstancia":"Realizando Tarea Habitual","siniestroFKT":"0","siniestroAltaMedica":"1","siniestroDiagnostico":"1","siniestroCirugia":"0","siniestroEstudios":"0","siniestroPeriodo":"201601","siniestroPrestadorProvincia":"Capital Federal","siniestroCanalIngreso":"DA","siniestroCaseSML":"Lsalvatierra","siniestroCaseSupervisor":"Dgonza_sup","siniestroPrestador":"Cemic","empresaCP":"1425","empresaProvincia":"0","siniestradoNacionalidad":"12","siniestradoCP":"0","siniestradoSexo":"27","siniestradoFhNacimiento":"1901-01-01","tipoPoliza":"RG","localidadPoliza":"Capital Federal"},
                    "inferredValue":"44,56"},
                    {"accident":{"id":"5","siniestroSeveridad":"Moderado","siniestroCausa":"Contacto Con Materiales Calientes O Incandescentes","siniestroParteCuerpo":"Mano (Con Excepcion De Los Dedos Solos)","siniestradoDescUltimoDX":"Quemadura Muneca Y Mano,1 Grado Sup Hasta 10%","siniestroCircunstancia":"Realizando Tarea Habitual","siniestroFKT":"0","siniestroAltaMedica":"1","siniestroDiagnostico":"1","siniestroCirugia":"0","siniestroEstudios":"0","siniestroPeriodo":"201601","siniestroPrestadorProvincia":"Santa Fe","siniestroCanalIngreso":"DE","siniestroCaseSML":"Aruiz","siniestroCaseSupervisor":"Flamma","siniestroPrestador":"Mapaci Laboral S.A.","empresaCP":"2000","empresaProvincia":"12","siniestradoNacionalidad":"0","siniestradoCP":"0","siniestradoSexo":"27","siniestradoFhNacimiento":"1901-01-01","tipoPoliza":"RG","localidadPoliza":"Rosario"},"inferredValue":"41,29"}]};
                $('[data-toggle="tooltip"]').tooltip();
                var odata=TransformarJSON(data);
                $("#rowGrid").css("visibility","visible");
                document.getElementById("loader").style.display = "none";
                ArmarTable(odata);
                ArmarPieChart(odata);
                */
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
            { data: 'siniestroPorcentajeJuicio' }
        ],columnDefs: [{
            targets: 2,
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
            targets: [4],
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
        "order":[4,'desc'],
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
        siniestroPorcentajeJuicio:""
        }
        object.id=jsonarray._accidents[index].accident.id;
        object.siniestroCausa=jsonarray._accidents[index].accident.siniestroCausa;
        object.siniestroParteCuerpo=jsonarray._accidents[index].accident.siniestroParteCuerpo;
        object.siniestroSeveridad=jsonarray._accidents[index].accident.siniestroSeveridad;
        object.siniestroPorcentajeJuicio=jsonarray._accidents[index].inferredValue;
        array.push(object);
    }
    return array;
}