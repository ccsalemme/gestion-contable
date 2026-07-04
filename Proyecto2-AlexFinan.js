/**
 * =============================================================================
 * GOOGLE APPS SCRIPT - PLATAFORMA DE GESTIÓN CONTABLE
 * =============================================================================
 * 
 * NUEVA ESTRUCTURA FORM_INPUT (11 columnas A-K):
 * -----------------------------------------------
 * A: Timestamp (YYYY-MM-DD HH:mm:ss)
 * B: TipoOperacion ("Compra", "Venta", "Compra (Vinculada)", "Venta (Vinculada)")
 * C: Moneda ("USD", "ARS")
 * D: Monto (número)
 * E: Contraparte (Proveedor si compra, Cliente si venta)
 * F: Costo (número decimal, ej: 1.015)
 * G: Motivo ("Cable", "USDT", "Liquidación", "Otro")
 * H: EstadoTransaccion ("Completada", "En Proceso", "Cancelada", "Sin Estado")
 * I: UsaSaldoActual ("Sí", "No", "N/A")
 * J: CasoEspecial (boolean: true/false)
 * K: Estado ("Pendiente", "Procesado", "Error")
 * 
 * LÓGICA DE PROCESAMIENTO:
 * -------------------------
 * 1. Si Motivo = "Liquidación":
 *    → Escribir en TABLA DE LIQUIDACIONES (columnas J-M, 1 fila)
 *    → J: Monto, K: Vendedor, L: Comprador, M: "Liquidación"
 *    → Aplicar color según EstadoTransaccion
 * 
 * 2. Si Motivo ≠ "Liquidación":
 *    → Escribir en TABLA PRINCIPAL (columnas A-G, 2 filas/bloque)
 *    
 *    a) Si TipoOperacion es "Compra (Vinculada)" o "Venta (Vinculada)":
 *       - Buscar fila pareja (mismo timestamp, tipo complementario)
 *       - Combinar ambas en 1 solo bloque:
 *         Fila 1: [Cliente, '', '', '', '', '', '']
 *         Fila 2: [Monto, '', Monto*CostoCompra, Monto*CostoVenta, '', Proveedor, Motivo]
 *       - Marcar ambas filas como "Procesado"
 *    
 *    b) Si es "Solo Compra":
 *       - Fila 1: [Proveedor, '', '', '', '', '', '']
 *       - Fila 2: [Monto, '', Monto*CostoCompra, '', '', '', Motivo]
 *    
 *    c) Si es "Solo Venta":
 *       - Fila 1: [Cliente, '', '', '', '', '', '']
 *       - Fila 2: [Monto, '', '', Monto*CostoVenta, '', '', Motivo]
 * 
 * COLORES:
 * --------
 * - Verde (#00ff00): EstadoTransaccion = "Completada"
 * - Naranja (#ff9900): Otros estados (En Proceso, Cancelada)
 * - Amarillo (#ffff00): CasoEspecial = true (tiene prioridad sobre los demás)
 * - Sin color: EstadoTransaccion = "Sin Estado" o vacío
 * 
 * TRIGGERS:
 * ---------
 * - onOpen(): Crear menú personalizado
 * - onEdit(): Detectar ediciones manuales en FORM_INPUT
 * - onChange(): Detectar cambios estructurales (agregar/eliminar filas)
 * - doPost(): Webhook HTTP para procesar formularios desde backend externo
 * 
 * =============================================================================
 */

const SALDOS_SPREADSHEET_ID = "10uL1t_0emHLAmGUugw4ucwtKBN0TEKCQyfP_iBc3AZk";
const SALDOS_DIA_SHEET_NAME = "Saldos al dia";

function onOpen(e) {
  PropertiesService.getDocumentProperties().deleteAllProperties();
  
  // Crear menú personalizado
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Formularios')
      .addItem('Procesar formularios pendientes', 'procesarFormulariosPendientes')
      .addToUi();
}

function agregarClienteAlertado(cliente) {
  const props = PropertiesService.getDocumentProperties();
  const clientesAlertados = JSON.parse(props.getProperty("CLIENTES_ALERTADOS") || "[]");
  if (!clientesAlertados.includes(cliente)) {
    clientesAlertados.push(cliente);
    props.setProperty("CLIENTES_ALERTADOS", JSON.stringify(clientesAlertados));
  }
}

function yaFueAlertado(cliente) {
  const props = PropertiesService.getDocumentProperties();
  const clientesAlertados = JSON.parse(props.getProperty("CLIENTES_ALERTADOS") || "[]");
  return clientesAlertados.includes(cliente);
}

function ejecutarHoy() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const hoy = Utilities.formatDate(
    new Date(),
    ss.getSpreadsheetTimeZone(),
    "dd/MM"
  );

  Logger.log("Ejecutando cálculo para hoja: " + hoy);

  recalcularSaldos(hoy);
}

function onEdit(e) {

  try {

    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    Logger.log("Edición detectada en hoja: " + sheetName);

    // Detectar si es la hoja de formularios (edición manual)
    if (sheetName === "FORM_INPUT") {
      Logger.log("Edición manual en FORM_INPUT detectada. Procesando formulario...");
      procesarFormulario(e);
      return;
    }

    // Procesamiento existente para hojas de fecha
    if (!/^\d{2}\/\d{2}$/.test(sheetName)) {
      Logger.log("La hoja no corresponde a un día. Script detenido.");
      return;
    }

    recalcularSaldos(sheetName);

  } catch (error) {
    Logger.log("ERROR onEdit: " + error);
  }
}

/**
 * Trigger para cuando cambia la estructura de la hoja (agregar/eliminar filas)
 * Este trigger SÍ funciona cuando se agregan filas programáticamente
 * (no requiere Google Forms vinculado)
 */
function onChange(e) {
  try {
    Logger.log("Cambio detectado en la hoja. Tipo: " + (e ? e.changeType : "desconocido"));
    
    // Procesar formularios pendientes cada vez que se detecta un cambio
    // Esto captura filas agregadas por cualquier método
    procesarFormulariosPendientesAutomatico();
    
  } catch (error) {
    Logger.log("ERROR onChange: " + error);
  }
}

/**
 * Procesa todas las filas pendientes en FORM_INPUT
 * Útil para procesar formularios que se agregaron pero no se procesaron
 */
