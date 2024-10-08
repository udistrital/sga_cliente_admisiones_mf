/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: false,
  apiUrl: "http://localhost:4207/",
  NUXEO_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8199/v1',
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

  TERCEROS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8121/v1/',
  DOCUMENTO_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8094/v1/',
  CORE_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8105/v1/',
  EVENTO_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8107/v1/',
  OIKOS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8087/v2/',
  PROYECTO_ACADEMICO_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8116/v1/',
  SGA_ADMISIONES_MID: 'http://pruebasapi3.intranetoas.udistrital.edu.co:8547/v1/',
  SGA_CALENDARIO_MID: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8545/v1/',
  SGA_INSCRIPCION_MID_SERVICE: 'http://pruebasapi3.intranetoas.udistrital.edu.co:8543/v1/',
  INSCRIPCION_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8208/v1/',
  EXPERIENCIA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/experiencia_laboral_crud/v1/',
  IDIOMA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/idiomas_crud/v2/',
  ENTE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/ente_crud/v1/',
  ORGANIZACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/organizacion_crud/v1/',
  DESCUENTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/matriculas_descuentos_crud/v2/',
  PAGO_SERVICE: 'http://prueba.campusvirtual.udistrital.edu.co/pagos/',
  RECIBO_SERVICE: 'http://api.planestic.udistrital.edu.co:9017/v1/',
  // CIDC_SERVICE: 'http://200.69.103.88:3114/api/v1/',
  CIDC_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/siciud_crud/v1/',
  // EVALUACION_INSCRIPCION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/evaluacion_inscripcion_crud/v2/',
  // EVALUACION_INSCRIPCION_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8118/v2/',
  EVALUACION_INSCRIPCION_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8118/v1/',
  // EVALUACION_INSCRIPCION_SERVICE: 'http://localhost:8080/v1/',
  // PARAMETROS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8510/v1/',
  PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/',
  PSE_SERVICE: 'https://pruebasfuncionarios.portaloas.udistrital.edu.co/botonPago/index.php?',
  GOOGLE_MID_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8514/v1/',
  ESPACIOS_ACADEMICOS_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8530/',
  //ESPACIOS_ACADEMICOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/espacios_academicos_crud/v1/',
  PLAN_TRABAJO_DOCENTE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_trabajo_docente_crud/v1/',
  PLAN_ESTUDIOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planes_estudios_crud/v1/',
  LIQUIDACION_SERVICE: 'http://localhost:8080/v1/',
  //PLAN_ESTUDIOS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8537/v1/',
  //PLAN_ESTUDIOS_SERVICE: 'http://localhost:8925/v1/',


  // SGA_TERCERO_MID_SERVICE: 'http://localhost:8096/v1/',
  SGA_TERCERO_MID_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8123/v1/',
  NOTIFICACION_MID: 'http://pruebasapi.intranetoas.udistrital.edu.co:8527/v1/',
  CALENDARIO_MID_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/calendario_mid/v1/",
  SGA_PROYECTO_CURRICULAR_MID: "http://pruebasapi2.intranetoas.udistrital.edu.co:8540/v1/",
  SGA_CRUD_PARAMETRO: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8094/v1/',
  SOLICITUDES_ADMISIONES: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8117/v1/',
  PLANES_ESTUDIOS_CRUD: "http://pruebasapi.intranetoas.udistrital.edu.co:8537/v1/",

};
