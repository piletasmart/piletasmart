// === Pileta Smart — Control de Válvulas ===

let valvulaPiletaActiva = null;
let bombaPiletaEncendida = false;
let cambiando = false;
let cuentaPileta = 15;
let timerPileta;
let haySinAguaPileta = false;       // ⚠️ Detector de sin agua

const modos = ['skimmer', 'barrefondo', 'barrefondo-desagote', 'filtrado', 'retrolavado', 'desagote', 'hidrojets'];

// === CONTADOR DE 15 SEGUNDOS EN PANTALLA ===
function reiniciarContadorPileta() {
    cuentaPileta = 15;
    const el = document.getElementById('contador-pileta');
    if (el) el.textContent = '15s';
    if (el) el.classList.remove('activo');
    clearInterval(timerPileta);
}

function iniciarContadorPileta() {
    reiniciarContadorPileta();
    const el = document.getElementById('contador-pileta');
    if (el) el.classList.add('activo');
    cuentaPileta = 15;
    timerPileta = setInterval(() => {
        cuentaPileta--;
        if (el) el.textContent = cuentaPileta + 's';
        if (cuentaPileta <= 0) {
            clearInterval(timerPileta);
            if (el) el.textContent = 'OK';
        }
    }, 1000);
}

function actualizarEstado(modo, texto) {
    const el = document.getElementById('valv-' + modo);
    if (el) {
        el.textContent = texto;
        if (texto === '✅ ABIERTA') {
            el.className = 'valor activo';
        } else if (texto === '⏳ Abriendo...' || texto === '⏳ Cerrando...') {
            el.className = 'valor esperando';
        } else {
            el.className = 'valor inactivo';
        }
    }
}

function actualizarTodo() {
    modos.forEach(modo => {
        const el = document.getElementById('valv-' + modo);
        const btn = document.getElementById('btn-' + modo);
        if (el) {
            if (valvulaPiletaActiva === modo) {
                el.textContent = '✅ ABIERTA';
                el.className = 'valor activo';
            } else {
                el.textContent = '🔒 CERRADA';
                el.className = 'valor inactivo';
            }
        }
        if (btn) {
            valvulaPiletaActiva === modo ? btn.classList.add('activo') : btn.classList.remove('activo');
        }
    });
    
    // ⚠️ Estado de la bomba con detección de sin agua
    const estadoBomba = document.getElementById('bomba-pileta-estado');
    if (estadoBomba) {
        if (haySinAguaPileta) {
            estadoBomba.textContent = '⚠️ SIN AGUA';
            estadoBomba.className = 'valor sinagua';
        } else {
            estadoBomba.textContent = bombaPiletaEncendida ? '✅ ENCENDIDA' : '⏸️ APAGADA';
            estadoBomba.className = bombaPiletaEncendida ? 'valor activo' : 'valor inactivo';
        }
    }
}

// ⚠️ Función para activar alerta de sin agua
function activarSinAguaPileta() {
    haySinAguaPileta = true;
    bombaPiletaEncendida = false;
    valvulaPiletaActiva = null;
    actualizarTodo();
    reiniciarContadorPileta();
    // Mostrar el cartel de alerta en el HTML
    const alerta = document.getElementById('alerta-sinagua');
    if (alerta) alerta.classList.add('activa');
    console.log('⚠️ SIN AGUA — Bomba de pileta detenida');
}

// 🔄 Reiniciar sistema de pileta
function reiniciarSistemaPileta() {
    haySinAguaPileta = false;
    actualizarTodo();
    const alerta = document.getElementById('alerta-sinagua');
    if (alerta) alerta.classList.remove('activa');
    console.log('✅ Sistema de pileta reiniciado');
}

window.activarValvulaPileta = async function(modo) {
    console.log('👉 Tocado:', modo);
    
    if (cambiando) {
        console.log('⏳ Esperando, todavía está cambiando...');
        return;
    }
    
    // ⚠️ Si no hay agua, aviso pero NO bloqueo — el usuario puede reintentar
    if (haySinAguaPileta) {
        console.log('⚠️ Estado SIN AGUA — pero se permite reintentar');
    }
    
    if (valvulaPiletaActiva === modo) {
        console.log('⏹️ Apagando sistema...');
        bombaPiletaEncendida = false;
        actualizarTodo();
        actualizarEstado(modo, '⏳ Cerrando...');
        iniciarContadorPileta();
        await new Promise(resolve => setTimeout(resolve, 15000));
        actualizarEstado(modo, '🔒 CERRADA');
        valvulaPiletaActiva = null;
        reiniciarContadorPileta();
        actualizarTodo();
        console.log('✅ Sistema detenido');
        return;
    }
    
    cambiando = true;
    
    const anterior = valvulaPiletaActiva;
    if (anterior) {
        console.log('🔒 Cambiando desde:', anterior);
        bombaPiletaEncendida = false;
        actualizarTodo();
        actualizarEstado(anterior, '⏳ Cerrando...');
        iniciarContadorPileta();
        await new Promise(resolve => setTimeout(resolve, 15000));
        actualizarEstado(anterior, '🔒 CERRADA');
    }
    
    console.log('🔓 Abriendo:', modo);
    actualizarEstado(modo, '⏳ Abriendo...');
    valvulaPiletaActiva = modo;
    iniciarContadorPileta();
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('✅ Válvula lista — Encendiendo bomba');
    actualizarEstado(modo, '✅ ABIERTA');
    bombaPiletaEncendida = true;
    reiniciarContadorPileta();
    actualizarTodo();
    
    // ⚠️ Si al encender sigue sin detectar agua, el sistema externo llamará a activarSinAguaPileta()
    cambiando = false;
    console.log('✅ Cambio completado');
};

window.detenerTodoPileta = async function() {
    if (cambiando) return;
    
    cambiando = true;
    const anterior = valvulaPiletaActiva;
    
    bombaPiletaEncendida = false;
    actualizarTodo();
    
    if (anterior) {
        actualizarEstado(anterior, '⏳ Cerrando...');
        iniciarContadorPileta();
        await new Promise(resolve => setTimeout(resolve, 15000));
        actualizarEstado(anterior, '🔒 CERRADA');
    }
    
    valvulaPiletaActiva = null;
    cambiando = false;
    reiniciarContadorPileta();
    actualizarTodo();
    console.log('⏹️ Todo detenido');
};

console.log('✅ Pileta.js cargado — SIN AGUA visible, botones habilitados para reintentar ✅');