function procesarFormulariosPendientes() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("FORM_INPUT");
    
    if (!sheet) {
      Logger.log("ERROR: No se encontró la hoja FORM_INPUT");
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log("No hay datos en FORM_INPUT");
      return;
    }
    
    // Leer todas las filas de datos (ahora 11 columnas A-K)
    const range = sheet.getRange(2, 1, lastRow - 1, 11);
    const values = range.getValues();
    
    let procesados = 0;
    
    for (let i = 0; i < values.length; i++) {
      const row = i + 2; // +2 porque empezamos desde la fila 2
      const estado = values[i][10]; // Columna K (Estado)
      
      if (estado === "Pendiente") {
        Logger.log("Procesando fila pendiente: " + row);
        
        // Crear un objeto de evento simulado para procesarFormulario
        const fakeEvent = {
          source: ss,
          range: sheet.getRange(row, 1)
        };
        
        procesarFormulario(fakeEvent);
        procesados++;
      }
    }
    
    Logger.log("Procesados " + procesados + " formularios pendientes");
    SpreadsheetApp.getUi().alert("Procesados " + procesados + " formularios pendientes");
    
  } catch (error) {
    Logger.log("ERROR procesarFormulariosPendientes: " + error);
  }
}

/**
 * Versión automática de procesarFormulariosPendientes (sin alertas UI)
 * Se usa desde triggers automáticos como onChange
 */
function procesarFormulariosPendientesAutomatico() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("FORM_INPUT");
    
    if (!sheet) {
      Logger.log("ERROR: No se encontró la hoja FORM_INPUT");
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log("No hay datos en FORM_INPUT");
      return;
    }
    
    Logger.log("Buscando filas pendientes en FORM_INPUT...");
    
    // Leer todas las filas de datos (ahora 11 columnas A-K)
    const range = sheet.getRange(2, 1, lastRow - 1, 11);
    const values = range.getValues();
    
    let procesados = 0;
    
    for (let i = 0; i < values.length; i++) {
      const row = i + 2;
      const estado = values[i][10]; // Columna K (Estado)
      
      if (estado === "Pendiente") {
        Logger.log("==== Procesando fila pendiente: " + row + " ====");
        
        try {
          // Extraer datos de la fila
          const timestamp = values[i][0];        // Columna A
          const tipoOperacion = values[i][1];    // Columna B
          const moneda = values[i][2];           // Columna C
          const monto = values[i][3];            // Columna D
          const contraparte = values[i][4];      // Columna E
          const costo = values[i][5];            // Columna F
          const motivo = values[i][6];           // Columna G
          const estadoTransaccion = values[i][7]; // Columna H
          const usaSaldoActual = values[i][8];   // Columna I
          const casoEspecial = values[i][9];     // Columna J
          
          Logger.log("Datos: tipo=" + tipoOperacion + ", monto=" + monto + ", motivo=" + motivo);
          
          // Validar datos requeridos
          if (!timestamp || !monto || !contraparte) {
            Logger.log("ERROR: Faltan datos requeridos en la fila " + row);
            continue;
          }
          
          // Convertir timestamp a formato dd/MM
          const fecha = new Date(timestamp);
          const dia = Utilities.formatDate(fecha, ss.getSpreadsheetTimeZone(), "dd/MM");
          
          Logger.log("Fecha calculada: " + dia);
          
          // Crear hoja si no existe
          crearHojaSiNoExiste(ss, dia);
          
          // Determinar si es liquidación
          if (motivo === "Liquidación") {
            Logger.log("Es liquidación - escribiendo en tabla J-M");
            escribirLiquidacion(ss, dia, row, sheet, tipoOperacion, monto, contraparte, estadoTransaccion, casoEspecial, timestamp);
          } else {
            // Verificar si es operación vinculada
            if (tipoOperacion === "Compra (Vinculada)" || tipoOperacion === "Venta (Vinculada)") {
              Logger.log("Es operación vinculada - buscando pareja...");
              procesarOperacionVinculada(ss, sheet, dia, row, timestamp, tipoOperacion, monto, contraparte, costo, motivo, estadoTransaccion, casoEspecial);
            } else {
              Logger.log("Es operación simple - escribiendo en tabla A-G");
              escribirOperacionSimple(ss, dia, tipoOperacion, monto, contraparte, costo, motivo, estadoTransaccion, casoEspecial);
              // Actualizar estado a "Procesado"
              sheet.getRange(row, 11).setValue("Procesado");
            }
          }
          
          procesados++;
          Logger.log("Fila " + row + " procesada exitosamente");
          
        } catch (error) {
          Logger.log("ERROR procesando fila " + row + ": " + error);
        }
      }
    }
    
    Logger.log("==== RESUMEN: Procesados " + procesados + " formularios ====");
    
  } catch (error) {
    Logger.log("ERROR procesarFormulariosPendientesAutomatico: " + error);
  }
}


function procesarTablaAG(data, colores, saldosMap, filterFunction, clientesNoEnCCAgus, clientesEncontrados, ignorarColores, saldosBaseFallback, clientesFiltrados, clientesProcesados) {

  let clienteActual = null;

  for (let i = 1; i < data.length; i++) {

    const valorA = data[i][0];
    const montoC = data[i][2];
    const montoD = data[i][3];
    const clienteF = data[i][5];
    const reason = data[i][6];

    // Obtener color de columna A
    const colorA = normalizarColor(colores[i][0]);
    const colorF = normalizarColor(colores[i][5]);

    // Ignorar fila si color A es cian (#00ffff)
    if (colorA === "#00ffff") {
      clienteActual = null;
      continue;
    }

    let esFilaCliente = false;

    // ---- detectar cliente receptor (solo texto) ----
    if (typeof valorA === "string" && valorA.trim() !== "") {
      clienteActual = normalizar(valorA);
      esFilaCliente = true;
    }

    // ---- fin de bloque ----
    if (valorA === "") {
      clienteActual = null;
    }

    // ---- sumar al cliente receptor (solo en filas de transacción) ----
    if (!esFilaCliente && clienteActual && montoC) {

      // Verificar si es cliente amarillo especial
      const esClienteActualEspecial = colorA === "#ffff00";

      if (!esClienteActualEspecial) {
        if (filterFunction && !filterFunction(clienteActual)) {
          // Cliente filtrado por filterFunction (ej: no es wallet/usdt)
          if (clientesFiltrados) {
            clientesFiltrados.push(clienteActual + " (suma)");
          }
        } else {

          if (!saldosMap.hasOwnProperty(clienteActual) && saldosBaseFallback && saldosBaseFallback.hasOwnProperty(clienteActual)) {
            saldosMap[clienteActual] = saldosBaseFallback[clienteActual];
          }

          if (saldosMap.hasOwnProperty(clienteActual)) {
            if (clientesProcesados) {
              clientesProcesados.add(clienteActual);
            }
            saldosMap[clienteActual] += Number(montoC);
            clientesEncontrados.add(clienteActual);

          } else {

            clientesNoEnCCAgus.add(clienteActual);
          }
        }
      }
    }

    // ---- restar al cliente que envía ----
    if (clienteF && montoD) {

      const clienteEnv = normalizar(clienteF);

      // Verificar si es cliente amarillo especial
      const esClienteEnvEspecial = colorF === "#ffff00";

      if (!esClienteEnvEspecial) {
        if (filterFunction && !filterFunction(clienteEnv)) {
          // Cliente filtrado por filterFunction
          if (clientesFiltrados) {
            clientesFiltrados.push(clienteEnv + " (resta)");
          }
        } else {

          if (!saldosMap.hasOwnProperty(clienteEnv) && saldosBaseFallback && saldosBaseFallback.hasOwnProperty(clienteEnv)) {
            saldosMap[clienteEnv] = saldosBaseFallback[clienteEnv];
          }

          if (saldosMap.hasOwnProperty(clienteEnv)) {
            if (clientesProcesados) {
              clientesProcesados.add(clienteEnv);
            }
            saldosMap[clienteEnv] -= Math.abs(Number(montoD));
            clientesEncontrados.add(clienteEnv);

          } else {

            clientesNoEnCCAgus.add(clienteEnv);
          }
        }
      }
    }

  }
}


