// === Pileta Smart — Control de Válvulas ===

let valvulaPiletaActiva = null;
let bombaPiletaEncendida = false;
let cambiando = false; // Evita doble clic mientras cambia
let cuentaPileta = 15;
let timerPileta;

// Quité "enjuague" de la lista
const modos = ['skimmer', 'barrefondo', 'filtrado', 'retrolavado', 'desagote', 'hidrojets'];

// === CONTADOR DE 15 SEGUNDOS EN PANTALLA ===
function reiniciarContadorPileta() {
    cuentaPileta = 15;
    const el = document.getElementById('contador-pileta');
    if (el) el.textContent = '15s';
    el.classList.remove('activo');
    clearInterval(timerPileta);
}

function iniciarContadorPileta() {
    reiniciarContadorPileta();
    const el = document.getElementById('contador-pileta');
    el.classList.add('activo');
    cuentaPileta = 15;
    timerPileta = setInterval(() => {
        cuentaPileta--;
        el.textContent = cuentaPileta + 's';
        if (cuentaPileta <= 0) {
            clearInterval(timerPileta);
            el.textContent = 'OK';
        }
    }, 1000);
}

function actualizarTodo() {
    modos.forEach(modo => {
        const el = document.getElementById('valv-' + modo);
        const btn = document.getElementById('btn-' + modo);
        if (el) {
            el.textContent = valvulaPiletaActiva === modo ? '✅ ABIERTA' : '🔒 CERRADA';
            el.className = valvulaPiletaActiva === modo ? 'valor activo' : 'valor inactivo';
        }
        if (btn) {
            valvulaPiletaActiva === modo ? btn.classList.add('activo') : btn.classList.remove('activo');
        }
    });
    const estadoBomba = document.getElementById('bomba-pileta-estado');
    if (estadoBomba) {
        estadoBomba.textContent = bombaPiletaEncendida ? '✅ ENCENDIDA' : '⏸️ APAGADA';
        estadoBomba.className = bombaPiletaEncendida ? 'valor activo' : 'valor inactivo';
    }
}

window.activarValvulaPileta = async function(modo) {
    console.log('👉 Tocado:', modo);
    
    if (cambiando) {
        console.log('⏳ Esperando, todavía está cambiando...');
        return;
    }
    
    // Si es la misma que ya está activa → la apagamos
    if (valvulaPiletaActiva === modo) {
        valvulaPiletaActiva = null;
        bombaPiletaEncendida = false;
        reiniciarContadorPileta();
        actualizarTodo();
        return;
    }
    
    cambiando = true;
    
    // PASO 1: Cerramos la válvula actual
    console.log('🔒 Cerrando:', valvulaPiletaActiva || 'ninguna');
    valvulaPiletaActiva = null;
    bombaPiletaEncendida = false;
    actualizarTodo();
    
    // PASO 2: Contamos y esperamos 15 segundos
    console.log('⏳ Esperando 15 segundos...');
    iniciarContadorPileta();
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // PASO 3: Abrimos la nueva válvula
    console.log('🔓 Abriendo:', modo);
    valvulaPiletaActiva = modo;
    bombaPiletaEncendida = true;
    actualizarTodo();
    
    cambiando = false;
    console.log('✅ Cambio completado');
};

window.detenerTodoPileta = function() {
    valvulaPiletaActiva = null;
    bombaPiletaEncendida = false;
    cambiando = false;
    reiniciarContadorPileta();
    actualizarTodo();
    console.log('⏹️ Todo detenido');
};

console.log('✅ Pileta.js cargado — Una a la vez + Contador 15s ✅');
