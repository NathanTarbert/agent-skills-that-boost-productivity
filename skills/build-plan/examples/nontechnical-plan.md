# Example — Non-technical plan, non-English (Spanish)

Request: *"Ayúdame a planear el lanzamiento de nuestro programa de embajadores."* Classified **medium**, 3 questions asked.

Shows two things at once: a plan with no code in it, and the language rule — **human page fully localized, manifest keys in English, manifest values localized.**

---

## Página 1 — Human page (parent)

# Programa de embajadores

## Objetivo
Diez personas de la comunidad hablan de nuestro producto en público cada mes, sin que nadie del equipo tenga que pedírselo.

## Por qué ahora
El crecimiento depende de una sola cuenta: la nuestra. Cuando el equipo no publica, no pasa nada. Ya hay gente que crea contenido por su cuenta y no recibe nada a cambio.

## Qué vamos a construir
Un programa de diez lugares, sin niveles. Los embajadores reciben beneficios —viajes a eventos, gastos cubiertos, merch, acceso anticipado— y no dinero. Postulación abierta, selección manual, ciclo de seis meses.

## Enfoque
**Elegido — programa plano de diez lugares con beneficios.** Simple de explicar, simple de administrar, y los beneficios cuestan menos que pagos en efectivo.

**Descartado — niveles (bronce/plata/oro).** Genera comparaciones entre embajadores y trabajo administrativo constante para decidir quién sube de nivel.

**Descartado — pago por publicación.** Convierte entusiasmo en trabajo por encargo y el contenido se nota comprado.

## Fases

| Fase | Qué es verdad cuando termina | Esfuerzo aproximado |
|---|---|---|
| 1. Definir el programa | Existe una página pública que explica beneficios, expectativas y duración | ~2 días |
| 2. Abrir postulaciones | Cualquiera puede postularse con un formulario y recibe confirmación | ~1 día |
| 3. Seleccionar | Diez personas aceptaron por escrito y saben qué se espera de ellas | ~1 semana |
| 4. Lanzar | El programa se anunció en público y los diez aparecen en la página | ~2 días |

## Riesgos y dudas
- Podemos recibir muy pocas postulaciones y quedar en evidencia → medir el número a los siete días antes de anunciar nada en público.
- El presupuesto de viajes todavía no está confirmado → confirmarlo antes de publicar la página de la fase 1, porque promete viajes.

## Terminado significa
- [ ] Diez embajadores aceptaron por escrito
- [ ] La página pública lista beneficios y expectativas
- [ ] Cada embajador sabe a quién escribir cuando necesita algo
- [ ] El anuncio público está publicado

## Preguntas abiertas
- ¿Quién aprueba los gastos de viaje? — decisión de finanzas.

---

## Página 2 — Machine page (child, al final de la página padre)

# Manifiesto de ejecución

```yaml
---
plan_id: ambassador-program-launch
plan_version: 1
source_page: https://www.notion.so/Programa-de-embajadores-def456
language: es
created: 2026-08-17
status: not_started
---
```

## T-001 · Confirmar el presupuesto de viajes

- depends_on: []
- files: []
- acceptance: finanzas confirma por escrito un monto anual para viajes y gastos
- verify: manual — pegar la confirmación en esta tarea antes de marcarla
- notes: bloquea T-002, porque la página pública promete viajes
- [ ] status

## T-002 · Escribir la página pública del programa

- depends_on: [T-001]
- files: content/embajadores.mdx
- acceptance: la página indica los diez lugares, los beneficios exactos, la duración de seis meses y que no hay pago en efectivo
- verify: manual — revisión de una persona ajena al equipo que pueda explicar el programa después de leerla
- [ ] status

## T-003 · Crear el formulario de postulación

- depends_on: [T-002]
- files: content/embajadores.mdx
- acceptance: el formulario recoge nombre, enlaces a redes, y una razón; enviarlo muestra una confirmación
- verify: manual — enviar una postulación de prueba y comprobar que llega
- [ ] status

## T-004 · Medir el volumen de postulaciones a los siete días

- depends_on: [T-003]
- files: []
- acceptance: se registra el número de postulaciones al día siete
- verify: manual — reportar el número al usuario antes de empezar T-005
- notes: si son menos de veinte, detenerse y revisar el plan antes de seleccionar
- [ ] status

## T-005 · Seleccionar y confirmar diez embajadores

- depends_on: [T-004]
- files: []
- acceptance: diez personas aceptaron por escrito y recibieron el documento de expectativas
- verify: manual — diez confirmaciones registradas
- [ ] status

## T-006 · Publicar el anuncio

- depends_on: [T-005]
- files: content/embajadores.mdx
- acceptance: el anuncio está publicado y la página lista a los diez embajadores con su nombre y enlaces
- verify: manual — abrir la página publicada y contar diez
- [ ] status