function procesarTablaIK(data, colores, saldosMap, filterFunction, clientesNoEnCCAgus, clientesEncontrados, ignorarColores, saldosBaseFallback, clientesFiltrados, clientesProcesados) {

  for (let i = 1; i < data.length; i++) {

    const monto = data[i][9];
    const envia = data[i][10];
    const recibe = data[i][11];
    const reason = data[i][12];

    // Obtener color de columna J
    const colorI = normalizarColor(colores[i][9]);
    const colorJ = normalizarColor(colores[i][10]);
    const colorK = normalizarColor(colores[i][11]);

    if (!monto) continue;

    // Ignorar fila si color J es cian (#00ffff)
    if (colorI === "#00ffff") {
      continue;
    }

    const montoNum = Number(monto);

    if (envia) {

      const clienteEnv = normalizar(envia);

      // Verificar si es cliente amarillo especial
      const esClienteEnvEspecial = colorJ === "#ffff00";

      if (!esClienteEnvEspecial) {
        if (filterFunction && !filterFunction(clienteEnv)) {
          // Cliente filtrado por filterFunction
          if (clientesFiltrados) {
            clientesFiltrados.push(clienteEnv + " (envía)");
          }
        } else {

          if (!saldosMap.hasOwnProperty(clienteEnv) && saldosBaseFallback && saldosBaseFallback.hasOwnProperty(clienteEnv)) {
            saldosMap[clienteEnv] = saldosBaseFallback[clienteEnv];
          }

          if (saldosMap.hasOwnProperty(clienteEnv)) {
            if (clientesProcesados) {
              clientesProcesados.add(clienteEnv);
            }
            saldosMap[clienteEnv] -= montoNum;
            clientesEncontrados.add(clienteEnv);

          } else {

            clientesNoEnCCAgus.add(clienteEnv);
          }
        }
      }
    }

    if (recibe) {

      const clienteRec = normalizar(recibe);

      // Verificar si es cliente amarillo especial
      const esClienteRecEspecial = colorK === "#ffff00";

      if (!esClienteRecEspecial) {
        if (filterFunction && !filterFunction(clienteRec)) {
          // Cliente filtrado por filterFunction
          if (clientesFiltrados) {
            clientesFiltrados.push(clienteRec + " (recibe)");
          }
        } else {

          if (!saldosMap.hasOwnProperty(clienteRec) && saldosBaseFallback && saldosBaseFallback.hasOwnProperty(clienteRec)) {
            saldosMap[clienteRec] = saldosBaseFallback[clienteRec];
          }

          if (saldosMap.hasOwnProperty(clienteRec)) {
            if (clientesProcesados) {
              clientesProcesados.add(clienteRec);
            }
            saldosMap[clienteRec] += montoNum;
            clientesEncontrados.add(clienteRec);

          } else {

            clientesNoEnCCAgus.add(clienteRec);
          }
        }
      }
    }
  }
}


function calcularSaldoConsolidado(data, colores, saldosBase) {

  const saldosConsolidados = {};
  const dummyNoEnCC = new Set();
  const dummyEncontrados = new Set();
  const clientesFiltrados = [];
  const clientesProcesados = new Set();

  procesarTablaAG(data, colores, saldosConsolidados, esClienteConsolidado, dummyNoEnCC, dummyEncontrados, true, saldosBase, clientesFiltrados, clientesProcesados);
  procesarTablaIK(data, colores, saldosConsolidados, esClienteConsolidado, dummyNoEnCC, dummyEncontrados, true, saldosBase, clientesFiltrados, clientesProcesados);

  let total = 0;
  const debugItems = [];
  const saldosOriginales = [];

  for (const cliente in saldosConsolidados) {
    const valor = saldosConsolidados[cliente];
    total += valor;
    debugItems.push(valor + " (" + cliente + ")");
  }

  // Obtener saldos originales de los clientes procesados
  for (const cliente of clientesProcesados) {
    const saldoOriginal = saldosBase.hasOwnProperty(cliente) ? saldosBase[cliente] : 0;
    saldosOriginales.push(saldoOriginal + " (" + cliente + ")");
  }

  return {
    total: total,
    debug: debugItems.join(", "),
    saldosOriginales: saldosOriginales.join(", ")
  };
}


