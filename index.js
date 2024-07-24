async function monos_test(mono_num, capital, numTrades, rr, riesgoPrincipal, riesgoGanancias) {
    // mousewheel or two-finger scroll zooms the plot

    let mono = {
        x: ['2020-10-04', '2021-11-04', '2023-12-04'],
        y: [90, 40, 60],
        type: 'scatter',
        name: "Mono "+mono_num
    };

    // Función para generar una fecha futura basada en una fecha inicial
    // function generarFecha(fechaInicial) {
    //     let fecha = new Date(fechaInicial);
    //     fecha.setDate(fecha.getDate() + 1); // Añade un día a la fecha inicial
    //     return fecha.toISOString().split('T')[0]; // Formatea la fecha como YYYY-MM-DD
    // }

    // Fecha inicial basada en tu último dato
    //let fechaFinalActual = '2023-12-04';
    //let fechaInicialGenerar = new Date(fechaFinalActual);
    let vueltas = numTrades;

    // Genera las fechas para X
    // let fechasX = [];
    // for (let i = 0; i < vueltas; i++) { // Genera 101 fechas para incluir la fecha final actual
    //     fechasX.push(generarFecha(fechaInicialGenerar));
    //     fechaInicialGenerar.setDate(fechaInicialGenerar.getDate() + 1); // Avanza la fecha inicial
    // }


    // Función para generar un número aleatorio entre min y max
    function generarNumeroAleatorio(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Genera los datos numéricos para Y
    let datosY = [capital];
    let trades = [0];
    let porcentaje_riesgo = riesgoPrincipal;
    let porcentaje_riesgo_ganancias = riesgoGanancias;
    let riesgo = datosY[0] * porcentaje_riesgo;

    for (let i = 0; i < vueltas; i++) {

        if(datosY[i] > datosY[0]){
            if(datosY[i] > datosY[i-1]){
                riesgo += ((datosY[i] - datosY[i-1]) * porcentaje_riesgo_ganancias);
            }else{
                riesgo = datosY[0] * porcentaje_riesgo;
            }
        }else{
            riesgo = datosY[0] * porcentaje_riesgo;
        }

        trades.push(i+1)
        let result = generarNumeroAleatorio(0, 1)

        if (result === 1) { // Asegúrate de comparar con === para evitar errores de tipo
            datosY.push(datosY[datosY.length - 1] + (riesgo * rr)); // Corrección aquí
        } else {
            datosY.push(datosY[datosY.length - 1] - riesgo); // Y aquí
        }
        // Simplemente multiplica el índice por 10 para obtener una serie de números crecientes
    }

    // Actualiza la traza con las nuevas fechas y datos
    mono.x = trades;
    mono.y = datosY;
    let WinRate = 0;
    let ddh = 0;
    let minimoCapital = datosY[0];
    for(let i=1; i < datosY.length-1; i++){
        if(datosY[i] > datosY[i-1]){
            WinRate += 1;
        }

        if(datosY[i] < minimoCapital){
            minimoCapital = datosY[i];
        }
    }

    ddh = ((datosY[0] - minimoCapital) / datosY[0]) * 100;
    let crecimientoPorcentual = (((datosY[datosY.length-1] - datosY[0]) / datosY[0]) * 100);

    crecimientoPorcentual = crecimientoPorcentual.toFixed(2);
    ddh = ddh.toFixed(2);
    WinRate = ((WinRate / (datosY.length - 1)) * 100)

    //console.log(`Mono ${mono_num}(trace ${mono_num-1}) tiene un total de wins de ${WinRate.toFixed(2)}% y ha finalizado con un capital de ${datosY[datosY.length-1].toFixed(2)}( ${crecimientoPorcentual}% ) con un DDH de -${ddh}%`);
    
    let datosFinales = {
        data: mono,
        nombre: `Mono ${mono_num}`,
        winRate: WinRate.toFixed(2)+"%",
        capital: datosY[datosY.length-1].toFixed(2),
        return: crecimientoPorcentual+"%",
        ddh_ci: "-"+ddh+"%"
    }
    
    return datosFinales;
}

async function testMonos(totalMonos, capital, numTrades, rr, riesgoPrincipal, riesgoGanancias){
    var monos = [];
    var monosDatos = []

    for (let i = 0; i < totalMonos; i++) {
        let datoMono = await monos_test(i+1, capital, numTrades, rr, riesgoPrincipal, riesgoGanancias)
        monos.push(datoMono.data);
        monosDatos.push(datoMono)
    }

    var layout = {
        title: 'Test de los monos',
        showlegend: false
    };
    
    Plotly.newPlot('myDiv', monos, layout, { scrollZoom: true });

    console.clear();
    console.table(monosDatos)
}

var btn = document.getElementById("btn");

btn.addEventListener("click", () => {
    btn.setAttribute('disabled', "true");
    let monos = 10;
    let capital = 1000;
    let trades = 100;
    let ratio = 1.5;
    let riesgoPrincipal = 0.01;
    let riesgoGanancias = 0.1;

    testMonos(monos, capital, trades, ratio, riesgoPrincipal, riesgoGanancias);
    btn.removeAttribute('disabled');
});
