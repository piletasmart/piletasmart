// === BOMBA SUMERGIBLE - Pozo / Riego / Llenado de Pileta ===

// TIEMPOS DE RETARDO
const RETARDO_VALVULA = 15000;        // ⏱️ 15 segundos para ABRIR o CERRAR cada válvula
const RETARDO_MANTENIMIENTO = 15000;  // ⏱️ 15 segundos en mantenimiento

// ESTADO
let bombaSumergibleEncendida = false;
let valvulasBomba = { zona1: false, zona2: false, llenado: false, tanque: false };
let bloqueoBombaSumergible = false;
let haySinAgua = false;
let tanqueLleno = true;
let cicloMantenimientoActivo = false;

let cuentaBomba = 15;
let timerBomba;

// INICIO
actualizarEstadoTanque();

// CONTADOR
function reiniciarContadorBomba() {
    cuentaBomba = 15;
    const el = document.getElementById('contador-bomba');
    if (el) el.textContent = '15s';
    document.getElementById('contador-bomba').classList.remove('activo');
    clearInterval(timerBomba);
}

function iniciarContadorBomba() {
    reiniciarContadorBomba();
    document.getElementById('contador-bomba').classList.add('activo');
    cuentaBomba = 15;
    timerBomba = setInterval(() => {
        cuentaBomba--;
        const el = document.getElementById('contador-bomba');
        if (el) el.textContent = cuentaBomba + 's';
        if (cuentaBomba <= 0) {
            clearInterval(timerBomba);
            document.getElementById('contador-bomba').textContent = 'OK';
        }
    }, 1000);
}

// ESTADOS
function actualizarEstadoBombaSumergible() {
    const el = document.getElementById('bomba-sumergible-estado');
    if (haySinAgua) {
        el.textContent = '⚠️ SIN AGUA';
        el.className = 'valor sinagua';
    } else if (cicloMantenimientoActivo) {
        el.textContent = '🔧 MANTENIMIENTO';
        el.className = 'valor mantenimiento';
    } else {
        el.textContent = bombaSumergibleEncendida ? 'ENCENDIDA' : 'APAGADA';
        el.className = bombaSumergibleEncendida ? 'valor activo' : 'valor inactivo';
    }
}

function actualizarEstadoTanque() {
    const el = document.getElementById('tanque-estado');
    if (el) {
        el.textContent = tanqueLleno ? '✅ LLENO' : '⏳ LLENÁNDOSE';
        el.className = tanqueLleno ? 'valor activo' : 'valor esperando';
    }
}

// === CAMBIAR ESTADO DE UNA VÁLVULA ===
async function toggleValvulaBomba(nombre) {
    console.log('🔘 Tocaste:', nombre);
    if (bloqueoBombaSumergible || cicloMantenimientoActivo || haySinAgua) return;

    const btn = document.getElementById('btn-' + nombre);
    if (!btn) return;
    
    const estabaEncendida = valvulasBomba[nombre];
    const otrasAbiertas = Object.entries(valvulasBomba).some(([k, v]) => k !== nombre && v);
    
    // ⏳ Mostrar "Esperando..." en la válvula
    const estadoValvula = document.getElementById(nombre + '-estado');
    estadoValvula.textContent = '⏳ Esperando...';
    estadoValvula.className = 'valor esperando';
    
    bloqueoBombaSumergible = true;
    btn.classList.add('esperando');
    iniciarContadorBomba();
    
    if (estabaEncendida) {
        // 🔴 CERRANDO — Si es la última → APAGAR LA BOMBA AHORA MISMO
        if (!otrasAbiertas) {
            bombaSumergibleEncendida = false;
            actualizarEstadoBombaSumergible();
        }
    }
    
    // ⏱️ Esperamos los 15 segundos
    await new Promise(r => setTimeout(r, RETARDO_VALVULA));
    
    // ✅ Terminó el tiempo — actualizar estado final
    if (estabaEncendida) {
        // CERRANDO
        valvulasBomba[nombre] = false;
        estadoValvula.textContent = '🔒 CERRADA';
        estadoValvula.className = 'valor inactivo';
        btn.classList.remove('activo');
    } else {
        // ABRIENDO — primero espera, después enciende
        valvulasBomba[nombre] = true;
        estadoValvula.textContent = '✅ ABIERTA';
        estadoValvula.className = 'valor activo';
        btn.classList.add('activo');
        if (!otrasAbiertas) {
            bombaSumergibleEncendida = true;
            actualizarEstadoBombaSumergible();
        }
    }
    
    btn.classList.remove('esperando');
    bloqueoBombaSumergible = false;
}