function recalcularSaldos(sheetName) {

  Logger.log("Inicio recalcularSaldos para hoja: " + sheetName);

  try {

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const sheetDia = ss.getSheetByName(sheetName);
    const sheetSaldosDia = ss.getSheetByName(SALDOS_DIA_SHEET_NAME);

    if (!sheetDia) {
      Logger.log("ERROR: No se encontró hoja del día");
      return;
    }

    if (!sheetSaldosDia) {
      Logger.log("ERROR: No se encontró hoja 'saldos al día'");
      return;
    }

    const saldosBase = obtenerSaldosBase();

    const clientesNoEnCCAgus = new Set();
    const clientesEncontrados = new Set();

    const data = sheetDia.getDataRange().getValues();
    const colores = sheetDia.getDataRange().getBackgrounds();
    const formulas = sheetDia.getDataRange().getFormulas();

    // ===== PROCESAR FILAS ROJAS ESPECIALES (solo tabla A-G) =====
    const resultadoFilasRojas = procesarFilasRojasEspeciales(data, colores, formulas);
    sheetSaldosDia.getRange("A9").setValue(resultadoFilasRojas);

    // ===== CALCULAR SALDO CONSOLIDADO WALLET/USDT =====
    const saldoConsolidado = calcularSaldoConsolidado(data, colores, saldosBase);
    sheetSaldosDia.getRange("C9").setValue(saldoConsolidado.total);
    sheetSaldosDia.getRange("C10").setValue(saldoConsolidado.debug);
    sheetSaldosDia.getRange("C11").setValue(saldoConsolidado.saldosOriginales);

    // ===== TABLA A-G =====
    procesarTablaAG(data, colores, saldosBase, null, clientesNoEnCCAgus, clientesEncontrados, false, null, null, null);

    // ===== TABLA I-K =====
    procesarTablaIK(data, colores, saldosBase, null, clientesNoEnCCAgus, clientesEncontrados, false, null, null, null);

        actualizarHojaSaldos(sheetSaldosDia, saldosBase);
        
        // Registrar timestamp de última ejecución
        const ahora = new Date();
        const timestamp = Utilities.formatDate(ahora, ss.getSpreadsheetTimeZone(), "dd/MM/yyyy HH:mm:ss");
        sheetSaldosDia.getRange("A12").setValue(timestamp);

        // Identificar clientes en "Saldos al día" que no fueron procesados
        const clientesSaldosDia = sheetSaldosDia
          .getRange(1, 1, 1, sheetSaldosDia.getLastColumn())
          .getValues()[0]
          .filter(c => c)
          .map(c => normalizar(c));

        const clientesEnDiaNoEnSaldos = Array.from(clientesEncontrados).filter(
          cliente => !clientesSaldosDia.includes(normalizar(cliente))
        );

        // Filtrar solo clientes que no fueron alertados antes
        const clientesEnDiaNewAlert = clientesEnDiaNoEnSaldos.filter(cliente => {
          if (!yaFueAlertado(cliente)) {
            agregarClienteAlertado(cliente);
            return true;
          }
          return false;
        });

        const clientesNoEnCCAgusNewAlert = Array.from(clientesNoEnCCAgus).filter(cliente => {
          if (!yaFueAlertado(cliente)) {
            agregarClienteAlertado(cliente);
            return true;
          }
          return false;
        });

        let mensaje = "";

        if (clientesEnDiaNewAlert.length > 0) {
          mensaje += "⚠️ Clientes en hoja del día pero NO en 'Saldos al día':\n" +
            clientesEnDiaNewAlert.join("\n");
        }

        if (clientesNoEnCCAgusNewAlert.length > 0) {
          if (mensaje) mensaje += "\n\n";
          mensaje += "⚠️ Clientes no encontrados en CC Agus:\n" +
            clientesNoEnCCAgusNewAlert.join("\n");
        }

        if (mensaje) {
          SpreadsheetApp.getUi().alert(mensaje);
        }

      } catch (error) {

        Logger.log("ERROR recalcularSaldos: " + error);

      }
    }



function obtenerSaldosBase() {

  const ssSaldos = SpreadsheetApp.openById(SALDOS_SPREADSHEET_ID);

  const sheets = ssSaldos.getSheets();
  const sheet = sheets[1]; // Segunda tab del archivo complementario

  if (!sheet) {
    throw new Error("No se encontró la segunda hoja del archivo complementario");
  }

  const clientes = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const montos = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];

  const mapa = {};

  for (let i = 0; i < clientes.length; i++) {

    if (!clientes[i]) break;

    const clave = normalizar(clientes[i]);

    mapa[clave] = Number(montos[i]) || 0;
  }

  return mapa;
}



function actualizarHojaSaldos(sheet, saldosBase) {

  const clientesFila = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  for (let i = 0; i < clientesFila.length; i++) {

    const nombre = clientesFila[i];

    if (!nombre) break;

    const clave = normalizar(nombre);

    if (saldosBase.hasOwnProperty(clave)) {

      const saldo = saldosBase[clave];

      sheet.getRange(2, i + 1).setValue(saldo);
    }
  }
}



function procesarFilasRojasEspeciales(data, colores, formulas) {
  let resultado = 0;

  for (let i = 1; i < data.length; i++) {
    const colorA = normalizarColor(colores[i][0]);
    
    // Solo procesar filas rojas
    if (colorA !== "#ff0000") continue;

    const valorC = data[i][2];
    const valorD = data[i][3];
    const formulaC = formulas[i][2];
    const formulaD = formulas[i][3];

    // Verificar que solo una tenga valor (no ambas, no ninguna)
    const soloC = valorC && !valorD;
    const soloD = valorD && !valorC;

    if (!soloC && !soloD) continue;

    // Determinar qué fórmula usar
    const formulaActual = soloC ? formulaC : formulaD;
    
    // Extraer operador numérico
    const operador = extraerOperador(formulaActual);
    
    // Si el operador es menor a 2, ignorar
    if (operador < 2) continue;

    // Obtener el valor de columna A en la misma fila
    const valorA = data[i][0];
    
    // Solo procesar si es un número
    if (typeof valorA !== "number") continue;

    // Aplicar operación según columna
    if (soloC) {
      resultado -= valorA; // C tiene valor -> restar
    } else if (soloD) {
      resultado += valorA; // D tiene valor -> sumar
    }
    
  }

  return resultado;
}



function extraerOperador(formula) {
  if (!formula || formula === "") return 0;
  
  // Buscar patrones de multiplicación o división
  // Ejemplos: "A10/1400", "A5*0.98", "=A10/1400"
  
  // Pattern para división: buscar el número después de /
  const patternDiv = /\/(\d+\.?\d*)/;
  const matchDiv = formula.match(patternDiv);
  
  if (matchDiv) {
    return parseFloat(matchDiv[1]);
  }
  
  // Pattern para multiplicación: buscar el número después de *
  const patternMult = /\*(\d+\.?\d*)/;
  const matchMult = formula.match(patternMult);
  
  if (matchMult) {
    return parseFloat(matchMult[1]);
  }
  
  return 0;
}


// ========================================
// FUNCIONES PARA PROCESAR FORMULARIOS
// ========================================

