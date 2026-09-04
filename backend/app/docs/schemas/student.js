/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del estudiante
 *         name:
 *           type: string
 *           description: Nombre del estudiante
 *         lastName:
 *           type: string
 *           description: Apellido del estudiante
 *         document:
 *           type: integer
 *           description: Número de documento del estudiante
 *         email:
 *           type: string
 *           format: email
 *           description: Email del estudiante
 *         phoneNumber:
 *           type: string
 *           description: Número de teléfono
 *         cellPhoneNumber:
 *           type: string
 *           description: Número de celular
 *         contact:
 *           type: string
 *           description: Persona de contacto
 *         image:
 *           type: string
 *           description: URL o ruta de la imagen del estudiante
 *         alias:
 *           type: string
 *           description: Alias del estudiante
 *         address:
 *           type: string
 *           description: Dirección
 *         occupation:
 *           type: string
 *           description: Ocupación
 *         coverage:
 *           type: string
 *           description: Cobertura de salud
 *         country:
 *           type: string
 *           description: País
 *         province:
 *           type: string
 *           description: Provincia
 *         neighborhood:
 *           type: string
 *           description: Barrio
 *         ivaCondition:
 *           type: string
 *           enum: [CONSUMIDOR_FINAL, MONOTRIBUTO, RESPONSABLE_INSCRIPTO]
 *           description: Condición ante el IVA
 *         cuit:
 *           type: string
 *           description: CUIT del estudiante
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - lastName
 *         - email
 *     StudentCreateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         lastName:
 *           type: string
 *         document:
 *           type: integer
 *         email:
 *           type: string
 *           format: email
 *         phoneNumber:
 *           type: string
 *         cellPhoneNumber:
 *           type: string
 *         contact:
 *           type: string
 *         alias:
 *           type: string
 *         address:
 *           type: string
 *         occupation:
 *           type: string
 *         coverage:
 *           type: string
 *         country:
 *           type: string
 *         province:
 *           type: string
 *         neighborhood:
 *           type: string
 *         ivaCondition:
 *           type: string
 *           enum: [CONSUMIDOR_FINAL, MONOTRIBUTO, RESPONSABLE_INSCRIPTO]
 *         cuit:
 *           type: string
 *       required:
 *         - name
 *         - lastName
 *         - email
 *     StudentUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         lastName:
 *           type: string
 *         document:
 *           type: integer
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         cellPhoneNumber:
 *           type: string
 *         contact:
 *           type: string
 *         alias:
 *           type: string
 *         address:
 *           type: string
 *         occupation:
 *           type: string
 *         coverage:
 *           type: string
 *         country:
 *           type: string
 *         province:
 *           type: string
 *         neighborhood:
 *           type: string
 *         ivaCondition:
 *           type: string
 *         cuit:
 *           type: string
 */
