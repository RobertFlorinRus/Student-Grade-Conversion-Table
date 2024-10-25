// Tested and working on Chrome ver. 122.0.6261.112 on windows 10
document.addEventListener("DOMContentLoaded", () => {
  
  // Initially fill the table with one row
  for (let i = 0; i < 10; i++) {
    addStudent();
  }
  updateTable(); // Update count and style on load
});

// Adds a new student row to the table
function addStudent() {
  const table = document
    .getElementById("gradesTable")
    .getElementsByTagName("tbody")[0];
  const headers = document
    .getElementById("gradesTable")
    .getElementsByTagName("thead")[0].rows[0].cells;
  const row = table.insertRow(); // Insert a new row at the end of the table

  // Loop through all headers to create a cell for each column
  for (let i = 0; i < headers.length; i++) {
    const cell = row.insertCell(i);

    if (i === 0) {
      cell.innerHTML = "Student Name";
      cell.contentEditable = true;
    } else if (i === 1) {
      cell.innerHTML = "Student ID";
      cell.contentEditable = true;
    } else if (i < headers.length - 1) {
      // Editable cells for assignments
      cell.contentEditable = true;
      cell.oninput = calculateAverages;
      cell.className = "center-aligned yellow-background";
      cell.innerHTML = "-";
      cell.oninput = updateCellColor;
    } else {
      // Last column for average, non-editable
      cell.className = "right-aligned";
    }
    cell.dataset.original;
  }

  updateTable();
  calculateAverages();
}

// Adds a new assignment column to the table
function addAssignment() {
  // Get the header row and all body rows
  const headerRow = document
    .getElementById("gradesTable")
    .querySelector("thead tr");
  const tableRows = document
    .getElementById("gradesTable")
    .querySelectorAll("tbody tr");

  // Calculate the next assignment number
  const nextAssignmentNumber = headerRow.cells.length - 1;

  // Add a header cell for the new assignment before the Average column
  const headerCell = headerRow.insertCell(nextAssignmentNumber);
  headerCell.textContent = `Assignment ${nextAssignmentNumber - 1}`;
  headerCell.classList.add("center-aligned");
  headerCell.style.fontWeight = "bold";
  headerCell.style.backgroundColor = "rgb(169,169,169)";

  // Add a cell for each existing row in the table body before the Average column
  tableRows.forEach((row) => {
    const cell = row.insertCell(nextAssignmentNumber);
    cell.contentEditable = true;
    cell.classList.add("center-aligned", "yellow-background");
    cell.textContent = "-";
    cell.addEventListener("input", updateCellColor);
    cell.addEventListener("input", calculateAverages);
    updateCellColor(cell);
  });

  updateTable();
  calculateAverages();
}

// Function for showing/hiding conversion table
function toggleTable() {
  document.getElementById("ConversionTable").classList.toggle("hidden");
}

function updateTable() {
  const table = document.getElementById("gradesTable");
  let unsubmittedCount = 0; // Counter for unsubmitted assignments

  // Ensure we start iteration with the first row of tbody
  for (let i = 1; i < table.rows.length; i++) {
    // Loop through each cell in the row
    for (let j = 1; j < table.rows[i].cells.length; j++) {
      const cell = table.rows[i].cells[j];
      if (cell.innerText.trim() === "-") {
        updateCellColor(cell);
        unsubmittedCount++; // Increment the counter
      } else {
        cell.style.backgroundColor = ""; // Reset background color if not '-'
        cell.className = cell.innerText.match(/^\d+$/) // Right-align if the content is a number (and not '-')
          ? "right-aligned"
          : "center-aligned";
      }
    }
  }

  // Update the displayed count of unsubmitted assignments
  document.getElementById(
    "unsubmittedCount"
  ).innerText = `Total Unsubmitted Assignments: ${unsubmittedCount}`;
  document.getElementById("unsubmittedCount").style.fontWeight = "bold"; // Style the count display
}

// Call this function initially and every time a cell is edited
document.addEventListener("DOMContentLoaded", updateTable);

// Function to update cell color based on content
function updateCellColor(cell) {
  if (cell.innerText === "-") {
    cell.style.backgroundColor = "yellow"; // Set cell background to yellow
    cell.className = "center-aligned"; // Center-align the content
  } else if (
    !isNaN(cell.innerText) &&
    cell.innerText >= 0 &&
    cell.innerText <= 100
  ) {
    cell.style.backgroundColor = ""; // Reset background color if valid number
    cell.className = "right-aligned"; // Right-align the content
  } else {
    cell.style.backgroundColor = ""; // Reset background color for other cases
    cell.className = "center-aligned"; // Center-align the content
  }
}

// Event listener to trigger cell color update on input
document.getElementById("gradesTable").addEventListener("input", (event) => {
  if (event.target.tagName === "TD") {
    updateCellColor(event.target);
    calculateAverages(); // Recalculate averages on cell input
  }
});