/**
 * Procesa una nueva solicitud del formulario FORM_INPUT
 * Lee la fila editada y la escribe en la hoja de fecha correspondiente
 * 
 * Nueva estructura FORM_INPUT (11 columnas A-K):
 * A: Timestamp
 * B: TipoOperacion (Compra, Venta, Compra (Vinculada), Venta (Vinculada))
 * C: Moneda (USD, ARS)
 * D: Monto
 * E: Contraparte (Proveedor si compra, Cliente si venta)
 * F: Costo
 * G: Motivo (Cable, USDT, Liquidación, Otro)
 * H: EstadoTransaccion (Completada, En Proceso, Cancelada, Sin Estado)
 * I: UsaSaldoActual (Sí, No, N/A)
 * J: CasoEspecial (boolean)
 * K: Estado (Pendiente, Procesado, Error)
 */
function procesarFormulario(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const ss = e.source;
    const row = e.range.getRow();
    
    Logger.log("Procesando fila: " + row);
    
    // Solo procesar si es fila de datos (no encabezado)
    if (row <= 1) {
      Logger.log("Es fila de encabezado, ignorando.");
      return;
    }
    
    // Leer datos de la fila editada (11 columnas A-K)
    const range = sheet.getRange(row, 1, 1, 11);
    const values = range.getValues()[0];
    
    const timestamp = values[0];        // Columna A
    const tipoOperacion = values[1];    // Columna B
    const moneda = values[2];           // Columna C
    const monto = values[3];            // Columna D
    const contraparte = values[4];      // Columna E
    const costo = values[5];            // Columna F
    const motivo = values[6];           // Columna G
    const estadoTransaccion = values[7]; // Columna H
    const usaSaldoActual = values[8];   // Columna I
    const casoEspecial = values[9];     // Columna J
    const estado = values[10];          // Columna K
    
    Logger.log("Datos: tipo=" + tipoOperacion + ", monto=" + monto + ", contraparte=" + contraparte + ", motivo=" + motivo + ", estado=" + estado);
    
    // Verificar que el estado sea "Pendiente"
    if (estado !== "Pendiente") {
      Logger.log("La fila ya fue procesada (estado: " + estado + "). Ignorando.");
      return;
    }
    
    // Validar datos requeridos
    if (!timestamp || !monto || !contraparte) {
      Logger.log("ERROR: Faltan datos requeridos en la fila " + row);
      return;
    }
    
    // Convertir timestamp a formato dd/MM
    const fecha = new Date(timestamp);
    const dia = Utilities.formatDate(fecha, ss.getSpreadsheetTimeZone(), "dd/MM");
    
    Logger.log("Fecha calculada: " + dia);
    
    // Crear hoja si no existe
    crearHojaSiNoExiste(ss, dia);
    
    // Determinar si es liquidación
    if (motivo === "Liquidación") {
      Logger.log("Es liquidación - escribiendo en tabla J-M");
      escribirLiquidacion(ss, dia, row, sheet, tipoOperacion, monto, contraparte, estadoTransaccion, casoEspecial, timestamp);
    } else {
      // Verificar si es operación vinculada
      if (tipoOperacion === "Compra (Vinculada)" || tipoOperacion === "Venta (Vinculada)") {
        Logger.log("Es operación vinculada - buscando pareja...");
        procesarOperacionVinculada(ss, sheet, dia, row, timestamp, tipoOperacion, monto, contraparte, costo, motivo, estadoTransaccion, casoEspecial);
      } else {
        Logger.log("Es operación simple - escribiendo en tabla A-G");
        escribirOperacionSimple(ss, dia, tipoOperacion, monto, contraparte, costo, motivo, estadoTransaccion, casoEspecial);
        // Actualizar estado a "Procesado"
        sheet.getRange(row, 11).setValue("Procesado");
      }
    }
    
    Logger.log("Formulario procesado exitosamente.");
    
  } catch (error) {
    Logger.log("ERROR procesarFormulario: " + error);
  }
}

/**
 * Procesa un formulario cuando se envía a través de Google Forms
 * El evento onFormSubmit tiene una estructura diferente a onEdit
 * NOTA: Esta función mantiene compatibilidad con el antiguo formato si existe
 */
function procesarFormularioSubmit(e) {
  try {
    const sheet = e.range.getSheet();
    const ss = sheet.getParent();
    const row = e.range.getRow();
    
    Logger.log("Procesando formulario enviado en fila: " + row);
    
    // Delegar al procesarFormulario regular
    const fakeEvent = {
      source: ss,
      range: sheet.getRange(row, 1)
    };
    
    procesarFormulario(fakeEvent);
    
  } catch (error) {
    Logger.log("ERROR procesarFormularioSubmit: " + error);
  }
}

/**
 * Crea una hoja de fecha (dd/MM) si no existe
 * Si la crea, agrega encabezados en la fila 1
 */
function crearHojaSiNoExiste(ss, nombreHoja) {
  let hoja = ss.getSheetByName(nombreHoja);
  
  if (!hoja) {
    Logger.log("La hoja '" + nombreHoja + "' no existe. Creándola...");
    hoja = ss.insertSheet(nombreHoja);
    
    // Agregar encabezados en la fila 1
    hoja.getRange(1, 3).setValue("Nos deben (+)");      // C1
    hoja.getRange(1, 4).setValue("Le debemos (-)");     // D1
    hoja.getRange(1, 7).setValue("Motivo");             // G1
    hoja.getRange(1, 10).setValue("Liquidaciones");     // J1
    hoja.getRange(1, 11).setValue("De parte de");       // K1
    hoja.getRange(1, 12).setValue("A");                 // L1
    
    // Aplicar colores a los encabezados
    hoja.getRange(1, 3).setBackground("#00ff00");   // C1: Verde
    hoja.getRange(1, 4).setBackground("#ff0000");   // D1: Rojo
    hoja.getRange(1, 7).setBackground("#00ffff");   // G1: Cyan
    hoja.getRange(1, 10).setBackground("#00ff00");  // J1: Verde
    hoja.getRange(1, 11).setBackground("#00ff00");  // K1: Verde
    hoja.getRange(1, 12).setBackground("#00ff00");  // L1: Verde
    
    Logger.log("Hoja '" + nombreHoja + "' creada con encabezados y colores.");
  } else {
    Logger.log("La hoja '" + nombreHoja + "' ya existe.");
  }
  
  return hoja;
}

/**
 * Escribe una transacción del formulario en la hoja de fecha correspondiente
 * Formato:
 *   Fila N:   [Receptor, '', '', '', '', '', '']
 *   Fila N+1: [Monto, '', '', '', '', Emisor, Motivo]
 */
