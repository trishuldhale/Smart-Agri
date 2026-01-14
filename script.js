firebase.initializeApp({
  apiKey: "AIzaSyCqKzWRm0pdRexlmXaO3A8yY-OG8BgVb04",
  databaseURL: "https://smartmotor-370eb-default-rtdb.firebaseio.com"
});

const db = firebase.database();

/* ELEMENTS */
const soilEl = soil;
const tempEl = temp;
const humEl = hum;
const waterEl = water;
const pumpToggle = pumpToggleEl = document.getElementById("pumpToggle");
const switchToggle = document.getElementById("switchToggle");
const pumpStatus = document.getElementById("pumpStatus");
const switchStatus = document.getElementById("switchStatus");
const threshold = document.getElementById("threshold");
const thVal = document.getElementById("thVal");
const checkWater = document.getElementById("checkWater");
const alertText = document.getElementById("alertText");

/* CHART */
const chart = new Chart(document.getElementById("chart"),{
  type:"line",
  data:{
    labels:[],
    datasets:[
      {label:"Soil %",data:[],borderColor:"#2d6a4f"},
      {label:"Temp °C",data:[],borderColor:"#e63946"},
      {label:"Humidity %",data:[],borderColor:"#1d3557"}
    ]
  }
});

/* SENSORS */
db.ref("sensors").on("value",s=>{
  const d=s.val(); if(!d) return;
  soilEl.innerText=d.soil;
  tempEl.innerText=d.temperature;
  humEl.innerText=d.humidity;

  waterEl.innerText=d.waterLevel?"OK":"LOW";
  waterEl.className=d.waterLevel?"status ok":"status low";

  chart.data.labels.push("");
  chart.data.datasets[0].data.push(d.soil);
  chart.data.datasets[1].data.push(d.temperature);
  chart.data.datasets[2].data.push(d.humidity);

  if(chart.data.labels.length>30){
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds=>ds.data.shift());
  }
  chart.update();
});

/* SETTINGS */
db.ref("settings/moistureThreshold").on("value",s=>{
  threshold.value=s.val();
  thVal.innerText=s.val();
});

threshold.oninput=e=>{
  thVal.innerText=e.target.value;
  db.ref("settings/moistureThreshold").set(+e.target.value);
};

db.ref("settings/checkWaterLevel").on("value",s=>{
  checkWater.checked=!!s.val();
});

checkWater.onchange=e=>{
  db.ref("settings/checkWaterLevel").set(e.target.checked);
};

/* MODES */
db.ref("mode").on("value",s=>{
  const m=s.val();
  document.querySelectorAll(".mode button")
    .forEach(b=>b.classList.toggle("active",b.innerText===m));
  pumpToggle.disabled=(m==="AUTO");
});

/* RELAYS */
db.ref("pump").on("value",s=>{
  pumpToggle.checked=!!s.val();
  pumpStatus.innerText=s.val()?"ON":"OFF";
});

db.ref("switch").on("value",s=>{
  switchToggle.checked=!!s.val();
  switchStatus.innerText=s.val()?"ON":"OFF";
});

pumpToggle.onchange=e=>{
  if(pumpToggle.disabled) return;
  db.ref("pump").set(e.target.checked);
};

switchToggle.onchange=e=>{
  db.ref("switch").set(e.target.checked);
};

function setMode(m){
  db.ref("mode").set(m);
}

/* ALERTS */
db.ref("status").on("value",s=>{
  const d=s.val(); if(!d) return;
  if(d.reason==="WATER_LOW"){
    alertText.innerText="⚠ Water level low. Pump blocked.";
  }else if(d.buzzer){
    alertText.innerText="🚜 Pump running.";
  }else{
    alertText.innerText="System OK";
  }
});