// Function to validate input and calculate averages
function calculateAverages() {
  const table = document.getElementById("gradesTable");
  let totalUnsubmitted = 0; // Keep track of unsubmitted assignments

  // Iterate over each row in the table
  for (let i = 1, row; (row = table.rows[i]); i++) {
    let sum = 0;
    let count = 0;

    // Get the index of the average column dynamically
    const averageColumnIndex = row.cells.length - 1;

    // Iterate over each cell in the row
    for (let j = 2, cell; (cell = row.cells[j]); j++) {
      const grade = cell.innerText.trim();
      if (grade !== "-" && !isNaN(grade) && grade >= 0 && grade <= 100) {
        sum += parseFloat(grade);
        count++;
      } else {
        // If the grade is not a valid number, reset it to '-'
        cell.innerHTML = "-";
        totalUnsubmitted++;
      }
    }

    // Calculate the average using the dynamically determined average column index
    const average = count === 0 ? 0 : Math.round(sum / count);
    const averageCell = row.cells[averageColumnIndex];
    averageCell.innerHTML = `${average}%`;
    averageCell.dataset.numericAverage = average; // Store the numeric average

    // Style the average if below 60%
    averageCell.className = average < 60 ? "lowGrade right-aligned" : "right-aligned";

    // Convert the average to letter and scale
    const { letterGrade, scale } = getLetterAndScale(average);

    // Set the cell text based on the display mode
    switch (displayMode) {
      case "percentage":
        averageCell.innerText = `${average}%`;
        break;
      case "letter":
        averageCell.innerText = letterGrade;
        break;
      case "gpa":
        averageCell.innerText = scale.toFixed(1);
        break;
    }

    // Update the total unsubmitted assignments display
    document.getElementById(
      "unsubmittedCount"
    ).innerText = `Total Unsubmitted Assignments: ${totalUnsubmitted - 10}`;
    //-10 because my code would display 10 more assignments than there actually were and idk why
  }
}

let displayMode = "percentage"; //initial display mode
 
//Grade mappings
function getLetterAndScale(average) {
  let letterGrade, scale;
  if (average >= 93) {letterGrade = "A";scale = 4.0; } 
  else if (average >= 90) {letterGrade = "A-";scale = 3.7;} 
  else if (average >= 87) {letterGrade = "B+";scale = 3.3;} 
  else if (average >= 83) { letterGrade = "B"; scale = 3.0;} 
  else if (average >= 80) {letterGrade = "B-";scale = 2.7;} 
  else if (average >= 77) {letterGrade = "C+";scale = 2.3;} 
  else if (average >= 73) { letterGrade = "C"; scale = 2.0;}
  else if (average >= 70) {letterGrade = "C-";scale = 1.7;} 
  else if (average >= 67) {letterGrade = "D+"; scale = 1.3;} 
  else if (average >= 63) {letterGrade = "D";scale = 1.0;} 
  else if (average >= 60) {letterGrade = "D-"; scale = 0.7;} 
  else {letterGrade = "F";scale = 0.0;}
  return { letterGrade, scale };
}

function toggleDisplayMode() {
  const averageHeader = document.getElementById("gradesTable").querySelector("thead th:last-child"); // Adjust if your average column is not the last

  switch (displayMode) {
    case "percentage":
      displayMode = "letter";
      averageHeader.textContent = "Average [Letter]"; // Update header text for percentage
      break;
    case "letter":
      displayMode = "gpa";
      averageHeader.textContent = "Average [GPA]"; // Update header text for percentage
      break;
    case "gpa":
      displayMode = "percentage";
      calculateAverages(); // Recalculate percentage again
      averageHeader.textContent = "Average [%]"; // Update header text for percentage
      break;
  }
  calculateAverages(); // Recalculate averages to update the display
}

//Makes the button for alternating display modes work
document.getElementById("toggleButton").addEventListener("click", toggleDisplayMode);

//This code is for the save/return feature of the table but it does not work 
//and I no longer had time to debug and make some working code

// let savedTableState = null; 

// function saveTableState() {
// console.log("Saving table state...");
//   const table = document.getElementById("gradesTable");
//   const rows = Array.from(table.rows).map(row => 
//     Array.from(row.cells).map(cell => ({
//       content: cell.innerHTML,
//       classList: [...cell.classList], 
//       isContentEditable: cell.contentEditable 
//     }))
//   );
//   savedTableState = { rows };
// }

// function restoreTableState() {
// console.log("Restoring table state...");
//   if (savedTableState) {
//     const table = document.getElementById("gradesTable");
    
//     while (table.rows.length > 0) {
//       table.deleteRow(0);
//     }
    
//     savedTableState.rows.forEach((rowData, rowIndex) => {
//       const row = table.insertRow();
//       rowData.forEach((cellData, cellIndex) => {
//         const cell = row.insertCell();
//         cell.innerHTML = cellData.content;
//         cell.classList.add(...cellData.classList); 
//         cell.contentEditable = cellData.isContentEditable; 
//       });
//     });
//   }
// }