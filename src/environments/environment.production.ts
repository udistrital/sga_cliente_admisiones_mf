/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
    production: false,
    apiUrl:'https://sgaadmisiones.portaloas.udistrital.edu.co/',
    NUXEO_SERVICE:'https://autenticacion.portaloas.udistrital.edu.co/apioas/gestor_documental_mid/v1/',
    TOKEN: {
      AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
      CLIENTE_ID: 'e36v1MPQk2jbz9KM4SmKhk8Cyw0a',
      RESPONSE_TYPE: 'id_token token',
      SCOPE: 'openid email role documento',
      REDIRECT_URL: 'http://localhost:4200/',
      SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
      SIGN_OUT_REDIRECT_URL: 'http://localhost:4200/',
      AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
    },
  
    TERCEROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
    DOCUMENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/documento_crud/v2/',
    CORE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/core_crud/v2/',
    EVENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/sesiones_crud/v2/',
    OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v2/',
    PROYECTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/proyecto_academico_crud/v1/',
    SGA_ADMISIONES_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/admisiones_mid/v1/',
    SGA_CALENDARIO_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/calendario_mid/v1/',
    SGA_INSCRIPCION_MID_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/inscripcion_mid/v1/',
    INSCRIPCION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/inscripcion_crud/v2/',
    IDIOMA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/idiomas_crud/v2/',
    DESCUENTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/matriculas_descuentos_crud/v2/',
    CIDC_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/siciud_crud/v1/',
    EVALUACION_INSCRIPCION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/evaluacion_inscripcion_crud/v2/',
    PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/',
    LIQUIDACION_SERVICE: 'http://localhost:8080/v1/',
    NOTIFICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/notificacion_mid/v1/',
    CALENDARIO_MID_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/calendario_mid/v1/',
    SOLICITUDES_ADMISIONES:'https://autenticacion.portaloas.udistrital.edu.co/apioas/solicitudes_crud/v1/',
    SGA_TERCERO_MID_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_mid/v1/',
    PLANES_ESTUDIOS_CRUD: "https://autenticacion.portaloas.udistrital.edu.co/apioas/planes_estudios_crud/v1/",
  };
  
