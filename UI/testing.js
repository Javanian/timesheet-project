getUserByNfc("42:b7:db:69").then(data => {
  if (data) {
    console.log("User ditemukan:", data);
    sessionStorage.setItem("datakaryawan", JSON.stringify(data));
    window.location.href = "mainmenu";
  } else {
    console.log("user tidak ditemukan");
  }
});

fetch('/timesheet/getsn/123')
  .then(response => response.json()) 
  .then(data => {
    console.log(data); 
  })
  .catch(error => console.error('Error:', error));