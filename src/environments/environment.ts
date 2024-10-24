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
  IDIOMA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/idiomas_crud/v2/',
  DESCUENTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/matriculas_descuentos_crud/v2/',
  CIDC_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/siciud_crud/v1/',
  EVALUACION_INSCRIPCION_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8118/v1/',
  PARAMETROS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8510/v1/',
  LIQUIDACION_SERVICE: 'http://localhost:8080/v1/',
  SGA_TERCERO_MID_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8123/v1/',
  NOTIFICACION_MID: 'http://pruebasapi.intranetoas.udistrital.edu.co:8527/v1/',
  CALENDARIO_MID_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/calendario_mid/v1/",
  SOLICITUDES_ADMISIONES: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8117/v1/',
  PLANES_ESTUDIOS_CRUD: "http://pruebasapi.intranetoas.udistrital.edu.co:8537/v1/",
  SOLICITUDES_ADMINISTRACION:'http://pruebasapi2.intranetoas.udistrital.edu.co:8117/v1/',
};
