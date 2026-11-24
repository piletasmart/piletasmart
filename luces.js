// === CONTROL DE LUCES — Exterior, Pileta, Jardín y Quincho ===

// TIEMPOS DE RETARDO
const RETARDO_LUCES = 3000;   // 3 segundos antes de poder prender la misma luz otra vez

// ESTADO
let luces = { exterior: false, pileta: false, jardin: false, quincho: false };
let bloqueoLuz = { exterior: false, pileta: false, jardin: false, quincho: false };

let cuentaLuces = 3;
let timerLuces;

// === CONTADOR EN PANTALLA ===
function reiniciarContadorLuces() {
    cuentaLuces = 3;
    document.getElementById('contador-luces').textContent = '3s';
    document.getElementById('contador-luces').classList.remove('activo');
    clearInterval(timerLuces);
}

function iniciarContadorLuces() {
    reiniciarContadorLuces();
    document.getElementById('contador-luces').classList.add('activo');
    cuentaLuces = 3;
    timerLuces = setInterval(() => {
        cuentaLuces--;
        document.getElementById('contador-luces').textContent = cuentaLuces + 's';
        if (cuentaLuces <= 0) {
            clearInterval(timerLuces);
            document.getElementById('contador-luces').textContent = 'OK';
        }
    }, 1000);
}

// === CAMBIAR ESTADO DE UNA LUZ ===
async function toggleLuz(nombre) {
    if (bloqueoLuz[nombre]) return;

    const btn = document.getElementById('btn-luz-' + nombre);
    const elEstado = document.getElementById('luz-' + nombre);
    
    // Aplicamos retardo al apagar y volver a prender la misma luz
    if (luces[nombre]) {
        // APAGAR
        luces[nombre] = false;
        elEstado.textContent = '⏸️ APAGADA';
        elEstado.className = 'valor inactivo';
        btn.classList.remove('activo');
        
        // Bloqueamos por 3 segundos antes de poder prender de nuevo
        bloqueoLuz[nombre] = true;
        iniciarContadorLuces();
        await new Promise(r => setTimeout(r, RETARDO_LUCES));
        bloqueoLuz[nombre] = false;
    } else {
        // PRENDER
        luces[nombre] = true;
        elEstado.textContent = '✅ ENCENDIDA';
        elEstado.className = 'valor activo';
        btn.classList.add('activo');
    }
}

// === APAGAR TODAS LAS LUCES ===
function apagarTodoLuces() {
    Object.keys(luces).forEach(clave => {
        luces[clave] = false;
        document.getElementById('luz-' + clave).textContent = '⏸️ APAGADA';
        document.getElementById('luz-' + clave).className = 'valor inactivo';
        document.getElementById('btn-luz-' + clave).classList.remove('activo');
        bloqueoLuz[clave] = false;
    });
    reiniciarContadorLuces();
}