function escribirEnHojaDia(ss, nombreHoja, receptor, monto, emisor, motivo, casoEspecial) {
  try {
    const hoja = ss.getSheetByName(nombreHoja);
    
    if (!hoja) {
      Logger.log("ERROR: No se pudo obtener la hoja '" + nombreHoja + "'");
      return;
    }
    
    // Encontrar la última fila con datos
    let ultimaFila = hoja.getLastRow();
    
    // Si la hoja tiene solo encabezados (fila 1), empezar en fila 3
    if (ultimaFila === 0 || ultimaFila === 1) {
      ultimaFila = 3;
    } else {
      // Agregar después de la última fila, dejando una fila en blanco
      ultimaFila += 2;
    }
    
    Logger.log("Escribiendo en hoja '" + nombreHoja + "' desde fila " + ultimaFila + " (con fila en blanco antes)");
    
    // Preparar el motivo (agregar # si es caso especial)
    let motivoFinal = motivo || '';
    if (casoEspecial === true || casoEspecial === "TRUE" || casoEspecial === "true") {
      motivoFinal = motivoFinal + "#";
      Logger.log("Caso especial detectado. Motivo con #: " + motivoFinal);
    }
    
    // Fila 1: Nombre del receptor
    const fila1 = [receptor, '', '', '', '', '', ''];
    hoja.getRange(ultimaFila, 1, 1, 7).setValues([fila1]);
    
    // Fila 2: Monto, '', '', '', '', Emisor, Motivo
    const fila2 = [monto, '', '', '', '', emisor, motivoFinal];
    hoja.getRange(ultimaFila + 1, 1, 1, 7).setValues([fila2]);
    
    Logger.log("Datos escritos: Fila " + ultimaFila + ": [" + receptor + ", ...]");
    Logger.log("                Fila " + (ultimaFila + 1) + ": [" + monto + ", '', '', '', '', " + emisor + ", " + motivoFinal + "]");
    
    // Si es caso especial, aplicar color amarillo
    if (casoEspecial === true || casoEspecial === "TRUE" || casoEspecial === "true") {
      Logger.log("Aplicando color amarillo a las celdas A (filas " + ultimaFila + " y " + (ultimaFila + 1) + ") y F (fila " + (ultimaFila + 1) + ")");
      
      // Aplicar color amarillo (#ffff00) a columna A de ambas filas
      hoja.getRange(ultimaFila, 1).setBackground("#ffff00");
      hoja.getRange(ultimaFila + 1, 1).setBackground("#ffff00");
      
      // Aplicar color amarillo a columna F (columna 6) de la fila del monto
      hoja.getRange(ultimaFila + 1, 6).setBackground("#ffff00");
      
      Logger.log("Colores aplicados para caso especial.");
    }
    
    Logger.log("Transacción escrita exitosamente en hoja '" + nombreHoja + "'");
    
  } catch (error) {
    Logger.log("ERROR escribirEnHojaDia: " + error);
  }
}


/**
 * Escribe una liquidación en la tabla de la derecha (columnas J-M)
 * Formato de 1 sola fila: [Monto, De parte de (vendedor), A (comprador), Liquidación]
 */
function escribirLiquidacion(ss, nombreHoja, rowFormInput, sheetFormInput, tipoOperacion, monto, contraparte, estadoTransaccion, casoEspecial, timestamp) {
  try {
    const hoja = ss.getSheetByName(nombreHoja);
    
    if (!hoja) {
      Logger.log("ERROR: No se pudo obtener la hoja '" + nombreHoja + "'");
      return;
    }
    
    // Encontrar la primera fila disponible SOLO en columnas J-M
    let ultimaFila = 3; // Empezar desde fila 3 (después de encabezados)
    const maxRow = hoja.getMaxRows();
    
    // Buscar la primera fila vacía en columna J (col 10)
    for (let i = 3; i <= maxRow; i++) {
      const valorJ = hoja.getRange(i, 10).getValue();
      if (!valorJ || valorJ === '') {
        ultimaFila = i;
        break;
      }
    }
    
    Logger.log("Escribiendo liquidación en fila " + ultimaFila + ", columnas J-M (primera disponible en tabla J-M)");
    
    // Determinar vendedor y comprador según el tipo de operación
    let vendedor = '';
    let comprador = '';
    
    if (tipoOperacion === "Compra" || tipoOperacion === "Compra (Vinculada)") {
      // Si es compra, nosotros compramos a un proveedor
      // Vendedor = Proveedor (contraparte), Comprador = nosotros (implícito)
      vendedor = contraparte;
      comprador = ''; // Se puede dejar vacío o poner un nombre específico
    } else if (tipoOperacion === "Venta" || tipoOperacion === "Venta (Vinculada)") {
      // Si es venta, nosotros vendemos a un cliente
      // Vendedor = nosotros (implícito), Comprador = Cliente (contraparte)
      vendedor = '';
      comprador = contraparte;
    }
    
    // Si es vinculada, necesitamos buscar la otra fila para obtener ambas partes
    if (tipoOperacion === "Compra (Vinculada)" || tipoOperacion === "Venta (Vinculada)") {
      const pareja = buscarFilaPareja(sheetFormInput, rowFormInput, timestamp, tipoOperacion);
      if (pareja) {
        // Leer datos de la fila pareja
        const rangePareja = sheetFormInput.getRange(pareja.row, 1, 1, 11);
        const valuesPareja = rangePareja.getValues()[0];
        const contrapartePareja = valuesPareja[4]; // Columna E
        
        if (tipoOperacion === "Compra (Vinculada)") {
          // Esta es compra, la pareja es venta
          comprador = contrapartePareja; // Cliente de la venta
        } else {
          // Esta es venta, la pareja es compra
          vendedor = contrapartePareja; // Proveedor de la compra
        }
      }
    }
    
    // Preparar motivo con # si es caso especial
    let motivoFinal = "Liquidación";
    if (casoEspecial === true || casoEspecial === "TRUE" || casoEspecial === "true") {
      motivoFinal = "Liquidación#";
    }
    
    // Escribir en columnas J (col 10), K (col 11), L (col 12), M (col 13)
    hoja.getRange(ultimaFila, 10).setValue(monto);         // J: Monto
    hoja.getRange(ultimaFila, 11).setValue(vendedor);      // K: De parte de (vendedor)
    hoja.getRange(ultimaFila, 12).setValue(comprador);     // L: A (comprador)
    hoja.getRange(ultimaFila, 13).setValue(motivoFinal);   // M: Liquidación
    
    Logger.log("Liquidación escrita: Monto=" + monto + ", Vendedor=" + vendedor + ", Comprador=" + comprador);
    
    // Aplicar colores según estado (solo columnas J-L)
    const rangoLiquidacion = hoja.getRange(ultimaFila, 10, 1, 3); // J-L
    aplicarColorEstado(rangoLiquidacion, estadoTransaccion, casoEspecial);
    
    // Actualizar estado a "Procesado"
    sheetFormInput.getRange(rowFormInput, 11).setValue("Procesado");
    
    // Si es vinculada, también actualizar la pareja
    if (tipoOperacion === "Compra (Vinculada)" || tipoOperacion === "Venta (Vinculada)") {
      const pareja = buscarFilaPareja(sheetFormInput, rowFormInput, timestamp, tipoOperacion);
      if (pareja) {
        sheetFormInput.getRange(pareja.row, 11).setValue("Procesado");
      }
    }
    
    // Recalcular saldos automáticamente después de escribir la liquidación
    Logger.log("Recalculando saldos para la hoja: " + nombreHoja);
    recalcularSaldos(nombreHoja);
    
  } catch (error) {
    Logger.log("ERROR escribirLiquidacion: " + error);
  }
}