// 🔧 MANTENIMIENTO
async function iniciarMantenimientoBomba() {
    console.log('🔧 Mantenimiento solicitado');
    if (bloqueoBombaSumergible || haySinAgua || cicloMantenimientoActivo) return;

    if (!bombaSumergibleEncendida) {
        alert('⚠️ Encendé la bomba primero para hacer el mantenimiento');
        return;
    }

    if (!confirm('🔧 Iniciar mantenimiento mensual?\n\nMoverá cada válvula para que no se trabe.')) {
        return;
    }

    cicloMantenimientoActivo = true;
    bloqueoBombaSumergible = true;
    bombaSumergibleEncendida = false;
    actualizarEstadoBombaSumergible();
    
    valvulasBomba = { zona1: false, zona2: false, llenado: false, tanque: false };
    Object.keys(valvulasBomba).forEach(clave => {
        const btn = document.getElementById('btn-' + clave);
        if (btn) btn.classList.remove('activo');
        document.getElementById(clave + '-estado').textContent = '🔒 CERRADA';
        document.getElementById(clave + '-estado').className = 'valor inactivo';
    });

    const listaValvulas = ['zona1', 'zona2', 'llenado', 'tanque'];

    for (const nombre of listaValvulas) {
        document.getElementById(nombre + '-estado').textContent = '⏳ Esperando...';
        const btn = document.getElementById('btn-' + nombre);
        if (btn) btn.classList.add('esperando');
        await new Promise(r => setTimeout(r, RETARDO_MANTENIMIENTO));
        
        valvulasBomba[nombre] = true;
        document.getElementById(nombre + '-estado').textContent = '✅ ABIERTA';
        document.getElementById(nombre + '-estado').className = 'valor activo';
        if (btn) btn.classList.remove('esperando');
        if (btn) btn.classList.add('activo');
        
        if (nombre === listaValvulas[0]) {
            bombaSumergibleEncendida = true;
            actualizarEstadoBombaSumergible();
        }
        
        await new Promise(r => setTimeout(r, RETARDO_MANTENIMIENTO));
        
        document.getElementById(nombre + '-estado').textContent = '⏳ Esperando...';
        if (btn) btn.classList.add('esperando');
        if (nombre === listaValvulas.length - 1) {
            bombaSumergibleEncendida = false;
            actualizarEstadoBombaSumergible();
        }
        await new Promise(r => setTimeout(r, RETARDO_MANTENIMIENTO));
        
        valvulasBomba[nombre] = false;
        document.getElementById(nombre + '-estado').textContent = '🔒 CERRADA';
        document.getElementById(nombre + '-estado').className = 'valor inactivo';
        if (btn) btn.classList.remove('activo', 'esperando');
    }

    cicloMantenimientoActivo = false;
    bloqueoBombaSumergible = false;
    actualizarEstadoBombaSumergible();
    alert('✅ Mantenimiento finalizado');
}

// DETENER TODO
function detenerTodoBomba() {
    if (cicloMantenimientoActivo) {
        cicloMantenimientoActivo = false;
        bloqueoBombaSumergible = false;
    }
    bombaSumergibleEncendida = false;
    actualizarEstadoBombaSumergible();
    
    Object.keys(valvulasBomba).forEach(clave => {
        valvulasBomba[clave] = false;
        const btn = document.getElementById('btn-' + clave);
        if (btn) btn.classList.remove('activo');
        document.getElementById(clave + '-estado').textContent = '🔒 CERRADA';
        document.getElementById(clave + '-estado').className = 'valor inactivo';
    });
    reiniciarContadorBomba();
}

// REINICIAR SISTEMA
function reiniciarSistema() {
    haySinAgua = false;
    const alerta = document.getElementById('alerta-sinagua');
    if (alerta) alerta.classList.remove('activa');
    actualizarEstadoBombaSumergible();
}

console.log('✅ bomba_sumergible.js cargado
