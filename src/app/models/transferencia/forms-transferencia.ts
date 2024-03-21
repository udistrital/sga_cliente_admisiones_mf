export const FORM_TRANSFERENCIA_INTERNA = {
    tipo_formulario: 'mini',
    alertas: true,
    btn: 'Guardar',
    modelo: 'Inscripcion',
    campos: [
        {
            etiqueta: 'select',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'Periodo',
            label_i18n: 'periodo_preinscripcion',
            placeholder_i18n: 'placeholder_periodo_preinscripcion',
            requerido: true,
            tipo: 'Periodo',
            key: 'Nombre',
            opciones: [],
            deshabilitar: true,
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'CalendarioAcademico',
            label_i18n: 'calendario_academico',
            placeholder_i18n: 'placeholder_calendario_academico',
            requerido: true,
            tipo: 'CalendarioAcademico',
            key: 'Nombre',
            opciones: [],
            entrelazado: true,
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'TipoInscripcion',
            label_i18n: 'tipo_inscripcion',
            placeholder_i18n: 'placeholder_tipo_inscripcion',
            requerido: true,
            tipo: 'TipoInscripcion',
            key: 'Nombre',
            opciones: [],
            entrelazado: true,
            ocultar: true,
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'ProyectoCurricular',
            label_i18n: 'proyecto_curricular',
            placeholder_i18n: 'proyecto_curricular',
            requerido: true,
            tipo: 'placeholder_programa_destino',
            key: 'Nombre',
            opciones: [],
            entrelazado: true,
            ocultar: true,
        },
    ]
}

export const FORM_SOLICITUD_TRANSFERENCIA = {
    tipo_formulario: 'mini',
    alertas: true,
    titulo: "Información de solicitud",
    btn: 'Guardar',
    modelo: 'dataTransferencia',
    campos: [
        {
            etiqueta: 'input',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'UniversidadOrigen',
            label_i18n: 'universidad_origen',
            placeholder_i18n: 'placeholder_universidad_origen',
            requerido: true,
            ocultar: false,
            tipo: 'text',
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'ProgramaOrigen',
            label_i18n: 'programa_origen',
            placeholder_i18n: 'placeholder_programa_origen',
            requerido: true,
            ocultar: false,
            tipo: 'ProgramaOrigen',
            key: 'Nombre',
            opciones: [],
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'ProgramaOrigenInput',
            label_i18n: 'programa_origen',
            placeholder_i18n: 'placeholder_programa_origen',
            requerido: false,
            ocultar: true,
            tipo: 'text',
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'CodigoEstudiante',
            label_i18n: 'codigo_estudiante',
            placeholder_i18n: 'codigo_estudiante',
            tipo: 'CodigoEstudiante',
            key: 'Nombre',
            opciones: [],
            requerido: false,
            ocultar: true,
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'CodigoEstudianteExterno',
            label_i18n: 'codigo_estudiante',
            placeholder_i18n: 'codigo_estudiante',
            ocultar: true,
            requerido: false,
            tipo: 'text',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-sm-6 col-xs-6',
            nombre: 'CantidadCreditos',
            label_i18n: 'cantidad_creditos_aprobados',
            placeholder_i18n: 'placeholder_cantidad_creditos_aprobados',
            requerido: true,
            tipo: 'number',
            minimo: 0,
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-sm-6 col-xs-6',
            nombre: 'UltimoSemestre',
            label_i18n: 'ultimo_semestre',
            placeholder_i18n: 'placeholder_ultimo_semestre',
            requerido: true,
            tipo: 'number',
            minimo: 0,
        },
        {
            etiqueta: 'checkbox',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'Cancelo',
            label_i18n: 'cancelo',
            requerido: false,
            tipo: 'checkbox',
            valor: false,
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'ProgramaDestino',
            label_i18n: 'programa_destino',
            placeholder_i18n: 'placeholder_programa_destino',
            requerido: true,
            tipo: 'ProgramaDestino',
            key: 'Nombre',
            opciones: [],
            deshabilitar: true,
        },
        {
            etiqueta: 'textarea',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'MotivoCambio',
            label_i18n: 'motivo_cambio',
            placeholder_i18n: 'placeholder_motivo_cambio',
            requerido: true,
            tipo: 'MotivoCambio',
            key: 'Nombre',
            opciones: [],
        },
        {
            etiqueta: 'file',
            claseGrid: 'col-12 col-md-12',
            clase: 'form-control',
            nombre: 'SoporteDocumento',
            label_i18n: 'soportes_documentos',
            placeholder_i18n: 'placeholder_soportes_documentos',
            requerido: true,
            tipo: 'pdf',
            tipoDocumento: 62,
            formatos: 'pdf',
            url: '',
            tamanoMaximo: 2,
        },
        {
            etiqueta: 'checkbox',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'Acuerdo',
            label_i18n: 'acuerdo',
            requerido: false,
            tipo: 'checkbox',
            valor: false,
        }
    ]
}

export const FORM_RESPUESTA_SOLICITUD = {
    tipo_formulario: 'mini',
    alertas: true,
    titulo: "Respuesta de solicitud",
    btn: 'Responder',
    modelo: 'Respuesta',
    campos: [
        {
            etiqueta: 'select',
            claseGrid: 'col-sm-6 col-xs-6',
            nombre: 'EstadoId',
            label_i18n: 'respuesta_solicitud',
            placeholder_i18n: 'placeholder_respuesta_solicitud',
            requerido: true,
            entrelazado: true,
            tipo: 'RespuestaSolicitud',
            key: 'Nombre',
            opciones: [],
        },
        {
            etiqueta: 'input',
            tipo: 'datetime-local',
            claseGrid: 'col-sm-6 col-xs-6',
            nombre: 'FechaEspecifica',
            label_i18n: 'fecha_especifica',
            placeholder_i18n: 'placeholder_fecha_especifica',
            requerido: false,
            key: 'Nombre',
            opciones: [],
            deshabilitar: true,
        },
        {
            etiqueta: 'textarea',
            claseGrid: 'col-sm-12 col-xs-12',
            nombre: 'Observacion',
            label_i18n: 'comentarios',
            placeholder_i18n: 'placeholder_comentarios',
            requerido: true,
            tipo: 'MotivoCambio',
            key: 'Nombre',
        },
        {
            etiqueta: 'file',
            claseGrid: 'col-12 col-md-12',
            clase: 'form-control',
            nombre: 'SoporteRespuesta',
            label_i18n: 'soporte_respuesta',
            placeholder_i18n: 'placeholder_soporte_respuesta',
            requerido: true,
            tipo: 'pdf',
            tipoDocumento: 62,
            formatos: 'pdf',
            url: '',
            tamanoMaximo: 2,
        },
    ]
}