/**
 * Procesa una operación vinculada (Compra y Venta juntas)
 * Busca la fila pareja y las combina en un solo bloque
 */
function procesarOperacionVinculada(ss, sheetFormInput, nombreHoja, row, timestamp, tipoOperacion, monto, contraparte, costo, motivo, estadoTransaccion, casoEspecial) {
  try {
    // Buscar la fila pareja
    const pareja = buscarFilaPareja(sheetFormInput, row, timestamp, tipoOperacion);
    
    if (!pareja) {
      Logger.log("ADVERTENCIA: No se encontró la fila pareja para la operación vinculada. Procesando como operación simple.");
      escribirOperacionSimple(ss, nombreHoja, tipoOperacion, monto, contraparte, costo, motivo, estadoTransaccion, casoEspecial);
      sheetFormInput.getRange(row, 11).setValue("Procesado");
      return;
    }
    
    Logger.log("Fila pareja encontrada en fila " + pareja.row);
    
    // Leer datos de la fila pareja
    const rangePareja = sheetFormInput.getRange(pareja.row, 1, 1, 11);
    const valuesPareja = rangePareja.getValues()[0];
    
    const montoPareja = valuesPareja[3];        // Columna D
    const contrapartePareja = valuesPareja[4];  // Columna E
    const costoPareja = valuesPareja[5];        // Columna F
    
    // Determinar quién es comprador y quién es vendedor
    let nombreComprador = '';
    let nombreVendedor = '';
    let costoCompra = '';
    let costoVenta = '';
    let montoFinal = monto; // Por defecto usar el monto de esta fila
    
    if (tipoOperacion === "Compra (Vinculada)") {
      // Esta fila es compra, la pareja es venta
      nombreVendedor = contraparte;        // Proveedor (de quien compramos)
      nombreComprador = contrapartePareja; // Cliente (a quien vendemos)
      costoCompra = costo;
      costoVenta = costoPareja;
    } else {
      // Esta fila es venta, la pareja es compra
      nombreComprador = contraparte;       // Cliente (a quien vendemos)
      nombreVendedor = contrapartePareja;  // Proveedor (de quien compramos)
      costoVenta = costo;
      costoCompra = costoPareja;
    }
    
    Logger.log("Operación vinculada: Comprador=" + nombreComprador + ", Vendedor=" + nombreVendedor);
    
    // Escribir el bloque completo
    escribirBloqueEnHojaDia(ss, nombreHoja, nombreComprador, nombreVendedor, montoFinal, costoCompra, costoVenta, motivo, estadoTransaccion, casoEspecial);
    
    // Actualizar estado de ambas filas a "Procesado"
    sheetFormInput.getRange(row, 11).setValue("Procesado");
    sheetFormInput.getRange(pareja.row, 11).setValue("Procesado");
    
    Logger.log("Operación vinculada procesada exitosamente");
    
  } catch (error) {
    Logger.log("ERROR procesarOperacionVinculada: " + error);
  }
}


/**
 * Busca la fila pareja de una operación vinculada
 * Retorna {row: número de fila} o null si no se encuentra
 */
function buscarFilaPareja(sheet, rowActual, timestamp, tipoOperacionActual) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return null;
    
    // Determinar el tipo de operación pareja
    let tipoPareja = '';
    if (tipoOperacionActual === "Compra (Vinculada)") {
      tipoPareja = "Venta (Vinculada)";
    } else if (tipoOperacionActual === "Venta (Vinculada)") {
      tipoPareja = "Compra (Vinculada)";
    } else {
      return null; // No es vinculada
    }
    
    // Buscar en todas las filas
    const range = sheet.getRange(2, 1, lastRow - 1, 11);
    const values = range.getValues();
    
    for (let i = 0; i < values.length; i++) {
      const rowNum = i + 2;
      if (rowNum === rowActual) continue; // Saltar la fila actual
      
      const timestampFila = values[i][0]; // Columna A
      const tipoOperacionFila = values[i][1]; // Columna B
      
      // Comparar timestamps (mismo timestamp = operaciones vinculadas)
      const fechaActual = new Date(timestamp);
      const fechaFila = new Date(timestampFila);
      
      if (fechaActual.getTime() === fechaFila.getTime() && tipoOperacionFila === tipoPareja) {
        Logger.log("Fila pareja encontrada: fila " + rowNum + " con tipo " + tipoPareja);
        return { row: rowNum };
      }
    }
    
    Logger.log("No se encontró fila pareja para la fila " + rowActual);
    return null;
    
  } catch (error) {
    Logger.log("ERROR buscarFilaPareja: " + error);
    return null;
  }
}


/**
 * Escribe una operación simple (Solo Compra o Solo Venta) en la tabla principal
 */
function escribirOperacionSimple(ss, nombreHoja, tipoOperacion, monto, contraparte, costo, motivo, estadoTransaccion, casoEspecial) {
  try {
    let nombreComprador = '';
    let nombreVendedor = '';
    let costoCompra = '';
    let costoVenta = '';
    
    if (tipoOperacion === "Compra") {
      // Solo compra: el comprador es implícito (nosotros), vendedor es el proveedor
      nombreVendedor = contraparte; // Proveedor
      costoCompra = costo;
    } else if (tipoOperacion === "Venta") {
      // Solo venta: el vendedor es implícito (nosotros), comprador es el cliente
      nombreComprador = contraparte; // Cliente
      costoVenta = costo;
    }
    
    Logger.log("Operación simple: tipo=" + tipoOperacion + ", comprador=" + nombreComprador + ", vendedor=" + nombreVendedor);
    
    escribirBloqueEnHojaDia(ss, nombreHoja, nombreComprador, nombreVendedor, monto, costoCompra, costoVenta, motivo, estadoTransaccion, casoEspecial);
    
  } catch (error) {
    Logger.log("ERROR escribirOperacionSimple: " + error);
  }
}


