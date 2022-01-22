const { app, BrowserWindow, ipcMain } = require("electron");
const Fs = require('fs');
const ip = require("ip");
const {getFileProperties} = require('get-file-properties');
const api = require('./services/api');


let mainWindow = null;

app.on("ready", () => {
    console.log("Menu initiated");
    mainWindow = new BrowserWindow({
      width: 700,
      height: 500,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      autoHideMenuBar: true,
    });
    mainWindow.hide();

});



async function getProgramas(){
  return api.get('/infra/programas');
}


async function postProgramasDetalhes(dispositivo, data, versao, caminho, id_programa, IP){
  return api.post('/infra/programasDetalhes', {
      nome_estacao: dispositivo,
      data_criacao: data,
      versao: versao,
      caminho: caminho,
      id_programa: id_programa,
      ip: IP,
  })

}


function createdDate (file) {  
  let { birthtime } = Fs.statSync(file)

  let tmp = JSON.stringify(birthtime);

  hora = tmp[12] + tmp[13];

  hora = parseInt(hora);

  hora -= 3;
  if((hora) < 0){
      hora += 24;
  }
  horaStr = hora.toString();
  if(hora < 10) horaStr = '0' + horaStr;

  let arrayFinal = [0];
  let j = 0;

  for(let i = 1; i < tmp.length - 6; i++){
      arrayFinal[j] = tmp[i];
      j++;
  }
  arrayFinal[11] = horaStr[0];
  arrayFinal[12] = horaStr[1];
  arrayFinal = arrayFinal.join('');


  return arrayFinal;
}

async function demo() {
  const {data: vetor} = await getProgramas();


  const promises = [];
  for(let programa of vetor){
    let array = [];
    for(let i = 0; i < programa.caminho.length; i++){
        array[i] = programa.caminho[i];
        if(array[i] == '/')array[i] = '\\';
    }
    let result = array.join('');
    result = /[^/]*$/.exec(result)[0];


    //
    try{
      let metadata = await getFileProperties(result)

      console.log('encontrou', result);


      array = [];
      for(let i = 0; i < metadata.Name.length; i++){
          array[i] = metadata.Name[i];
          if(array[i] == '\\')array[i] = '/';
      }
  
      result = array.join('');
      result = /[^/]*$/.exec(result)[0];
  
  
      
      let dispositivo = metadata.CSName;
      let data = createdDate(metadata.Name);
      let versao = metadata.Version;
      let caminho = metadata.Name;
      let id_programa = programa.id;
      let IP = ip.address();
      
      array = [];
      for(let i = 0; i < caminho.length; i++){
        array[i] = caminho[i];
        if(array[i] == '\\') array[i] = '/';
      }
      caminho = array.join('');
  
  
      promises.push(postProgramasDetalhes(dispositivo, data, versao, caminho, id_programa, IP));
      
      

    }catch(err){

      console.log('nao encontrou', result);

      continue;
    }
    //

    
  }
  await Promise.all(promises);
  app.quit();
  //mainWindow.close();
  //app.close();
  //let w = remote.getCurrentWindow();
  //w.close();

}
demo();