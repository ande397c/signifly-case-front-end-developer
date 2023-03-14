window.addEventListener("load", setup);
// Global let variabels
let allTeams = [];
let results = [];
let placeCounter = 0;
let adminAccess = false;

// Global const variabels
const tbl = document.querySelector("#scoreboard-table");
const teamForm = document.querySelector("#team-form");
const formFields = document.querySelectorAll(".input");

function setup() {
 // Control admin access
 const adminLogin = document.querySelector("#admin_login");
 adminLogin.addEventListener("click", () => {
  const tableInputs = document.querySelectorAll("#scoreboard-table input");
  if (document.querySelector("header input").checked) {
   adminAccess = true;
   teamForm.classList.toggle("hide");
   enableInputs(tableInputs);
  } else {
   adminAccess = false;
   teamForm.classList.add("hide");

   disableInputs(tableInputs);
  }
 });

 teamForm.addEventListener("submit", addTeam);
}

function addTeam(e) {
 e.preventDefault();

 // Set total team length limit
 const formMessage = document.querySelector("#form-message");
 if (allTeams.length == 8) {
  formMessage.classList.replace("hide", "show");

  setTimeout(function () {
   formMessage.classList.replace("show", "hide");
  }, 2000);
  return;
 }
 // Show default td
 document.querySelector(".default").classList.remove("hide");

 // Create and push team object
 const newTeam = {
  id: Math.trunc(Math.random() * 10000) + 1,
  teamName: formFields[0].value,
  firstMember: formFields[1].value,
  secondMember: formFields[2].value,
  wins: 0,
  losses: 0,
  points: 0,
 };
 allTeams.push(newTeam);

 // Append team to table and create cells
 const row = tbl.insertRow(tbl.rows.length);
 let i;

 for (i = 0; i < tbl.rows[0].cells.length; i++) {
  if (i === 0) {
   createCell(row.insertCell(i), newTeam, "div");
  } else {
   createCell(row.insertCell(i), 0, "input");
  }
 }

 for (i = 0; i < tbl.rows.length; i++) {
  if (i === 0) {
   createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), newTeam, "div");
  } else {
   createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), 0, "input");
  }
 }
 styleTable();

 // Clear form inputs
 formFields.forEach((field) => {
  field.value = "";
 });
 formFields[0].focus();
}
// Appending info
function createCell(cell, text, elm) {
 const element = document.createElement(elm),
  txt = document.createTextNode(text.teamName);

 if (element.tagName === "INPUT") {
  element.value = "-";
  element.type = "tel";
 } else if (element.tagName === "DIV") {
  element.id = text.id;
 }
 element.appendChild(txt);

 cell.appendChild(element);

 if (typeof text === "object" && text !== null) {
  let members = [text.firstMember, text.secondMember];
  members.forEach((member) => {
   const membersSpan = document.createElement("span");
   membersSpan.textContent = member;
   cell.appendChild(membersSpan);
  });
 }
}

// Style cells
function styleTable() {
 for (i = 0; i < tbl.rows.length; i++) {
  const lastCell = tbl.rows[tbl.rows.length - 1].cells[tbl.rows.length - 1];

  lastCell.innerHTML = "";

  lastCell.style.backgroundColor = "#b6b6b6";
 }

 const tbody = document.querySelector("#scoreboard-table");

 tbody.addEventListener("click", getCell);
}

// Get clicked cell + teamcells
function getCell(e) {
 const cell = e.target.closest("td");
 if (!cell) {
  return;
 }
 const firstTeam = cell.parentNode.firstChild;
 const secondTeam = tbl.rows[0].cells[cell.cellIndex];

 const activeElement = document.activeElement;

 // On blur event calculate score/winner
 activeElement.addEventListener("blur", () => {
  getOutcome(activeElement.value, firstTeam, secondTeam);
 });
}

function getOutcome(score, firstTeam, secondTeam) {
 const firstNumber = parseInt(score.substring(0, score.indexOf("-")));
 const lastNumber = parseInt(score.split("-").pop());

 if (firstNumber > lastNumber) {
  update(firstTeam.childNodes[0].id, secondTeam.childNodes[0].id);
 } else if (firstNumber < lastNumber) {
  update(secondTeam.childNodes[0].id, firstTeam.childNodes[0].id);
 } else {
  console.log("It'a draw");
 }
}
// Update objects
function update(winnerId, looserId) {
 let winnerTeam = allTeams.find((team) => team.id === parseInt(winnerId));
 let looserTeam = allTeams.find((team) => team.id === parseInt(looserId));

 winnerTeam = { ...winnerTeam, wins: winnerTeam.wins + 1, points: winnerTeam.points + 3 };

 looserTeam = { ...looserTeam, losses: looserTeam.losses + 1 };

 results.push(winnerTeam, looserTeam);

 allTeams = allTeams.map((obj) => results.find((o) => o.id === obj.id) || obj);

 results = [];

 placeCounter = 0;

 // Sort teams before displaying
 allTeams.sort((a, b) => {
  return b.points - a.points;
 });

 displayList(allTeams);
}

function displayList(teams) {
 document.querySelector("#teams_table tbody").innerHTML = "";
 document.querySelector(".empty").classList.add("hide");

 teams.forEach(displayTeams);
}

// Clone team data
function displayTeams(team) {
 const clone = document.querySelector("template#team").content.cloneNode(true);
 placeCounter++;
 clone.querySelector("[data-field=place]").textContent = placeCounter;
 clone.querySelector("[data-field=team]").textContent = team.teamName;
 clone.querySelector("[data-field=won]").textContent = team.wins;
 clone.querySelector("[data-field=lost]").textContent = team.losses;
 clone.querySelector("[data-field=points]").textContent = team.points;

 document.querySelector("#teams_table tbody").appendChild(clone);
}

function disableInputs(tableInputs) {
 tableInputs.forEach((tableInput) => {
  tableInput.disabled = true;
 });
}
function enableInputs(tableInputs) {
 tableInputs.forEach((tableInput) => {
  tableInput.disabled = false;
 });
}

// Note:
// In case I was able to make this into a mutli-page application,
// I would've saved allTeams as a json file and fetched that data into the leaderboard

// async function getData() {
//  const url = "teams.json";
//  let data = await fetch(url);
//  teams = await data.json();
// }