/**
 * Escribe un bloque de transacción en la hoja del día (tabla principal A-G)
 * Formato de 2 filas:
 *   Fila 1: [Comprador, '', '', '', '', '', '']
 *   Fila 2: [Monto, '', Monto*CostoCompra, Monto*CostoVenta, '', Vendedor, Motivo]
 */
function escribirBloqueEnHojaDia(ss, nombreHoja, nombreComprador, nombreVendedor, monto, costoCompra, costoVenta, motivo, estadoTransaccion, casoEspecial) {
  try {
    const hoja = ss.getSheetByName(nombreHoja);
    
    if (!hoja) {
      Logger.log("ERROR: No se pudo obtener la hoja '" + nombreHoja + "'");
      return;
    }
    
    // Encontrar la última fila con datos
    let ultimaFila = hoja.getLastRow();
    
    // Si la hoja tiene solo encabezados (fila 1), empezar en fila 3
    if (ultimaFila === 0 || ultimaFila === 1) {
      ultimaFila = 3;
    } else {
      // Agregar después de la última fila, dejando una fila en blanco
      ultimaFila += 2;
    }
    
    Logger.log("Escribiendo bloque en hoja '" + nombreHoja + "' desde fila " + ultimaFila);
    
    // Preparar el motivo (agregar # si es caso especial)
    let motivoFinal = motivo || '';
    if (casoEspecial === true || casoEspecial === "TRUE" || casoEspecial === "true") {
      motivoFinal = motivoFinal + "#";
      Logger.log("Caso especial detectado. Motivo con #: " + motivoFinal);
    }
    
    // Fila 1: [Comprador, '', '', '', '', '', '']
    const fila1 = [nombreComprador || '', '', '', '', '', '', ''];
    hoja.getRange(ultimaFila, 1, 1, 7).setValues([fila1]);
    
    // Calcular monto con costo aplicado (monto * costo)
    const montoConCostoCompra = costoCompra ? monto * costoCompra : '';
    const montoConCostoVenta = costoVenta ? monto * costoVenta : '';
    
    // Fila 2: [Monto, '', Monto*CostoCompra, Monto*CostoVenta, '', Vendedor, Motivo]
    const fila2 = [monto, '', montoConCostoCompra, montoConCostoVenta, '', nombreVendedor || '', motivoFinal];
    hoja.getRange(ultimaFila + 1, 1, 1, 7).setValues([fila2]);
    
    Logger.log("Bloque escrito: Fila " + ultimaFila + ": [" + nombreComprador + "]");
    Logger.log("               Fila " + (ultimaFila + 1) + ": [" + monto + ", '', " + montoConCostoCompra + ", " + montoConCostoVenta + ", '', " + nombreVendedor + ", " + motivoFinal + "]");
    
    // Aplicar colores según estado (columnas A-F, 2 filas - SIN columna G)
    const rangoBloque = hoja.getRange(ultimaFila, 1, 2, 6); // A-F, 2 filas (sin G)
    aplicarColorEstado(rangoBloque, estadoTransaccion, casoEspecial);
    
    Logger.log("Bloque escrito exitosamente en hoja '" + nombreHoja + "'");
    
    // Recalcular saldos automáticamente después de escribir el bloque
    Logger.log("Recalculando saldos para la hoja: " + nombreHoja);
    recalcularSaldos(nombreHoja);
    
  } catch (error) {
    Logger.log("ERROR escribirBloqueEnHojaDia: " + error);
  }
}


/**
 * Aplica colores al rango según el estado de transacción y caso especial
 * - Verde (#00ff00) si estado es "Completada"
 * - Naranja (#ff9900) para otros estados
 * - Amarillo (#ffff00) si es caso especial (tiene prioridad)
 */
function aplicarColorEstado(rango, estadoTransaccion, casoEspecial) {
  try {
    // Si es caso especial, aplicar amarillo y terminar
    if (casoEspecial === true || casoEspecial === "TRUE" || casoEspecial === "true") {
      Logger.log("Aplicando color amarillo (caso especial)");
      rango.setBackground("#ffff00");
      return;
    }
    
    // Aplicar color según estado
    if (estadoTransaccion === "Completada") {
      Logger.log("Aplicando color verde (completada)");
      rango.setBackground("#00ff00"); // Verde
    } else if (estadoTransaccion && estadoTransaccion !== "Sin Estado") {
      Logger.log("Aplicando color naranja (" + estadoTransaccion + ")");
      rango.setBackground("#ff9900"); // Naranja
    }
    // Si es "Sin Estado" o vacío, no aplicar color
    
  } catch (error) {
    Logger.log("ERROR aplicarColorEstado: " + error);
  }
}


// ========================================
// WEB APP ENDPOINT PARA FORMULARIO EXTERNO
// ========================================

/**
 * Endpoint HTTP POST para recibir notificaciones del formulario externo
 * Cuando el formulario externo agrega una fila a FORM_INPUT mediante la API,
 * debe llamar a esta función para procesar inmediatamente
 * 
 * URL: Se obtiene al publicar este script como Web App
 * Método: POST
 * Body: JSON con { trigger: "formSubmitted" }
 */
function doPost(e) {
  try {
    Logger.log("Web App llamado - Iniciando procesamiento de formularios pendientes");
    
    // Procesar todos los formularios pendientes
    procesarFormulariosPendientesAutomatico();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Formularios procesados correctamente'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("ERROR en doPost: " + error);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint HTTP GET para verificar que el Web App está funcionando
 * Útil para testing
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Web App funcionando correctamente',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}


// ========================================
// FUNCIONES AUXILIARES
// ========================================

function normalizar(nombre) {
  return nombre.toString().trim().toLowerCase();
}



function esClienteConsolidado(nombreCliente) {
  const clienteNorm = normalizar(nombreCliente);
  return clienteNorm === "wallet" || clienteNorm.includes("usdt");
}



function normalizarColor(color) {
  // Google Sheets puede devolver colores en diferentes formatos
  // Esta función los normaliza a formato hexadecimal minúscula
  if (!color) return "";

  color = color.toString().toLowerCase().trim();

  // Si ya es hexadecimal, devolverlo
  if (color.startsWith("#")) {
    return color;
  }

  // Si no tiene #, agregarlo
  if (color.match(/^[0-9a-f]{6}$/)) {
    return "#" + color;
  }

  return color;
}